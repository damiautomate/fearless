"use client";

// ─── Clean SVG Icons for Fearless UI ───
// Replace emojis with crisp, scalable icons

const I = ({ d, size = 20, color = "currentColor", ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>{d}</svg>
);

export function IconPill({ size, color, ...p }) {
  return <I size={size} color={color} d={<><path d="M10.5 1.5L13.5 4.5" /><rect x="3" y="9" width="12" height="12" rx="6" transform="rotate(-45 9 15)" /><line x1="12" y1="12" x2="14.5" y2="9.5" /></>} {...p} />;
}

export function IconBrain({ size, color, ...p }) {
  return <I size={size} color={color} d={<><path d="M12 2a5 5 0 0 1 4.9 4 4.5 4.5 0 0 1 1.8 8.3A4 4 0 0 1 12 22a4 4 0 0 1-6.7-7.7A4.5 4.5 0 0 1 7.1 6 5 5 0 0 1 12 2z" /><path d="M12 2v20" /></>} {...p} />;
}

export function IconChart({ size, color, ...p }) {
  return <I size={size} color={color} d={<><path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 5-5" /></>} {...p} />;
}

export function IconUser({ size, color, ...p }) {
  return <I size={size} color={color} d={<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} {...p} />;
}

export function IconSun({ size, color, ...p }) {
  return <I size={size} color={color} d={<><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>} {...p} />;
}

export function IconMoon({ size, color, ...p }) {
  return <I size={size} color={color} d={<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />} {...p} />;
}

export function IconFlame({ size, color, ...p }) {
  return <I size={size} color={color} d={<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />} {...p} />;
}

export function IconZap({ size, color, ...p }) {
  return <I size={size} color={color} d={<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>} {...p} />;
}

export function IconSend({ size, color, ...p }) {
  return <I size={size} color={color} d={<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>} {...p} />;
}

export function IconCheck({ size, color, ...p }) {
  return <I size={size} color={color} d={<polyline points="20 6 9 17 4 12" />} {...p} />;
}

export function IconPlay({ size, color, ...p }) {
  return <I size={size} color={color} d={<polygon points="5 3 19 12 5 21 5 3" />} {...p} />;
}

export function IconBook({ size, color, ...p }) {
  return <I size={size} color={color} d={<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>} {...p} />;
}

export function IconHeadphones({ size, color, ...p }) {
  return <I size={size} color={color} d={<><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></>} {...p} />;
}

export function IconPen({ size, color, ...p }) {
  return <I size={size} color={color} d={<><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></>} {...p} />;
}

export function IconLeaf({ size, color, ...p }) {
  return <I size={size} color={color} d={<><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></>} {...p} />;
}

export function IconSettings({ size, color, ...p }) {
  return <I size={size} color={color} d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>} {...p} />;
}

export function IconChevron({ size, color, direction = "down", ...p }) {
  const paths = {
    down: <polyline points="6 9 12 15 18 9" />,
    up: <polyline points="18 15 12 9 6 15" />,
    right: <polyline points="9 18 15 12 9 6" />,
    left: <polyline points="15 18 9 12 15 6" />,
  };
  return <I size={size} color={color} d={paths[direction]} {...p} />;
}

export function IconLogout({ size, color, ...p }) {
  return <I size={size} color={color} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>} {...p} />;
}

export function IconMic({ size, color, ...p }) {
  return <I size={size} color={color} d={<><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>} {...p} />;
}

export function IconTarget({ size, color, ...p }) {
  return <I size={size} color={color} d={<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>} {...p} />;
}

export function IconShield({ size, color, ...p }) {
  return <I size={size} color={color} d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />} {...p} />;
}

// ─── Type icon mapping ───
export const typeIconMap = {
  video: IconPlay,
  book: IconBook,
  audio: IconHeadphones,
  challenge: IconZap,
  journal: IconPen,
  rest: IconLeaf,
};

export const typeColorMap = {
  video: "var(--red)",
  book: "var(--teal)",
  audio: "var(--orange)",
  challenge: "var(--purple)",
  journal: "var(--accent)",
  rest: "var(--green)",
};
