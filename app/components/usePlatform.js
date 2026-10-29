"use client";

import { useEffect, useState } from "react";

// Returns one of: "unknown" (before detection), "mac-arm64", "mac-intel",
// "win-x64", "win-arm64", "linux", "mobile", "other".
// The server render always sees "unknown", so markup hydrates cleanly and
// switches to the visitor's build after mount.

function webglRenderer() {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    return info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
  } catch {
    return "";
  }
}

export async function detectPlatform() {
  const ua = navigator.userAgent;
  const hints = navigator.userAgentData;
  if (/iPhone|iPad|iPod|Android/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "mobile";

  const os = /Windows/.test(ua) ? "windows" : /Mac OS X|Macintosh/.test(ua) ? "mac" : /Linux|CrOS/.test(ua) ? "linux" : "other";
  if (os === "linux" || os === "other") return os;

  // Client hints report the CPU architecture in Chromium browsers. Only trust
  // them when they agree with the user agent, which spoofing tools can change.
  let arch = "";
  const hintOs = hints?.platform === "macOS" ? "mac" : hints?.platform === "Windows" ? "windows" : "";
  if (hintOs === os) {
    try {
      arch = (await hints.getHighEntropyValues(["architecture"])).architecture || "";
    } catch {}
  }

  if (os === "windows") return arch === "arm" ? "win-arm64" : "win-x64";
  if (arch === "x86") return "mac-intel";
  if (arch === "arm") return "mac-arm64";
  // Safari and Firefox: an Intel GPU name means an Intel Mac. Apple Silicon is
  // the default because it is the only Mac the app supports.
  return /Intel/i.test(webglRenderer()) ? "mac-intel" : "mac-arm64";
}

export default function usePlatform() {
  const [platform, setPlatform] = useState("unknown");
  useEffect(() => {
    let live = true;
    detectPlatform().then((value) => { if (live) setPlatform(value); }, () => { if (live) setPlatform("other"); });
    return () => { live = false; };
  }, []);
  return platform;
}
