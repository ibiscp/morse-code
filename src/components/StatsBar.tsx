interface StatsBarProps {
  wpm: number;
  accuracy: number;
  progress: number;
  total: number;
}

export function StatsBar({ wpm, accuracy, progress, total }: StatsBarProps) {
  return (
    <div className="flex justify-center gap-8 font-mono text-sm text-ink-muted">
      <Stat label="Speed" value={`${wpm} WPM`} />
      <Stat label="Accuracy" value={`${accuracy}%`} />
      <Stat label="Progress" value={`${progress}/${total}`} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg text-ink">{value}</span>
      <span className="text-xs uppercase tracking-widest text-ink-faint">{label}</span>
    </div>
  );
}
