'use client';

import React, { useState } from 'react';
import { DraftData, MatchSimResult } from '../lib/types';

const HISTORIC_OPPONENTS = [
  { name: 'Australia 2003', ovr: 78, flag: '🇦🇺', captain: 'Ricky Ponting', star: 'Glenn McGrath' },
  { name: 'West Indies 1979', ovr: 76, flag: '🌴', captain: 'Clive Lloyd', star: 'Viv Richards' },
  { name: 'India 2011', ovr: 77, flag: '🇮🇳', captain: 'MS Dhoni', star: 'Yuvraj Singh' },
  { name: 'Pakistan 1992', ovr: 75, flag: '🇵🇰', captain: 'Imran Khan', star: 'Wasim Akram' },
  { name: 'England 2019', ovr: 76, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', captain: 'Eoin Morgan', star: 'Ben Stokes' },
  { name: 'Sri Lanka 1996', ovr: 74, flag: '🇱🇰', captain: 'Arjuna Ranatunga', star: 'Sanath Jayasuriya' },
  { name: 'South Africa 1999', ovr: 75, flag: '🇿🇦', captain: 'Hansie Cronje', star: 'Lance Klusener' },
  { name: 'New Zealand 2015', ovr: 73, flag: '🇳🇿', captain: 'Brendon McCullum', star: 'Trent Boult' },
  { name: 'India 2023', ovr: 80, flag: '🇮🇳', captain: 'Rohit Sharma', star: 'Virat Kohli' },
];

function fireConfetti() {
  if (typeof window === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: any[] = [];
  const colors = ['#f59e0b', '#22c55e', '#00f2fe', '#ec4899', '#eab308'];
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.5,
      r: Math.random() * 6 + 4,
      d: Math.random() * 150,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0,
      vx: (Math.random() - 0.5) * 18,
      vy: Math.random() * -14 - 4,
    });
  }

  let animationFrame: number;
  let life = 0;
  function draw() {
    life++;
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2 + p.vy;
      p.x += Math.sin(p.d) * 2 + p.vx;
      p.vy += 0.25;
      p.tilt = Math.sin(p.tiltAngle - life / 3) * 15;
      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      ctx.stroke();
    });

    if (life < 180) {
      animationFrame = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(animationFrame);
      if (document.body.contains(canvas)) document.body.removeChild(canvas);
    }
  }
  draw();
}

interface MatchSimulatorProps {
  draftData: DraftData;
  onResetDraft: () => void;
  onUnlockAchievement?: (badgeId: string) => void;
}

