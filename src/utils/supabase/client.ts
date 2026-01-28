import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Timeout padrão para requisições ao Supabase (evita "Salvando..." ou loading infinito por rede lenta). */
const SUPABASE_FETCH_TIMEOUT_MS = 30 * 1000; // 30s

/**
 * Fetch com timeout — evita que requisições fiquem penduradas e causem loops de loading.
 * Recomendação Supabase: custom fetch com AbortSignal para timeout.
 * @see https://supabase.com/docs/guides/api/automatic-retries-in-supabase-js
 * @see https://supabase.com/docs/reference/javascript/db-abortsignal
 */
function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SUPABASE_FETCH_TIMEOUT_MS);

  const signal = init?.signal;
  if (signal) {
    signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      controller.abort();
    });
  }

  return fetch(input, {
    ...init,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
}

export const createClient = () =>
  createBrowserClient(supabaseUrl!, supabaseKey!, {
    global: {
      fetch: fetchWithTimeout,
    },
  });
