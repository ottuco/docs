import React from "react";
import { McpInstallButton } from "docusaurus-plugin-mcp-server/theme";
import BrowserOnly from "@docusaurus/BrowserOnly";

export default function McpButton(): React.JSX.Element {
  return (
    <BrowserOnly>
      {() => (
        <McpInstallButton
          serverUrl={`${window.location.origin}/mcp`}
          serverName="ottu-docs"
          label="MCP"
        />
      )}
    </BrowserOnly>
  );
}
