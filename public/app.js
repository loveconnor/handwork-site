const tabs = [...document.querySelectorAll('[data-demo]')];
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let playing = false;
const toggle = document.querySelector('#motion-toggle');
const toggleLabel = toggle?.querySelector('.motion-label');
const demoOpen = document.querySelector('#demo-open');
const recordingViewer = document.querySelector('#recording-viewer');
const recordingViewerImage = document.querySelector('#recording-viewer-image');
const recordingViewerContent = document.querySelector('#recording-viewer-content');
const recordingViewerTitle = document.querySelector('#recording-viewer-title');
const recordingViewerPlay = document.querySelector('#recording-viewer-play');
const recordingViewerPlayLabel = recordingViewerPlay?.querySelector('.motion-label');
const recordingViewerClose = document.querySelector('#recording-viewer-close');
const recordingViewerSteps = [...document.querySelectorAll('[data-viewer-demo]')];
let recordingViewerPlaying = false;
let recordingViewerReturnFocus = null;
let recordingViewerCloseTimer = 0;

function updateMotionButton(button, label, active) {
  if (!button || !label) return;
  label.textContent = active ? 'Pause recording' : 'Play recording';
  button.setAttribute('aria-pressed', String(active));
  button.setAttribute('aria-label', label.textContent);
}
function updateMotion() {
  document.querySelectorAll('.demo-image').forEach(image => {
    const panel = image.closest('[role="tabpanel"]');
    image.src = playing && panel.dataset.state === 'active' ? image.dataset.gif : image.dataset.poster;
  });
  updateMotionButton(toggle, toggleLabel, playing);
}
function syncRecordingPreview() {
  const active = tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
  const image = active && document.querySelector(`#${active.getAttribute('aria-controls')} .demo-image`);
  if (demoOpen && image) demoOpen.href = image.dataset.poster;
  updateMotion();
}
function selectTab(tab) {
  if (tab) document.dispatchEvent(new CustomEvent('handwork:select-recording', { detail: tab.dataset.demo }));
}
document.addEventListener('handwork:recording-changed', syncRecordingPreview);
syncRecordingPreview();
toggle?.addEventListener('click', () => { playing = !playing; updateMotion(); });

