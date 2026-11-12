// Every API whose calls the docs can run on the sandbox. To add one, write
// scenarios/<name>/index.ts exporting a Scenario (see ../scenario.ts, and
// autopay/ for an example) and list it here; then
// <ApiReference api="<slug>" scenario="<name>" run="<endpoint>" /> runs it.
import type { AnyScenario } from "../scenario";
import autopay from "./autopay";

const SCENARIOS = { autopay } satisfies Record<string, AnyScenario>;

export type ScenarioKey = keyof typeof SCENARIOS;

const has = (object: object, key: string) =>
  Object.prototype.hasOwnProperty.call(object, key);

/** The scenario named in MDX; throws, naming the ones that exist, when it is unknown. */
export function scenarioOf(name: string): AnyScenario {
  const found: AnyScenario | undefined = has(SCENARIOS, name)
    ? SCENARIOS[name as ScenarioKey]
    : undefined;
  if (!found)
    throw new Error(
      `ApiExecute: no scenario "${name}". Known: ${Object.keys(SCENARIOS).join(", ")} (src/components/ApiExecute/scenarios/index.ts).`,
    );
  return found;
}

/**
 * The scenario and one of its endpoints; throws, naming the ones that exist,
 * when either is unknown or the endpoint needs a step the scenario lacks.
 */
export function runOf(scenarioName: string, endpointName: string) {
  const scenario = scenarioOf(scenarioName);
  const endpoint = has(scenario.endpoints, endpointName)
    ? scenario.endpoints[endpointName]
    : undefined;
  if (!endpoint)
    throw new Error(
      `ApiExecute: scenario "${scenarioName}" has no endpoint "${endpointName}". Known: ${Object.keys(scenario.endpoints).join(", ")}.`,
    );
  const unknown = endpoint.needs.filter((step) => !has(scenario.steps, step));
  if (unknown.length > 0)
    throw new Error(
      `ApiExecute: endpoint "${endpointName}" of scenario "${scenarioName}" needs unknown steps: ${unknown.join(", ")}. Known: ${Object.keys(scenario.steps).join(", ")}.`,
    );
  return { scenario, endpoint };
}
