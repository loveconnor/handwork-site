"use client";

import { useEffect, useLayoutEffect, useState } from 'react';
import { Tabs, TabsList, TabsTab, TabsPanel } from './ui/tabs';
import { Button } from './ui/button';
import PlaybackIcons from './PlaybackIcons';

export default function RecordingDemo() {
  const [step, setStep] = useState('inspect');

  // The full-size viewer keeps its dialog/history lifecycle in app.js.
  // Selection belongs to Tabs; these events synchronize that existing viewer.
  useEffect(() => {
    function selectFromViewer(event) {
      if (event.detail === 'inspect' || event.detail === 'verify') setStep(event.detail);
    }
    document.addEventListener('handwork:select-recording', selectFromViewer);
    return () => document.removeEventListener('handwork:select-recording', selectFromViewer);
  }, []);

  useLayoutEffect(() => {
    document.dispatchEvent(new Event('handwork:recording-changed'));
  }, [step]);

  return (
    <Tabs value={step} onValueChange={(value) => setStep(value)} className="demo-wrap" style={{ '--tabs-trigger-height': '44px' }}>
      <TabsList activateOnFocus className="demo-tabs w-[340px]" aria-label="Recorded Handwork task">
        <TabsTab value="inspect" id="inspect-tab" aria-controls="inspect-panel" data-demo="inspect">
          <span>01</span> Inspect
        </TabsTab>
        <TabsTab value="verify" id="verify-tab" aria-controls="verify-panel" data-demo="verify">
          <span>02</span> Edit and test
        </TabsTab>
      </TabsList>
      <div className="capture-shell">
        <TabsPanel value="inspect" id="inspect-panel" aria-labelledby="inspect-tab" data-state={step === 'inspect' ? 'active' : 'inactive'} keepMounted>
          <img className="demo-image" src="/media/inspect.png" data-gif="/media/inspect.gif" data-poster="/media/inspect.png" width="1100" height="650" alt="Handwork reads slug.js and test.js and explains the bug." />
        </TabsPanel>
        <TabsPanel value="verify" id="verify-panel" aria-labelledby="verify-tab" data-state={step === 'verify' ? 'active' : 'inactive'} keepMounted>
          <img className="demo-image" src="/media/verify.png" data-gif="/media/verify.gif" data-poster="/media/verify.png" width="1100" height="650" alt="Handwork edits slug.js and runs node test.js. Both tests pass." />
        </TabsPanel>
      </div>
      <div className="capture-controls"><p><span className="mobile-pan-note">Open full size to read the terminal. </span>This is real terminal output with shorter idle waits.</p><div className="capture-actions"><Button variant="outline" className="motion-toggle" id="motion-toggle" aria-pressed="false"><PlaybackIcons /><span className="motion-label">Play recording</span></Button><Button asChild variant="outline" className="no-underline"><a id="demo-open" href="/media/inspect.png">Open full size</a></Button></div></div>
    </Tabs>
  );
}
