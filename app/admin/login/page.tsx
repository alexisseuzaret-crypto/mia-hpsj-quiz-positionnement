'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? 'Mot de passe incorrect');
      }
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--surface)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 space-y-6"
        style={{ background: 'var(--background)', boxShadow: '0 2px 16px 0 rgba(26,32,61,0.08)' }}
      >
        <div className="flex justify-center">
          <Image
            src="/logos/mister-ia.png"
            alt="Mister IA"
            width={120}
            height={45}
            priority
            style={{ height: 'auto', width: 'auto', maxHeight: '45px' }}
          />
        </div>

        <div>
          <h1 className="text-xl font-bold text-center" style={{ color: 'var(--primary)' }}>
            Accès administrateur
          </h1>
          <p className="text-sm text-center mt-1" style={{ color: 'var(--text-muted)' }}>
            Dashboard HPSJ — Quiz Copilot Chat
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
              required
            />
            {error && (
              <p role="alert" className="text-xs" style={{ color: '#EF4444' }}>
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full cursor-pointer"
            style={{ background: 'var(--primary)', color: '#fff' }}
            disabled={loading || !password}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  );
}