function getDemoTab(value) {
  return tabs.find(tab => tab.dataset.demo === value) || tabs[0];
}
function updateRecordingViewerMotion() {
  if (!recordingViewerImage) return;
  recordingViewerImage.src = recordingViewerPlaying ? recordingViewerImage.dataset.gif : recordingViewerImage.dataset.poster;
  updateMotionButton(recordingViewerPlay, recordingViewerPlayLabel, recordingViewerPlaying);
}
function setRecordingViewerStep(tab, { syncPage = true, updateHistory = true } = {}) {
  if (!recordingViewer || !recordingViewerImage || !tab) return;
  const sourceImage = document.querySelector(`#${tab.getAttribute('aria-controls')} .demo-image`);
  if (!sourceImage) return;
  recordingViewer.dataset.demo = tab.dataset.demo;
  recordingViewerTitle.textContent = tab.textContent.trim().replace(/^\d+\s*/, '');
  recordingViewerImage.dataset.gif = sourceImage.dataset.gif;
  recordingViewerImage.dataset.poster = sourceImage.dataset.poster;
  recordingViewerImage.alt = sourceImage.alt;
  recordingViewerSteps.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.viewerDemo === tab.dataset.demo)));
  if (syncPage) selectTab(tab);
  updateRecordingViewerMotion();
  recordingViewerContent?.scrollTo(0, 0);
  if (updateHistory && recordingViewer.open && history.state?.handworkRecording) {
    history.replaceState({ ...history.state, handworkRecording: { step: tab.dataset.demo } }, '', '#recording');
  }
}
function finishRecordingViewerClose() {
  clearTimeout(recordingViewerCloseTimer);
  recordingViewerCloseTimer = 0;
  if (!recordingViewer?.open) return;
  recordingViewer.close();
  recordingViewer.removeAttribute('data-state');
  document.body.classList.remove('recording-viewer-open');
  recordingViewerPlaying = false;
  updateRecordingViewerMotion();
  const returnFocus = recordingViewerReturnFocus;
  recordingViewerReturnFocus = null;
  requestAnimationFrame(() => returnFocus?.focus({ preventScroll: true }));
}
function closeRecordingViewer() {
  if (!recordingViewer?.open || recordingViewer.dataset.state === 'closing') return;
  recordingViewer.dataset.state = 'closing';
  if (motionPreference.matches) finishRecordingViewerClose();
  else recordingViewerCloseTimer = setTimeout(finishRecordingViewerClose, 160);
}
function requestRecordingViewerClose() {
  if (!recordingViewer?.open) return;
  if (history.state?.handworkRecording) history.back();
  else closeRecordingViewer();
}
function openRecordingViewer(tab, { pushHistory = true } = {}) {
  if (!recordingViewer || !tab) return;
  clearTimeout(recordingViewerCloseTimer);
  recordingViewerCloseTimer = 0;
  recordingViewerReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : demoOpen;
  playing = false;
  recordingViewerPlaying = false;
  updateMotion();
  setRecordingViewerStep(tab, { updateHistory: false });
  recordingViewer.removeAttribute('data-state');
  if (!recordingViewer.open) recordingViewer.showModal();
  document.body.classList.add('recording-viewer-open');
  if (pushHistory) history.pushState({ ...(history.state || {}), handworkRecording: { step: tab.dataset.demo } }, '', '#recording');
  recordingViewerClose?.focus({ preventScroll: true });
}

demoOpen?.addEventListener('click', event => {
  if (!recordingViewer) return;
  event.preventDefault();
  openRecordingViewer(tabs.find(tab => tab.getAttribute('aria-selected') === 'true'));
});
recordingViewerPlay?.addEventListener('click', () => {
  recordingViewerPlaying = !recordingViewerPlaying;
  updateRecordingViewerMotion();
});
recordingViewerClose?.addEventListener('click', requestRecordingViewerClose);
recordingViewerSteps.forEach(button => button.addEventListener('click', () => setRecordingViewerStep(getDemoTab(button.dataset.viewerDemo))));
recordingViewer?.addEventListener('cancel', event => {
  event.preventDefault();
  requestRecordingViewerClose();
});
recordingViewer?.addEventListener('click', event => {
  if (event.target === recordingViewer) requestRecordingViewerClose();
});
addEventListener('popstate', event => {
  const viewerState = event.state?.handworkRecording;
  if (viewerState) {
    const tab = getDemoTab(viewerState.step);
    if (recordingViewer?.open) setRecordingViewerStep(tab, { updateHistory: false });
    else openRecordingViewer(tab, { pushHistory: false });
  } else if (recordingViewer?.open) closeRecordingViewer();
});
motionPreference.addEventListener('change', () => {
  if (!motionPreference.matches) return;
  playing = false;
  recordingViewerPlaying = false;
  updateMotion();
  updateRecordingViewerMotion();
});
if (history.state?.handworkRecording) openRecordingViewer(getDemoTab(history.state.handworkRecording.step), { pushHistory: false });

const docsNavToggle = document.querySelector('#docs-nav-toggle');
const docsNav = document.querySelector('#docs-sections');
const docsMobile = matchMedia('(max-width: 620px)');
function setDocsNavOpen(open) {
  if (!docsNavToggle || !docsNav) return;
  docsNavToggle.setAttribute('aria-expanded', String(open));
  docsNav.hidden = !open;
}
function syncDocsNav() {
  if (!docsNavToggle || !docsNav) return;
  setDocsNavOpen(!docsMobile.matches);
}
docsNavToggle?.addEventListener('click', () => {
  if (docsMobile.matches) setDocsNavOpen(docsNavToggle.getAttribute('aria-expanded') !== 'true');
});
docsNav?.addEventListener('click', event => {
  if (docsMobile.matches && event.target.closest('a')) setDocsNavOpen(false);
});
docsMobile.addEventListener('change', syncDocsNav);
syncDocsNav();

