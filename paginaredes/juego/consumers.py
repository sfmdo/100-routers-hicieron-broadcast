import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import GameState, Answer
from .serializers import GameStateSerializer # Necesitaremos el serializador

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        Se ejecuta cuando un cliente (navegador) se conecta.
        """
        self.room_group_name = 'game_100routers'
        # Unir al cliente a un grupo de canales para poder enviarle mensajes a todos
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        # Enviar el estado actual del juego solo a este cliente que acaba de conectar
        await self.send_current_state()

    async def disconnect(self, close_code):
        """
        Se ejecuta cuando un cliente se desconecta.
        """
        # Quitar al cliente del grupo
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """
        Se ejecuta cuando el servidor recibe un mensaje de un cliente.
        """
        data = json.loads(text_data)
        action = data.get('action')

        # --- Acciones desde el Panel de Admin ---
        if action == 'setup_round':
            await self.setup_round(data['answers'], data.get('question', ''))
        elif action == 'reveal_answer':
            await self.reveal_answer(data['position'])
        elif action == 'add_strike':
            await self.add_strike()
        elif action == 'award_points':
            await self.award_points(data['team'])
        elif action == 'toggle_buzzers':
            await self.toggle_buzzers(data['locked'])
        elif action == 'reset_strikes':
            await self.reset_strikes()
            
        # --- Acciones desde el Buzzer ---
        elif action == 'buzz_in':
            await self.buzz_in(data['team'])

        # Al final de cada acción, notificar a TODOS los clientes conectados el nuevo estado
        await self.broadcast_state()

    # --- Lógica de las Acciones (Funciones que modifican la Base de Datos) ---

    @sync_to_async
    def setup_round(self, answers_data, question):
        """Prepara una nueva ronda: borra respuestas antiguas y crea las nuevas."""
        state, _ = GameState.objects.get_or_create(id=1)
        state.round_question = question
        state.strikes = 0
        state.active_team = None
        state.buzzers_locked = True # Los buzzers empiezan bloqueados
        state.round_total_points = 0
        state.team1_score = 0
        state.team2_score = 0
        state.save()

        # Borrar respuestas anteriores y crear las nuevas
        Answer.objects.filter(game_state_id=1).delete()
        for i, ans in enumerate(answers_data):
            if ans.get('text') and ans.get('points'): # Solo guardar si tiene datos
                Answer.objects.create(
                    game_state_id=1,
                    text=ans['text'],
                    points=int(ans['points']),
                    position=i + 1,
                    revealed=False
                )

    @sync_to_async
    def reveal_answer(self, position):
        """Marca una respuesta como revelada y suma sus puntos al total de la ronda."""
        try:
            answer = Answer.objects.get(game_state_id=1, position=position)
            if not answer.revealed:
                answer.revealed = True
                answer.save()
                
                state = GameState.objects.get(id=1)
                state.round_total_points += answer.points
                state.save()
        except Answer.DoesNotExist:
            print(f"Error: No se encontró la respuesta en la posición {position}")

    @sync_to_async
    def add_strike(self):
        """Añade un 'strike' (error), hasta un máximo de 3."""
        state = GameState.objects.get(id=1)
        if state.strikes < 3:
            state.strikes += 1
            state.save()

    @sync_to_async
    def reset_strikes(self):
        """Reinicia los strikes a 0."""
        state = GameState.objects.get(id=1)
        state.strikes = 0
        state.save()

    @sync_to_async
    def award_points(self, team):
        """Otorga los puntos de la ronda al equipo ganador y reinicia el estado de la ronda."""
        state = GameState.objects.get(id=1)
        if team == 'team1':
            state.team1_score += state.round_total_points
        elif team == 'team2':
            state.team2_score += state.round_total_points
        
        # Reiniciar para la siguiente jugada (dentro de la misma ronda si es necesario)
        state.round_total_points = 0
        state.strikes = 0
        state.active_team = None
        state.buzzers_locked = True
        state.save()
        
        # Marcar todas las respuestas como no reveladas para la siguiente ronda.
        # Esto se maneja mejor en setup_round. Aquí solo reseteamos contadores.

    
    @sync_to_async
    def toggle_buzzers(self, locked):
        """Activa o desactiva los buzzers para los jugadores."""
        state = GameState.objects.get(id=1)
        state.buzzers_locked = locked
        # Si se desbloquean, se reinicia el equipo activo y los strikes
        if not locked:
            state.active_team = None
            state.strikes = 0
        state.save()

    @sync_to_async
    def buzz_in(self, team):
        """Gestiona el primer equipo que presiona el buzzer."""
        state = GameState.objects.get(id=1)
        # Solo se puede responder si los buzzers no están bloqueados
        if not state.buzzers_locked:
            state.buzzers_locked = True # Bloquear inmediatamente para que nadie más responda
            state.active_team = team
            state.save()

    # --- Funciones para Notificar a los Clientes ---

    async def broadcast_state(self):
        """Envía el estado completo del juego a TODOS los clientes en el grupo."""
        state_data = await self.get_serialized_state()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_message', # Esto llama a la función game_message
                'message': state_data
            }
        )

    async def send_current_state(self):
        """Envía el estado completo del juego SOLO al cliente que se acaba de conectar."""
        state_data = await self.get_serialized_state()
        await self.send(text_data=json.dumps(state_data))

    async def game_message(self, event):
        """
        Función que se llama por `broadcast_state`. Recibe el mensaje del grupo
        y lo reenvía por el WebSocket al cliente.
        """
        message = event['message']
        await self.send(text_data=json.dumps(message))

    @sync_to_async
    def get_serialized_state(self):
        """
        Obtiene el estado actual del juego desde la BD y lo convierte a un formato
        que el frontend pueda entender (JSON).
        """
        state, _ = GameState.objects.get_or_create(id=1)
        # Asegurarse de que las respuestas estén ordenadas por su posición
        answers = Answer.objects.filter(game_state_id=1).order_by('position')
        
        # Construir el diccionario manualmente para un control total
        state_data = {
            "team1_score": state.team1_score,
            "team2_score": state.team2_score,
            "round_question": state.round_question,
            "round_total_points": state.round_total_points,
            "strikes": state.strikes,
            "active_team": state.active_team,
            "buzzers_locked": state.buzzers_locked,
            "answers": [
                {
                    "text": ans.text,
                    "points": ans.points,
                    "revealed": ans.revealed,
                    "position": ans.position
                } for ans in answers
            ]
        }
        return state_data