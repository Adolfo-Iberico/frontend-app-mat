import { Footer } from '@/components/Layout/footer';
import { Header } from '@/components/Layout/header';
import { cn } from '@/lib/utils';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn('public-body-bg flex flex-col min-h-screen')}>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
