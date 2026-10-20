import { Play, Pause } from 'honestui/icons';

export default function PlaybackIcons() {
  return (
    <span className="playback-icons" aria-hidden="true">
      <Play className="icon-play" size={16} strokeWidth={1.5} focusable="false" />
      <Pause className="icon-pause" size={16} strokeWidth={1.5} focusable="false" />
    </span>
  );
}
