import './globals.css';

export const metadata = {
  title: 'FinTrack AI',
  description: 'Sistema inteligente de finanzas personales',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}