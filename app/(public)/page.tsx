import Link from 'next/link';
import { Button } from '@/components/ui/button';

const LEVELS = [
  {
    title: 'Débutant — Premiers pas avec Copilot Chat',
    desc: '3 sessions de 1h30 pour découvrir l\'outil et ses usages quotidiens',
  },
  {
    title: 'Intermédiaire — Approfondir ses usages',
    desc: '3 sessions de 1h30 pour maîtriser le prompting avancé et construire ses templates',
  },
  {
    title: 'Avancé — Exploiter Copilot au maximum',
    desc: '3 sessions de 1h30 pour aller plus loin dans les usages métier',
  },
];

export default function LandingPage() {
  return (
    <>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1
              className="text-3xl sm:text-4xl font-bold leading-tight"
              style={{ color: 'var(--primary)' }}
            >
              Quiz de positionnement<br />Formation Copilot Chat
            </h1>
            <p className="text-xl" style={{ color: 'var(--text-muted)' }}>
              Évaluez votre niveau en 5 à 10 minutes et découvrez le programme de formation adapté à votre profil.
            </p>
          </div>

          {/* À propos du programme */}
          <div
            className="rounded-xl p-6 text-left space-y-4"
            style={{ background: 'var(--surface)' }}
          >
            <h2 className="text-base font-bold" style={{ color: 'var(--primary)' }}>
              À propos de ce programme de formation
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
              Les Hôpitaux Paris Saint-Joseph Marie-Lannelongue lancent un plan de formation à
              Microsoft Copilot Chat. Ce quiz permet d&apos;identifier votre niveau actuel pour
              vous orienter vers le programme le plus adapté à votre profil.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {LEVELS.map((l) => (
                <div
                  key={l.title}
                  className="rounded-lg p-3 space-y-1"
                  style={{ background: 'var(--background)' }}
                >
                  <p className="text-xs font-semibold leading-snug" style={{ color: 'var(--primary)' }}>
                    {l.title}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {l.desc}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Quel que soit votre niveau, vous aurez accès à 3 sessions de 1h30 adaptées à vos besoins.
            </p>
          </div>

          {/* RGPD */}
          <div
            className="rounded-xl p-6 text-left text-sm"
            style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
          >
            <p className="font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Informations sur vos données
            </p>
            <p>
              Vos réponses sont collectées uniquement dans le cadre de ce programme de formation.
              Elles ne seront pas partagées avec des tiers et seront conservées le temps nécessaire
              à l&apos;organisation des sessions. Conformément au RGPD, vous pouvez demander l&apos;accès,
              la rectification ou la suppression de vos données à{' '}
              <a href="mailto:formation@mister-ia.com" style={{ color: 'var(--primary)' }}>
                formation@mister-ia.com
              </a>.
            </p>
          </div>

          <Link href="/quiz">
            <Button
              size="lg"
              className="text-lg px-10 py-6 cursor-pointer"
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              Commencer le quiz →
            </Button>
          </Link>

          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            21 questions · 5 à 10 minutes · Résultat immédiat
          </p>
        </div>
      </div>

      <footer
        className="border-t py-4 text-center text-sm"
        style={{ borderColor: 'var(--surface)', color: 'var(--text-muted)' }}
      >
        <p>
          © 2026 Mister IA ·{' '}
          <a href="mailto:formation@mister-ia.com" style={{ color: 'var(--primary)' }}>
            Contact
          </a>
        </p>
      </footer>
    </>
  );
}
