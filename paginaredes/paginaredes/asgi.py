# en paginaredes/asgi.py

import os
from django.core.asgi import get_asgi_application

# 1. ESTE ES EL PASO MÁS IMPORTANTE.
#    Configura Django ANTES de hacer cualquier importación que dependa de él.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paginaredes.settings')

# 2. Llama a get_asgi_application() para forzar el arranque completo de Django.
#    Esto carga los settings, las apps, los modelos, etc.
django_asgi_app = get_asgi_application()

# 3. AHORA que Django está listo, podemos importar de forma segura
#    los componentes de Channels que dependen de los modelos de Django.
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import juego.routing

# 4. Define el enrutador principal.
application = ProtocolTypeRouter({
    # Para el tráfico HTTP, usa la aplicación Django ya inicializada.
    "http": django_asgi_app,

    # Para el tráfico WebSocket, usa la pila de Channels.
    "websocket": AuthMiddlewareStack(
        URLRouter(
            juego.routing.websocket_urlpatterns
        )
    ),
})