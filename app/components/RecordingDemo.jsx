"use client";

import { useEffect, useRef } from 'react';

export default function RecordingDemo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (!preference.matches) video.play().catch(() => {});
    const respectReducedMotion = () => {
      if (preference.matches) video.pause();
    };
    preference.addEventListener('change', respectReducedMotion);
    return () => preference.removeEventListener('change', respectReducedMotion);
  }, []);

  return (
    <video
      ref={videoRef}
      className="hero-demo-video"
      width="1600"
      height="1080"
      muted
      loop
      playsInline
      controls
      preload="metadata"
      poster="/media/handwork-hero-poster.jpg"
      aria-label="Handwork terminal and desktop demo: editing code and running tests"
    >
      <source src="/media/handwork-hero.mp4" type="video/mp4" />
      <a href="/media/handwork-hero.mp4">Watch the Handwork demo</a>
    </video>
  );
}
