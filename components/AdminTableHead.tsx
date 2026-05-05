export default function AdminTableHead() {
  return (
    <thead>
      <tr style={{ borderBottom: '1px solid var(--surface)' }}>
        {['Prénom', 'Nom', 'Email', 'Site', 'Pôle', 'Service', 'Format', 'Niveau', 'Score', 'Date', 'Actions'].map((col) => (
          <th
            key={col}
            className={`text-xs font-semibold px-3 py-2 whitespace-nowrap ${col === 'Actions' ? 'text-right' : 'text-left'}`}
            style={{ color: 'var(--text-muted)' }}
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}
