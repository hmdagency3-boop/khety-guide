interface OfficialBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export function OfficialBadge({ size = "sm", className = "" }: OfficialBadgeProps) {
  const isLg = size === "md";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-black tracking-widest select-none shrink-0 ${
        isLg ? "px-2 py-0.5 text-[10px]" : "px-1.5 py-0.5 text-[8px]"
      } ${className}`}
      style={{
        background: "transparent",
        border: "1.5px solid",
        borderColor: "#f59e0b",
        color: "#f59e0b",
        letterSpacing: "0.12em",
        textShadow: "0 0 6px rgba(245,158,11,0.4)",
      }}
    >
      <span style={{ fontSize: isLg ? "10px" : "8px", lineHeight: 1 }}>𓇳</span>
      {isLg ? " KHETY" : "KHETY"}
    </span>
  );
}
