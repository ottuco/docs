import buildPostmanRequest from "docusaurus-theme-openapi-docs/lib/theme/ApiExplorer/buildPostmanRequest";

type AuthState = {
  selected?: string;
  options?: Record<string, Array<any>>;
  data?: Record<string, any>;
};

export default function buildPostmanRequestWithAuth(postman: any, opts: any) {
  const request = buildPostmanRequest(postman, opts as any);

  const auth: AuthState | undefined = opts?.auth;
  if (!auth || !auth.selected || !auth.options || !auth.data) {
    return request;
  }

  const selectedAuth = auth.options[auth.selected] || [];

  const debugAuthHeaders: Array<{ key: string; value: string }> = [];

  for (const a of selectedAuth) {
    if (a.type === "http" && a.scheme === "basic") {
      const username = auth.data[a.key]?.username;
      const password = auth.data[a.key]?.password;
      if (username && password) {
        const value = `Basic ${window.btoa(`${username}:${password}`)}`;
        request.upsertHeader({ key: "Authorization", value });
        debugAuthHeaders.push({ key: "Authorization", value });
      }
      continue;
    }

    if (a.type === "apiKey" && a.in === "header") {
      let apiKey = auth.data[a.key]?.apiKey;
      if (apiKey) {
        if (a.name === "Authorization" && !/^Api-Key\\s+/i.test(apiKey)) {
          apiKey = `Api-Key ${apiKey}`;
        }
        request.upsertHeader({ key: a.name, value: apiKey });
        debugAuthHeaders.push({ key: a.name, value: apiKey });
      }
    }
  }

  if (debugAuthHeaders.length > 0) {
    // Visible in browser devtools console for debugging auth issues.
    // eslint-disable-next-line no-console
    console.info("[ApiExplorer] Auth headers", debugAuthHeaders);
  }

  return request;
}
