import { createBrowserClient } from "@supabase/ssr";
import fetchRetry from "fetch-retry";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Timeout padrão para requisições ao Supabase (evita "Salvando..." ou loading infinito por rede lenta). */
const SUPABASE_FETCH_TIMEOUT_MS = 30 * 1000; // 30s

/**
 * Fetch base com timeout usando AbortController.
 * Segue a recomendação da doc do Supabase de usar AbortSignal para timeout:
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

/**
 * fetch com retries automáticos, igual à doc oficial:
 * @see https://supabase.com/docs/guides/api/automatic-retries-in-supabase-js
 */
const fetchWithRetry = fetchRetry(fetchWithTimeout, {
  retries: 3, // número de tentativas
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000), // backoff exponencial
  // Só faz retry em erros de rede ou status de infra (ex.: 502/503/504/520),
  // para não esgotar o pool em erros de aplicação.
  retryOn: (attempt, error, response) => {
    if (attempt >= 3) return false;

    // Erro de rede (sem response)
    if (error) return true;

    // Erros típicos de gateway/rede
    if (response && [502, 503, 504, 520].includes(response.status)) {
      return true;
    }

    return false;
  },
});

export const createClient = () =>
  createBrowserClient(supabaseUrl!, supabaseKey!, {
    global: {
      // Igual à doc: passamos um fetch com retry para o Supabase client
      fetch: fetchWithRetry,
    },
  });
