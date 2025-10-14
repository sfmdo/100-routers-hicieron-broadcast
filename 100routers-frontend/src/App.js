import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import MainBoard from './components/MainBoard';
import AdminPanel from './components/AdminPanel';
import BuzzerView from './components/BuzzerView';
import './App.css'; // Importaremos un CSS para darle estilo

function App() {
    return (
        <GameProvider>
            <Router>
                <div className="app-container">
                    <Routes>
                        <Route path="/" element={<MainBoard />} />
                        <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/buzzer" element={<BuzzerView />} />
                    </Routes>
                </div>
            </Router>
        </GameProvider>
    );
}
export default App;