interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

export function VerifiedBadge({ size = 16, className = "" }: VerifiedBadgeProps) {
  const id = "vb_" + Math.random().toString(36).slice(2, 7);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0, display: "inline-block" }}
    >
      <defs>
        <linearGradient id={`${id}_gold`} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* Outer gold ring */}
      <circle cx="12" cy="12" r="11.2" fill={`url(#${id}_gold)`} />

      {/* Black inner circle */}
      <circle cx="12" cy="12" r="9.2" fill="#0a0a0a" />

      {/* Gold checkmark */}
      <path
        d="M7.5 12.2 L10.5 15.2 L16.5 9"
        stroke={`url(#${id}_gold)`}
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
