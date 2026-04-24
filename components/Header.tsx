import Image from 'next/image';

export default function Header() {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--surface)',
        background: 'var(--background)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
        }}
      >
        <Image
          src="/logos/mister-ia.png"
          alt="Mister IA"
          width={160}
          height={60}
          priority
          style={{ height: 'auto', width: 'auto', maxHeight: '60px' }}
        />

        <span
          aria-hidden
          className="hidden sm:inline-block"
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '24px',
            fontWeight: 400,
            color: 'var(--text-muted)',
            lineHeight: 1,
          }}
        >
          ×
        </span>

        <Image
          src="/logos/saint-joseph.png"
          alt="Hôpitaux Paris Saint-Joseph"
          width={160}
          height={60}
          priority
          style={{ height: 'auto', width: 'auto', maxHeight: '60px' }}
        />
      </div>
    </header>
  );
}
