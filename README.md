# Handwork site

Standalone static site for the Handwork CLI. No desktop-app content. No framework or server runtime. Production pages use Vercel Web Analytics for visitor and page-view counts. The site self-hosts the same Geist Mono 1.3.1 variable font used by the Handwork terminal app, with system monospace fallbacks. Its SIL Open Font License is stored beside the font in `public/fonts/`.

## Local development

Requires Node.js 22+.

```sh
npm run dev
# http://127.0.0.1:4321
```

The server builds on startup. Restart after source edits. Set `PORT` to choose another port.

```sh
npm run build
npm test
npm run test:browser
```

Set the public origin when creating a production build. The production command stops if `SITE_URL` is missing. The build uses it for canonical URLs, social-card URLs, `robots.txt`, and `sitemap.xml`. Set the release value when the current package version changes.

```sh
SITE_URL=https://example.com HANDWORK_VERSION=0.0.9 npm run build:production
```

Browser checks require the dev dependency and Chromium: `npm install`, then `npx playwright install chromium`. Deploy the generated `dist/` directory to a static host with directory-index support. No server-side rendering or fallback routing is needed.

## Web Analytics

Enable Web Analytics in the Vercel project dashboard, then deploy the site with `npm run build` and output directory `dist`. The shared page template loads `@vercel/analytics` on every page when `VERCEL_ENV=production`. Local builds and Vercel preview deployments do not collect visits. Outside Vercel, `npm run build:production` enables the integration, but the host must provide Vercel's analytics endpoint.

The build copies the browser SDK and its MIT license into `dist/vendor/`. Analytics removes query strings and URL fragments before sending page views, respects Global Privacy Control and Do Not Track, and sends no custom events. Verify live collection by visiting the deployed site and checking the Vercel Analytics dashboard; blockers or privacy preferences can prevent collection.

## Structure

- `src/`: home, docs, about page content
- `public/`: shared styles, browser interactions, favicon, generated GIFs and static posters
- `scripts/build.mjs`: shared document/navigation/footer and static output
- `scripts/server.mjs`: loopback-only preview server
- `content/actual-run.script`: raw `script -r` terminal recording
- `content/actual-run.json`: recording setup and result
- `content/demo-workspace/`: the fixture as it existed before the run
- `scripts/generate-media.py`: renders the terminal recording with Python 3, Pyte, and Pillow

## Content provenance

CLI copy and documentation use the sibling Handwork repository README and terminal styling in `src/ui/render.zig` / `src/ui/assistant/user_message_card.zig`, inspected September 14, 2026. The site is standalone and does not read the sibling project during build or runtime.

Benchmark values come from a fresh five-attempt series for Handwork, OpenCode, and Codex on pagination, async search, and authorization/cache isolation. All agents used the same model and 600-second limit, fresh workspaces, rotated order, and independent scoring. Every scored outcome is retained. The report and summary are served from `public/benchmarks/fair-comparison/`. Update `public/app.js` and the no-JavaScript table in `src/index.html` together.

The two GIFs come from a real interactive Handwork 0.0.9 session in a disposable project. The raw `script -r` recording contains the terminal output and timing. `scripts/generate-media.py` applies the recorded control sequences to a 110 by 38 terminal with Pyte, then draws each screen with Pillow. The generator caps idle gaps at 650 milliseconds but does not add or rewrite output. Playback is opt in. The page also has static posters, a pause control, keyboard tabs, and a text result.

The source repository, contributor site, and npm version are intentionally explicit. Production metadata is generated when `SITE_URL` is set.

Claude Code was added on October 4, 2026 with Opus 5.5 at medium effort, five attempts per task. Previous values are preserved. The method and aggregate results are in `public/benchmarks/claude-code/`; combined report downloads include the fourth row. Models and run dates differ.
