import React, { createContext, useState, useEffect, useRef, useContext } from 'react';


// Reemplaza esta IP con la dirección IP de la computadora que ejecuta Django
const YOUR_DJANGO_SERVER_IP = '192.168.0.110'; // o '192.168.1.10'
const WEBSOCKET_URL = `ws://${YOUR_DJANGO_SERVER_IP}:8000/ws/game/`;


export const GameContext = createContext();

// Hook personalizado para usar el contexto más fácilmente
export const useGame = () => {
    return useContext(GameContext);
};

export const GameProvider = ({ children }) => {
    const [gameState, setGameState] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const webSocket = useRef(null);

    useEffect(() => {
        webSocket.current = new WebSocket(WEBSOCKET_URL);

        webSocket.current.onopen = () => {
            console.log("WebSocket Conectado");
            setIsConnected(true);
        };

        webSocket.current.onclose = () => {
            console.log("WebSocket Desconectado");
            setIsConnected(false);
        };

        webSocket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Estado recibido:", data); // Muy útil para depurar
            setGameState(data);
        };
        

        // Limpieza al desmontar el componente
        return () => {
            if (webSocket.current) {
                webSocket.current.close();
            }
        };
    }, []);

    const sendCommand = (command) => {
        if (webSocket.current && webSocket.current.readyState === WebSocket.OPEN) {
            webSocket.current.send(JSON.stringify(command));
        } else {
            console.error("WebSocket no está conectado.");
        }
    };

    const value = {
        gameState,
        sendCommand,
        isConnected,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};