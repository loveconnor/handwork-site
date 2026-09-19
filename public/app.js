const copyButton = document.querySelector('[data-copy]');
copyButton?.addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(copyButton.dataset.copy);
    status.textContent = 'Install command copied.';
    copyButton.setAttribute('aria-label', 'Install command copied');
    copyButton.classList.add('copied');
    setTimeout(() => {
      copyButton.classList.remove('copied');
      copyButton.setAttribute('aria-label', 'Copy install command');
      status.textContent = '';
    }, 2000);
  } catch { status.textContent = 'Copy unavailable. Select and copy the install command above.'; }
});

const tabs = [...document.querySelectorAll('[data-demo]')];
const tabList = document.querySelector('.demo-tabs');
const captureShell = document.querySelector('.capture-shell');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let playing = false;
const toggle = document.querySelector('#motion-toggle');
const toggleLabel = toggle?.querySelector('span');
const demoOpen = document.querySelector('#demo-open');
const recordingViewer = document.querySelector('#recording-viewer');
const recordingViewerImage = document.querySelector('#recording-viewer-image');
const recordingViewerContent = document.querySelector('#recording-viewer-content');
const recordingViewerTitle = document.querySelector('#recording-viewer-title');
const recordingViewerPlay = document.querySelector('#recording-viewer-play');
const recordingViewerPlayLabel = recordingViewerPlay?.querySelector('span');
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
function updateTabIndicator(tab) {
  if (!tabList || !tab) return;
  tabList.style.setProperty('--indicator-x', `${tab.offsetLeft}px`);
  tabList.style.setProperty('--indicator-width', String(tab.offsetWidth));
}
function selectTab(tab, { animate = true } = {}) {
  if (!animate) {
    tabList?.setAttribute('data-motion', 'none');
    captureShell?.setAttribute('data-motion', 'none');
  }
  tabs.forEach(item => {
    const active = item === tab;
    const panel = document.getElementById(item.getAttribute('aria-controls'));
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    panel.dataset.state = active ? 'active' : 'inactive';
    panel.setAttribute('aria-hidden', String(!active));
    panel.inert = !active;
    panel.hidden = false;
  });
  const activeImage = document.querySelector(`#${tab?.getAttribute('aria-controls')} .demo-image`);
  if (demoOpen && activeImage) demoOpen.href = activeImage.dataset.poster;
  updateTabIndicator(tab);
  updateMotion();
  if (!animate) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      tabList?.removeAttribute('data-motion');
      captureShell?.removeAttribute('data-motion');
    }));
  }
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    const keys = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault(); const next = tabs[keys[event.key]]; selectTab(next, { animate: false }); next.focus();
  });
});
const initialTab = tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
if (initialTab) {
  selectTab(initialTab, { animate: false });
  requestAnimationFrame(() => { tabList.dataset.ready = ''; });
  addEventListener('resize', () => updateTabIndicator(tabs.find(tab => tab.getAttribute('aria-selected') === 'true')));
}
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
  if (syncPage) selectTab(tab, { animate: false });
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
    "source": "bullmq-recovery",
    "values": [
      {
        "attempts": 5,
        "fixes": 5,
        "time": 251.485,
        "toolCalls": 25.8,
        "inputTokens": 477491.2,
        "outputTokens": 2939,
        "rss": 30.640625
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
        "time": 40.622,
        "toolCalls": 5,
        "inputTokens": 37086.6,
        "outputTokens": 991.8,
        "rss": 23.65625
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
      }
    ]
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
        "time": 25.376,
        "toolCalls": 5,
        "inputTokens": 27880.2,
        "outputTokens": 462,
        "rss": 21.90625
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
      }
    ]
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
        "time": 86.128,
        "toolCalls": 8.4,
        "inputTokens": 71894.8,
        "outputTokens": 2136.2,
        "rss": 27.265625
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
      }
    ]
  }
};
const benchmarkMetricKeys = ['fixes', 'time', 'toolCalls', 'inputTokens', 'outputTokens', 'rss'];
const taskSelect = document.querySelector('#task-select');
const taskMenu = document.querySelector('#task-options');
const taskOptions = [...document.querySelectorAll('#task-options [role="option"]')];
let activeTaskOption = taskOptions.find(option => option.getAttribute('aria-selected') === 'true');

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
      time: `${agent.time.toFixed(1)} s`,
      toolCalls: agent.toolCalls.toFixed(1),
      inputTokens: Math.round(agent.inputTokens).toLocaleString('en-US'),
      outputTokens: Math.round(agent.outputTokens).toLocaleString('en-US'),
      rss: `${agent.rss.toFixed(1)} MiB`
    };
    benchmarkMetricKeys.forEach(key => {
      const cell = rows[index].querySelector(`[data-metric="${key}"]`);
      cell.querySelector('.metric-value').textContent = formatted[key];
      const scale = key === 'fixes' ? agent.fixes / (agent.attempts ?? data.attempts) : agent[key] / maxima[key];
      cell.querySelector('.metric-bar').style.setProperty('--bar-scale', String(scale));
    });
  });
  const source = data.source ?? 'fair-comparison';
  document.querySelector('#benchmark-source').href = `/benchmarks/${source}/REPORT.md`;
  document.querySelector('#benchmark-download').href = `/benchmarks/${source}/summary.json`;
}
function setActiveTaskOption(option) {
  activeTaskOption?.classList.remove('is-active');
  activeTaskOption = option;
  activeTaskOption?.classList.add('is-active');
  if (taskSelect?.getAttribute('aria-expanded') === 'true') taskSelect.setAttribute('aria-activedescendant', option.id);
}
function setTaskMenuOpen(open) {
  if (!taskSelect || !taskMenu) return;
  taskSelect.setAttribute('aria-expanded', String(open));
  taskMenu.hidden = !open;
  if (open) setActiveTaskOption(taskOptions.find(option => option.getAttribute('aria-selected') === 'true'));
  else {
    taskSelect.removeAttribute('aria-activedescendant');
    activeTaskOption?.classList.remove('is-active');
  }
}
function chooseTask(option) {
  taskOptions.forEach(item => item.setAttribute('aria-selected', String(item === option)));
  taskSelect.dataset.value = option.dataset.value;
  document.querySelector('#task-select-value').textContent = option.textContent.trim();
  updateBenchmark(option.dataset.value);
  setTaskMenuOpen(false);
}
function moveActiveTask(step) {
  const index = taskOptions.indexOf(activeTaskOption);
  setActiveTaskOption(taskOptions[(index + step + taskOptions.length) % taskOptions.length]);
}

