# Handwork site

Next.js App Router site for Handwork, with CLI documentation and desktop app downloads. Pages are authored as React components and exported as static files for hosting. Production pages use Vercel Web Analytics for visitor and page-view counts. The site self-hosts the same Geist Mono 1.3.1 variable font used by the Handwork terminal app, with system monospace fallbacks. Its SIL Open Font License is stored beside the font in `public/fonts/`.

## Local development

Requires Node.js 22+.

```sh
npm run dev
# http://127.0.0.1:4321
```

With the dev server running, `npm run test:hydration` checks clean hydration, extension-added root attributes, and detection of mismatches inside the page. Set `HYDRATION_ORIGIN` if the server uses another address.

Next.js updates the page as you edit. Set `PORT` to choose another port. To preview the production export, run `npm run build` followed by `npm run preview` (also on port 4321).

```sh
npm run build
npm test
npm run test:browser
```

Set the public origin when creating a production build. The production command stops if `SITE_URL` is missing. The build uses it for canonical URLs, social-card URLs, `robots.txt`, and `sitemap.xml`. The displayed CLI version defaults to 0.1.5. Set HANDWORK_VERSION to override it for a release build; this is independent of the private site package version.

```sh
SITE_URL=https://example.com HANDWORK_VERSION=0.1.5 npm run build:production
```

Browser checks require the dev dependency and Chromium: `npm install`, then `npx playwright install chromium`. Deploy the generated `dist/` directory to a static host with directory-index support. No production Node.js server or fallback routing is needed. Keep the `npm run build` build-command override and `dist` output-directory override when deploying; they also generate crawler files and the exported security policy. Hosts that support `_headers` should serve the generated `dist/_headers`, whose CSP hashes allow the exact Next.js bootstrap scripts. The local preview uses that same policy.

## Web Analytics

Enable Web Analytics in the Vercel project dashboard, then deploy the site with `npm run build` and output directory `dist`. The shared Next.js layout loads `@vercel/analytics` on every page when `VERCEL_ENV=production`. Local builds and Vercel preview deployments do not collect visits. Outside Vercel, `npm run build:production` enables the integration, but the host must provide Vercel's analytics endpoint.

The prepare step copies the browser SDK and its MIT license into `public/vendor/`; Next.js includes them in `dist/vendor/`. Analytics removes query strings and URL fragments before sending page views, respects Global Privacy Control and Do Not Track, and sends no custom events. Verify live collection by visiting the deployed site and checking the Vercel Analytics dashboard; blockers or privacy preferences can prevent collection.

Interface icons come from `honestui/icons`; GitHub, OpenAI, and Claude marks come from `honestui/logos` (Honest UI 0.2.3, MIT). The Handwork branding and OpenCode mark remain local assets because Honest UI does not provide them.

Buttons use the editable Honest UI registry component in `app/components/ui/button.jsx`, with its MIT license retained beside it. It uses the current `@base-ui/react` package, Tailwind v4 utilities, and Honest UI theme tokens mapped to the site's monochrome actions. The original page styles stay in their own cascade layer so component states can apply consistently.

The recording preview uses the Honest UI tabs registry component in `app/components/ui/tabs.jsx`. It owns keyboard navigation and panel selection; a small event bridge keeps the existing full-size viewer and playback controls synchronized.

The install command uses Honest AI's `ProseCodeBlock` from the local `honest-ai` registry, adapted to JSX in `app/components/ai/prose-code-block.jsx` with its MIT license. It includes keyboard copying, copy confirmation, and clipboard failure feedback.

The benchmark Task picker uses Honest UI Select (`app/components/ui/select.jsx`) for single selection, keyboard controls, focus, and popup positioning. Selection events update the existing benchmark table and report links.

## Structure

- `app/`: React pages for home, docs, about, and the custom not-found page
- `app/components/SiteShell.jsx`: shared navigation and footer
- `app/site-config.mjs`: release version, metadata, and analytics build settings
- `public/`: shared styles, browser interactions, favicon, generated GIFs and static posters
- `scripts/build.mjs`: Next.js build/export, crawler files, and CSP script hashes
- `scripts/server.mjs`: loopback-only preview server
- `content/actual-run.script`: raw `script -r` terminal recording
- `content/actual-run.json`: recording setup and result
- `content/demo-workspace/`: the fixture as it existed before the run
- `scripts/generate-media.py`: renders the terminal recording with Python 3, Pyte, and Pillow

