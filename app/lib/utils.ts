import { type ClassValue, clsx } from "clsx";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export function useDebouncedState<S>(initialState: S, delay: number): [S, S, (state: S) => void] {
  const [state, setState] = useState(initialState);
  const [debouncedState, setDebouncedState] = useState(initialState);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedState(state), delay);
    return () => clearTimeout(timer);
  }, [state, delay]);

  return [state, debouncedState, setState];
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function snakeToPretty(str: string): string {
  if (!str) return str;
  return str
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

type RetryOptions = {
  retries: number;
  retryDelay?: number;
  timeout?: number;
};

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  retryOptions: RetryOptions = { retries: 3, retryDelay: 100, timeout: 5000 },
): Promise<Response> {
  if (retryOptions.timeout) {
    init.signal = AbortSignal.timeout(retryOptions.timeout);
  }
  return fetch(input, init)
    .then(async (response) => (response.ok ? response : Promise.reject(response)))
    .catch(async (err) => {
      if (retryOptions.retries <= 0) {
        console.error(`Failed to fetch ${input}: ${err}`);
        throw err;
      }
      console.warn(`Failed to fetch ${input}: ${err}, ${retryOptions.retries} retries left`);
      return await new Promise((resolve) => setTimeout(resolve, retryOptions.retryDelay ?? 0)).then(() =>
        fetchWithRetry(input, init, { retries: retryOptions.retries - 1, retryDelay: retryOptions.retryDelay }),
      );
    });
}
