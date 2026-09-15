import { cn } from "@/lib/cn";

/**
 * Marque VESTIA : le glyphe est à la fois un cintre et un « V ».
 */
export function LogoMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-[9px] bg-accent text-white",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.62}
        height={size * 0.62}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="5" r="2.1" />
        <path d="M12 7.1v2.3" />
        <path d="M4.2 18.4 12 9.4l7.8 9" />
      </svg>
    </span>
  );
}

export function Logo({
  size = 32,
  className,
  tone = "dark",
  subtitle,
}: {
  size?: number;
  className?: string;
  tone?: "dark" | "light";
  subtitle?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className="leading-none">
        <span
          className={cn(
            "block text-[15px] font-semibold tracking-[0.14em]",
            tone === "dark" ? "text-ink" : "text-white",
          )}
        >
          VESTIA
        </span>
        {subtitle && (
          <span
            className={cn(
              "mt-1 block text-[11px] tracking-wide",
              tone === "dark" ? "text-faint" : "text-white/55",
            )}
          >
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