taskSelect?.addEventListener('click', () => setTaskMenuOpen(taskSelect.getAttribute('aria-expanded') !== 'true'));
taskSelect?.addEventListener('keydown', event => {
  const open = taskSelect.getAttribute('aria-expanded') === 'true';
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (open) moveActiveTask(event.key === 'ArrowDown' ? 1 : -1);
    else setTaskMenuOpen(true);
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault();
    if (!open) setTaskMenuOpen(true);
    setActiveTaskOption(taskOptions[event.key === 'Home' ? 0 : taskOptions.length - 1]);
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (open) chooseTask(activeTaskOption);
    else setTaskMenuOpen(true);
  } else if (event.key === 'Escape' && open) {
    event.preventDefault();
    setTaskMenuOpen(false);
  } else if (event.key === 'Tab' && open) {
    setTaskMenuOpen(false);
  } else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
    const match = taskOptions.find(option => option.textContent.trim().toLowerCase().startsWith(event.key.toLowerCase()));
    if (match) { event.preventDefault(); setTaskMenuOpen(true); setActiveTaskOption(match); }
  }
});
taskOptions.forEach(option => {
  option.addEventListener('mousedown', event => event.preventDefault());
  option.addEventListener('click', () => chooseTask(option));
  option.addEventListener('pointermove', () => setActiveTaskOption(option));
});
document.addEventListener('pointerdown', event => {
  if (!event.target.closest('.custom-select')) setTaskMenuOpen(false);
});
