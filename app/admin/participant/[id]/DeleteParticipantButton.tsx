'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Props = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function DeleteParticipantButton({ id, firstName, lastName, email }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Supprimer définitivement ${firstName} ${lastName} (${email}) ? Cette action est irréversible.`
    );
    if (!confirmed) return;

    const res = await fetch('/api/admin/delete-participant', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      const data = await res.json().catch(() => ({})) as { error?: string };
      alert(data.error ?? 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        className="cursor-pointer"
      >
        Supprimer ce participant
      </Button>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        La suppression est définitive et inclut toutes les réponses associées.
      </p>
    </div>
  );
}
