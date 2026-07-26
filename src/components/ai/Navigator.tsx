'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Minimize2, ChevronDown, RotateCcw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: Date;
}

const RESPONSES: Record<string, string> = {
  default: "I can assist with route suggestions, budget estimation, and group settlement strategies. What are you planning?",
  goa: "Goa is optimal for groups of 4–8. Recommended budget: ₹8,000–₹15,000/person for 5 days (flights included). Best window: Oct–Feb. Shall I scaffold a trip plan?",
  manali: "Manali: 5-day recommended budget ₹12,000–₹18,000/person. Volvo from Delhi is cost-optimal vs. flight. Group of 6+ qualifies for hotel bulk rates.",
  budget: "To estimate group budget: (flights per head) + (hotel/nights × rooms) + ₹2,000/person/day for food & local transport. I can run the exact calculation — share your group size and destination.",
  settle: "The Min-Cash-Flow algorithm in the Ledger module will compute the minimum number of transactions to clear all debts. For 8 people, it typically resolves to 4–6 transfers. Navigate to the Ledger tab.",
  flight: "For domestic routes, IndiGo and SpiceJet consistently offer lowest fares 21+ days out. International: Qatar Airways and Emirates are optimal for Southeast Asia. Want a specific route analysis?",
  hotel: "I recommend booking via the Hotels tab or directly checking OYO/Ginger for budget, Lemon Tree/Marriott for mid-range, and Taj/ITC for premium. For groups 8+, negotiate directly with properties for bulk rates.",
  help: "Commands I understand:\n— Budget estimation\n— Route suggestions\n— Settlement help\n— Hotel recommendations\n— Group trip structuring\n\nType any destination or ask your question.",
};

function getReply(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('goa'))      return RESPONSES.goa;
  if (lower.includes('manali'))   return RESPONSES.manali;
  if (lower.includes('budget') || lower.includes('cost') || lower.includes('price')) return RESPONSES.budget;
  if (lower.includes('settle') || lower.includes('debt') || lower.includes('split')) return RESPONSES.settle;
  if (lower.includes('flight') || lower.includes('fly') || lower.includes('airline')) return RESPONSES.flight;
  if (lower.includes('hotel') || lower.includes('stay') || lower.includes('room')) return RESPONSES.hotel;
  if (lower.includes('help') || lower.includes('what can') || lower.includes('command')) return RESPONSES.help;
  return RESPONSES.default;
}

const SUGGESTIONS = [
  'Estimate Goa budget for 6 people',
  'Best routes DEL → COK',
  'How to settle group debts?',
  'Manali in January — viable?',
];

export default function Navigator() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Navigator AI online. I can assist with destination analysis, budget modeling, and group settlement strategy. How can I help?",
      ts: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = (text: string = input.trim()) => {
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      ts: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = getReply(text);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        ts: new Date(),
      }]);
      setTyping(false);
    }, 750 + Math.random() * 500);
  };

  const reset = () => {
    setMessages([{
      id: 'init-' + Date.now(),
      role: 'assistant',
      content: "Navigator AI online. Session reset. How can I assist?",
      ts: new Date(),
    }]);
  };

  const formatTime = (d: Date) =>
    new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(d));

  return (
    <>
      {open && (
        <div
          style={{
            position: 'fixed',
            right: 0, top: 0, bottom: 0,
            width: '380px',
            backgroundColor: '#0E1420',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-6px 0 32px rgba(0,0,0,0.40)',
            animation: 'slideRight 0.28s cubic-bezier(0.4,0,0.2,1) forwards',
          }}
        >
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: '10px',
            flexShrink: 0,
          }}>
            <div style={{
              width: '34px', height: '34px',
              background: 'var(--orange)',
              borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bot size={17} color="#FFFFFF" strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
                Navigator AI
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E', display: 'inline-block', flexShrink: 0 }} />
                Operational
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={reset} style={{ width: '28px', height: '28px', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '4px', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.45)', transition: 'all 0.15s ease' }} title="Reset session" onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.25)'; }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.10)'; }}>
                <RotateCcw size={12} />
              </button>
              <button onClick={() => setOpen(false)} style={{ width: '28px', height: '28px', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '4px', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.45)', transition: 'all 0.15s ease' }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FF4545'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,69,69,0.35)'; }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.10)'; }}>
                <X size={13} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '4px' }}>
                <div className={msg.role === 'user' ? 'navigator-msg-user' : 'navigator-msg-ai'} style={{ whiteSpace: 'pre-line' }}>
                  {msg.content}
                </div>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif' }}>
                  {formatTime(msg.ts)}
                </span>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px 8px 8px 2px', padding: '12px 16px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'rgba(255,105,15,0.70)', display: 'inline-block', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '10px 16px 0', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)} style={{ padding: '4px 10px', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)', fontSize: '11px', fontFamily: 'Inter, sans-serif', cursor: 'pointer', transition: 'all 0.15s ease', fontWeight: 400 }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,105,15,0.40)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--orange)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,105,15,0.07)'; }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.10)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}>
                {s}
              </button>
            ))}
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder="Ask Navigator AI..." style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '6px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontSize: '13px', padding: '9px 14px', outline: 'none', transition: 'border-color 0.15s ease' }} onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,105,15,0.45)'} onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.10)'} />
            <button onClick={() => sendMessage()} disabled={!input.trim()} style={{ width: '36px', height: '36px', background: input.trim() ? 'var(--orange)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: input.trim() ? '#FFFFFF' : 'rgba(255,255,255,0.25)', transition: 'all 0.15s ease', flexShrink: 0 }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        style={{ position: 'fixed', bottom: '28px', right: open ? '396px' : '28px', width: '52px', height: '52px', background: open ? 'rgba(255,255,255,0.10)' : 'var(--navy)', border: open ? '1px solid rgba(255,255,255,0.20)' : '2px solid var(--orange)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: open ? 'rgba(255,255,255,0.75)' : '#FFFFFF', zIndex: 201, boxShadow: open ? 'none' : '0 4px 20px rgba(255,105,15,0.35)', transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)' }}
        title={open ? 'Close Navigator' : 'Open Navigator AI'}
      >
        {open ? <ChevronDown size={20} /> : <Bot size={22} />}
      </button>
    </>
  );
}
