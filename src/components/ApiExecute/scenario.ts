// What the run panel (ApiExecuteInner) needs from one API to run its calls on
// the sandbox. The panel itself is generic: the dialog that sets up what a
// call depends on, Run, the response and the copy-paste code. Everything the
// OpenAPI schema can't give (the requests, the live ids they chain, the test
// objects to clean up) is one scenario per API, in scenarios/<name>/, listed
// in scenarios/index.ts.
import type React from "react";
import type { ExecuteResult } from "./send";
import type { SnippetRequest } from "./snippets";

/** One call, as built, shown (snippets.ts) and sent. */
export type PreparedRequest = SnippetRequest;

/** A step's call, shown in the dialog like Stripe shows a request: body, then response. */
export interface StepRun {
  /** The body it sent (none for a GET). */
  body?: unknown;
  response: unknown;
}

/** One thing a step took from its response, in the reader's words. */
export interface Picked {
  /** What it is, e.g. "Gateway (pg_code)". */
  label: string;
  /** The value, or a link's text when `href` is set. */
  value: string;
  href?: string;
  /** Why it matters, e.g. "the customer pays the first charge here". */
  note?: string;
}

/** Something a call needs on the sandbox first (a gateway, a subscription). */
export interface Step<State> {
  /** Shown in the "Set up prerequisites" dialog. */
  title: string;
  method: PreparedRequest["method"];
  path: string;
  /** True when the state already holds what this step makes. */
  done(state: State): boolean;
  /** Makes it on the sandbox and stores it in the state. */
  run(): Promise<StepRun>;
  /**
   * What the state holds from this step, once done: shown under the step,
   * also when an earlier run made it.
   */
  picked(state: State): Picked[];
}

export interface Endpoint<State, StepKey extends string = string> {
  /** Keys of the scenario's steps this call needs, in the order they run. */
  needs: StepKey[];
  /** The request Run sends and the code shows, built from the state. */
  request(state: State): PreparedRequest;
  /**
   * Everything `request` reads, as one string (a date it puts in the body
   * included): the code is rebuilt only when it changes, so it stays put
   * while the reader reads it, and Run rebuilds the request when it changed
   * since. Keep it in step with `request`, or Run sends a stale request.
   */
  inputs(state: State): string;
  /** The request has ids that must not repeat (an order number): build a new one after each run. */
  newEachRun?: boolean;
}

/** One finished call, for the scenario to keep its state in step. */
export interface Run<State> {
  endpoint: string;
  request: PreparedRequest;
  result: ExecuteResult;
  /** The state when Run was pressed. */
  before: State;
  /** epoch() when Run was pressed: differs from epoch() if the reader started over meanwhile. */
  startedIn: number;
}

export interface Scenario<State, StepKey extends string = string> {
  steps: Record<StepKey, Step<State>>;
  endpoints: Record<string, Endpoint<State, StepKey>>;
  /** The state every panel of the scenario shares (useSyncExternalStore). */
  getState(): State;
  subscribe(listener: () => void): () => void;
  /**
   * Bumped when the reader starts over: a response to a call made before is
   * not shown. Starting over must also give `getState` a new object and tell
   * the subscribers (the panels re-render on that, not on the epoch). Without
   * it, the state never starts over.
   */
  epoch?(): number;
  /** Called when a run panel mounts; returns what to call when it unmounts. */
  hold?(): () => void;
  /**
   * After each call, including one made before the reader started over, to
   * update the state (or clean up what it created). An error here is logged,
   * never shown: the reader still sees the response they asked for.
   */
  afterRun?(run: Run<State>): void;
  /** Shown above the tabs by ApiExecuteGroup, e.g. the shared test object. */
  Bar?: React.ComponentType;
}

/** Any scenario: each keeps its own state type, the panel only hands it back. */
export type AnyScenario = Scenario<any>;
