'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export type Filters = {
  level: string;
  format: string;
  site: string;
  pole: string;
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

      <Input
        placeholder="Filtrer par site…"
        value={filters.site}
        onChange={(e) => onChange({ ...filters, site: e.target.value })}
        className="w-48 h-9"
      />

      <Input
        placeholder="Filtrer par pôle…"
        value={filters.pole}
        onChange={(e) => onChange({ ...filters, pole: e.target.value })}
        className="w-48 h-9"
      />

      <span className="text-sm ml-auto" style={{ color: 'var(--text-muted)' }}>
        {filtered === total ? `${total} participant${total > 1 ? 's' : ''}` : `${filtered} / ${total}`}
      </span>
    </div>
  );
}
