'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

const THEMES = {
  classic: {
    bg: 'bg-green-100',
    snake: 'bg-green-600',
    food: 'bg-red-500',
    grid: 'border-green-300'
  },
  neon: {
    bg: 'bg-purple-900',
    snake: 'bg-cyan-400',
    food: 'bg-pink-500',
    grid: 'border-purple-700'
  },
  dark: {
    bg: 'bg-gray-900',
    snake: 'bg-yellow-400',
    food: 'bg-orange-500',
    grid: 'border-gray-700'
  }
};

export default function Game({ playerName, onGameOver, theme = 'classic' }) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(150);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const directionRef = useRef(direction);
  const currentTheme = THEMES[theme];
  
  // Refs para los sonidos
  const eatSoundRef = useRef(null);
  const gameOverSoundRef = useRef(null);
  const moveSoundRef = useRef(null);
  const backgroundMusicRef = useRef(null);

  // Inicializar sonidos y música
// Inicializar sonidos y música
  useEffect(() => {
    // Sonidos de efectos
eatSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');    gameOverSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'); // Sonido simple de error/perdida
    moveSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2997/2997-preview.mp3');
    
    // Música de fondo tranquila y constante
backgroundMusicRef.current = new Audio('https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Shipping_Lanes.mp3');    
    // Configurar volúmenes
    eatSoundRef.current.volume = 0.2;
    gameOverSoundRef.current.volume = 0.3;
    moveSoundRef.current.volume = 0.1;
    backgroundMusicRef.current.volume = 0.2;
    backgroundMusicRef.current.loop = true;
    
    // Iniciar música de fondo
    if (soundEnabled) {
      backgroundMusicRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    
    // Cleanup al desmontar
    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.currentTime = 0;
      }
    };
  }, []);

  // Controlar música cuando cambie soundEnabled
  useEffect(() => {
    if (backgroundMusicRef.current) {
      if (soundEnabled && !isPaused && !gameOver) {
        backgroundMusicRef.current.play().catch(e => console.log('Audio play failed:', e));
      } else {
        backgroundMusicRef.current.pause();
      }
    }
  }, [soundEnabled, isPaused, gameOver]);

  const playSound = (soundRef) => {
    if (soundEnabled && soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        setSoundEnabled(prev => !prev);
        return;
      }

      const keyMap = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 }
      };

      const newDirection = keyMap[e.key];
      if (newDirection) {
        const opposite = directionRef.current.x === -newDirection.x && 
                        directionRef.current.y === -newDirection.y;
        if (!opposite) {
          setDirection(newDirection);
          directionRef.current = newDirection;
          playSound(moveSoundRef);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [soundEnabled]);

  const [touchStart, setTouchStart] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const diffX = touchEnd.x - touchStart.x;
    const diffY = touchEnd.y - touchStart.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      const newDirection = diffX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      const opposite = directionRef.current.x === -newDirection.x;
      if (!opposite) {
        setDirection(newDirection);
        directionRef.current = newDirection;
        playSound(moveSoundRef);
      }
    } else {
      const newDirection = diffY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      const opposite = directionRef.current.y === -newDirection.y;
      if (!opposite) {
        setDirection(newDirection);
        directionRef.current = newDirection;
        playSound(moveSoundRef);
      }
    }

    setTouchStart(null);
  };

  useEffect(() => {
    if (gameOver || isPaused) return;

    const gameLoop = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y
        };

        if (newHead.x < 0 || newHead.x >= GRID_SIZE || 
            newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          playSound(gameOverSoundRef);
          if (backgroundMusicRef.current) {
            backgroundMusicRef.current.pause();
          }
          setTimeout(() => onGameOver(score), 500);
          return prevSnake;
        }

        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          playSound(gameOverSoundRef);
          if (backgroundMusicRef.current) {
            backgroundMusicRef.current.pause();
          }
          setTimeout(() => onGameOver(score), 500);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(prev => prev + 10);
          setFood(generateFood());
          setSpeed(prev => Math.max(50, prev - 2));
          playSound(eatSoundRef);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(gameLoop);
  }, [gameOver, isPaused, food, score, speed, onGameOver, generateFood, soundEnabled]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between items-center w-full max-w-md px-4">
        <div className="text-white">
          <span className="font-bold text-lg">{playerName}</span>
        </div>
        <div className="text-white text-2xl font-bold">
          🏆 {score}
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-3xl hover:scale-110 transition-transform active:scale-95"
          title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <div 
        className={`relative ${currentTheme.bg} border-4 ${currentTheme.grid} shadow-2xl`}
        style={{ 
          width: GRID_SIZE * CELL_SIZE, 
          height: GRID_SIZE * CELL_SIZE 
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute ${currentTheme.snake} ${index === 0 ? 'rounded-full' : 'rounded'}`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2
            }}
          />
        ))}

        <div
          className={`absolute ${currentTheme.food} rounded-full animate-pulse`}
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2
          }}
        />

        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-white text-center animate-bounce">
              <h2 className="text-3xl font-bold mb-2">💀 Game Over!</h2>
              <p className="text-xl">Score: {score}</p>
            </div>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-3xl font-bold animate-pulse">⏸️ PAUSA</div>
          </div>
        )}
      </div>

      <div className="text-white text-sm text-center">
        <p>🎮 Flechas/WASD | ⏸️ ESPACIO | 🔊 M para sonido</p>
        <p className="md:hidden">📱 Desliza para moverte</p>
      </div>
    </div>
  );
}