export default function MatchSimulator({
  draftData,
  onResetDraft,
  onUnlockAchievement,
}: MatchSimulatorProps) {
  const { squad, squadOvr, captain, tactic } = draftData;
  const [matchIndex, setMatchIndex] = useState(0);
  const [results, setResults] = useState<MatchSimResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentMatchDetails, setCurrentMatchDetails] = useState<MatchSimResult | null>(null);
  const [tournamentEnded, setTournamentEnded] = useState(false);

  const tournamentSchedule = [
    { type: 'Group Stage', opponent: HISTORIC_OPPONENTS[0] },
    { type: 'Group Stage', opponent: HISTORIC_OPPONENTS[1] },
    { type: 'Group Stage', opponent: HISTORIC_OPPONENTS[2] },
    { type: 'Group Stage', opponent: HISTORIC_OPPONENTS[3] },
    { type: 'Group Stage', opponent: HISTORIC_OPPONENTS[4] },
    { type: 'Group Stage', opponent: HISTORIC_OPPONENTS[5] },
    { type: 'Group Stage', opponent: HISTORIC_OPPONENTS[6] },
    { type: 'Group Stage', opponent: HISTORIC_OPPONENTS[7] },
    { type: 'Group Stage', opponent: HISTORIC_OPPONENTS[8] },
    { type: 'Semi-Final 🏆', opponent: HISTORIC_OPPONENTS[Math.floor(Math.random() * 4)] },
    { type: 'Grand World Cup Final 👑', opponent: HISTORIC_OPPONENTS[8] },
  ];

  const currentMatch = tournamentSchedule[Math.min(matchIndex, tournamentSchedule.length - 1)];
  const winsCount = results.filter((r) => r.isWin).length;
  const lossesCount = results.filter((r) => !r.isWin).length;

  const simulateNextMatch = () => {
    setIsSimulating(true);

    setTimeout(() => {
      const opp = currentMatch.opponent;
      const oppEffective = squadOvr + (Math.random() * 6 - 3);
      const tacticBonus = tactic
        ? Object.values(tactic.boost || {}).reduce((a, b) => a + b, 0) / 12
        : 0;
      const userPower = squadOvr + tacticBonus;
      const variance = Math.random() * 10 - 5;
      const isWin = userPower + variance >= oppEffective;

      const baseScore = Math.floor(230 + Math.random() * 80);
      let myScore: number;
      let myWkts: number;
      let oppScore: number;
      let oppWkts: number;
      let margin: string;

      if (isWin) {
        myScore = baseScore;
        myWkts = Math.floor(2 + Math.random() * 7);
        const runGap = Math.floor(2 + Math.random() * 45);
        oppScore = myScore - runGap;
        oppWkts = 10;
        margin = runGap <= 15 ? `Won by ${runGap} runs (THRILLER! 🔥)` : `Won by ${runGap} runs`;
      } else {
        oppScore = baseScore;
        oppWkts = Math.floor(2 + Math.random() * 7);
        const runGap = Math.floor(2 + Math.random() * 40);
        myScore = oppScore - runGap;
        myWkts = 10;
        margin = runGap <= 15 ? `Lost by ${runGap} runs (SO CLOSE! 😤)` : `Lost by ${runGap} runs`;
      }

      const topPerformer = squad[Math.floor(Math.random() * squad.length)];
      const matchRes: MatchSimResult = {
        matchNo: matchIndex + 1,
        stage: currentMatch.type,
        opponent: opp.name,
        oppFlag: opp.flag,
        myScore: `${myScore}/${myWkts}`,
        oppScore: `${oppScore}/${oppWkts}`,
        isWin,
        margin,
        mom: topPerformer ? `${topPerformer.name} (${topPerformer.role})` : captain.name,
      };

      const updatedResults = [...results, matchRes];
      setResults(updatedResults);
      setCurrentMatchDetails(matchRes);
      setIsSimulating(false);

      if (matchIndex === tournamentSchedule.length - 1) {
        setTournamentEnded(true);
        const finalWins = updatedResults.filter((r) => r.isWin).length;
        if (finalWins === 11) {
          fireConfetti();
          if (onUnlockAchievement) onUnlockAchievement('11-0 Undefeated Champion');
        } else if (finalWins >= 9) {
          if (onUnlockAchievement) onUnlockAchievement('World Cup Winner');
        }
      } else {
        setMatchIndex((prev) => prev + 1);
      }
    }, 1100);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-slate-100">
      {/* Top Banner: 11-0 Tracker */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest block">
            World Cup Tournament Pursuit
          </span>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 mt-1">
            <span>Match #{Math.min(matchIndex + 1, 11)} of 11</span>
            <span className="text-xs px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full font-extrabold uppercase border border-yellow-400/30">
              {winsCount}–{lossesCount} Record
            </span>
          </h2>
        </div>

        {/* 11-0 Badge Status Tracker */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          {Array.from({ length: 11 }).map((_, i) => {
            const res = results[i];
            return (
              <div
                key={i}
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-[10px] transition-all ${
                  res
                    ? res.isWin
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                      : 'bg-rose-500 text-white'
                    : i === matchIndex && !tournamentEnded
                    ? 'bg-yellow-400 text-slate-950 animate-pulse'
                    : 'bg-slate-800 text-slate-600'
                }`}
              >
                {res ? (res.isWin ? 'W' : 'L') : i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Simulation View */}
      {!tournamentEnded ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Next Match Fixture Card */}
          <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider block mb-1">
                {currentMatch.type}
              </span>
              <h3 className="text-2xl font-black text-yellow-400 uppercase tracking-tight flex items-center gap-2">
                Your Final 11 vs {currentMatch.opponent.flag} {currentMatch.opponent.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Opponent Rating: <strong className="text-white">{currentMatch.opponent.ovr} OVR</strong> • Captain: {currentMatch.opponent.captain}
              </p>
            </div>

            <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Your Squad OVR:</span>
                <span className="font-extrabold text-yellow-400">{squadOvr}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Tactical Playstyle:</span>
                <span className="font-bold text-emerald-400">{tactic?.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Team Captain:</span>
                <span className="font-bold text-white">👑 {captain?.name}</span>
              </div>
            </div>

            <button
              onClick={simulateNextMatch}
              disabled={isSimulating}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-wider text-xs transition-all shadow-xl ${
                isSimulating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-slate-950 shadow-yellow-500/20 transform hover:scale-102'
              }`}
            >
              {isSimulating ? '⏳ Simulating Match Over-by-Over...' : '⚔️ Simulate Next Match'}
            </button>
          </div>

          {/* Live Match Results History */}
          <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Tournament Match Log ({results.length} Matches Completed)
            </h3>

            {results.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs italic">
                No matches simulated yet. Click "Simulate Next Match" to start your campaign!
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {results.map((r, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
                      r.isWin ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase ${
                            r.isWin ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                          }`}
                        >
                          {r.isWin ? 'WIN' : 'LOSS'}
                        </span>
                        <span className="font-extrabold text-white text-xs">
                          Match #{r.matchNo}: vs {r.oppFlag} {r.opponent}
                        </span>
                      </div>
                      <span className="text-slate-400 font-bold text-[11px]">{r.margin}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 pl-1">
                      <span>Scores: You {r.myScore} • Opp {r.oppScore}</span>
                      <span className="text-yellow-400 font-bold">MoM: {r.mom}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tournament Summary Screen */
        <div className="text-center py-12 bg-slate-950/90 border border-slate-800 rounded-3xl p-8 space-y-6">
          <div className="text-6xl animate-bounce">
            {winsCount === 11 ? '👑' : winsCount >= 9 ? '🏆' : '🏏'}
          </div>

          <div>
            <h2 className="text-3xl font-black uppercase text-yellow-400 tracking-tight">
              {winsCount === 11
                ? 'PERFECT 11–0 UNDEFEATED WORLD CHAMPION!'
                : winsCount >= 9
                ? 'WORLD CUP WINNER!'
                : 'WORLD CUP CAMPAIGN CONCLUDED'}
            </h2>
            <p className="text-slate-400 text-xs mt-2">
              Your squad completed the World Cup with a record of{' '}
              <strong className="text-white">
                {winsCount} Wins and {lossesCount} Losses
              </strong>
              .
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={onResetDraft}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
            >
              🔄 Start New 11–0 Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
