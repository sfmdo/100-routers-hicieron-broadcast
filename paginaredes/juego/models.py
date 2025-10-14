from django.db import models

class GameState(models.Model):
    team1_score = models.IntegerField(default=0)
    team2_score = models.IntegerField(default=0)
    round_question = models.CharField(max_length=255, default="Pregunta de la ronda")
    round_total_points = models.IntegerField(default=0)
    strikes = models.IntegerField(default=0)
    active_team = models.CharField(max_length=10, blank=True, null=True) # 'team1', 'team2'
    buzzers_locked = models.BooleanField(default=True)

    def __str__(self):
        return f"Pregunta actual: {self.round_question}"

class Answer(models.Model):
    game_state_id = models.IntegerField(default=1)
    text = models.CharField(max_length=200)
    points = models.IntegerField()
    revealed = models.BooleanField(default=False)
    position = models.IntegerField() # Para saber en qué orden mostrarlas (1 a 8)

    def __str__(self):
        return f"{self.text} ({self.points} puntos)"