/**
 * Components every MDX page can use without importing them. Docusaurus merges
 * this map into the MDX scope; a page that imports a component itself still
 * gets its own import.
 *
 * StepShow / Step: steps on the left, the matching screenshot on the right
 * (src/components/StepShow).
 */
import MDXComponents from "@theme-original/MDXComponents";
import StepShow, { Step } from "@site/src/components/StepShow";

export default {
  ...MDXComponents,
  StepShow,
  Step,
};
