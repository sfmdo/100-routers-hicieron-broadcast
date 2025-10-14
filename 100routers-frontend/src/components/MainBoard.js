import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';

const MainBoard = () => {
    const { gameState } = useGame();

    // Polling: Recarga la página cada 5 segundos.
    useEffect(() => {
        const reloadInterval = setInterval(() => {
            window.location.reload();
        }, 5000);
        return () => clearInterval(reloadInterval);
    }, []);

    // Muestra un mensaje de carga hasta que lleguen los datos.
    if (!gameState) {
        return <div className="loading-screen">Cargando datos del juego...</div>;
    }

    // --- LA LÓGICA CLAVE: CREAR EL TABLERO COMPLETO ---

    const TOTAL_ANSWERS = 8; // El tablero siempre tiene 8 respuestas.

    // 1. Obtenemos la lista de respuestas que el servidor nos dice que están reveladas.
    const revealedAnswersFromServer = gameState.answers || [];

    // 2. Creamos el array que se mostrará en pantalla. SIEMPRE tendrá 8 elementos.
    const displayAnswers = Array.from({ length: TOTAL_ANSWERS }, (_, index) => {
        const position = index + 1; // Posiciones del 1 al 8.

        // 3. Buscamos si hay una respuesta revelada para esta posición específica.
        const revealedAnswer = revealedAnswersFromServer.find(
            (answer) => answer.position === position
        );

        // 4. Si la encontramos, usamos sus datos para mostrarla.
        if (revealedAnswer) {
            return revealedAnswer; // ya tiene `text`, `points`, `position`, etc.
        }

        // 5. Si NO la encontramos, creamos un objeto "placeholder" para la casilla oculta.
        return {
            position: position,
            revealed: false,
            text: '',
            points: 0,
        };
    });
    
    // --- FIN DE LA LÓGICA CLAVE ---


    return (
        <div className="main-board-container">
            <div className="scores-container">
                <div className="team-score">
                    <div className="team-name">EQUIPO 1</div>
                    <div className="score">{String(gameState.team1_score || 0).padStart(3, '0')}</div>
                </div>
                <div className="strikes-display">
                    <div className={`strike ${gameState.strikes >= 1 ? 'active' : ''}`}>X</div>
                    <div className={`strike ${gameState.strikes >= 2 ? 'active' : ''}`}>X</div>
                    <div className={`strike ${gameState.strikes >= 3 ? 'active' : ''}`}>X</div>
                </div>
                <div className="team-score">
                    <div className="team-name">EQUIPO 2</div>
                    <div className="score">{String(gameState.team2_score || 0).padStart(3, '0')}</div>
                </div>
            </div>

            <div className="answer-board">
                {/* Este .map() ahora siempre recorre 8 elementos, mostrando
                    el contenido correcto para cada uno según esté revelado o no. */}
                {displayAnswers.map(answer => (
                    <div key={answer.position} className={`answer-slot ${answer.revealed ? 'revealed' : ''}`}>
                        {answer.revealed ? (
                            <>
                                <span className="answer-text">{answer.text}</span>
                                <span className="answer-points">{answer.points}</span>
                            </>
                        ) : (
                            <span className="answer-number">{answer.position}</span>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="round-total">
                <div className="total-label">TOTAL</div>
                <div className="total-points">{String(gameState.round_total_points || 0).padStart(2, '0')}</div>
            </div>

            <h2 className="game-question">{gameState.round_question}</h2>
            
            {gameState.active_team && (
                <div className="active-team-banner">
                    Turno para: {gameState.active_team.toUpperCase()}
                </div>
            )}
        </div>
    );
};

export default MainBoard;