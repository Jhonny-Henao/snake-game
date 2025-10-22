'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 30; // Reducido para móvil
const CELL_SIZE = 18; // Aumentado para mejor visibilidad
const INITIAL_SNAKE = [
  { x: 15, y: 15 },
  { x: 14, y: 15 },
  { x: 13, y: 15 }
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
  const [baseSpeed] = useState(120); // Más lento para móvil
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
  const isTouchDevice = useRef(false);
  const touchActive = useRef(false);
  const currentTouchPos = useRef(null);
  const eatSoundRef = useRef(null);
  const gameOverSoundRef = useRef(null);
  const comboSoundRef = useRef(null);
  const powerUpSoundRef = useRef(null);
  const backgroundMusicRef = useRef(null);

  // Detectar si es dispositivo táctil
  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  // Prevenir comportamiento por defecto del navegador móvil
  useEffect(() => {
    const preventDefaultTouch = (e) => {
      e.preventDefault();
    };

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    document.addEventListener('gesturestart', preventDefaultTouch, { passive: false });
    document.addEventListener('gesturechange', preventDefaultTouch, { passive: false });
    document.addEventListener('gestureend', preventDefaultTouch, { passive: false });

    // Ocultar barra de direcciones
    setTimeout(() => window.scrollTo(0, 1), 100);

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.removeEventListener('touchmove', preventDefaultTouch);
      document.removeEventListener('gesturestart', preventDefaultTouch);
      document.removeEventListener('gesturechange', preventDefaultTouch);
      document.removeEventListener('gestureend', preventDefaultTouch);
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
    const count = 4;
    for (let i = 0; i < count; i++) {
      let newFood;
      let attempts = 0;
      do {
        newFood = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
          type: Math.random() > 0.75 ? 'special' : 'normal',
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

  // Controles táctiles MEJORADOS - Más suaves y controlables
  const handleTouchStart = useCallback((e) => {
    if (gameOver || isPaused) return;
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    currentTouchPos.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    touchActive.current = true;
  }, [gameOver, isPaused]);

  const handleTouchMove = useCallback((e) => {
    if (gameOver || isPaused || !touchActive.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    currentTouchPos.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }, [gameOver, isPaused]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    touchActive.current = false;
    currentTouchPos.current = null;
  }, []);

  // Calcular dirección suavizada para touch
  useEffect(() => {
    if (!isTouchDevice.current) return;
    
    const updateDirection = () => {
      if (gameOver || isPaused || !touchActive.current || !currentTouchPos.current) return;
      
      const head = snake[0];
      if (!head) return;
      
      const headPixelX = head.x * CELL_SIZE + CELL_SIZE / 2;
      const headPixelY = head.y * CELL_SIZE + CELL_SIZE / 2;
      
      const dx = currentTouchPos.current.x - headPixelX;
      const dy = currentTouchPos.current.y - headPixelY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Zona muerta más grande para evitar cambios involuntarios
      if (distance > 30) {
        const angle = Math.atan2(dy, dx);
        const deg = angle * 180 / Math.PI;
        
        let newDir;
        // Zonas más amplias para cada dirección (45 grados cada una)
        if (deg >= -22.5 && deg < 67.5) newDir = { x: 1, y: 0 }; // Derecha
        else if (deg >= 67.5 && deg < 112.5) newDir = { x: 0, y: 1 }; // Abajo
        else if (deg >= 112.5 || deg < -157.5) newDir = { x: -1, y: 0 }; // Izquierda
        else newDir = { x: 0, y: -1 }; // Arriba
        
        const currentDir = directionRef.current;
        const isOpposite = (currentDir.x === -newDir.x && currentDir.y === -newDir.y);
        
        if (!isOpposite && (newDir.x !== currentDir.x || newDir.y !== currentDir.y)) {
          nextDirectionRef.current = newDir;
        }
      }
    };
    
    const interval = setInterval(updateDirection, 100); // Actualización más lenta = más suave
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

          if (foodEaten && remainingFood.length < 2) {
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
              } else if (p.type === 'doublePoints') {
                activateEffect('doublePoints', 8000);
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

        if (Math.random() > 0.99 && powerUps.length < 1) {
          const types = ['invincible', 'doublePoints'];
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
        doublePoints: '#ffff00'
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
        const eyeSize = 4;
        ctx.fillRect(segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + 5, eyeSize, eyeSize);
        ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - 9, segment.y * CELL_SIZE + 5, eyeSize, eyeSize);
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

  const handleSoundToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSoundEnabled(prev => !prev);
  };

  const handlePauseToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPaused(prev => !prev);
  };

  return (
    <div ref={containerRef} className="fixed inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-black flex flex-col items-center justify-center overflow-hidden select-none">
      {/* HUD Compacto */}
      <div className="absolute top-0 left-0 right-0 z-20 p-2 flex justify-between items-center gap-2">
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-purple-500/30 flex items-center gap-2">
          <span className="text-purple-400 text-xs font-bold">{playerName}</span>
          <span className="text-white text-lg font-bold">{score}</span>
          {combo > 1 && (
            <span className="text-yellow-400 text-xs font-bold animate-pulse">
              🔥x{combo}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onTouchEnd={handleSoundToggle}
            onClick={handleSoundToggle}
            className="bg-black/60 backdrop-blur-md rounded-lg p-2.5 border border-white/20 active:scale-95 transition-transform text-xl touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onTouchEnd={handlePauseToggle}
            onClick={handlePauseToggle}
            className="bg-black/60 backdrop-blur-md rounded-lg p-2.5 border border-white/20 active:scale-95 transition-transform text-xl touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
        </div>
      </div>

      {/* Status effects */}
      {(isEffectActive('invincible') || isEffectActive('doublePoints')) && (
        <div className="absolute top-14 right-2 flex flex-col gap-1 z-20">
          {isEffectActive('invincible') && (
            <div className="bg-purple-500/40 backdrop-blur-md rounded-lg px-2 py-1 border border-purple-400/60 animate-pulse">
              <span className="text-purple-200 text-xs font-bold">⚡ INVINCIBLE</span>
            </div>
          )}
          {isEffectActive('doublePoints') && (
            <div className="bg-yellow-500/40 backdrop-blur-md rounded-lg px-2 py-1 border border-yellow-400/60 animate-pulse">
              <span className="text-yellow-200 text-xs font-bold">💎 2X</span>
            </div>
          )}
        </div>
      )}

      {/* Canvas con mejor tamaño para móvil */}
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="border-4 border-cyan-500/40 rounded-lg shadow-2xl touch-none"
        style={{
          boxShadow: '0 0 40px rgba(0, 255, 255, 0.3)',
          maxWidth: '96vw',
          maxHeight: '85vh',
          width: '540px',
          height: '540px',
          cursor: isTouchDevice.current ? 'default' : 'crosshair'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Indicador visual de toque activo */}
      {touchActive.current && currentTouchPos.current && (
        <div 
          className="absolute w-12 h-12 rounded-full border-4 border-cyan-400 pointer-events-none z-30 animate-ping"
          style={{
            left: currentTouchPos.current.x,
            top: currentTouchPos.current.y,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}

      {/* Instrucciones móvil */}
      <div className="absolute bottom-2 left-0 right-0 text-center px-2 z-20">
        <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-cyan-400/40 inline-block">
          <p className="text-cyan-300 text-xs font-bold">
            {isTouchDevice.current ? '👆 Toca y mantén presionado para dirigir la serpiente' : '🎮 WASD/Arrows • 🍎 +10 • ⭐ +25'}
          </p>
        </div>
      </div>

      {/* Longitud de serpiente */}
      <div className="absolute bottom-16 left-2 bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-green-500/30 z-20">
        <span className="text-green-400 text-xs font-bold">🐍 {snake.length}</span>
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-40 animate-fadeIn">
          <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-md rounded-2xl p-8 border-4 border-cyan-500/60 text-center transform animate-scaleIn max-w-sm mx-4">
            <div className="text-6xl mb-4 animate-bounce">💀</div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-3">
              GAME OVER
            </h2>
            <div className="text-white text-lg font-bold mb-1">Final Score</div>
            <div className="text-yellow-400 text-5xl font-bold mb-4">{score}</div>
            <div className="text-gray-300 text-base">
              Longitud: {snake.length}
            </div>
          </div>
        </div>
      )}

      {/* Pause */}
      {isPaused && !gameOver && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 border-2 border-white/30">
            <div className="text-white text-6xl font-bold animate-pulse">⏸️</div>
            <p className="text-white/80 text-sm mt-4 text-center">PAUSADO</p>
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
        
        /* Prevenir selección y comportamientos no deseados */
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        button {
          touch-action: manipulation;
        }
      `}</style>
    </div>
  );
}