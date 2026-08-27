'use client';

interface Props {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export default function ScoreBar({ label, value, max = 100, color = '#22c55e' }: Props) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium" style={{ color: '#6b7280' }}>{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value.toFixed(0)}</span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(30,35,51,0.8)' }}
      >
        <div
          className="h-full rounded-full score-bar-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 8px ${color}44`,
          }}
        />
      </div>
    </div>
  );
}