const docsLinks = [...document.querySelectorAll('#docs-sections a[href^="#"]')];
const docsSections = docsLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
let docsScrollFrame = 0;
function updateDocsLocation() {
  docsScrollFrame = 0;
  if (!docsSections.length) return;
  const current = [...docsSections].reverse().find(section => section.getBoundingClientRect().top <= 150) || docsSections[0];
  docsLinks.forEach(link => {
    if (link.getAttribute('href') === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
if (docsSections.length) {
  updateDocsLocation();
  addEventListener('scroll', () => {
    if (!docsScrollFrame) docsScrollFrame = requestAnimationFrame(updateDocsLocation);
  }, { passive: true });
}

const datasets = {
  "bullmq": {
    "label": "BullMQ worker recovery",
    "attempts": 5,
    "budget": 1800,
    "build": "ReleaseFast",
    "source": "handwork-2026-10-19",
    "values": [
      {
        "attempts": 5,
        "fixes": 5,
        "time": 232.136,
        "toolCalls": 20.8,
        "inputTokens": 321875.2,
        "outputTokens": 3317.8,
        "rss": 23.28125
      },
      {
        "attempts": 5,
        "fixes": 5,
        "time": 446.917,
        "toolCalls": 30.8,
        "inputTokens": 539156,
        "outputTokens": 4461.8,
        "rss": 778.71875
      },
      {
        "attempts": 5,
        "fixes": 5,
        "time": 231.599,
        "toolCalls": 20.2,
        "inputTokens": 623398.6,
        "outputTokens": 3643.6,
        "rss": 205.84375
      },
      {
        "attempts": 5,
        "fixes": 5,
        "time": 262.985,
        "toolCalls": 19.2,
        "inputTokens": 748616.8,
        "outputTokens": 10491.4,
        "rss": 307.515625
      }
    ]
  },
  "search": {
    "label": "Async search",
    "attempts": 5,
    "budget": 600,
    "build": "ReleaseFast",
    "values": [
      {
        "attempts": 5,
        "fixes": 5,
        "time": 28.957,
        "toolCalls": 5,
        "inputTokens": 30740.6,
        "outputTokens": 1012.4,
        "rss": 24.4375
      },
      {
        "attempts": 5,
        "fixes": 5,
        "time": 55.151,
        "toolCalls": 15.8,
        "inputTokens": 78781.2,
        "outputTokens": 1138.8,
        "rss": 790.0625
      },
      {
        "attempts": 5,
        "fixes": 5,
        "time": 32.841,
        "toolCalls": 4.2,
        "inputTokens": 82758.2,
        "outputTokens": 763.4,
        "rss": 234.015625
      },
      {
        "attempts": 5,
        "fixes": 5,
        "time": 21.242,
        "toolCalls": 3,
        "inputTokens": 37797.2,
        "outputTokens": 2095.8,
        "rss": 275.234375
      }
    ],
    "source": "handwork-2026-10-19"
  },
  "pagination": {
    "label": "Pagination",
    "attempts": 5,
    "budget": 600,
    "build": "ReleaseFast",
    "values": [
      {
        "attempts": 5,
        "fixes": 5,
        "time": 20.222,
        "toolCalls": 5,
        "inputTokens": 25233.2,
        "outputTokens": 464,
        "rss": 24.390625
      },
      {
        "attempts": 5,
        "fixes": 5,
        "time": 41.656,
        "toolCalls": 11,
        "inputTokens": 42015.8,
        "outputTokens": 734.4,
        "rss": 748.1875
      },
      {
        "attempts": 5,
        "fixes": 5,
        "time": 27.981,
        "toolCalls": 3.4,
        "inputTokens": 66153.2,
        "outputTokens": 566.4,
        "rss": 237.671875
      },
      {
        "attempts": 5,
        "fixes": 5,
        "time": 12.835,
        "toolCalls": 3.8,
        "inputTokens": 32897.8,
        "outputTokens": 1032.4,
        "rss": 275.6875
      }
    ],
    "source": "handwork-2026-10-19"
  },
  "cache": {
    "label": "Authorization and cache isolation",
    "attempts": 5,
    "budget": 600,
    "build": "ReleaseFast",
    "values": [
      {
        "attempts": 5,
        "fixes": 5,
        "time": 50.298,
        "toolCalls": 8.2,
        "inputTokens": 58932.2,
        "outputTokens": 1930.8,
        "rss": 28.140625
      },
      {
        "attempts": 5,
        "fixes": 5,
        "time": 121.552,
        "toolCalls": 24.2,
        "inputTokens": 115747.8,
        "outputTokens": 3056.8,
        "rss": 785.3125
      },
      {
        "attempts": 5,
        "fixes": 5,
        "time": 83.48,
        "toolCalls": 6.2,
        "inputTokens": 129680.2,
        "outputTokens": 2236,
        "rss": 235.09375
      },
      {
        "attempts": 5,
        "fixes": 5,
        "time": 47.945,
        "toolCalls": 3.2,
        "inputTokens": 53216.6,
        "outputTokens": 5212.6,
        "rss": 282.875
      }
    ],
    "source": "handwork-auth-cache-2026-10-19"
  }
};
const benchmarkMetricKeys = ['fixes', 'time', 'toolCalls', 'inputTokens', 'outputTokens', 'rss'];

function updateBenchmark(value) {
  const data = datasets[value];
  const maxima = Object.fromEntries(benchmarkMetricKeys.map(key => [key, Math.max(...data.values.map(agent => agent[key]))]));
  const rows = [...document.querySelectorAll('#benchmark-rows tr')];
  document.querySelector('#benchmark-caption').textContent = data.label;
  document.querySelector('#benchmark-budget').textContent = `${data.attempts} attempts per agent, ${data.budget} second limit per attempt`;
  data.values.forEach((agent, index) => {
    const cells = rows[index].children;
    const buildTag = cells[0].querySelector('.row-tag');
    if (buildTag) buildTag.textContent = data.build;
    const formatted = {
      fixes: `${agent.fixes} / ${agent.attempts ?? data.attempts}`,
      time: agent.time === null ? "—" : `${agent.time.toFixed(1)} s`,
      toolCalls: agent.toolCalls === null ? '—' : agent.toolCalls.toFixed(1),
      inputTokens: agent.inputTokens === null ? '—' : Math.round(agent.inputTokens).toLocaleString('en-US'),
      outputTokens: agent.outputTokens === null ? '—' : Math.round(agent.outputTokens).toLocaleString('en-US'),
      rss: agent.rss === null ? '—' : `${agent.rss.toFixed(1)} MiB`
    };
    benchmarkMetricKeys.forEach(key => {
      const cell = rows[index].querySelector(`[data-metric="${key}"]`);
      cell.querySelector('.metric-value').textContent = formatted[key];
      const scale = key === 'fixes' ? agent.fixes / (agent.attempts ?? data.attempts) : (agent[key] ?? 0) / (maxima[key] || 1);
      cell.querySelector('.metric-bar').style.setProperty('--bar-scale', String(scale));
    });
  });
  const source = data.source ?? 'fair-comparison';
  document.querySelector('#benchmark-source').href = `/benchmarks/${source}/`;
  document.querySelector('#benchmark-download').href = `/benchmarks/${source}/summary.json`;
}
document.addEventListener('handwork:benchmark-task', event => {
  if (Object.hasOwn(datasets, event.detail)) updateBenchmark(event.detail);
});
