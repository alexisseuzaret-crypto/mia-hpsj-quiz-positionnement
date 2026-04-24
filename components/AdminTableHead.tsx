export default function AdminTableHead() {
  return (
    <thead>
      <tr style={{ borderBottom: '1px solid var(--surface)' }}>
        {['Prénom', 'Nom', 'Email', 'Service', 'Niveau', 'Score', 'Date'].map((col) => (
          <th
            key={col}
            className="text-left text-xs font-semibold px-3 py-2 whitespace-nowrap"
            style={{ color: 'var(--text-muted)' }}
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}
