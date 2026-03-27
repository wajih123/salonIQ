import { useState, useRef, useEffect } from 'react';
import { ownerChat, clientChat } from '../../lib/api.js';

function ThinkingDots({ theme }) {
  const color = theme === 'owner' ? 'var(--owner-green)' : 'var(--client-rose)';
  return (
    <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: color,
          animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
        }} />
      ))}
    </div>
  );
}

export default function AIChat({ theme = 'owner', placeholder, initialMessages = [], onClose, style = {} }) {
  const isOwner = theme === 'owner';
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const colors = isOwner ? {
    bg: 'var(--owner-bg2)', border: 'var(--owner-border)', border2: 'var(--owner-border2)',
    accent: 'var(--owner-green)', accentDim: 'var(--owner-green-dim)',
    text: 'var(--owner-text)', text2: 'var(--owner-text2)', text3: 'var(--owner-text3)',
    surface: 'var(--owner-bg3)', msgBg: 'rgba(78,202,126,0.06)'
  } : {
    bg: 'var(--client-surface)', border: 'var(--client-border)', border2: 'var(--client-border2)',
    accent: 'var(--client-rose)', accentDim: 'var(--client-rose-dim)',
    text: 'var(--client-text)', text2: 'var(--client-text2)', text3: 'var(--client-text3)',
    surface: 'var(--client-bg2)', msgBg: 'rgba(196,119,90,0.06)'
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const fn = isOwner ? ownerChat : clientChat;
      const { reply } = await fn(newMessages.map(m => ({ role: m.role, content: m.content })));
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: isOwner
        ? "Désolé, une erreur s'est produite. Vérifiez la connexion au serveur."
        : "Oups ! Je rencontre une petite difficulté. Réessayez dans un instant !" }]);
    }
    setLoading(false);
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: colors.bg, border: `1px solid ${colors.border2}`,
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      ...style
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px', borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: colors.accentDim, border: `1px solid ${colors.border2}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div style={{
              position: 'absolute', top: -2, right: -2,
              width: 8, height: 8, borderRadius: '50%',
              background: colors.accent,
              border: `2px solid ${colors.bg}`,
              animation: 'pulse 2s ease-in-out infinite'
            }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>
              {isOwner ? 'SalonIQ AI Copilote' : 'Assistant Atelier Lumière'}
            </div>
            <div style={{ fontSize: 11, color: colors.accent }}>En ligne · IA active</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: colors.text3, fontSize: 20, lineHeight: 1, padding: 4
          }}>×</button>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 12,
        minHeight: 0
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '32px 16px',
            color: colors.text3, fontSize: 13
          }}>
            {isOwner
              ? "Bonjour Sarah ! Posez-moi n'importe quelle question sur votre salon."
              : "Bonjour ! Je suis votre assistant de réservation. Comment puis-je vous aider ?"}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            animation: 'fadeUp 0.3s ease both'
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: colors.accentDim, marginRight: 8, marginTop: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.accent }} />
              </div>
            )}
            <div style={{
              maxWidth: '78%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user'
                ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user' ? colors.accentDim : colors.surface,
              border: `1px solid ${msg.role === 'user' ? colors.border2 : colors.border}`,
              fontSize: 13, color: colors.text, lineHeight: 1.6,
              wordBreak: 'break-word', whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: colors.accentDim, marginRight: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.accent }} />
            </div>
            <div style={{
              padding: '10px 14px', borderRadius: '14px 14px 14px 4px',
              background: colors.surface, border: `1px solid ${colors.border}`
            }}>
              <ThinkingDots theme={theme} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 0 && (
        <div style={{
          padding: '0 16px 12px',
          display: 'flex', flexWrap: 'wrap', gap: 6
        }}>
          {(isOwner
            ? ["Quel est mon CA aujourd'hui ?", "Quels clients sont à risque ?", "Génère une campagne win-back", "Prévision revenus du mois"]
            : ["Réserver une coupe", "C'est quoi le balayage ?", "Quelle est la durée ?", "Quel est le prix ?"]
          ).map(q => (
            <button key={q} onClick={() => { setInput(q); setTimeout(() => { setInput(''); const msgs = [...messages, { role: 'user', content: q }]; setMessages(msgs); setLoading(true); (isOwner ? ownerChat : clientChat)(msgs.map(m => ({ role: m.role, content: m.content }))).then(({ reply }) => { setMessages(prev => [...prev, { role: 'assistant', content: reply }]); setLoading(false); }).catch(() => setLoading(false)); }, 50); }}
              style={{
                background: colors.accentDim, border: `1px solid ${colors.border2}`,
                borderRadius: 100, padding: '5px 12px', fontSize: 11,
                color: colors.accent, cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'var(--sans)', whiteSpace: 'nowrap'
              }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '12px 16px', borderTop: `1px solid ${colors.border}`,
        display: 'flex', gap: 8
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder={placeholder || (isOwner ? "Posez votre question…" : "Comment puis-je vous aider ?")}
          style={{
            flex: 1, background: colors.surface,
            border: `1px solid ${colors.border}`, borderRadius: 10,
            padding: '9px 14px', color: colors.text, fontSize: 13,
            fontFamily: 'var(--sans)', outline: 'none', transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = colors.border2}
          onBlur={e => e.target.style.borderColor = colors.border}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: colors.accentDim, border: `1px solid ${colors.border2}`,
          color: colors.accent, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          opacity: loading || !input.trim() ? 0.5 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s'
        }}>
          {loading ? <div className="spinner" style={{ borderTopColor: colors.accent, borderRightColor: colors.accent, width: 16, height: 16 }} />
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          }
        </button>
      </div>
    </div>
  );
}
