from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import GameState
from .serializers import GameStateSerializer

class GameStateView(APIView):
    def get(self, request, *args, **kwargs):
        state, created = GameState.objects.get_or_create(id=1)
        serializer = GameStateSerializer(state)
        return Response(serializer.data)
