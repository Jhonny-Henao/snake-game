'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const THEMES = [
  { id: 'classic', name: '🌿 Clásico', colors: 'from-green-500 to-green-700' },
  { id: 'neon', name: '✨ Neón', colors: 'from-purple-500 to-pink-500' },
  { id: 'dark', name: '🌙 Oscuro', colors: 'from-gray-700 to-gray-900' }
];

export default function Menu({ onStartGame }) {
  const [playerName, setPlayerName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [topScores, setTopScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const loadTopScores = async () => {
      try {
        const { data, error } = await supabase
          .from('scores')
          .select('*')
          .order('score', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error cargando top scores:', error);
        } else {
          setTopScores(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopScores();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      onStartGame(playerName.trim(), selectedTheme);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 animate-pulse">
          🐍 SNAKE
        </h1>
        <p className="text-white text-xl mb-2">El juego clásico de la culebrita</p>
        <p className="text-green-400 text-sm">Con ranking global en tiempo real</p>
      </div>

      <button
        onClick={() => setShowLeaderboard(!showLeaderboard)}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transform transition-all duration-200 hover:scale-105"
      >
        {showLeaderboard ? '❌ Ocultar Ranking' : '🏆 Ver Ranking Global'}
      </button>

      {showLeaderboard && (
        <div className="w-full max-w-md bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 border border-white border-opacity-20 animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            🌟 Top 5 Mundial
          </h2>
          
          {loading ? (
            <div className="text-center text-white py-4">
              <div className="animate-spin text-3xl mb-2">⏳</div>
              <p>Cargando ranking...</p>
            </div>
          ) : topScores.length === 0 ? (
            <div className="text-center text-white py-4">
              <p>¡Sé el primero en jugar!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topScores.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white bg-opacity-5 hover:bg-opacity-10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-white">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `${index + 1}.`}
                    </span>
                    <span className="text-white font-semibold">{entry.player_name}</span>
                  </div>
                  <span className="text-green-400 font-bold">{entry.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div>
          <label className="block text-white mb-2 font-semibold">
            Tu nombre:
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ingresa tu nombre"
            className="w-full px-4 py-3 rounded-lg text-black text-lg focus:outline-none focus:ring-4 focus:ring-green-400"
            maxLength={20}
            required
          />
        </div>

        <div>
          <label className="block text-white mb-3 font-semibold">
            Elige tu tema:
          </label>
          <div className="grid grid-cols-1 gap-3">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedTheme(theme.id)}
                className={`px-6 py-4 rounded-lg font-bold text-white bg-gradient-to-r ${theme.colors} 
                  transform transition-all duration-200 hover:scale-105 ${
                  selectedTheme === theme.id ? 'ring-4 ring-white scale-105' : ''
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl transform transition-all duration-200 hover:scale-105 shadow-lg"
        >
          🎮 ¡Jugar Ahora!
        </button>
      </form>

      <div className="text-white text-sm text-center opacity-75">
        <p>🎵 Juega con sonido activado para mejor experiencia</p>
      </div>
    </div>
  );
}