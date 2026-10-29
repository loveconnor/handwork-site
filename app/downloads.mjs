// Desktop release links. Bump `desktopVersion` (and the README) for each release.
export const desktopVersion = "0.1.47";
export const desktopReleaseNotes = `https://github.com/loveconnor/handwork/releases/tag/desktop-v${desktopVersion}`;
const base = `https://github.com/loveconnor/handwork/releases/download/desktop-v${desktopVersion}`;

export const desktopBuilds = [
  { id: "mac-arm64", os: "macOS", arch: "Apple Silicon", note: "Macs with an M-series chip. Signed and notarized by Apple.", href: `${base}/Handwork-${desktopVersion}-arm64.dmg`, aria: "Download Handwork for macOS Apple Silicon" },
  { id: "win-x64", os: "Windows", arch: "x64", note: "Most Windows PCs with an Intel or AMD processor.", href: `${base}/Handwork-Setup-${desktopVersion}-x64.exe`, aria: "Download Handwork for Windows x64" },
  { id: "win-arm64", os: "Windows", arch: "ARM64", note: "Windows on ARM, including Snapdragon laptops.", href: `${base}/Handwork-Setup-${desktopVersion}-arm64.exe`, aria: "Download Handwork for Windows ARM64" },
];
