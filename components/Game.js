'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 40;
const CELL_SIZE = 15;
const INITIAL_SNAKE = [
  { x: 20, y: 20 },
  { x: 19, y: 20 },
  { x: 18, y: 20 }
];

const SKINS = {
  neon: { head: '#00ffff', body: '#0066ff', glow: '#00ffff' },
  fire: { head: '#ff4400', body: '#ff8800', glow: '#ff0000' },
  toxic: { head: '#00ff00', body: '#44ff00', glow: '#00ff00' },
  galaxy: { head: '#ff00ff', body: '#8800ff', glow: '#ff00ff' },
  gold: { head: '#ffd700', body: '#ffaa00', glow: '#ffd700' }
};

export default function Game({ playerName, onGameOver, theme = 'classic', selectedSkin = 'neon' }) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState([]);
  const [particles, setParticles] = useState([]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [baseSpeed] = useState(100);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [combo, setCombo] = useState(0);
  const [powerUps, setPowerUps] = useState([]);
  const [activeEffects, setActiveEffects] = useState([]);
  const [skin, setSkin] = useState(selectedSkin);
  const [growthQueue, setGrowthQueue] = useState(0);
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const directionRef = useRef(direction);
  const nextDirectionRef = useRef(direction);
  const mouseMode = useRef(false);
  const touchStartPos = useRef(null);
  const lastTouchPos = useRef(null);
  const eatSoundRef = useRef(null);
  const gameOverSoundRef = useRef(null);
  const comboSoundRef = useRef(null);
  const powerUpSoundRef = useRef(null);
  const backgroundMusicRef = useRef(null);

  // Prevenir comportamiento por defecto del navegador móvil
  useEffect(() => {
    const preventDefaultTouch = (e) => {
      if (e.target.closest('canvas') || e.target.closest('button')) {
        e.preventDefault();
      }
    };

    const preventScroll = (e) => {
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    document.addEventListener('touchstart', preventDefaultTouch, { passive: false });
    document.addEventListener('gesturestart', preventScroll, { passive: false });
    document.addEventListener('gesturechange', preventScroll, { passive: false });
    document.addEventListener('gestureend', preventScroll, { passive: false });

    // Ocultar barra de direcciones en móviles
    const hideAddressBar = () => {
      window.scrollTo(0, 1);
    };
    window.addEventListener('load', hideAddressBar);
    setTimeout(hideAddressBar, 100);

    return () => {
      document.removeEventListener('touchmove', preventDefaultTouch);
      document.removeEventListener('touchstart', preventDefaultTouch);
      document.removeEventListener('gesturestart', preventScroll);
      document.removeEventListener('gesturechange', preventScroll);
      document.removeEventListener('gestureend', preventScroll);
      window.removeEventListener('load', hideAddressBar);
    };
  }, []);

  // Inicializar sonidos
  useEffect(() => {
    eatSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    gameOverSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
    comboSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3');
    powerUpSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3');
    backgroundMusicRef.current = new Audio('https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Shipping_Lanes.mp3');
    
    eatSoundRef.current.volume = 0.3;
    gameOverSoundRef.current.volume = 0.4;
    comboSoundRef.current.volume = 0.3;
    powerUpSoundRef.current.volume = 0.4;
    backgroundMusicRef.current.volume = 0.15;
    backgroundMusicRef.current.loop = true;
    
    if (soundEnabled) {
      backgroundMusicRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    
    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
    };
  }, []);

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
    const newFoodItems = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      let newFood;
      let attempts = 0;
      do {
        newFood = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
          type: Math.random() > 0.7 ? 'special' : 'normal',
          id: Date.now() + i + Math.random()
        };
        attempts++;
      } while (
        attempts < 100 && 
        (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
         newFoodItems.some(f => f.x === newFood.x && f.y === newFood.y))
      );
      if (attempts < 100) {
        newFoodItems.push(newFood);
      }
    }
    return newFoodItems;
  }, [snake]);

  useEffect(() => {
    setFood(generateFood());
  }, []);

  const createParticles = (x, y, color, count = 10) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        color,
        size: Math.random() * 5 + 2
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.03,
          vy: p.vy + 0.15
        }))
        .filter(p => p.life > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const activateEffect = (type, duration = 5000) => {
    const effect = { type, endTime: Date.now() + duration };
    setActiveEffects(prev => [...prev.filter(e => e.type !== type), effect]);
    
    setTimeout(() => {
      setActiveEffects(prev => prev.filter(e => e.type !== type));
    }, duration);
  };

  const isEffectActive = (type) => {
    return activeEffects.some(e => e.type === type && e.endTime > Date.now());
  };

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;

      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setSoundEnabled(prev => !prev);
        return;
      }

      const skinKeys = { '1': 'neon', '2': 'fire', '3': 'toxic', '4': 'galaxy', '5': 'gold' };
      if (skinKeys[e.key]) {
        setSkin(skinKeys[e.key]);
        return;
      }

      const keyMap = {
        'ArrowUp': { x: 0, y: -1 },
        'ArrowDown': { x: 0, y: 1 },
        'ArrowLeft': { x: -1, y: 0 },
        'ArrowRight': { x: 1, y: 0 },
        'w': { x: 0, y: -1 },
        'W': { x: 0, y: -1 },
        's': { x: 0, y: 1 },
        'S': { x: 0, y: 1 },
        'a': { x: -1, y: 0 },
        'A': { x: -1, y: 0 },
        'd': { x: 1, y: 0 },
        'D': { x: 1, y: 0 }
      };

      const newDir = keyMap[e.key];
      if (newDir) {
        e.preventDefault();
        mouseMode.current = false;
        
        const currentDir = directionRef.current;
        const isOpposite = (currentDir.x === -newDir.x && currentDir.y === -newDir.y) &&
                          (currentDir.x !== 0 || currentDir.y !== 0);
        
        if (!isOpposite && !isPaused) {
          nextDirectionRef.current = newDir;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused]);

  // Controles táctiles mejorados estilo Slither.io
  const handleTouchStart = useCallback((e) => {
    if (gameOver || isPaused) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    touchStartPos.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    lastTouchPos.current = touchStartPos.current;
    mouseMode.current = true;
  }, [gameOver, isPaused]);

  const handleTouchMove = useCallback((e) => {
    if (gameOver || isPaused || !touchStartPos.current) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    lastTouchPos.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    mouseMode.current = true;
  }, [gameOver, isPaused]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    // No resetear la posición, mantener la última dirección
  }, []);

  // Calcular dirección del touch (modo continuo como Slither.io)
  useEffect(() => {
    const updateDirection = () => {
      if (gameOver || isPaused || !mouseMode.current || !lastTouchPos.current) return;
      
      const head = snake[0];
      if (!head) return;
      
      const headPixelX = head.x * CELL_SIZE + CELL_SIZE / 2;
      const headPixelY = head.y * CELL_SIZE + CELL_SIZE / 2;
      
      const dx = lastTouchPos.current.x - headPixelX;
      const dy = lastTouchPos.current.y - headPixelY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 5) { // Threshold más bajo para móviles
        const angle = Math.atan2(dy, dx);
        const deg = angle * 180 / Math.PI;
        
        let newDir;
        if (deg >= -45 && deg < 45) newDir = { x: 1, y: 0 };
        else if (deg >= 45 && deg < 135) newDir = { x: 0, y: 1 };
        else if (deg >= 135 || deg < -135) newDir = { x: -1, y: 0 };
        else newDir = { x: 0, y: -1 };
        
        const currentDir = directionRef.current;
        const isOpposite = (currentDir.x === -newDir.x && currentDir.y === -newDir.y);
        
        if (!isOpposite) {
          nextDirectionRef.current = newDir;
        }
      }
    };
    
    const interval = setInterval(updateDirection, 50);
    return () => clearInterval(interval);
  }, [snake, gameOver, isPaused]);

  // Loop principal del juego
  useEffect(() => {
    if (gameOver || isPaused) return;

    const gameLoop = setInterval(() => {
      directionRef.current = nextDirectionRef.current;

      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y
        };

        if (!isEffectActive('invincible')) {
          if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
            setGameOver(true);
            playSound(gameOverSoundRef);
            backgroundMusicRef.current?.pause();
            createParticles(head.x, head.y, '#ff0000', 30);
            setTimeout(() => onGameOver(score), 800);
            return prevSnake;
          }

          if (prevSnake.length >= 4) {
            const collision = prevSnake.slice(1).some(segment => 
              segment.x === newHead.x && segment.y === newHead.y
            );
            
            if (collision) {
              setGameOver(true);
              playSound(gameOverSoundRef);
              backgroundMusicRef.current?.pause();
              createParticles(newHead.x, newHead.y, '#ff0000', 30);
              setTimeout(() => onGameOver(score), 800);
              return prevSnake;
            }
          }
        }

        const newSnake = [newHead, ...prevSnake];

        let foodEaten = false;
        
        setFood(prevFood => {
          const remainingFood = prevFood.filter(f => {
            if (f.x === newHead.x && f.y === newHead.y) {
              foodEaten = true;
              setGrowthQueue(prev => prev + 1);
              
              const points = f.type === 'special' ? 25 : 10;
              const multiplier = isEffectActive('doublePoints') ? 2 : 1;
              setScore(prev => prev + points * multiplier);
              setCombo(prev => prev + 1);
              
              const color = f.type === 'special' ? '#ffd700' : '#00ff88';
              createParticles(f.x, f.y, color, 20);
              playSound(eatSoundRef);
              
              if (combo > 0 && combo % 5 === 0) {
                playSound(comboSoundRef);
              }
              
              return false;
            }
            return true;
          });

          if (foodEaten && remainingFood.length < 3) {
            return [...remainingFood, ...generateFood()];
          }
          return remainingFood;
        });

        setPowerUps(prevPowerUps => {
          return prevPowerUps.filter(p => {
            if (p.x === newHead.x && p.y === newHead.y) {
              setGrowthQueue(prev => prev + 1);
              
              playSound(powerUpSoundRef);
              createParticles(p.x, p.y, '#ff00ff', 25);
              setScore(prev => prev + 50);
              
              if (p.type === 'invincible') {
                activateEffect('invincible', 5000);
              } else if (p.type === 'speed') {
                setScore(prev => prev + 30);
              } else if (p.type === 'doublePoints') {
                activateEffect('doublePoints', 8000);
              } else if (p.type === 'freeze') {
                setScore(prev => prev + 30);
              }
              
              return false;
            }
            return true;
          });
        });

        if (growthQueue > 0) {
          setGrowthQueue(prev => prev - 1);
        } else {
          newSnake.pop();
        }
        
        if (!foodEaten) {
          setCombo(0);
        }

        if (Math.random() > 0.985 && powerUps.length < 2) {
          const types = ['invincible', 'speed', 'doublePoints', 'freeze'];
          const newPowerUp = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
            type: types[Math.floor(Math.random() * types.length)],
            id: Date.now() + Math.random()
          };
          setPowerUps(prev => [...prev, newPowerUp]);
        }

        return newSnake;
      });
    }, isEffectActive('freeze') ? baseSpeed * 2 : baseSpeed);

    return () => clearInterval(gameLoop);
  }, [gameOver, isPaused, score, baseSpeed, onGameOver, generateFood, combo, powerUps, growthQueue]);

  // Renderizado con Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = GRID_SIZE * CELL_SIZE;
    const height = GRID_SIZE * CELL_SIZE;

    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0a0a1a');
    bgGradient.addColorStop(1, '#1a0a2a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(100, 100, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(width, i * CELL_SIZE);
      ctx.stroke();
    }

    food.forEach(f => {
      const pulse = Math.sin(Date.now() / 200) * 2;
      const gradient = ctx.createRadialGradient(
        f.x * CELL_SIZE + CELL_SIZE / 2,
        f.y * CELL_SIZE + CELL_SIZE / 2,
        0,
        f.x * CELL_SIZE + CELL_SIZE / 2,
        f.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE
      );
      
      if (f.type === 'special') {
        gradient.addColorStop(0, '#ffd700');
        gradient.addColorStop(1, '#ff8800');
      } else {
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(1, '#00aa55');
      }
      
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 20;
      ctx.shadowColor = f.type === 'special' ? '#ffd700' : '#00ff88';
      ctx.beginPath();
      ctx.arc(
        f.x * CELL_SIZE + CELL_SIZE / 2,
        f.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 1 + pulse,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    powerUps.forEach(p => {
      const colors = {
        invincible: '#ff00ff',
        speed: '#00ffff',
        doublePoints: '#ffff00',
        freeze: '#00aaff'
      };
      
      const pulse = Math.sin(Date.now() / 150) * 3;
      ctx.fillStyle = colors[p.type];
      ctx.shadowBlur = 25;
      ctx.shadowColor = colors[p.type];
      ctx.beginPath();
      ctx.arc(
        p.x * CELL_SIZE + CELL_SIZE / 2,
        p.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 + pulse,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    const currentSkin = SKINS[skin];
    snake.forEach((segment, index) => {
      const alpha = 1 - (index / snake.length) * 0.4;
      const size = CELL_SIZE - 2 - (index / snake.length) * 2;
      
      const gradient = ctx.createRadialGradient(
        segment.x * CELL_SIZE + CELL_SIZE / 2,
        segment.y * CELL_SIZE + CELL_SIZE / 2,
        0,
        segment.x * CELL_SIZE + CELL_SIZE / 2,
        segment.y * CELL_SIZE + CELL_SIZE / 2,
        size / 2
      );
      
      if (isEffectActive('invincible')) {
        gradient.addColorStop(0, `rgba(255, 0, 255, ${alpha})`);
        gradient.addColorStop(1, `rgba(138, 43, 226, ${alpha})`);
      } else {
        const headRgb = hexToRgb(currentSkin.head);
        const bodyRgb = hexToRgb(currentSkin.body);
        gradient.addColorStop(0, `rgba(${headRgb.r}, ${headRgb.g}, ${headRgb.b}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${bodyRgb.r}, ${bodyRgb.g}, ${bodyRgb.b}, ${alpha})`);
      }
      
      ctx.fillStyle = gradient;
      
      if (index === 0) {
        ctx.shadowBlur = 25;
        ctx.shadowColor = isEffectActive('invincible') ? '#ff00ff' : currentSkin.glow;
        ctx.beginPath();
        ctx.arc(
          segment.x * CELL_SIZE + CELL_SIZE / 2,
          segment.y * CELL_SIZE + CELL_SIZE / 2,
          size / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ffffff';
        const eyeSize = 3;
        ctx.fillRect(segment.x * CELL_SIZE + 4, segment.y * CELL_SIZE + 4, eyeSize, eyeSize);
        ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - 7, segment.y * CELL_SIZE + 4, eyeSize, eyeSize);
        ctx.shadowBlur = 0;
      } else {
        ctx.beginPath();
        ctx.arc(
          segment.x * CELL_SIZE + CELL_SIZE / 2,
          segment.y * CELL_SIZE + CELL_SIZE / 2,
          size / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });

    particles.forEach(p => {
      ctx.fillStyle = `${p.color}${Math.floor(p.life * 255).toString(16).padStart(2, '0')}`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

  }, [snake, food, powerUps, particles, skin, activeEffects]);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 255, b: 255 };
  };

  return (
    <div ref={containerRef} className="fixed inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-black flex flex-col items-center justify-center overflow-hidden touch-none">
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-20 p-2 sm:p-4 flex justify-between items-start flex-wrap gap-2">
        <div className="bg-black/40 backdrop-blur-md rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-3 border border-cyan-500/30">
          <div className="text-cyan-400 text-xs sm:text-sm font-semibold mb-1">PLAYER</div>
          <div className="text-white text-sm sm:text-xl font-bold">{playerName}</div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-md rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-3 border border-purple-500/30">
          <div className="text-purple-400 text-xs sm:text-sm font-semibold mb-1">SCORE</div>
          <div className="text-white text-xl sm:text-3xl font-bold">{score}</div>
          {combo > 1 && (
            <div className="text-yellow-400 text-xs sm:text-sm font-bold animate-pulse mt-1">
              🔥 COMBO x{combo}
            </div>
          )}
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-3 border border-green-500/30">
          <div className="text-green-400 text-xs sm:text-sm font-semibold mb-1">LENGTH</div>
          <div className="text-white text-xl sm:text-3xl font-bold">{snake.length}</div>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-black/40 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20 hover:border-white/40 transition-all text-xl sm:text-2xl active:scale-95"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="bg-black/40 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20 hover:border-white/40 transition-all text-xl sm:text-2xl active:scale-95"
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
        </div>
      </div>

      {/* Status effects */}
      <div className="absolute top-20 sm:top-24 right-2 sm:right-4 flex flex-col gap-2 z-20">
        {isEffectActive('invincible') && (
          <div className="bg-purple-500/30 backdrop-blur-md rounded-lg sm:rounded-xl px-2 sm:px-4 py-1 sm:py-2 border border-purple-400/50 animate-pulse">
            <span className="text-purple-300 text-xs sm:text-sm font-bold">⚡ INVINCIBLE</span>
          </div>
        )}
        {isEffectActive('doublePoints') && (
          <div className="bg-yellow-500/30 backdrop-blur-md rounded-lg sm:rounded-xl px-2 sm:px-4 py-1 sm:py-2 border border-yellow-400/50 animate-pulse">
            <span className="text-yellow-300 text-xs sm:text-sm font-bold">💎 2X POINTS</span>
          </div>
        )}
        {isEffectActive('freeze') && (
          <div className="bg-blue-500/30 backdrop-blur-md rounded-lg sm:rounded-xl px-2 sm:px-4 py-1 sm:py-2 border border-blue-400/50 animate-pulse">
            <span className="text-blue-300 text-xs sm:text-sm font-bold">❄️ SLOW</span>
          </div>
        )}
      </div>

      {/* Skin selector */}
      <div className="absolute top-20 sm:top-24 left-2 sm:left-4 bg-black/40 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20 z-20">
        <div className="text-white text-xs font-semibold mb-2 hidden sm:block">SKIN (1-5)</div>
        <div className="flex gap-1 sm:gap-2">
          {Object.keys(SKINS).map((s, i) => (
            <button
              key={s}
              onClick={() => setSkin(s)}
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all ${
                skin === s ? 'border-white scale-110' : 'border-white/30'
              }`}
              style={{ background: `linear-gradient(135deg, ${SKINS[s].head}, ${SKINS[s].body})` }}
              title={s}
            />
          ))}
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="border-4 border-cyan-500/30 rounded-lg shadow-2xl touch-none"
        style={{
          boxShadow: '0 0 60px rgba(0, 255, 255, 0.3), inset 0 0 60px rgba(0, 0, 0, 0.5)',
          maxWidth: '95vw',
          maxHeight: '70vh',
          cursor: 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Instrucciones - Ocultas en móvil cuando se juega */}
      <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 text-center px-2 z-20 hidden sm:block">
        <div className="bg-black/40 backdrop-blur-md rounded-lg sm:rounded-xl px-3 sm:px-6 py-2 sm:py-3 border border-white/20 inline-block">
          <p className="text-cyan-400 text-xs sm:text-sm font-semibold">
            🎮 WASD/Arrows or Touch Screen • 🍎 +10 • ⭐ +25 • 💎 Power-ups • 1-5: Change Skin
          </p>
        </div>
      </div>

      {/* Indicador táctil para móviles */}
      <div className="absolute bottom-2 left-0 right-0 text-center px-2 z-20 sm:hidden">
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-cyan-400/40 inline-block">
          <p className="text-cyan-300 text-xs font-bold">
            👆 Touch & Drag para mover la serpiente
          </p>
        </div>
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-30 animate-fadeIn">
          <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-12 border-4 border-cyan-500/50 text-center transform animate-scaleIn max-w-md mx-4">
            <div className="text-5xl sm:text-8xl mb-4 animate-bounce">💀</div>
            <h2 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
              GAME OVER
            </h2>
            <div className="text-white text-xl sm:text-3xl font-bold mb-2">Final Score</div>
            <div className="text-yellow-400 text-4xl sm:text-6xl font-bold mb-6">{score}</div>
            <div className="text-gray-300 text-lg sm:text-xl">
              Snake Length: {snake.length}
            </div>
          </div>
        </div>
      )}

      {/* Pause */}
      {isPaused && !gameOver && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-8 sm:p-12 border-2 border-white/30">
            <div className="text-white text-5xl sm:text-7xl font-bold animate-pulse">⏸️ PAUSED</div>
            <p className="text-white/70 text-sm sm:text-base mt-4 text-center">Press SPACE or ESC to continue</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}