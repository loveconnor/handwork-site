"use client";

import { CtaLabel, CtaWell, OsMark } from "./Cta";
import usePlatform from "./usePlatform";
import { desktopBuilds, desktopVersion } from "../downloads.mjs";

const labels = { "mac-arm64": "Download for Mac", "win-x64": "Download for Windows", "win-arm64": "Download for Windows" };

// The hero's primary action. It links straight to the installer for the
// visitor's system, or to the download list when there is no matching build.
export default function DownloadButton({ className = "" }) {
  const platform = usePlatform();
  const build = desktopBuilds.find((item) => item.id === platform);
  return (
    <span className="lp-download" data-platform={platform}>
      {build ? (
        <a className={`cta cta-light has-well ${className}`} href={build.href} aria-label={build.aria}>
          <OsMark os={build.os} /><CtaLabel>{labels[build.id]}</CtaLabel><CtaWell icon="download" />
        </a>
      ) : (
        <a className={`cta cta-light has-well ${className}`} href="#download">
          <CtaLabel>{platform === "unknown" ? "Download the app" : "See all downloads"}</CtaLabel><CtaWell icon="down" />
        </a>
      )}
    </span>
  );
}

// One line under the hero actions saying which build the button gets.
export function DownloadNote({ className = "" }) {
  const platform = usePlatform();
  const build = desktopBuilds.find((item) => item.id === platform);
  const note = build
    ? `${build.os} ${build.arch} · Desktop app v${desktopVersion}`
    : platform === "mac-intel" ? "The desktop app needs a Mac with Apple Silicon."
    : platform === "unknown" ? `Desktop app v${desktopVersion}`
    : "The desktop app is for macOS and Windows computers.";
  return <p className={className} aria-live="polite">{note}{build && <> · <a href="#download">Other platforms</a></>}</p>;
}
