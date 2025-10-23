import { useEffect, useRef } from "react";

type UseFitTextOptions = {
  maxFontSize?: number;
  minFontSize?: number;
  trigger?: unknown;
};

export function useFitText<TElement extends HTMLElement>({
  maxFontSize = 120,
  minFontSize = 32,
  trigger,
}: UseFitTextOptions = {}) {
  const textRef = useRef<TElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const element = textRef.current;
    const parent = element?.parentElement;

    if (!element || !parent) {
      return;
    }

    const hasResizeObserver = "ResizeObserver" in window;
    let resizeObserver: ResizeObserver | undefined;

    const adjustFontSize = () => {
      if (!element || !parent) {
        return;
      }

      const availableWidth = parent.clientWidth;
      const availableHeight = parent.clientHeight;

      if (availableWidth === 0 || availableHeight === 0) {
        return;
      }

      let low = minFontSize;
      let high = maxFontSize;
      let best = minFontSize;

      while (low <= high) {
        const mid = (low + high) / 2;
        element.style.fontSize = `${mid}px`;

        const fitsWithinWidth = element.scrollWidth <= availableWidth;
        const fitsWithinHeight = element.scrollHeight <= availableHeight;

        if (fitsWithinWidth && fitsWithinHeight) {
          best = mid;
          low = mid + 0.5;
        } else {
          high = mid - 0.5;
        }
      }

      element.style.fontSize = `${best}px`;
    };

    adjustFontSize();

    if (hasResizeObserver) {
      resizeObserver = new ResizeObserver(() => adjustFontSize());
      resizeObserver.observe(parent);
      resizeObserver.observe(element);
    } else {
      const handleResize = () => adjustFontSize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    return () => {
      resizeObserver?.disconnect();
    };
  }, [maxFontSize, minFontSize, trigger]);

  return textRef;
}
