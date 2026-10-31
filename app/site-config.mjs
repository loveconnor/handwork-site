export const release = process.env.HANDWORK_VERSION || '0.1.7';
export const siteUrl = process.env.SITE_URL?.replace(/\/$/, '');
export const analyticsEnabled = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === 'production'
  : process.env.HANDWORK_PRODUCTION_BUILD === '1';

const pages = {
  home: ['/', 'Handwork | AI coding agent for terminal and desktop', 'Handwork reads your project, edits files, and runs tests with your chosen AI model. Use it in your terminal or the desktop app.'],
  docs: ['/docs/', 'Documentation | Handwork', 'Install Handwork, connect a model, and run your first coding task. Includes CLI commands, permissions, and terminal image support.'],
  benchmarks: ['/benchmarks/', 'Benchmarks | Handwork', 'Coding task results for Handwork, OpenCode, Codex, and Claude Code: completed fixes, time, tool calls, tokens, and local memory, with every attempt kept.'],
  about: ['/about/', 'About | Handwork', 'Handwork is an AI coding agent by Connor Love. Its Zig runtime connects models to your project through the terminal, desktop app, or JavaScript SDK.'],
};

export function pageMetadata(page) {
  const [pathname, title, description] = pages[page];
  const url = siteUrl && `${siteUrl}${pathname}`;
  const images = siteUrl ? [{
    url: `${siteUrl}/og.png`, width: 1672, height: 941,
    alt: 'Handwork. A coding agent for the terminal, written in Zig.',
  }] : undefined;
  return {
    title, description,
    ...(url && { alternates: { canonical: url } }),
    openGraph: { title, description, siteName: 'Handwork', type: 'website', ...(url && { url, images }) },
    ...(url && { twitter: { card: 'summary_large_image', title, description, images: [`${siteUrl}/og.png`] } }),
  };
}
