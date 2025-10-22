'use client';

import { useState } from 'react';
import Menu from '@/components/Menu';
import Game from '@/components/Game';
import Leaderboard from '@/components/Leaderboard';

export default function Home() {
  const [gameState, setGameState] = useState('menu');
  const [playerName, setPlayerName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('neon');
  const [selectedSkin, setSelectedSkin] = useState('neon');
  const [finalScore, setFinalScore] = useState(0);

  const handleStartGame = (name, theme, skin) => {
    setPlayerName(name);
    setSelectedTheme(theme || 'neon');
    setSelectedSkin(skin || 'neon');
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
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black relative overflow-hidden">
      {/* Animaciones de fondo mejoradas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Orbes flotantes con blur */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-40 right-1/4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob animation-delay-6000"></div>
        
        {/* Grid de puntos en perspectiva */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Estrellas brillantes */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              opacity: Math.random() * 0.7 + 0.3,
              boxShadow: '0 0 10px rgba(255,255,255,0.8)'
            }}
          />
        ))}

        {/* Líneas de velocidad */}
        {gameState === 'playing' && [...Array(5)].map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-20 animate-speedline"
            style={{
              top: `${20 + i * 15}%`,
              left: '-100%',
              width: '200%',
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + i * 0.5}s`
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
          <Game 
            playerName={playerName}
            onGameOver={handleGameOver}
            theme={selectedTheme}
            selectedSkin={selectedSkin}
          />
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

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -30px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(30px, 10px) scale(1.05);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        @keyframes speedline {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-6000 {
          animation-delay: 6s;
        }

        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }

        .animate-speedline {
          animation: speedline 3s linear infinite;
        }
      `}</style>
    </main>
  );
}