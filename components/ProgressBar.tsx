type Props = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
        <span>Question {current} sur {total}</span>
        <span>{pct} %</span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ background: 'var(--surface)' }}>
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: 'var(--primary)' }}
        />
      </div>
    </div>
  );
}