## Desktop downloads

Below the terminal demo and benchmarks, the homepage links to Windows x64/ARM64 and macOS Apple Silicon installers in `desktop-v0.1.47`. The Mac app is signed with Developer ID, notarized by Apple, and stapled. Both Windows installers passed installation and launch checks on their respective architectures. Installed apps use the public `desktop-stable` update feed.

## Content provenance

The images and diagrams section uses the sibling Handwork repository `docs/inline-images.md`, inspected October 15, 2026. Terminal requirements link to the host documentation. Historical recordings retain their original version labels.

CLI copy and documentation use the sibling Handwork repository README and terminal styling in `src/ui/render.zig` / `src/ui/assistant/user_message_card.zig`, inspected September 14, 2026. The site is standalone and does not read the sibling project during build or runtime.

Archived September benchmark values came from a five-attempt series for Handwork, OpenCode, and Codex on pagination, async search, and authorization/cache isolation. All agents used the same model and 600-second limit, fresh workspaces, rotated order, and independent scoring. Every scored outcome is retained. The report and summary are served from `public/benchmarks/fair-comparison/`. Update `public/app.js` and the no-JavaScript table in `app/page.jsx` together.

The two GIFs come from a real interactive Handwork 0.0.9 session in a disposable project. The raw `script -r` recording contains the terminal output and timing. `scripts/generate-media.py` applies the recorded control sequences to a 110 by 38 terminal with Pyte, then draws each screen with Pillow. The generator caps idle gaps at 650 milliseconds but does not add or rewrite output. Playback is opt in. The page also has static posters, a pause control, keyboard tabs, and a text result.

The source repository, contributor site, and npm version are intentionally explicit. Production metadata is generated when `SITE_URL` is set.

Claude Code was added on October 4, 2026 with Opus 5.5 at medium effort, five attempts per task. Previous values are preserved. The method and aggregate results are in `public/benchmarks/claude-code/`; combined report downloads include the fourth row. Models and run dates differ.

Handwork alone was refreshed on October 19, 2026 using the current ReleaseFast build, five attempts on each original task. The original prompts, fixtures, verifiers and budgets are retained. Competitor figures and archived reports are unchanged; dates and methodological differences are visible on the page. The new aggregate export and method are in `public/benchmarks/handwork-2026-10-19/`. Regenerate only from a complete retained series with `node scripts/refresh-handwork-benchmarks.mjs /absolute/new-results-directory`.

Authorization/cache now uses the separate complete five-attempt cohort in `public/benchmarks/handwork-auth-cache-2026-10-19/`. All metrics in that row come from this cohort; the earlier four-task series remains unchanged. Regenerate into a new cohort with `node scripts/refresh-auth-cache.mjs /absolute/new-results-directory`.

Site copy was reviewed against the Handwork native source, package version, provider and image documentation, the desktop README, and retained benchmark reports on October 19, 2026. The homepage explains the coding task first; detailed setup and permissions stay in Docs. Historical recordings and desktop download versions retain their original labels.

Benchmark reports render from `public/benchmarks/*/REPORT.md` at `/benchmarks/<series>/` using `honestui/ai/markdown` and `honestui/prose.css`. The same template renders archived comparisons; the original Markdown and JSON exports remain downloadable. Static generation discovers report directories and includes their pages in the sitemap.

Each documentation section uses the same Honest AI `honest-prose` styles for headings, paragraphs, inline code, code blocks, and tables. Reference tables retain their table semantics and scroll with keyboard focus on narrow screens.

The nine documentation examples use the Honest AI code-block component with copy controls and feedback. The component supports the original captioned layout for examples and a compact layout for the homepage install command.

The homepage benchmark uses the Honest UI Table registry components in `app/components/ui/table.jsx`, retaining row headers, task switching, comparison bars, and the mobile card layout. The table container accepts region attributes for keyboard scrolling.
