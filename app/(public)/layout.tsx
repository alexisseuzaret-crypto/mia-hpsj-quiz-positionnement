import Header from '@/components/Header';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex flex-col flex-1">{children}</main>
    </>
  );
}
