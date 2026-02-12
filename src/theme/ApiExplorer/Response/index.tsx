import React from "react";
import OriginalResponse from "@theme-original/ApiExplorer/Response";

const DEFAULT_HARD_CODED_RESPONSE = "HERE_REPLACE_YOUR_HARD_CODED_RESPONSE";

// Optional fallback map (kept only as fallback if no YAML extension is found).
// Prefer using x-hard-coded-response in static/Ottu_API.yaml.
const HARD_CODED_RESPONSES: Record<string, string | object> = {};

function readYamlExtension(item: any): string | object | undefined {
  // OpenAPI vendor extension, preferred:
  // x-hard-coded-response: {...} OR "..."
  if (item && item["x-hard-coded-response"] !== undefined) {
    return item["x-hard-coded-response"];
  }
  // Compatibility fallback, if naming varies in different parser versions.
  if (item && item.hardCodedResponse !== undefined) {
    return item.hardCodedResponse;
  }
  return undefined;
}

function resolveResponseText(item: any): string {
  const fromYaml = readYamlExtension(item);
  const operationId = item?.operationId;
  const method = String(item?.method ?? "").toUpperCase();
  const path = item?.path;
  const methodPathKey = method && path ? `${method} ${path}` : undefined;

  const value =
    fromYaml ??
    (operationId ? HARD_CODED_RESPONSES[operationId] : undefined) ??
    (methodPathKey ? HARD_CODED_RESPONSES[methodPathKey] : undefined) ??
    DEFAULT_HARD_CODED_RESPONSE;

  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value, null, 2);
}

export default function Response(props: any): React.ReactElement {
  const text = resolveResponseText(props?.item);

  return (
    <>
      <OriginalResponse {...props} />
      <div className="openapi-explorer__response-container">
        <div className="openapi-explorer__response-title-container">
          <span className="openapi-explorer__response-title">
            Hard Coded Response
          </span>
        </div>
        <div
          style={{
            paddingLeft: "1rem",
            paddingTop: "1rem",
            paddingBottom: "1rem",
          }}
        >
          <pre className="openapi-explorer__code-block openapi-response__status-code">
            {text}
          </pre>
        </div>
      </div>
    </>
  );
}
