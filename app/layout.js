import "./globals.css";

export const metadata = {
  title: "🐍 Snake Game - Juego de la Culebrita",
  description: "El clásico juego de la serpiente con ranking global",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
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