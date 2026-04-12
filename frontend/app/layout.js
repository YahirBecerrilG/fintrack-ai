import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'FinTrack AI — Tu asesor financiero inteligente',
  description: 'Controla tus finanzas personales con inteligencia artificial',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1C2B3A',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#34A853', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#EA4335', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}