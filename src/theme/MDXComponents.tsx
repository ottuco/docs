/**
 * Components every MDX page can use without importing them. Docusaurus merges
 * this map into the MDX scope; a page that imports a component itself still
 * gets its own import.
 *
 * StepShow / Step: steps on the left, the matching screenshot on the right
 * (src/components/StepShow).
 * UseCases / UseCase: a grid of use case cards (src/components/UseCases).
 * Expander: an expandable item (src/components/Expander).
 */
import MDXComponents from "@theme-original/MDXComponents";
import StepShow, { Step } from "@site/src/components/StepShow";
import UseCases, { UseCase } from "@site/src/components/UseCases";
import Expander from "@site/src/components/Expander";

export default {
  ...MDXComponents,
  StepShow,
  Step,
  UseCases,
  UseCase,
  Expander,
};
