"use client";

import { CtaLabel, CtaWell } from "./Cta";
import usePlatform from "./usePlatform";
import { desktopBuilds } from "../downloads.mjs";

// Every desktop build, with the one that matches this device marked.
export default function DesktopDownloads() {
  const platform = usePlatform();
  return (
    <ul className="desktop-downloads" aria-label="Desktop downloads">
      {desktopBuilds.map((build) => {
        const match = build.id === platform;
        return (
          <li className="desktop-download-row" key={build.id} data-match={match || undefined}>
            <div>
              <h3>{build.os} <span>{build.arch}</span>{match && <em className="desktop-match">Your device</em>}</h3>
              <p>{build.note}</p>
            </div>
            <a className={`download-button cta cta-sm has-well ${match ? "cta-light" : "cta-glass"}`} href={build.href} aria-label={build.aria}><CtaLabel>Download</CtaLabel><CtaWell icon="download" /></a>
          </li>
        );
      })}
    </ul>
  );
}
