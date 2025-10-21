import "./globals.css";

export const metadata = {
  title: "🐍 Snake Game - Juego de la Culebrita",
  description: "El clásico juego de la serpiente con ranking global",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}