export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`worklog-skeleton rounded-md ${className}`} />;
}
