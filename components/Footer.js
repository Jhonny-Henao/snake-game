'use client';

export default function Footer() {
  return (
    <footer className="relative border-t border-cyan-500/20 bg-gradient-to-b from-indigo-950 via-purple-950/90 to-black/90 backdrop-blur-md">
      {/* Efecto de brillo superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
      
      <div className="max-w-6xl mx-auto px-6 py-12 relative">
        {/* Orbes de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 relative z-10">
          {/* Brand Section */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
              🐍 Snake Game
            </h3>
            <p className="text-sm text-gray-200/90 leading-relaxed">
              El clásico juego de la serpiente reinventado con tecnología moderna. 
              Compite globalmente y demuestra tus habilidades.
            </p>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="text-lg">⚡</span>
              Tecnologías
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-lg border border-purple-400/50 hover:bg-purple-500/30 hover:border-purple-400/70 transition-all hover:scale-105 shadow-lg shadow-purple-500/20">
                React
              </span>
              <span className="px-3 py-1.5 text-xs font-medium bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-400/50 hover:bg-cyan-500/30 hover:border-cyan-400/70 transition-all hover:scale-105 shadow-lg shadow-cyan-500/20">
                Next.js
              </span>
              <span className="px-3 py-1.5 text-xs font-medium bg-green-500/20 text-green-300 rounded-lg border border-green-400/50 hover:bg-green-500/30 hover:border-green-400/70 transition-all hover:scale-105 shadow-lg shadow-green-500/20">
                Supabase
              </span>
              <span className="px-3 py-1.5 text-xs font-medium bg-pink-500/20 text-pink-300 rounded-lg border border-pink-400/50 hover:bg-pink-500/30 hover:border-pink-400/70 transition-all hover:scale-105 shadow-lg shadow-pink-500/20">
                Tailwind CSS
              </span>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="text-lg">🌐</span>
              Conecta
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://github.com/Jhonny-Henao?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-100 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 transition-all group hover:scale-105 shadow-lg hover:shadow-cyan-500/20"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🐱</span>
                <span className="text-sm font-medium">GitHub</span>
              </a>
              <a
                href="mailto:jhonny100@gmail.com"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-100 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-400/50 transition-all group hover:scale-105 shadow-lg hover:shadow-green-500/20"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">📧</span>
                <span className="text-sm font-medium">Contacto</span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider con brillo */}
        <div className="relative mb-6">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent blur-sm"></div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm relative z-10">
          <p className="text-center md:text-left text-gray-100/90">
            Hecho con <span className="text-pink-400 animate-pulse inline-block">💜</span> por{" "}
            <span className="font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Jhonny Henao</span>
          </p>
          <p className="text-xs text-gray-300/70">
            © {new Date().getFullYear()} Snake Ultra • Proyecto educativo de código abierto
          </p>
        </div>
      </div>

      {/* Puntos decorativos */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>
    </footer>
  );
}