"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

type Props = {
  className?: string;
  src?: string;
};

export function HomeHeroLottie({ className, src = "/STUDENT.json" }: Props) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    fetch(src)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!data) {
    return (
      <div
        className={className}
        aria-hidden
      >
        <div className="mx-auto aspect-square w-full max-w-[min(100%,440px)] rounded-2xl bg-dark/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={className}>
      <Lottie
        animationData={data}
        loop
        className="mx-auto w-full max-w-[min(100%,480px)]"
        aria-hidden
      />
    </div>
  );
}
