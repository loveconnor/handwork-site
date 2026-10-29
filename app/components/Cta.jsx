import { ArrowRight, ArrowDown, Download } from "honestui/icons";

const icons = { right: ArrowRight, down: ArrowDown, download: Download };

// The round icon well at the end of a .cta button. It holds two copies of the
// icon so the first can slide out as the second slides in on hover.
export function CtaWell({ icon = "right" }) {
  const Icon = icons[icon];
  const glyph = <Icon size={16} strokeWidth={1.75} aria-hidden="true" focusable="false" />;
  return <span className="cta-well" data-dir={icon === "right" ? undefined : "down"} aria-hidden="true">{glyph}{glyph}</span>;
}

// A button label that rolls letter by letter on hover. The rolling copy is
// hidden from assistive technology, which reads the plain text instead.
export function CtaLabel({ children }) {
  return (
    <span className="cta-label">
      <span className="sr-only">{children}</span>
      <span className="cta-roll" aria-hidden="true">
        {[...children].map((char, index) => <span key={index} style={{ "--i": index }}>{char === " " ? "\u00a0" : char}</span>)}
      </span>
    </span>
  );
}

// Operating system marks for download buttons.
export function OsMark({ os }) {
  if (os === "macOS") {
    return (
      <svg className="cta-mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M21.36 8.18c-.14.11-2.66 1.5-2.66 4.57 0 3.56 3.2 4.82 3.3 4.86-.01.07-.51 1.72-1.69 3.4-1.05 1.48-2.15 2.96-3.82 2.96s-2.1-.95-4.03-.95c-1.88 0-2.55.98-4.08.98s-2.6-1.37-3.82-3.05C3.15 18.98 2 15.91 2 13c0-4.67 3.1-7.14 6.16-7.14 1.62 0 2.98 1.04 4 1.04.97 0 2.48-1.1 4.33-1.1.7 0 3.22.06 4.87 2.38zm-5.75-4.36c.77-.88 1.31-2.11 1.31-3.34 0-.17-.02-.34-.05-.48-1.24.05-2.72.81-3.61 1.82-.7.78-1.35 2-1.35 3.25 0 .19.03.38.05.44.08.01.2.03.33.03 1.12 0 2.52-.73 3.32-1.72z" />
      </svg>
    );
  }
  return (
    <svg className="cta-mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M3 5.1 10.4 4v7.2H3zm8.3-1.2L21 2.5v8.7h-9.7zM3 12.8h7.4V20L3 18.9zm8.3 0H21v8.7l-9.7-1.4z" />
    </svg>
  );
}
