import "./globals.css";
import Footer from "@/components/Footer";

export const metadata = {
  title: "🐍 Snake Game - Juego de la Culebrita",
  description: "El clásico juego de la serpiente con ranking global",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  themeColor: "#0a0a1a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}