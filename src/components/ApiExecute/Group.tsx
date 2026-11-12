import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { scenarioOf, type ScenarioKey } from "./scenarios";

// Wraps the tabs of one API's endpoints: shows the scenario's bar (e.g. the
// shared test subscription) above them.
export default function ApiExecuteGroup({
  scenario,
  children,
}: {
  scenario: ScenarioKey;
  children: React.ReactNode;
}): React.JSX.Element {
  // Here, not in the browser only: an unknown scenario fails the build.
  const { Bar } = scenarioOf(scenario);
  return (
    <>
      {Bar && <BrowserOnly>{() => <Bar />}</BrowserOnly>}
      {children}
    </>
  );
}
