import { DocsSidebarProvider } from "@docusaurus/plugin-content-docs/client";
import Heading from "@theme/Heading";
import ApiItem from "docusaurus-theme-openapi-docs/lib/theme/ApiItem";
import React from "react";

interface ApiDocEmbedProps {
  path: string;
}

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[`"'’]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ApiDocEmbed({
  path,
}: ApiDocEmbedProps): React.ReactElement {
  const mod = require(`@site/docs/developers/apis/${path}`);
  const Content = mod.default;
  Object.assign(Content, mod);

  const title =
    mod.metadata?.title ??
    Content?.metadata?.title ??
    mod.frontMatter?.title;
  const headingId = title ? `api-${slugifyHeading(title)}` : undefined;

  // Remove previous/next to hide pagination, and title to prevent document title change
  Content.metadata = {
    ...Content.metadata,
    previous: undefined,
    next: undefined,
    title: undefined,
  };

  return (
    <>
      {title ? (
        <Heading as="h2" id={headingId}>
          {title}
        </Heading>
      ) : null}
      <div className="api-doc-embed">
        <style>{`.api-doc-embed .openapi__heading{display:none;}`}</style>
        {/* Pass null to hide sidebar breadcrumbs in embedded API docs */}
        <DocsSidebarProvider name={null} items={null}>
          {/* @ts-expect-error ApiItem works without route in MDX context */}
          <ApiItem content={Content} />
        </DocsSidebarProvider>
      </div>
    </>
  );
}