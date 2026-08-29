const TICKER =
  "ALL IN  ·  53,000+ IN THE CREW  ·  INDONESIA · CAMBODIA · VIETNAM  ·  REAL MAD MONKEY HOSTELS EVERY NIGHT  ·  $99 HOLDS YOUR SPOT  ·  SOLO? NOT FOR LONG  ·  ";

export function Ticker({ className = "bg-mm-lime" }: { className?: string }) {
  return (
    <div className={`ticker ${className}`} aria-hidden="true">
      <div className="ticker-track font-sticker text-[11px] tracking-[0.18em] text-mm-black">
        <span>{TICKER.repeat(4)}</span>
        <span>{TICKER.repeat(4)}</span>
      </div>
    </div>
  );
}
