import clsx from "clsx";
import { type PropsWithChildren } from "react";

import { useFitText } from "@/hooks/useFitText";

type AutoFitTextProps = PropsWithChildren<{
  maxFontSize?: number;
  minFontSize?: number;
  className?: string;
}>;

export function AutoFitText({
  children,
  maxFontSize = 120,
  minFontSize = 48,
  className,
}: AutoFitTextProps) {
  const textRef = useFitText<HTMLSpanElement>({
    maxFontSize,
    minFontSize,
    trigger: children,
  });

  return (
    <span
      ref={textRef}
      className={clsx("block w-full whitespace-nowrap leading-none", className)}
    >
      {children}
    </span>
  );
}
