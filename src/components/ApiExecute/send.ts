import { ACTIVE_CONNECT } from "@site/src/utils/sandbox";

export interface ExecuteResult {
  status: number;
  ms: number;
  body: unknown;
}

/** Calls the sandbox with its public test key; a body that is not JSON comes back as text. */
export async function send(
  method: "GET" | "POST",
  path: string,
  options: { body?: unknown; headers?: Record<string, string>; keepalive?: boolean } = {},
): Promise<ExecuteResult> {
  const started = performance.now();
  const response = await fetch(`${ACTIVE_CONNECT.connectBaseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Api-Key ${ACTIVE_CONNECT.connectApiKey}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    keepalive: options.keepalive,
  });
  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Not JSON: show the raw text.
  }
  return { status: response.status, ms: Math.round(performance.now() - started), body };
}
