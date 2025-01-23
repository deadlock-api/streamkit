import { useEffect, useState } from "react";

export function useDebouncedState<S>(initialState: S, delay: number): [S, S, (state: S) => void] {
  const [state, setState] = useState(initialState);
  const [debouncedState, setDebouncedState] = useState(initialState);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedState(state), delay);
    return () => clearTimeout(timer);
  }, [state, delay]);

  return [state, debouncedState, setState];
}

export function snakeToPretty(str: string): string {
  if (!str) return str;
  return str
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}
