'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function Leaderboard({ currentScore, playerName, onPlayAgain, onBackToMenu }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [globalStats, setGlobalStats] = useState({
    totalGames: 0,
    totalPlayers: 0,
    highestScore: 0,
    averageScore: 0
  });

  const hasSavedRef = useRef(false); // Prevenir guardados duplicados

  useEffect(() => {
    const loadAndSaveScore = async () => {
      try {
        // Guardar la nueva puntuación SOLO UNA VEZ
        if (currentScore > 0 && !hasSavedRef.current) {
          hasSavedRef.current = true;
          setSaving(true);
          
          const { error: insertError } = await supabase
            .from('scores')
            .insert([
              { 
                player_name: playerName, 
                score: currentScore,
                created_at: new Date().toISOString()
              }
            ]);

          if (insertError) {
            console.error('Error guardando puntuación:', insertError);
            setError('No se pudo guardar la puntuación');
            hasSavedRef.current = false; // Permitir reintentar
          } else {
            console.log('✅ Puntuación guardada exitosamente');
          }
          setSaving(false);
        }

        // Cargar todas las puntuaciones
        const { data: scores, error: fetchError } = await supabase
          .from('scores')
          .select('*')
          .order('score', { ascending: false });

        if (fetchError) {
          console.error('Error cargando puntuaciones:', fetchError);
          setError('No se pudo cargar el ranking');
        } else {
          console.log('📊 Puntuaciones cargadas:', scores.length);
          
          // Top 10
          setLeaderboard(scores.slice(0, 10));
          
          // Calcular estadísticas
          const uniquePlayers = new Set(scores.map(s => s.player_name));
          const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
          const highestScore = scores.length > 0 ? scores[0].score : 0;
          
          setGlobalStats({
            totalGames: scores.length,
            totalPlayers: uniquePlayers.size,
            highestScore: highestScore,
            averageScore: scores.length > 0 ? Math.round(totalScore / scores.length) : 0
          });
        }
      } catch (error) {
        console.error('Error completo:', error);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    loadAndSaveScore();
  }, []); // Solo se ejecuta una vez al montar

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
      <div className="text-center mb-4">
        <h1 className="text-5xl font-bold text-white mb-2">
          🏆 Game Over
        </h1>
        <p className="text-2xl text-green-400 font-bold">
          Tu puntuación: {currentScore}
        </p>
        {saving && <p className="text-white mt-2 animate-pulse">💾 Guardando puntuación...</p>}
        {error && <p className="text-red-400 mt-2 text-sm">⚠️ {error}</p>}
      </div>

      {/* Estadísticas Globales */}
      <div className="w-full max-w-2xl grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-500 bg-opacity-20 backdrop-blur-lg rounded-lg p-4 text-center border border-blue-400">
          <div className="text-3xl font-bold text-blue-300">{globalStats.totalGames}</div>
          <div className="text-white text-sm">Partidas</div>
        </div>
        <div className="bg-purple-500 bg-opacity-20 backdrop-blur-lg rounded-lg p-4 text-center border border-purple-400">
          <div className="text-3xl font-bold text-purple-300">{globalStats.totalPlayers}</div>
          <div className="text-white text-sm">Jugadores</div>
        </div>
        <div className="bg-green-500 bg-opacity-20 backdrop-blur-lg rounded-lg p-4 text-center border border-green-400">
          <div className="text-3xl font-bold text-green-300">{globalStats.highestScore}</div>
          <div className="text-white text-sm">Récord</div>
        </div>
        <div className="bg-yellow-500 bg-opacity-20 backdrop-blur-lg rounded-lg p-4 text-center border border-yellow-400">
          <div className="text-3xl font-bold text-yellow-300">{globalStats.averageScore}</div>
          <div className="text-white text-sm">Promedio</div>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 border border-white border-opacity-20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          🌟 Top 10 Mundial
        </h2>

        {loading ? (
          <div className="text-center text-white py-8">
            <div className="animate-spin text-4xl mb-2">⏳</div>
            <p>Cargando ranking...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-8">
            <p className="text-lg mb-2">❌ {error}</p>
            <p className="text-sm">Verifica tu conexión a internet</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center text-white py-8">
            <p className="text-xl mb-2">🎉 ¡Eres el primero!</p>
            <p className="text-sm">Tu puntuación se ha guardado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const isCurrentPlayer = entry.score === currentScore && 
                                     entry.player_name === playerName && 
                                     new Date(entry.created_at).getTime() > Date.now() - 10000;
              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    isCurrentPlayer 
                      ? 'bg-yellow-400 bg-opacity-30 ring-2 ring-yellow-400 scale-105' 
                      : 'bg-white bg-opacity-5 hover:bg-opacity-10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-white w-8">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `${index + 1}.`}
                    </span>
                    <div>
                      <p className="text-white font-bold text-lg">
                        {entry.player_name}
                        {isCurrentPlayer && ' 🎉'}
                      </p>
                      <p className="text-gray-300 text-sm">
                        {formatDate(entry.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-400 font-bold text-xl">
                    {entry.score} pts
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={onPlayAgain}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transform transition-all duration-200 hover:scale-105 shadow-lg"
        >
          🔄 Jugar de nuevo
        </button>
        <button
          onClick={onBackToMenu}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg transform transition-all duration-200 hover:scale-105 shadow-lg"
        >
          🏠 Menú principal
        </button>
      </div>
    </div>
  );
}