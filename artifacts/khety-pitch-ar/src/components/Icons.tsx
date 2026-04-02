interface IconProps {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

const defaults = { color: "#CAA354", strokeWidth: 1.5 };

/* ── Human Moments (Slide04Features) ── */

export function IconObelisk({ size = "100%", color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="16,3 11,27 21,27" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <line x1="9" y1="27" x2="23" y2="27" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="13" y1="13" x2="19" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="12" y1="19" x2="20" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="16" y1="3" x2="16" y2="1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function IconMetroPath({ size = "100%", color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="24" height="14" rx="3" stroke={color} strokeWidth={strokeWidth} />
      <line x1="4" y1="15" x2="28" y2="15" stroke={color} strokeWidth={strokeWidth} />
      <rect x="7" y="10" width="4" height="4" rx="1" stroke={color} strokeWidth={strokeWidth} />
      <rect x="21" y="10" width="4" height="4" rx="1" stroke={color} strokeWidth={strokeWidth} />
      <circle cx="10" cy="25" r="2" stroke={color} strokeWidth={strokeWidth} />
      <circle cx="22" cy="25" r="2" stroke={color} strokeWidth={strokeWidth} />
      <line x1="10" y1="22" x2="10" y2="25" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="22" y1="22" x2="22" y2="25" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function IconShieldCheck({ size = "100%", color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 3L5 7.5V15c0 7 4.8 13.4 11 15.4C22.2 28.4 27 22 27 15V7.5L16 3z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <polyline
        points="11,16 14,19 21,12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconDiningPlate({ size = "100%", color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="17" r="10" stroke={color} strokeWidth={strokeWidth} />
      <circle cx="16" cy="17" r="6" stroke={color} strokeWidth={strokeWidth} strokeDasharray="2 2" />
      <line x1="9" y1="5" x2="9" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M7 5 v4 a2 2 0 0 0 4 0 V5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 5 Q25 8 25 11 Q25 13 23 13 L23 27" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Tourism Types (Slide04bTourismScope) ── */

export function IconWaves({ size = "100%", color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 10 C5 7 8 7 11 10 C14 13 17 13 20 10 C23 7 26 7 30 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M2 17 C5 14 8 14 11 17 C14 20 17 20 20 17 C23 14 26 14 30 17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M2 24 C5 21 8 21 11 24 C14 27 17 27 20 24 C23 21 26 21 30 24" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function IconDunes({ size = "100%", color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="7" r="3" stroke={color} strokeWidth={strokeWidth} />
      <line x1="24" y1="3" x2="24" y2="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="24" y1="11" x2="24" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="28" y1="7" x2="29" y2="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="19" y1="7" x2="18" y2="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M1 28 Q8 10 16 20 Q22 28 32 20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="28" x2="31" y2="28" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function IconPillars({ size = "100%", color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="28" height="3" rx="1" stroke={color} strokeWidth={strokeWidth} />
      <rect x="1" y="26" width="30" height="3" rx="1" stroke={color} strokeWidth={strokeWidth} />
      <rect x="6" y="7" width="4" height="19" stroke={color} strokeWidth={strokeWidth} />
      <rect x="14" y="7" width="4" height="19" stroke={color} strokeWidth={strokeWidth} />
      <rect x="22" y="7" width="4" height="19" stroke={color} strokeWidth={strokeWidth} />
      <path d="M4 4 L16 1 L28 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCoral({ size = "100%", color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 12 C3 8 3 4 6 4 C9 4 9 8 9 10 L9 20"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M9 14 C9 10 13 8 14 12 C15 16 13 18 9 18"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M16 28 L16 14 C16 10 19 8 20 12 L20 20"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M20 10 C20 6 24 5 25 9 C26 12 23 14 20 13"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M4 29 Q12 25 20 29 Q25 31 30 29" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <ellipse cx="26" cy="20" rx="3" ry="1.8" stroke={color} strokeWidth={strokeWidth} />
      <path d="M29 20 L31 18 L31 22 Z" fill={color} />
    </svg>
  );
}
