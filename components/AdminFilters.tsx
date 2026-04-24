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
  service: string;
};

const LEVELS = [
  { value: 'all', label: 'Tous les niveaux' },
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
];

const SERVICES = [
  'Direction générale',
  'DSN',
  'RH',
  'Qualité',
  'Assistantes de direction',
  'Service international',
  'Autre',
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
        value={filters.service}
        onValueChange={(val) => val && onChange({ ...filters, service: val })}
      >
        <SelectTrigger className="w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les services</SelectItem>
          {SERVICES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-sm ml-auto" style={{ color: 'var(--text-muted)' }}>
        {filtered === total ? `${total} participant${total > 1 ? 's' : ''}` : `${filtered} / ${total}`}
      </span>
    </div>
  );
}
