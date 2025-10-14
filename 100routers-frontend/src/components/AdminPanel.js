import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const AdminPanel = () => {
    const { gameState, sendCommand, isConnected } = useGame();
    const [question, setQuestion] = useState('');
    const [answers, setAnswers] = useState(
        Array.from({ length: 8 }, () => ({ text: '', points: '' }))
    );

    const handleAnswerChange = (index, field, value) => {
        const newAnswers = [...answers];
        newAnswers[index][field] = value;
        setAnswers(newAnswers);
    };

    const handleSetupRound = () => {
        sendCommand({
            action: 'setup_round',
            question: question,
            answers: answers.filter(a => a.text && a.points) // Enviar solo respuestas con datos
        });
    };
    
    if (!isConnected) return <div>Conectando al servidor...</div>;
    if (!gameState) return <div>Esperando estado del juego...</div>;

    return (
        <div className="admin-panel">
            <h1>Panel de Administrador</h1>

            <div className="admin-section setup-section">
                <h2>Configurar Ronda</h2>
                <input
                    type="text"
                    placeholder="Escribe la pregunta de la ronda"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="question-input"
                />
                <div className="answers-setup">
                    {answers.map((ans, index) => (
                        <div key={index} className="answer-input-group">
                            <span>{index + 1}.</span>
                            <input
                                type="text"
                                placeholder="Respuesta"
                                value={ans.text}
                                onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Puntos"
                                value={ans.points}
                                onChange={(e) => handleAnswerChange(index, 'points', e.target.value)}
                            />
                        </div>
                    ))}
                </div>
                <button onClick={handleSetupRound} className="btn-setup">
                    CARGAR RONDA
                </button>
            </div>

            <div className="admin-section controls-section">
                <h2>Controles de Juego</h2>
                <div className="control-group">
                    <h3>Buzzers</h3>
                    <button onClick={() => sendCommand({ action: 'toggle_buzzers', locked: false })} disabled={!gameState.buzzers_locked}>
                        Activar Buzzers
                    </button>
                    <button onClick={() => sendCommand({ action: 'toggle_buzzers', locked: true })} disabled={gameState.buzzers_locked}>
                        Desactivar Buzzers
                    </button>
                </div>
                <div className="control-group">
                    <h3>Respuestas</h3>
                    {Array.from({ length: 8 }, (_, i) => (
                        <button key={i} onClick={() => sendCommand({ action: 'reveal_answer', position: i + 1 })}>
                            Revelar {i + 1}
                        </button>
                    ))}
                </div>
                 <div className="control-group">
                    <h3>Strikes</h3>
                    <button onClick={() => sendCommand({ action: 'add_strike' })}>Añadir X ({gameState.strikes})</button>
                    <button onClick={() => sendCommand({ action: 'reset_strikes' })}>Reiniciar X</button>
                </div>
                <div className="control-group">
                    <h3>Puntos</h3>
                    <button onClick={() => sendCommand({ action: 'award_points', team: 'team1' })} className="btn-success">
                        Puntos a Equipo 1
                    </button>
                    <button onClick={() => sendCommand({ action: 'award_points', team: 'team2' })} className="btn-success">
                        Puntos a Equipo 2
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;