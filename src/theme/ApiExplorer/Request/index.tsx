/**
 * Wraps the explorer's Request form with a "Prerequisites" step for endpoints
 * that act on an object that must exist first (see src/utils/tryItPrerequisites.ts).
 */
import OriginalRequest from "@theme-original/ApiExplorer/Request";
import React from "react";
import TryItPrerequisites from "@site/src/components/TryItPrerequisites";
import { TRY_IT_PREREQUISITES } from "@site/src/utils/tryItPrerequisites";

export default function Request(props: any): React.JSX.Element {
  const chain = props?.item?.operationId ? TRY_IT_PREREQUISITES[props.item.operationId] : undefined;
  return (
    <>
      {chain ? <TryItPrerequisites chain={chain} /> : null}
      <OriginalRequest {...props} />
    </>
  );
}
