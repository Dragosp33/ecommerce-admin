import { Inter } from 'next/font/google';
import '@/app/_styles/globals.css';

import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | DPC Dashboard',
    default: 'DPC Dashboard',
  },
  description: 'DPC Admin Dashboard.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
  generator: 'Next.js',
  applicationName: 'DPC Dashboard',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'Next.js',
    'React',
    'JavaScript',
    'Admin',
    'Ecommerce',
    'DPC',
    'Dashboard',
  ],
  authors: [{ name: 'Dragos Polifronie', url: 'https://github.com/Dragosp33' }],
  creator: 'Dragos Polifronie',
  publisher: 'Dragos Polifronie',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
