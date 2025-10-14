import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';

const BuzzerView = () => {
    const { gameState, sendCommand, isConnected } = useGame();

    useEffect(() => {
            const reloadInterval = setInterval(() => {
                window.location.reload();
            }, 5000);
            return () => clearInterval(reloadInterval);
        }, []);

    if (!isConnected) return <div className="buzzer-message">Conectando...</div>;
    if (!gameState) return <div className="buzzer-message">Esperando juego...</div>;

    const handleBuzz = (team) => {
        sendCommand({ action: 'buzz_in', team });
    };

    return (
        <div className="buzzer-page">
            <div className="buzzer-status">
                {gameState.buzzers_locked ? "BUZZERS BLOQUEADOS" : "¡RESPONDE AHORA!"}
            </div>
            <div className="buzzer-container">
                <button
                    className="buzzer-button team1"
                    onClick={() => handleBuzz('team1')}
                    disabled={gameState.buzzers_locked}
                >
                    EQUIPO 1
                </button>
                <button
                    className="buzzer-button team2"
                    onClick={() => handleBuzz('team2')}
                    disabled={gameState.buzzers_locked}
                >
                    EQUIPO 2
                </button>
            </div>
            {gameState.active_team && (
                <div className="buzzer-message active-team-info">
                    {gameState.active_team.toUpperCase()} tiene el control.
                </div>
            )}
        </div>
    );
};

export default BuzzerView;