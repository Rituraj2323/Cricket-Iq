'use client';

import React, { useState } from 'react';
import { WcHeroPlayer, TacticalPlaystyle, DraftData } from '../lib/types';

const TACTICS: TacticalPlaystyle[] = [
  {
    id: 'balanced',
    name: '⚖️ Balanced Champions',
    desc: '+5 OVR Synergy. Solid in all match conditions.',
    boost: { BAT: 3, BOW: 3, CTL: 3, IMP: 3 },
  },
  {
    id: 'powerplay',
    name: '💥 Jayasuriya Powerplay',
    desc: '+10 POW & Strike Rate. Explosive scoring, higher risk.',
    boost: { BAT: 5, POW: 10, IMP: 5 },
  },
  {
    id: 'pace',
    name: '⚡ Pace Battery',
    desc: '+10 BOW & CTL. Restricts opponent run rates in death overs.',
    boost: { BOW: 10, CTL: 8, IMP: 2 },
  },
  {
    id: 'spin',
    name: '🌀 Spin Web & Squeeze',
    desc: '+10 CTL & FLD. Dominates middle overs on turning pitches.',
    boost: { CTL: 10, FLD: 8, BOW: 4 },
  },
];

const ROLE_COLORS: Record<string, { bg: string; light: string; border: string }> = {
  Batter: { bg: '#1d4ed8', light: '#bfdbfe', border: '#3b82f6' },
  Bowler: { bg: '#065f46', light: '#6ee7b7', border: '#10b981' },
  'All-Rounder': { bg: '#92400e', light: '#fde68a', border: '#f59e0b' },
  Wicketkeeper: { bg: '#581c87', light: '#e9d5ff', border: '#a855f7' },
};

function rc(role: string = '') {
  for (const key of Object.keys(ROLE_COLORS)) {
    if (role && role.includes(key)) return ROLE_COLORS[key];
  }
  return { bg: '#1e293b', light: '#94a3b8', border: '#475569' };
}

// ── Small OVR pill ──────────────────────────────────────────────────────────
function OvrPill({ ovr }: { ovr: number }) {
  const color = ovr >= 90 ? '#f59e0b' : ovr >= 80 ? '#22d3ee' : ovr >= 70 ? '#4ade80' : '#94a3b8';
  return (
    <span
      style={{
        background: `${color}22`,
        border: `1.5px solid ${color}`,
        color,
        borderRadius: 8,
        padding: '1px 8px',
        fontWeight: 900,
        fontSize: 16,
        minWidth: 42,
        display: 'inline-block',
        textAlign: 'center',
      }}
    >
      {ovr}
    </span>
  );
}

