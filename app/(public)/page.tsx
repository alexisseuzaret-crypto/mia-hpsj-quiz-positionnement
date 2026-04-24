import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
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
            20 questions · 5 à 10 minutes · Résultat immédiat
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
