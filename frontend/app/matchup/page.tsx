'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '../../lib/auth';
import Navbar from '../../components/Navbar';
import { getCountryFlag } from '../../lib/playerPhotos';
import { getClientMatchupChatResponse } from '../../lib/clientEngine';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text?: string;
  data?: any;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Whom should I rely on for middle order?',
  'India vs Australia, Venue: Ahmedabad, Format: ODI, Need: Bowler',
  'Who is the most reliable death over bowler in T20s?',
  'India vs England @ Lord’s (Seaming Pitch) — Need Top Order Batter',
  'IPL Finals in Chennai — Need Middle-Order All-Rounder with High SR',
];

export default function MatchupChatbotPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/');
    }
  }, [router]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 **Hello! I am your AI Cricket Match-Up Analyst.**\n\nAsk me who to pick for any match scenario! For example:\n*\"India vs Australia, Venue: Ahmedabad, Format: ODI, Need: Bowler\"*\n\nI will analyze venue pitch characteristics, opponent historical head-to-heads, player roles, and recent form to give you the most tactical player recommendations!",
      timestamp: 'Just now',
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/recommend/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error('Failed to fetch from API');
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.warn('Backend unavailable, resolving using client matchup engine:', e);
      const fallbackData = getClientMatchupChatResponse(text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        data: fallbackData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050b12',
        color: '#f1f5f9',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />

      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 14px',
                borderRadius: 999,
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.3)',
                fontSize: 11,
                fontWeight: 800,
                color: '#f59e0b',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              🤖 Interactive AI Chatbot
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, margin: 0 }}>
              Cricket Match-Up AI Assistant
            </h1>
          </div>

          <div
            style={{
              padding: '6px 14px',
              borderRadius: 12,
              background: 'rgba(0,242,254,0.08)',
              border: '1px solid rgba(0,242,254,0.25)',
              fontSize: 12,
              color: '#00f2fe',
              fontWeight: 700,
            }}
          >
            ⚡ NLP Query Engine Active
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 12 }}>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#f59e0b';
                e.currentTarget.style.color = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              💬 {prompt}
            </button>
          ))}
        </div>

        {/* Chat History Box */}
        <div
          style={{
            flex: 1,
            minHeight: '480px',
            maxHeight: '620px',
            overflowY: 'auto',
            background: 'rgba(11,19,32,0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            marginBottom: '1rem',
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {/* Sender label */}
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, padding: '0 4px' }}>
                {m.sender === 'user' ? '👤 You' : '🏏 CricketIQ Match-Up AI'} · {m.timestamp}
              </div>

              {/* Text Message Bubble */}
              {m.text && (
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '12px 18px',
                    borderRadius: 16,
                    background: m.sender === 'user' ? 'linear-gradient(135deg, #0d5c63, #084045)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${m.sender === 'user' ? 'rgba(0,242,254,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    color: '#f1f5f9',
                    fontSize: 14,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.text}
                </div>
              )}

              {/* Bot Structured Recommendation Cards */}
              {m.data && (
                <div style={{ width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Player Recommendation Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {m.data.recommendations.map((p: any) => (
                      <div
                        key={p.id || p.name}
                        style={{
                          background: p.rank === 1 ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(11,19,32,0.95))' : 'rgba(255,255,255,0.03)',
                          border: `1.5px solid ${p.rank === 1 ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: 16,
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                background: p.rank === 1 ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                                color: p.rank === 1 ? '#000' : '#fff',
                                fontWeight: 900,
                                fontSize: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              #{p.rank}
                            </span>
                            <span style={{ fontSize: 20, fontWeight: 900, color: p.rank === 1 ? '#22c55e' : '#f59e0b' }}>
                              {p.score_pct}
                            </span>
                          </div>

                          <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>
                            {p.name} {getCountryFlag(p.country)}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                            {p.country} · {p.role}
                          </div>

                          {/* Reasons */}
                          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 12 }}>
                            {p.why.map((w: string, idx: number) => (
                              <div key={idx} style={{ marginBottom: 4, display: 'flex', gap: 6 }}>
                                <span style={{ color: p.rank === 1 ? '#22c55e' : '#f59e0b' }}>✓</span> {w}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Stats Strip */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: 8,
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            fontSize: 11,
                            color: '#64748b',
                          }}
                        >
                          <span>Avg: <strong style={{ color: '#f1f5f9' }}>{p.stats.avg?.toFixed(1) || '—'}</strong></span>
                          <span>SR: <strong style={{ color: '#f1f5f9' }}>{p.stats.sr?.toFixed(1) || '—'}</strong></span>
                          {p.stats.economy && <span>Eco: <strong style={{ color: '#22c55e' }}>{p.stats.economy?.toFixed(1)}</strong></span>}
                          <span>Form: <strong style={{ color: '#00f2fe' }}>{p.stats.form}/100</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Conclusion text */}
                  {m.data.conclusion && (
                    <div
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(34,197,94,0.08)',
                        borderRadius: 12,
                        border: '1px solid rgba(34,197,94,0.2)',
                        fontSize: 12,
                        color: '#4ade80',
                      }}
                    >
                      {m.data.conclusion}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', alignSelf: 'flex-start' }}>
              <div style={{ fontSize: 20, animation: 'spin 1s linear infinite' }}>🏏</div>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Analyzing venue pitch, opponent head-to-heads, and player records...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="E.g., India vs Australia, Venue: Ahmedabad, Format: ODI, Need: Bowler..."
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: 14,
              background: 'rgba(11,19,32,0.95)',
              border: '1.5px solid rgba(0,242,254,0.25)',
              color: '#f1f5f9',
              fontSize: 14,
              outline: 'none',
            }}
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              padding: '14px 28px',
              borderRadius: 14,
              background: loading || !input.trim() ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#000',
              fontWeight: 900,
              fontSize: 14,
              border: 'none',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '...' : 'Send 🚀'}
          </button>
        </div>
      </div>
    </div>
  );
}
