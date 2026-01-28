import React, { type ReactNode, useMemo } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import useIsBrowser from "@docusaurus/useIsBrowser";
import ApiExplorer from "@theme/ApiExplorer";
import SkeletonLoader from "@theme/SkeletonLoader";
import { createAuth } from "@theme/ApiExplorer/Authorization/slice";
import { createPersistanceMiddleware } from "@theme/ApiExplorer/persistanceMiddleware";
import {
  createStoreWithState,
  createStoreWithoutState,
} from "@theme/ApiItem/store";
import { Provider } from "react-redux";

type InlineApiItemProps = {
  api: string | Record<string, unknown> | undefined;
  infoPath?: string;
  children: ReactNode;
};

function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof atob === "function") {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  const buffer = (globalThis as any).Buffer.from(base64, "base64");
  return new Uint8Array(buffer);
}

function decodeApi(api: string) {
  // Decode the gzipped OpenAPI payload stored in MDX frontmatter.
  const { ungzip } = require("pako");
  return JSON.parse(
    new TextDecoder().decode(ungzip(base64ToUint8Array(api)))
  ) as Record<string, unknown>;
}

export default function InlineApiItem({
  api,
  infoPath,
  children,
}: InlineApiItemProps) {
  const isBrowser = useIsBrowser();
  const apiObject = useMemo(() => {
    if (!api) return undefined;
    if (typeof api === "string") {
      try {
        return decodeApi(api);
      } catch {
        return undefined;
      }
    }
    return api;
  }, [api]);

  const store = useMemo(() => {
    if (!apiObject) return undefined;

    const persistanceMiddleware = createPersistanceMiddleware({
      // Use theme defaults (matches ApiItem behavior).
    });

    if (!isBrowser) {
      return createStoreWithoutState({}, [persistanceMiddleware]);
    }

    const statusRegex = new RegExp("(20[0-9]|2[1-9][0-9])");
    let acceptArray: string[] = [];
    for (const [code, content] of Object.entries(
      (apiObject as any)?.responses ?? []
    )) {
      if (statusRegex.test(code)) {
        acceptArray.push(Object.keys((content as any).content ?? {}));
      }
    }
    acceptArray = acceptArray.flat();

    const content = (apiObject as any)?.requestBody?.content ?? {};
    const contentTypeArray = Object.keys(content);
    const servers = (apiObject as any)?.servers ?? [];
    const params = { path: [], query: [], header: [], cookie: [] } as Record<
      string,
      unknown[]
    >;
    (apiObject as any)?.parameters?.forEach((param: any) => {
      const paramType = param.in;
      const paramsArray = params[paramType] as unknown[];
      paramsArray.push(param);
    });

    const auth = createAuth({
      security: (apiObject as any)?.security,
      securitySchemes: (apiObject as any)?.securitySchemes,
      options: undefined,
    });

    const server = window?.sessionStorage.getItem("server");
    const serverObject = JSON.parse(server ?? "null") ?? {};

    return createStoreWithState(
      {
        accept: { value: acceptArray[0], options: acceptArray },
        contentType: { value: contentTypeArray[0], options: contentTypeArray },
        server: {
          value: serverObject.url ? serverObject : undefined,
          options: servers,
        },
        response: { value: undefined },
        body: { type: "empty" },
        params,
        auth,
      },
      [persistanceMiddleware]
    );
  }, [apiObject, isBrowser]);

  if (!apiObject || !store) {
    return <>{children}</>;
  }

  return (
    <Provider store={store}>
      <div className="row theme-api-markdown">
        <div className="col col--7 openapi-left-panel__container">
          {children}
        </div>
        <div className="col col--5 openapi-right-panel__container">
          <BrowserOnly fallback={<SkeletonLoader size="lg" />}>
            {() => <ApiExplorer item={apiObject} infoPath={infoPath} />}
          </BrowserOnly>
        </div>
      </div>
    </Provider>
  );
}
