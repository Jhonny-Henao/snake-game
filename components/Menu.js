'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Footer from "@/components/Footer";


const SKINS = {
  neon: { name: 'Neón', head: '#00ffff', body: '#0066ff', icon: '⚡' },
  fire: { name: 'Fuego', head: '#ff4400', body: '#ff8800', icon: '🔥' },
  toxic: { name: 'Tóxico', head: '#00ff00', body: '#44ff00', icon: '☢️' },
  galaxy: { name: 'Galaxia', head: '#ff00ff', body: '#8800ff', icon: '🌌' },
  gold: { name: 'Oro', head: '#ffd700', body: '#ffaa00', icon: '👑' }
};

export default function Menu({ onStartGame }) {
  const [playerName, setPlayerName] = useState('');
  const [selectedSkin, setSelectedSkin] = useState('neon');
  const [showSkinSelector, setShowSkinSelector] = useState(false);

  const [showRanking, setShowRanking] = useState(false);
  const [topPlayers, setTopPlayers] = useState([]);

  // ✅ Leer desde la tabla correcta: 'scores'
  useEffect(() => {
    const fetchTopPlayers = async () => {
      const { data, error } = await supabase
        .from('scores')
        .select('player_name, score')
        .order('score', { ascending: false })
        .limit(5);
      if (!error && data) {
        setTopPlayers(data);
      } else {
        console.error('Error cargando top 5:', error);
      }
    };
    fetchTopPlayers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      onStartGame(playerName.trim(), 'neon', selectedSkin);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12 animate-fadeInDown">
          <h1 className="text-7xl md:text-9xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient tracking-tight">
            SNAKE
          </h1>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
            <p className="text-cyan-300 text-xl md:text-2xl font-bold tracking-widest">GAME</p>
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
          </div>
          <p className="text-purple-300 text-sm md:text-base font-medium">
            Sigue el cursor • Come la comida • Crece • Supera los récords
          </p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl rounded-3xl border-2 border-cyan-500/30 p-8 md:p-12 shadow-2xl animate-fadeInUp">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-cyan-400 text-lg font-bold mb-3 tracking-wide">
                NOMBRE DEL JUGADOR
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Escribe tu nombre..."
                maxLength={20}
                className="w-full px-6 py-4 bg-black/50 border-2 border-purple-500/50 rounded-xl text-white text-xl placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all"
                autoFocus
              />
            </div>

            {/* Selector de Skin */}
            <div>
              <button
                type="button"
                onClick={() => setShowSkinSelector(!showSkinSelector)}
                className="w-full flex items-center justify-between px-6 py-4 bg-black/50 border-2 border-purple-500/50 rounded-xl text-white hover:border-cyan-400 transition-all group"
              >
                <span className="text-lg font-bold text-cyan-400">SELECCIONAR SKIN</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{SKINS[selectedSkin].icon}</span>
                  <span className="text-white font-semibold">{SKINS[selectedSkin].name}</span>
                  <span className={`text-xl transition-transform ${showSkinSelector ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </button>

              {showSkinSelector && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 animate-fadeIn">
                  {Object.entries(SKINS).map(([key, skin]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedSkin(key);
                        setShowSkinSelector(false);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 ${
                        selectedSkin === key
                          ? 'border-cyan-400 bg-cyan-400/20 shadow-lg shadow-cyan-400/50'
                          : 'border-purple-500/30 bg-black/30 hover:border-purple-400'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">{skin.icon}</span>
                        <div
                          className="w-full h-3 rounded-full"
                          style={{ background: `linear-gradient(90deg, ${skin.head}, ${skin.body})` }}
                        ></div>
                        <span className="text-white font-semibold text-sm">{skin.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!playerName.trim()}
              className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-2xl font-black rounded-xl shadow-lg shadow-cyan-500/50 hover:shadow-purple-500/50 transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {playerName.trim() ? (
                <span className="flex items-center justify-center gap-3">
                  <span>INICIAR JUEGO</span>
                  <span className="text-3xl animate-bounce">🎮</span>
                </span>
              ) : (
                'ESCRIBE TU NOMBRE'
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowRanking(true)}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-300 hover:to-pink-400 text-white text-xl font-bold rounded-xl mt-3 shadow-lg shadow-yellow-500/40 transform hover:scale-105 transition-all"
            >
              🏆 Ver Ranking Top 5
            </button>
          </form>

          {/* Controles info */}
          <div className="mt-8 pt-8 border-t border-purple-500/30">
            <h3 className="text-cyan-400 font-bold text-center mb-4 text-lg">CONTROLES</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
                <div className="text-purple-300 font-semibold mb-1">🖱️ Mouse/Toque</div>
                <div className="text-gray-400">Sigue el cursor</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
                <div className="text-purple-300 font-semibold mb-1">⌨️ Teclado</div>
                <div className="text-gray-400">WASD / Flechas</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
                <div className="text-purple-300 font-semibold mb-1">⏸️ Pausa</div>
                <div className="text-gray-400">ESPACIO / ESC</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
                <div className="text-purple-300 font-semibold mb-1">🎯 Objetivo</div>
                <div className="text-gray-400">Come comida, no choques</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 Modal de Ranking Top 5 */}
      {showRanking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-gradient-to-br from-black via-purple-900 to-black p-8 md:p-10 rounded-3xl shadow-2xl border border-purple-600/40 max-w-md w-full animate-fadeInUp">
            <h2 className="text-center text-2xl font-bold text-yellow-300 mb-6">
              🏆 Top 5 Jugadores
            </h2>
            <ul className="space-y-4">
              {topPlayers.length > 0 ? (
                topPlayers.map((player, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-purple-500/20 border border-purple-400/40 rounded-xl px-4 py-2 text-white"
                  >
                    <span className="text-lg font-semibold">
                      {index + 1}. {player.player_name}
                    </span>
                    <span className="text-cyan-300 font-bold">{player.score}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center">No hay jugadores aún.</p>
              )}
            </ul>
            <button
              onClick={() => setShowRanking(false)}
              className="mt-8 w-full py-3 bg-purple-700 text-white rounded-xl hover:bg-purple-600 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
