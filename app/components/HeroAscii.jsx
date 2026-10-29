"use client";

import GradientASCII from "./reactbits/GradientASCII";

// A gradient glow drawn in terminal characters behind the hero. Decorative
// only; the panel's own background shows through if WebGL is unavailable.
export default function HeroAscii() {
  return (
    <div className="lp-ascii" aria-hidden="true">
      <GradientASCII
        colors={["#1e3fd8", "#f6f8ff", "#a5d8ff", "#4f7dff"]}
        shape="horizon"
        cellSize={16}
        speed={0.6}
        flow={0.45}
        glow={0.25}
        grain={0.06}
        glyphOpacity={0.72}
        clickEffect="none"
      />
    </div>
  );
}
