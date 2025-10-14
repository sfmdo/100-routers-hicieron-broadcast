from rest_framework import serializers
from .models import GameState, Answer

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = '__all__'

class GameStateSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, source='answer_set')
    class Meta:
        model = GameState
        fields = '__all__'

 