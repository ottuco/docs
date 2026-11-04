// Public entry for React Flow diagrams in the docs.
//
//   import {StoryDiagram, SequenceDiagram, FlowDiagram} from "@site/src/components/FlowDiagram";
//
// React Flow measures the DOM, so the diagram itself only renders in the
// browser. The server build renders a box of the same height (no layout jump)
// plus a visually hidden text version of the diagram, so search, the MCP
// server and screen readers still get the content.
import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { flowHeight, sequenceHeight, storyFigureHeight } from "./layout";
import type { FlowProps, SequenceProps, StoryProps } from "./types";
import styles from "./styles.module.css";

export type * from "./types";

function Shell({
  title,
  height,
  text,
  render,
}: {
  title: string;
  height: number;
  text: React.ReactNode;
  render: () => React.ReactNode;
}): React.JSX.Element {
  return (
    <figure className={styles.figure}>
      {/* The full text version (steps, details, actors, journeys). Kept on
          purpose after the live diagram loads: it is the one place a screen
          reader gets everything at once, it names the figure, and search and
          the MCP server read it from the server HTML. */}
      <figcaption className={styles.srOnly}>
        {title}
        {text}
      </figcaption>
      <BrowserOnly
        fallback={<div className={styles.placeholder} style={{ height }} />}
      >
        {render}
      </BrowserOnly>
    </figure>
  );
}

// A step with a lane past the last column is put in the nearest real lane
// (with a warning while developing); links and journey stops that point at a
// missing step are dropped. Done once, so layout, text and diagram agree.
function cleanStory(input: StoryProps): StoryProps {
  const last = Math.max(0, input.lanes.length - 1);
  const steps = input.steps.map((s) => {
    if (Number.isInteger(s.lane) && s.lane >= 0 && s.lane <= last) return s;
    if (process.env.NODE_ENV !== "production")
      console.warn(
        `StoryDiagram "${input.title}": step "${s.title}" has lane ${s.lane}, there are ${input.lanes.length} lanes`,
      );
    return { ...s, lane: Math.min(last, Math.max(0, Math.trunc(s.lane) || 0)) };
  });
  const isStep = (n: number) =>
    Number.isInteger(n) && n >= 1 && n <= steps.length;
  return {
    ...input,
    steps,
    links: input.links.filter(([a, b]) => isStep(a) && isStep(b) && a !== b),
    journeys: (input.journeys ?? [])
      .map((j) => ({ ...j, stops: j.stops.filter((x) => isStep(x.step)) }))
      .filter((j) => j.stops.length > 0),
  };
}

export function StoryDiagram(input: StoryProps): React.JSX.Element {
  const props = cleanStory(input);
  const journeys = props.journeys ?? [];
  return (
    <Shell
      title={props.title}
      height={storyFigureHeight(props)}
      text={
        <>
          <ol>
            {props.steps.map((s, i) => (
              <li key={i}>
                {props.lanes[s.lane]?.title}: {s.title}
                {s.sub ? ` (${s.sub})` : ""}
                {s.detail ? `. ${s.detail}` : ""}
              </li>
            ))}
          </ol>
          <ul>
            {props.lanes.map((l, i) =>
              l.about ? (
                <li key={i}>
                  {l.title}: {l.about.does} Relies on: {l.about.relies}
                </li>
              ) : null,
            )}
          </ul>
          {journeys.map((j, i) => (
            <React.Fragment key={i}>
              {j.name}
              <ol>
                {j.stops.map((x, k) => (
                  <li key={k}>{x.text}</li>
                ))}
              </ol>
            </React.Fragment>
          ))}
        </>
      }
      render={() => {
        const Story = require("./Story").default;
        return <Story {...props} />;
      }}
    />
  );
}

// Bad references (a typo in an index or id) are dropped once here, so the
// layout, the screen-reader text and the diagram all agree, and React Flow
// never gets an edge to nowhere. Story does the same for its links.
const isActor = (p: SequenceProps, i: number) =>
  Number.isInteger(i) && i >= 0 && i < p.actors.length;

export function SequenceDiagram(input: SequenceProps): React.JSX.Element {
  const props: SequenceProps = {
    ...input,
    messages: input.messages.filter(
      ([from, to]) => isActor(input, from) && isActor(input, to),
    ),
  };
  return (
    <Shell
      title={props.title}
      height={sequenceHeight(props)}
      text={
        <ol>
          {props.messages.map(([from, to, label, kind], i) => (
            <li key={i}>
              {props.actors[from].title} to {props.actors[to].title}: {label}
              {kind === "reply" ? " (reply)" : ""}
            </li>
          ))}
        </ol>
      }
      render={() => {
        const Sequence = require("./Sequence").default;
        return <Sequence {...props} />;
      }}
    />
  );
}

export function FlowDiagram(input: FlowProps): React.JSX.Element {
  const name = new Map(input.cards.map((c) => [c.id, c.title]));
  const props: FlowProps = {
    ...input,
    arrows: input.arrows.filter((a) => name.has(a.from) && name.has(a.to)),
  };
  return (
    <Shell
      title={props.title}
      height={flowHeight(props)}
      text={
        <ul>
          {props.arrows.map((a, i) => (
            <li key={i}>
              {name.get(a.from)} to {name.get(a.to)}
              {a.label ? `: ${a.label}` : ""}
              {a.kind === "reply" ? " (reply)" : ""}
            </li>
          ))}
        </ul>
      }
      render={() => {
        const Flow = require("./Flow").default;
        return <Flow {...props} />;
      }}
    />
  );
}
