import { UserPlus } from "lucide-react";

const GUEST_QUOTA = 3;

interface GuestBannerProps {
  quoteCount: number;
  onSignUp: () => void;
}

export function GuestBanner({ quoteCount, onSignUp }: GuestBannerProps) {
  const remaining = Math.max(0, GUEST_QUOTA - quoteCount);
  const atLimit = remaining === 0;

  return (
    <div
      className="flex items-center justify-between gap-4 px-6 py-2.5 text-sm border-b border-border"
      style={{ background: atLimit ? "#FEF2F2" : "#EFF6FF" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded"
          style={{
            background: atLimit ? "#FEE2E2" : "#DBEAFE",
            color: atLimit ? "#DC2626" : "#1D4ED8",
          }}
        >
          {quoteCount}/{GUEST_QUOTA}
        </span>
        <span style={{ color: atLimit ? "#B91C1C" : "#1E40AF" }}>
          {atLimit
            ? "Guest limit reached. Create a free account to add more quotes."
            : `Guest mode — ${remaining} quote${remaining !== 1 ? "s" : ""} remaining.`}
        </span>
      </div>

      <button
        type="button"
        onClick={onSignUp}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex-shrink-0 transition-opacity hover:opacity-90"
        style={{ background: "#2563EB" }}
      >
        <UserPlus className="w-3.5 h-3.5" />
        Create free account
      </button>
    </div>
  );
}

export { GUEST_QUOTA };
