import { DocsSidebarProvider } from "@docusaurus/plugin-content-docs/client";
import ApiItem from "docusaurus-theme-openapi-docs/lib/theme/ApiItem";
import React from "react";

interface ApiDocEmbedProps {
  path: string;
}

export default function ApiDocEmbed({
  path,
}: ApiDocEmbedProps): React.ReactElement {
  const mod = require(`@site/docs/developers/apis/${path}`);
  const Content = mod.default;
  Object.assign(Content, mod);

  // Remove previous/next to hide pagination, and title to prevent document title change
  Content.metadata = {
    ...Content.metadata,
    previous: undefined,
    next: undefined,
    title: undefined,
  };

  return (
    // Pass null to hide sidebar breadcrumbs in embedded API docs
    <DocsSidebarProvider name={null} items={null}>
      {/* @ts-expect-error ApiItem works without route in MDX context */}
      <ApiItem content={Content} />
    </DocsSidebarProvider>
  );
}