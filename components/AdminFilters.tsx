'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type Filters = {
  level: string;
  format: string;
};

const LEVELS = [
  { value: 'all', label: 'Tous les niveaux' },
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
];

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  total: number;
  filtered: number;
};

export default function AdminFilters({ filters, onChange, total, filtered }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.level}
        onValueChange={(val) => val && onChange({ ...filters, level: val })}
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LEVELS.map((l) => (
            <SelectItem key={l.value} value={l.value}>
              {l.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.format}
        onValueChange={(val) => val && onChange({ ...filters, format: val })}
      >
        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les formats</SelectItem>
          <SelectItem value="presentiel">Présentiel</SelectItem>
          <SelectItem value="distanciel">Distanciel</SelectItem>
          <SelectItem value="indifferent">Indifférent</SelectItem>
        </SelectContent>
      </Select>

      <span className="text-sm ml-auto" style={{ color: 'var(--text-muted)' }}>
        {filtered === total ? `${total} participant${total > 1 ? 's' : ''}` : `${filtered} / ${total}`}
      </span>
    </div>
  );
}
