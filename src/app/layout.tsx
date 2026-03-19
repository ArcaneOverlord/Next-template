import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Study App',
  description: 'Master any topic with AI-generated study plans.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
