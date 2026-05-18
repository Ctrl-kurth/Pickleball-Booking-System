import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Presentation | Next-Gen',
  description: 'A bespoke, interactive web-based presentation application.',
};

export default function PresentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-white/30 selection:text-white antialiased">
      {children}
    </div>
  );
}
