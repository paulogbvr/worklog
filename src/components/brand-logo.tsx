import { FaCode } from "react-icons/fa6";

export function BrandLogo({
  className = "",
  iconClassName = "size-5",
  showName = true
}: {
  className?: string;
  iconClassName?: string;
  showName?: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2.5 text-[color:var(--app-text-strong)]",
        className
      ].join(" ")}
    >
      <FaCode aria-hidden className={iconClassName} />
      {showName ? <span className="font-semibold">WorkLog</span> : null}
    </span>
  );
}
