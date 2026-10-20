import './buttons.css';
import Script from 'next/script';
import { analyticsEnabled } from './site-config.mjs';

export const metadata = {
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = { colorScheme: 'light', themeColor: '#ffffff' };

export default function RootLayout({ children }) {
  return (
    // Extensions such as Storylane add root attributes before React hydrates.
    // Keep this escape hatch on html so descendant mismatches still surface.
    <html lang="en" data-theme="light" data-style="modern" data-gray-color="gray" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/GeistMono-Variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        {children}
        <Script src="/app.js" strategy="afterInteractive" />
        <Script src="/hero-warp.js" strategy="afterInteractive" />
        {analyticsEnabled && <Script src="/analytics.js" type="module" strategy="afterInteractive" />}
      </body>
    </html>
  );
}
