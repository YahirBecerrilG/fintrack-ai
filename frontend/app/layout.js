import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'FinTrack AI — Tu asesor financiero inteligente',
  description: 'Controla tus finanzas personales con inteligencia artificial',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-[#F5F7FA] text-[#1F2937] antialiased min-h-screen">
        
        {/* Contenedor global opcional para centrar contenido */}
        <div className="min-h-screen flex flex-col">
          {children}
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#111827', // gris oscuro elegante
              color: '#F9FAFB',
              borderRadius: '14px',
              fontSize: '14px',
              padding: '14px 18px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            },
            success: {
              iconTheme: {
                primary: '#16A34A', // verde financiero
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#DC2626', // rojo más sobrio
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}