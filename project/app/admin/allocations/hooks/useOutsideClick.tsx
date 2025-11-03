// hooks/useOutsideClick.ts
import { useEffect } from "react";

export function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onClickAway: () => void
) {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onClickAway();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [ref, onClickAway]);
}
