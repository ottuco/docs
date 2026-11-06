import React from "react";

import ParamsDetails from "@theme-original/ParamsDetails";

// enrich-api-spec.ts strips the Authorization header from every operation so the
// API explorer does not ask for the key twice (it has its own auth panel). The
// Request section still has to show how a call authenticates, so the row is added
// back here, for display only. Every documented operation takes the private API
// key (_security.yaml applies it to all of them).
const AUTHORIZATION_HEADER = {
  in: "header",
  name: "Authorization",
  required: true,
  schema: { type: "string" },
  description:
    "Your private API key, sent as `Api-Key <your key>`. See [Authentication](/developers/getting-started/authentication).",
  example: "Api-Key <your key>",
};

interface Param {
  in?: string;
  name?: string;
}

interface Props {
  parameters?: Param[];
}

export default function ParamsDetailsWrapper({
  parameters,
}: Props): React.ReactElement {
  const others = (parameters ?? []).filter(
    (param) =>
      !(param?.in === "header" && param?.name?.toLowerCase() === "authorization"),
  );
  return <ParamsDetails parameters={[AUTHORIZATION_HEADER, ...others]} />;
}
