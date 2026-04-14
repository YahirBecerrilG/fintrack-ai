'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

// ── Burbuja de mensaje ──────────────────────────────────
function Mensaje({ msg }) {
  const esUsuario = msg.role === 'user';

  return (
    <div className={`flex ${esUsuario ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
      
      {!esUsuario && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600
          flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shadow-sm">
          AI
        </div>
      )}

      <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
        rounded-2xl shadow-sm
        ${esUsuario
          ? 'bg-blue-600 text-white rounded-br-none'
          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
        }`}>
        {msg.content}
      </div>

      {esUsuario && (
        <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center
          text-gray-600 text-xs font-bold ml-2 mt-1">
          Tú
        </div>
      )}
    </div>
  );
}

// ── Typing ─────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-2 items-center animate-fade-in">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600
        flex items-center justify-center text-white text-xs font-bold">
        AI
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const SUGERENCIAS = [
  '¿Cómo puedo ahorrar más este mes?',
  '¿En qué estoy gastando demasiado?',
  '¿Cuál deuda debo pagar primero?',
  '¿Cómo mejorar mi tasa de ahorro?',
  'Dame un plan para salir de deudas',
  '¿Cuánto debería tener en mi fondo de emergencia?',
];

// ── PAGE ─────────────────────────────────────────────
export default function AsistentePage() {
  const router = useRouter();
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [contexto, setContexto] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [tabActiva, setTabActiva] = useState('chat');

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    fetchHistorial();

    setMensajes([{
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asesor financiero con IA.\n\n¿En qué quieres mejorar hoy?'
    }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, loading]);

  async function fetchHistorial() {
    try {
      const res = await api.get('/api/ai/history');
      setHistorial(res.data.historial);
    } catch {}
  }

  async function handleAnalizar() {
    setAnalyzing(true);
    setMensajes(prev => [...prev, {
      role: 'user',
      content: '📊 Analiza mis finanzas'
    }]);

    try {
      const res = await api.post('/api/ai/analyze');
      setContexto(res.data.contexto);
      setMensajes(prev => [...prev, {
        role: 'assistant',
        content: res.data.respuesta
      }]);
      fetchHistorial();
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSend(textoDirecto) {
    const texto = textoDirecto || input.trim();
    if (!texto || loading) return;

    const nuevos = [...mensajes, { role: 'user', content: texto }];
    setMensajes(nuevos);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/ai/chat', {
        mensajes: nuevos.slice(-10)
      });

      setMensajes(prev => [...prev, {
        role: 'assistant',
        content: res.data.respuesta
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 flex flex-col md:flex-row gap-6">

        {/* SIDEBAR */}
        <div className="md:w-80 w-full space-y-4">

          <button
            onClick={handleAnalizar}
            disabled={analyzing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600
              text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition">
            {analyzing ? 'Analizando...' : '🔍 Analizar finanzas'}
          </button>

          {contexto && (
            <div className="bg-white rounded-2xl shadow-sm p-4 text-sm space-y-2">
              <p className="font-bold text-xs text-gray-400">Resumen</p>

              <div className="flex justify-between">
                <span>Ingresos</span>
                <span className="text-green-600 font-semibold">
                  ${contexto.total_ingresos}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Gastos</span>
                <span className="text-red-500 font-semibold">
                  ${contexto.total_gastos}
                </span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs font-bold text-gray-400 mb-2">Sugerencias</p>

            <div className="space-y-2">
              {SUGERENCIAS.map((s, i) => (
                <button key={i}
                  onClick={() => handleSend(s)}
                  className="w-full text-left text-xs p-2 rounded-lg
                    hover:bg-blue-50 hover:text-blue-600 transition">
                  💬 {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CHAT */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm">

          {/* Tabs */}
          <div className="flex border-b">
            {['chat','historial'].map(tab => (
              <button key={tab}
                onClick={() => setTabActiva(tab)}
                className={`flex-1 py-3 text-sm font-semibold ${
                  tabActiva === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-400'
                }`}>
                {tab === 'chat' ? '💬 Chat' : '📋 Historial'}
              </button>
            ))}
          </div>

          {tabActiva === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {mensajes.map((msg, i) => (
                  <Mensaje key={i} msg={msg} />
                ))}
                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>

              <div className="border-t p-4">
                <div className="flex gap-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu pregunta..."
                    className="flex-1 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                  />

                  <button
                    onClick={() => handleSend()}
                    className="bg-blue-600 text-white px-4 rounded-xl">
                    ➤
                  </button>
                </div>
              </div>
            </>
          )}

          {tabActiva === 'historial' && (
            <div className="p-6 space-y-4 overflow-y-auto">
              {historial.length === 0 ? (
                <p className="text-center text-gray-400">Sin historial</p>
              ) : historial.map((h, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-xl text-sm">
                  {h.mensaje}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}