// ── Pack player card ─────────────────────────────────────────────────────────
function PackCard({
  player,
  isSelected,
  onSelect,
  inSquad,
}: {
  player: WcHeroPlayer;
  isSelected: boolean;
  onSelect: (p: WcHeroPlayer) => void;
  inSquad: boolean;
}) {
  const c = rc(player.role);
  return (
    <div
      onClick={() => !inSquad && onSelect(player)}
      style={{
        background: isSelected
          ? `linear-gradient(135deg, #f59e0b22, ${c.bg}66)`
          : inSquad
          ? '#0a0f1a'
          : `linear-gradient(135deg, #0f172a, ${c.bg}33)`,
        border: `2px solid ${isSelected ? '#f59e0b' : inSquad ? '#1e293b' : c.border}`,
        borderRadius: 16,
        padding: '10px 14px',
        cursor: inSquad ? 'not-allowed' : 'pointer',
        opacity: inSquad ? 0.35 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.15s',
        boxShadow: isSelected ? '0 0 0 3px #f59e0b55' : 'none',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        userSelect: 'none',
      }}
    >
      <OvrPill ovr={player.OVR} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 900,
            fontSize: 13,
            color: isSelected ? '#fde68a' : '#f1f5f9',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {player.name}
        </div>
        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
          {player.country} · {player.year}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span
            style={{
              background: c.bg,
              color: c.light,
              border: `1px solid ${c.border}`,
              borderRadius: 6,
              padding: '1px 7px',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {player.role}
          </span>
        </div>
      </div>
      {inSquad && <span style={{ color: '#22d3ee', fontSize: 10, fontWeight: 700 }}>✔ In Squad</span>}
      {isSelected && !inSquad && (
        <span
          style={{
            background: '#f59e0b',
            color: '#0f172a',
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 10,
            fontWeight: 900,
            textTransform: 'uppercase',
            flexShrink: 0,
          }}
        >
          Picked ✓
        </span>
      )}
    </div>
  );
}

// ── Squad slot ───────────────────────────────────────────────────────────────
function SquadSlot({
  idx,
  player,
  captainId,
  setCaptainId,
  onRemove,
  onPlace,
  selectedPlayer,
}: {
  idx: number;
  player: WcHeroPlayer | null;
  captainId: string | null;
  setCaptainId: (id: string) => void;
  onRemove: (idx: number) => void;
  onPlace: (idx: number) => void;
  selectedPlayer: WcHeroPlayer | null;
}) {
  const filled = !!player;
  const c = filled ? rc(player.role) : null;
  const isCap = filled && captainId === player.id;
  const canPlace = !!selectedPlayer && !filled;
  const canReplace = !!selectedPlayer && filled;

  return (
    <div
      onClick={() => {
        if (selectedPlayer && !filled) onPlace(idx);
        else if (selectedPlayer && filled) onPlace(idx);
      }}
      style={{
        background: canPlace
          ? `linear-gradient(90deg, #f59e0b11, #f59e0b05)`
          : filled
          ? `linear-gradient(90deg, #0f172a 60%, ${c?.bg}33)`
          : '#0a0f1a',
        border: `2px solid ${
          canPlace ? '#f59e0b' : canReplace ? '#f59e0b55' : filled ? c?.border : '#1e293b'
        }`,
        borderRadius: 14,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minHeight: 52,
        cursor: selectedPlayer ? 'pointer' : 'default',
        transition: 'all 0.15s',
        boxShadow: canPlace ? '0 0 0 2px #f59e0b44' : 'none',
        animation: canPlace ? 'pulse-slot 1.2s ease-in-out infinite alternate' : 'none',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          flexShrink: 0,
          background: filled ? '#f59e0b' : canPlace ? '#f59e0b33' : '#1e293b',
          color: filled ? '#0f172a' : canPlace ? '#f59e0b' : '#475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: 12,
        }}
      >
        {idx + 1}
      </div>

      {filled ? (
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 13,
                color: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {player.name}
              <span style={{ fontWeight: 900, color: '#f59e0b', fontSize: 11 }}>{player.OVR}</span>
              {isCap && (
                <span
                  style={{
                    background: '#f59e0b',
                    color: '#0f172a',
                    borderRadius: 4,
                    padding: '0 5px',
                    fontSize: 9,
                    fontWeight: 900,
                  }}
                >
                  CAPTAIN
                </span>
              )}
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>
              {player.role} · {player.country} {player.year}
            </div>
          </div>
          {!selectedPlayer && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCaptainId(player.id);
                }}
                title="Make Captain"
                style={{
                  background: isCap ? '#f59e0b' : '#1e293b',
                  color: isCap ? '#0f172a' : '#64748b',
                  border: 'none',
                  borderRadius: 7,
                  padding: '4px 7px',
                  fontSize: 10,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                👑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(idx);
                }}
                title="Remove from XI"
                style={{
                  background: '#1e293b',
                  color: '#f43f5e',
                  border: 'none',
                  borderRadius: 7,
                  padding: '4px 7px',
                  fontSize: 11,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          )}
          {canReplace && (
            <span style={{ color: '#f59e0b', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
              Click to replace →
            </span>
          )}
        </>
      ) : (
        <span
          style={{
            fontSize: 12,
            color: canPlace ? '#f59e0b' : '#334155',
            fontStyle: canPlace ? 'normal' : 'italic',
            fontWeight: canPlace ? 800 : 600,
          }}
        >
          {canPlace ? '⬅ Click to place player here' : 'Empty slot'}
        </span>
      )}
    </div>
  );
}

// ── Hero Reveal Modal ────────────────────────────────────────────────────────
function HeroRevealModal({
  player,
  onClose,
}: {
  player: WcHeroPlayer | null;
  onClose: () => void;
}) {
  if (!player) return null;
  const c = rc(player.role);
  const highlights = player.notes ? player.notes.split(' | ') : [];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        animation: 'fadeInBg 0.3s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: `linear-gradient(160deg, #0f172a 60%, ${c.bg}66)`,
          border: `2px solid ${c.border}`,
          borderRadius: 28,
          padding: '36px 32px',
          maxWidth: 480,
          width: '92%',
          textAlign: 'center',
          boxShadow: `0 0 80px ${c.bg}99, 0 0 0 1px ${c.border}44`,
          animation: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 8 }}>🏆</div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: 4,
            color: c.light,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Legendary Hero Drafted
        </div>

        <h2
          style={{
            margin: '0 0 4px',
            fontSize: 30,
            fontWeight: 900,
            color: '#f1f5f9',
            lineHeight: 1.1,
            textTransform: 'uppercase',
          }}
        >
          {player.name}
        </h2>
        <p
          style={{
            margin: '0 0 20px',
            fontSize: 12,
            color: '#64748b',
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {player.country} · {player.role} · OVR <span style={{ color: c.light }}>{player.OVR}</span>
        </p>

        {highlights.length > 0 && (
          <div
            style={{
              background: 'rgba(0,0,0,0.45)',
              borderRadius: 16,
              padding: '16px 18px',
              marginBottom: 24,
              textAlign: 'left',
              border: `1px solid ${c.border}33`,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: 2.5,
                color: c.light,
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              ⚡ World Cup Career Highlights
            </div>
            {highlights.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 8,
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    color: c.light,
                    fontWeight: 900,
                    fontSize: 14,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  ›
                </span>
                <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600, lineHeight: 1.4 }}>
                  {h.trim()}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            background: `linear-gradient(135deg, #f59e0b, #d97706)`,
            color: '#0f172a',
            border: 'none',
            borderRadius: 14,
            padding: '12px 36px',
            fontSize: 13,
            fontWeight: 900,
            cursor: 'pointer',
            letterSpacing: 1,
            textTransform: 'uppercase',
            boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
          }}
        >
          Confirm to Squad ✓
        </button>
      </div>
    </div>
  );
}

// ── Main DraftEngine Component ───────────────────────────────────────────────
export default function DraftEngine({
  allPlayers,
  onCompleteDraft,
}: {
  allPlayers: WcHeroPlayer[];
  onCompleteDraft: (data: DraftData) => void;
}) {
  const [squad, setSquad] = useState<(WcHeroPlayer | null)[]>(Array(11).fill(null));
  const [drawnPacks, setDrawnPacks] = useState<WcHeroPlayer[] | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<WcHeroPlayer | null>(null);
  const [pickedPlayer, setPickedPlayer] = useState<WcHeroPlayer | null>(null);
  const [pendingSlot, setPendingSlot] = useState<number | null>(null);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [selectedTactic, setSelectedTactic] = useState('balanced');
  const [packFilterRole, setPackFilterRole] = useState('All');

  const draftedPlayers = squad.filter((p): p is WcHeroPlayer => Boolean(p));
  const draftedCount = draftedPlayers.length;
  const squadOvr =
    draftedCount > 0
      ? Math.round(draftedPlayers.reduce((a, p) => a + p.OVR, 0) / draftedCount)
      : 0;
  const isSquadFull = draftedCount === 11;

  // Roll 6 cards
  const rollPacks = () => {
    setSelectedPlayer(null);
    const takenNames = new Set(draftedPlayers.map((p) => p.name.toLowerCase().trim()));
    const takenIds = new Set(draftedPlayers.map((p) => p.id));
    const eligible = allPlayers.filter((p) => {
      if (takenIds.has(p.id)) return false;
      if (takenNames.has(p.name.toLowerCase().trim())) return false;
      if (packFilterRole !== 'All' && !p.role.includes(packFilterRole)) return false;
      return true;
    });
    const shuffled = [...eligible].sort(() => 0.5 - Math.random());
    setDrawnPacks(shuffled.slice(0, 6));
  };

  const selectPlayer = (player: WcHeroPlayer) => {
    setSelectedPlayer((prev) => (prev && prev.id === player.id ? null : player));
  };

  const placePlayer = (slotIdx: number) => {
    if (!selectedPlayer) return;
    setPendingSlot(slotIdx);
    setPickedPlayer(selectedPlayer);
  };

  const confirmPick = () => {
    if (pickedPlayer === null || pendingSlot === null) return;
    const newSquad = [...squad];
    newSquad[pendingSlot] = pickedPlayer;
    setSquad(newSquad);
    if (!captainId) setCaptainId(pickedPlayer.id);
    setSelectedPlayer(null);
    setDrawnPacks(null);
    setPickedPlayer(null);
    setPendingSlot(null);
  };

  const removePlayer = (idx: number) => {
    const newSquad = [...squad];
    newSquad[idx] = null;
    setSquad(newSquad);
  };

  const handleStartTournament = () => {
    if (!isSquadFull) return;
    const captain = draftedPlayers.find((p) => p.id === captainId) || draftedPlayers[0];
    const tacticObj = TACTICS.find((t) => t.id === selectedTactic) || TACTICS[0];
    onCompleteDraft({
      squad: draftedPlayers,
      squadOvr,
      captain,
      tactic: tacticObj,
    });
  };

  return (
    <>
      <HeroRevealModal player={pickedPlayer} onClose={confirmPick} />

      <div
        style={{
          background: '#040812',
          border: '1px solid #1e293b',
          borderRadius: 24,
          padding: '24px',
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ── Top Header ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24 }}>🎲</span>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>
                Making The Final 11 with Random Dice
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
              {selectedPlayer
                ? `✋ ${selectedPlayer.name} picked — click any slot (1-11) on the left to assign`
                : drawnPacks
                ? '👆 Select a card from the pack, then assign to any slot'
                : 'Roll the random dice to draw 6 World Cup players and craft your undefeated squad'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 14,
                padding: '8px 16px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: '#475569',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Drafted
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9' }}>
                {draftedCount} <span style={{ color: '#475569', fontSize: 13 }}>/ 11</span>
              </div>
            </div>
            <div
              style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 14,
                padding: '8px 16px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: '#f59e0b',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Team OVR
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>
                {squadOvr || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Two Columns: Starting XI vs Dice Pack Area ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* LEFT: 11 squad slots */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Starting XI Lineup {selectedPlayer && <span style={{ color: '#f59e0b' }}>— click any slot ↓</span>}
              </h3>
              {draftedCount > 0 && !selectedPlayer && (
                <button
                  onClick={() => {
                    setSquad(Array(11).fill(null));
                    setCaptainId(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f43f5e',
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {squad.map((player, idx) => (
                <SquadSlot
                  key={idx}
                  idx={idx}
                  player={player}
                  selectedPlayer={selectedPlayer}
                  captainId={captainId}
                  setCaptainId={setCaptainId}
                  onRemove={removePlayer}
                  onPlace={placePlayer}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: Dice Roll Pack Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                background: '#0a101f',
                border: '1px solid #1e293b',
                borderRadius: 20,
                padding: 18,
                flex: 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#f59e0b',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  🎲 Dice Roll Pack
                </h3>
                <select
                  value={packFilterRole}
                  onChange={(e) => setPackFilterRole(e.target.value)}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#f1f5f9',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 8,
                    padding: '4px 8px',
                  }}
                >
                  <option value="All">All Roles</option>
                  <option value="Batter">Batters</option>
                  <option value="Bowler">Bowlers</option>
                  <option value="All-Rounder">All-Rounders</option>
                  <option value="Wicketkeeper">Wicketkeepers</option>
                </select>
              </div>

              {!drawnPacks ? (
                <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                  <div style={{ fontSize: 52, marginBottom: 14 }}>🎲</div>
                  <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20, maxWidth: 300, margin: '0 auto 20px' }}>
                    {isSquadFull
                      ? 'Squad is complete! Choose your captain & playstyle below to start.'
                      : 'Roll the dice to draw 6 random World Cup cards from 1975 to 2023.'}
                  </p>
                  {!isSquadFull && (
                    <button
                      onClick={rollPacks}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#0f172a',
                        border: 'none',
                        borderRadius: 14,
                        padding: '14px 36px',
                        fontSize: 14,
                        fontWeight: 900,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        boxShadow: '0 4px 24px rgba(245,158,11,0.3)',
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      🎲 Roll Pack
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>
                      {selectedPlayer
                        ? `✋ ${selectedPlayer.name} — click a slot on the left`
                        : 'Click a player to pick them up:'}
                    </span>
                    {!selectedPlayer && (
                      <button
                        onClick={rollPacks}
                        style={{
                          background: 'none',
                          border: '1px solid rgba(245,158,11,0.4)',
                          color: '#f59e0b',
                          fontSize: 10,
                          fontWeight: 800,
                          borderRadius: 7,
                          padding: '3px 10px',
                          cursor: 'pointer',
                        }}
                      >
                        🔄 Re-roll
                      </button>
                    )}
                    {selectedPlayer && (
                      <button
                        onClick={() => setSelectedPlayer(null)}
                        style={{
                          background: 'none',
                          border: '1px solid rgba(244,63,94,0.4)',
                          color: '#f43f5e',
                          fontSize: 10,
                          fontWeight: 800,
                          borderRadius: 7,
                          padding: '3px 10px',
                          cursor: 'pointer',
                        }}
                      >
                        ✕ Deselect
                      </button>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      maxHeight: 380,
                      overflowY: 'auto',
                    }}
                  >
                    {drawnPacks.map((p) => (
                      <PackCard
                        key={p.id}
                        player={p}
                        isSelected={selectedPlayer?.id === p.id}
                        inSquad={draftedPlayers.some(
                          (s) => s.name.toLowerCase() === p.name.toLowerCase()
                        )}
                        onSelect={selectPlayer}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Captaincy & Tactics (unlocked when squad is 11/11) */}
            {isSquadFull && (
              <div
                style={{
                  background: '#0a101f',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 20,
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      marginBottom: 6,
                    }}
                  >
                    👑 Select Team Captain
                  </label>
                  <select
                    value={captainId || ''}
                    onChange={(e) => setCaptainId(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      color: '#f1f5f9',
                      borderRadius: 10,
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {draftedPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.country} {p.year}) — {p.OVR} OVR ({p.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      marginBottom: 6,
                    }}
                  >
                    ⚡ Tactical Playstyle
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {TACTICS.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTactic(t.id)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 12,
                          border: `1.5px solid ${selectedTactic === t.id ? '#f59e0b' : '#1e293b'}`,
                          background: selectedTactic === t.id ? 'rgba(245,158,11,0.1)' : '#0f172a',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 800,
                            fontSize: 12,
                            color: selectedTactic === t.id ? '#f59e0b' : '#94a3b8',
                          }}
                        >
                          {t.name}
                        </p>
                        <p style={{ margin: '2px 0 0', fontWeight: 400, fontSize: 10, color: '#64748b' }}>
                          {t.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartTournament}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 14,
                    padding: 14,
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  🏆 Start 11–0 World Cup Campaign
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
