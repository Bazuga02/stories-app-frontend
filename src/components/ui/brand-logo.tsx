import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

type BrandLogoProps = {
  href?: string;
  showText?: boolean;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
};

export function BrandLogo({
  href = "/",
  showText = true,
  className,
  imageClassName,
  textClassName,
}: BrandLogoProps) {
  const inner = (
    <>
      <Image
        src="/story.png"
        alt=""
        width={36}
        height={36}
        className={cn("size-8 shrink-0 sm:size-9", imageClassName)}
      />
      {showText ? (
        <span className={cn("font-semibold tracking-tight", textClassName)}>Stories</span>
      ) : null}
    </>
  );

  const wrapperClass = cn("inline-flex items-center gap-2.5 sm:gap-3", className);

  if (href) {
    return (
      <Link href={href} className={wrapperClass}>
        {inner}
      </Link>
    );
  }

  return <div className={wrapperClass}>{inner}</div>;
}
