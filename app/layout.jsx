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
        {/* Entrance animations start hidden; show everything when scripts are off. */}
        <noscript><style>{'.lp-reveal{visibility:visible!important}.lp-title [aria-hidden]{opacity:1!important;filter:none!important;transform:none!important}'}</style></noscript>
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        {children}
        <Script src="/app.js" strategy="afterInteractive" />
        {analyticsEnabled && <Script src="/analytics.js" type="module" strategy="afterInteractive" />}
      </body>
    </html>
  );
}
