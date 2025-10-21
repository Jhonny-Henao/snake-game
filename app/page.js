'use client';

import { useState } from 'react';
import Menu from '@/components/Menu';
import Game from '@/components/Game';
import Leaderboard from '@/components/Leaderboard';

export default function Home() {
  const [gameState, setGameState] = useState('menu');
  const [playerName, setPlayerName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [finalScore, setFinalScore] = useState(0);

  const handleStartGame = (name, theme) => {
    setPlayerName(name);
    setSelectedTheme(theme);
    setGameState('playing');
  };

  const handleGameOver = (score) => {
    setFinalScore(score);
    setTimeout(() => {
      setGameState('gameover');
    }, 1500);
  };

  const handlePlayAgain = () => {
    setGameState('playing');
    setFinalScore(0);
  };

  const handleBackToMenu = () => {
    setGameState('menu');
    setPlayerName('');
    setFinalScore(0);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animaciones de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Círculos flotantes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Estrellas */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.5 + 0.3
            }}
          />
        ))}
      </div>

      {/* Contenido */}
      <div className="relative z-10">
        {gameState === 'menu' && (
          <Menu onStartGame={handleStartGame} />
        )}

        {gameState === 'playing' && (
          <div className="flex items-center justify-center min-h-screen">
            <Game 
              playerName={playerName}
              onGameOver={handleGameOver}
              theme={selectedTheme}
            />
          </div>
        )}

        {gameState === 'gameover' && (
          <Leaderboard
            currentScore={finalScore}
            playerName={playerName}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={handleBackToMenu}
          />
        )}
      </div>
    </main>
  );
}