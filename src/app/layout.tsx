import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { IBM_Plex_Mono, Zen_Kaku_Gothic_New } from 'next/font/google';
import './globals.css';
const SUPPORTED_LANGS = ['ja', 'en'];

function detectLang(acceptLanguage: string | null): string {
  if (!acceptLanguage) return 'en';
  for (const part of acceptLanguage.split(',')) {
    const lang = part.split(';')[0]?.trim().slice(0, 2).toLowerCase();
    if (lang && SUPPORTED_LANGS.includes(lang)) return lang;
  }
  return 'en';
}


const bodyFont = Zen_Kaku_Gothic_New({
  variable: '--font-body',
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
});

const monoFont = IBM_Plex_Mono({
  variable: '--font-mono',
  weight: ['400', '500', '700'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'keisetsu Publisher',
  description: 'SQLite deck management starter for keisetsu.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const lang = detectLang(headersList.get('accept-language'));

  return (
    <html lang={lang}>
      <body className={`${bodyFont.variable} ${monoFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
