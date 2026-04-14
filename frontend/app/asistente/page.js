'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

// ── Burbuja de mensaje ──────────────────────────────────
function Mensaje({ msg }) {
  const esUsuario = msg.role === 'user';
  return (
    <div className={`flex ${esUsuario ? 'justify-end' : 'justify-start'} mb-4`}>
      {!esUsuario && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600
          flex items-center justify-center text-white text-sm font-bold mr-2 flex-shrink-0 mt-1">
          AI
        </div>
      )}
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
        ${esUsuario
          ? 'bg-blue-600 text-white rounded-br-none'
          : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
        }`}>
        {msg.content}
      </div>
      {esUsuario && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center
          text-gray-500 text-sm font-bold ml-2 flex-shrink-0 mt-1">
          Tú
        </div>
      )}
    </div>
  );
}

// ── Skeleton de carga ───────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600
        flex items-center justify-center text-white text-sm font-bold mr-2 flex-shrink-0">
        AI
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-5">
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

// ── Preguntas sugeridas ─────────────────────────────────
const SUGERENCIAS = [
  '¿Cómo puedo ahorrar más este mes?',
  '¿En qué estoy gastando demasiado?',
  '¿Cuál deuda debo pagar primero?',
  '¿Cómo mejorar mi tasa de ahorro?',
  'Dame un plan para salir de deudas',
  '¿Cuánto debería tener en mi fondo de emergencia?',
];

// ── Página principal ────────────────────────────────────
export default function AsistentePage() {
  const router   = useRouter();
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const [mensajes,   setMensajes]   = useState([]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [analyzing,  setAnalyzing]  = useState(false);
  const [contexto,   setContexto]   = useState(null);
  const [historial,  setHistorial]  = useState([]);
  const [tabActiva,  setTabActiva]  = useState('chat'); // 'chat' | 'historial'

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    fetchHistorial();
    // Mensaje de bienvenida
    setMensajes([{
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asesor financiero personal con IA.\n\nPuedo ayudarte a:\n• Analizar tus ingresos y gastos\n• Optimizar el pago de tus deudas\n• Darte recomendaciones personalizadas\n• Responder cualquier duda financiera\n\n¿Por dónde quieres empezar?'
    }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, loading]);

  async function fetchHistorial() {
    try {
      const res = await api.get('/api/ai/history');
      setHistorial(res.data.historial);
    } catch (err) {
      console.error(err);
    }
  }

  // Análisis completo de finanzas
  async function handleAnalizar() {
    setAnalyzing(true);
    setMensajes(prev => [
      ...prev,
      { role: 'user', content: '📊 Analiza mis finanzas completas y dame recomendaciones.' }
    ]);
    try {
      const res = await api.post('/api/ai/analyze');
      setContexto(res.data.contexto);
      setMensajes(prev => [
        ...prev,
        { role: 'assistant', content: res.data.respuesta }
      ]);
      fetchHistorial();
    } catch (err) {
      setMensajes(prev => [
        ...prev,
        { role: 'assistant', content: '❌ Hubo un error al analizar tus finanzas. Verifica tu conexión.' }
      ]);
    } finally {
      setAnalyzing(false);
    }
  }

  // Chat libre
  async function handleSend(textoDirecto) {
    const texto = textoDirecto || input.trim();
    if (!texto || loading) return;

    const userMsg = { role: 'user', content: texto };
    const nuevosMensajes = [...mensajes, userMsg];
    setMensajes(nuevosMensajes);
    setInput('');
    setLoading(true);

    try {
      // Enviar solo los últimos 10 mensajes para no exceder tokens
      const historialEnviar = nuevosMensajes
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await api.post('/api/ai/chat', { mensajes: historialEnviar });
      setMensajes(prev => [
        ...prev,
        { role: 'assistant', content: res.data.respuesta }
      ]);
    } catch (err) {
      setMensajes(prev => [
        ...prev,
        { role: 'assistant', content: '❌ Error al conectar con la IA. Intenta de nuevo.' }
      ]);
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

  function limpiarChat() {
    setMensajes([{
      role: 'assistant',
      content: 'Chat reiniciado. ¿En qué puedo ayudarte? 😊'
    }]);
  }

  const fmt = n => `$${parseFloat(n||0).toLocaleString('es-MX',{minimumFractionDigits:2})}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full p-6 flex gap-6">

        {/* ── Panel izquierdo ── */}
        <div className="w-72 flex-shrink-0 space-y-4">

          {/* Botón analizar */}
          <button onClick={handleAnalizar} disabled={analyzing || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600
              hover:from-blue-700 hover:to-purple-700
              disabled:from-gray-400 disabled:to-gray-400
              text-white font-bold py-3 px-4 rounded-xl transition-all duration-200
              shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none">
            {analyzing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Analizando...
              </span>
            ) : '🔍 Analizar mis finanzas'}
          </button>

          {/* Contexto financiero */}
          {contexto && (
            <div className="bg-white rounded-xl shadow-sm p-4 text-sm space-y-2">
              <p className="font-bold text-gray-700 text-xs uppercase tracking-wide mb-3">
                Tu resumen
              </p>
              {[
                { label: 'Ingresos', value: fmt(contexto.total_ingresos), color: 'text-green-600' },
                { label: 'Gastos',   value: fmt(contexto.total_gastos),   color: 'text-red-500'   },
                { label: 'Balance',  value: fmt(contexto.balance),
                  color: contexto.balance >= 0 ? 'text-blue-600' : 'text-orange-500' },
                { label: 'Ahorro',   value: `${contexto.tasa_ahorro}%`,  color: 'text-purple-600' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-400">{item.label}</span>
                  <span className={`font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Sugerencias */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="font-bold text-gray-700 text-xs uppercase tracking-wide mb-3">
              Preguntas frecuentes
            </p>
            <div className="space-y-2">
              {SUGERENCIAS.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)}
                  disabled={loading || analyzing}
                  className="w-full text-left text-xs text-gray-600 hover:text-blue-600
                    hover:bg-blue-50 p-2 rounded-lg transition-colors disabled:opacity-40">
                  💬 {s}
                </button>
              ))}
            </div>
          </div>

          {/* Limpiar chat */}
          <button onClick={limpiarChat}
            className="w-full text-xs text-gray-400 hover:text-gray-600
              hover:bg-gray-100 py-2 rounded-lg transition-colors">
            🗑️ Limpiar conversación
          </button>
        </div>

        {/* ── Panel derecho: chat + historial ── */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[
              { id: 'chat',      label: '💬 Chat'     },
              { id: 'historial', label: '📋 Historial' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setTabActiva(tab.id)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors
                  ${tabActiva === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                  }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB CHAT ── */}
          {tabActiva === 'chat' && (
            <>
              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-6 space-y-1"
                style={{ maxHeight: 'calc(100vh - 300px)' }}>
                {mensajes.map((msg, i) => (
                  <Mensaje key={i} msg={msg} />
                ))}
                {(loading || analyzing) && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 p-4">
                <div className="flex gap-3 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading || analyzing}
                    placeholder="Escribe tu pregunta financiera... (Enter para enviar)"
                    rows={1}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
                      disabled:bg-gray-50 disabled:text-gray-400"
                    style={{ maxHeight: '120px' }}
                    onInput={e => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || loading || analyzing}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200
                      text-white disabled:text-gray-400 p-3 rounded-xl transition-colors
                      flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-300 mt-2 text-center">
                  Shift+Enter para nueva línea · Enter para enviar
                </p>
              </div>
            </>
          )}

          {/* ── TAB HISTORIAL ── */}
          {tabActiva === 'historial' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4"
              style={{ maxHeight: 'calc(100vh - 260px)' }}>
              {historial.length === 0 ? (
                <div className="py-16 text-center text-gray-300">
                  <p className="text-4xl mb-3">🤖</p>
                  <p className="text-sm">Aún no hay análisis guardados.</p>
                  <p className="text-xs mt-1">Usa el botón "Analizar mis finanzas" para generar uno.</p>
                </div>
              ) : (
                historial.map((rec, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50
                        px-2 py-0.5 rounded-full">
                        Análisis #{historial.length - i}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(rec.fecha).toLocaleDateString('es-MX', {
                          day:'numeric', month:'long', year:'numeric',
                          hour:'2-digit', minute:'2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {rec.mensaje}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}