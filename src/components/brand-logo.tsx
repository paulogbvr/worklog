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
        "inline-flex min-w-0 items-center gap-2.5 leading-none text-[color:var(--app-text-strong)]",
        className
      ].join(" ")}
    >
      <FaCode aria-hidden className={["shrink-0", iconClassName].join(" ")} />
      {showName ? <span className="truncate font-semibold leading-none">WorkLog</span> : null}
    </span>
  );
}
