import type { Level } from '@/lib/scoring';

const LEVEL_CONFIG: Record<Level, { label: string; color: string; bg: string; description: string; advice: string }> = {
  debutant: {
    label: 'Débutant',
    color: '#F97316',
    bg: '#FFF7ED',
    description: 'Vous débutez avec Microsoft Copilot Chat. Vous allez découvrir comment cet outil peut transformer votre quotidien professionnel.',
    advice: 'Notre programme fondamentaux est fait pour vous : prise en main, premiers prompts efficaces, usages pratiques dans votre service.',
  },
  intermediaire: {
    label: 'Intermédiaire',
    color: '#0EA5E9',
    bg: '#F0F9FF',
    description: 'Vous utilisez Copilot Chat de façon régulière et avez acquis de bonnes bases. Il est temps de passer à la vitesse supérieure.',
    advice: "Notre programme approfondissement vous permettra de maîtriser le prompting avancé et d'exploiter toutes les intégrations Microsoft 365.",
  },
  avance: {
    label: 'Avancé',
    color: '#1A203D',
    bg: '#F1F5F9',
    description: "Vous maîtrisez Copilot Chat et l'intégrez pleinement à votre travail. Vous êtes en mesure d'en tirer le meilleur parti.",
    advice: "Notre programme expert vous aidera à affiner vos usages, explorer les fonctionnalités avancées et devenir un référent IA dans votre service.",
  },
};

type Props = {
  level: Level;
  score: number;
  maxScore: number;
  firstName: string;
};

export default function ResultCard({ level, score, maxScore, firstName }: Props) {
  const config = LEVEL_CONFIG[level];
  const pct = Math.round((score / maxScore) * 100);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg mb-1" style={{ color: 'var(--text-muted)' }}>
          Merci {firstName} !
        </p>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
          Votre résultat est prêt.
        </h2>
      </div>

      {/* Niveau */}
      <div className="rounded-xl p-6 text-center" style={{ background: config.bg }}>
        <span
          className="inline-block text-sm font-semibold px-3 py-1 rounded-full mb-3"
          style={{ background: config.color, color: '#fff' }}
        >
          Niveau {config.label}
        </span>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
          {config.description}
        </p>
      </div>

      {/* Score */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
          <span>Score obtenu</span>
          <span className="font-semibold" style={{ color: 'var(--text)' }}>
            {score} / {maxScore} pts ({pct} %)
          </span>
        </div>
        <div className="w-full h-3 rounded-full" style={{ background: '#E2E8F0' }}>
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: config.color }}
          />
        </div>
      </div>

      {/* Conseil */}
      <div
        className="rounded-lg p-4 text-sm leading-relaxed"
        style={{ background: 'var(--surface)', color: 'var(--text)' }}
      >
        <p className="font-semibold mb-1" style={{ color: 'var(--primary)' }}>Votre programme recommandé</p>
        <p>{config.advice}</p>
      </div>

      {/* Et maintenant ? */}
      <div
        className="rounded-lg p-5 text-sm leading-relaxed"
        style={{ background: 'var(--surface)', color: 'var(--text)' }}
      >
        <p className="font-semibold mb-2" style={{ color: 'var(--primary)' }}>Et maintenant ?</p>
        <p>
          Vous allez être recontacté(e) par le service formation des Hôpitaux Paris Saint-Joseph
          Marie-Lannelongue qui vous proposera 3 dates de formation pour planifier vos 3 sessions d&apos;1h30.
        </p>
      </div>
    </div>
  );
}
