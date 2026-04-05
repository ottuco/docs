import React from "react";
import Icon from "@mdi/react";
import { mdiAlertOutline } from "@mdi/js";

export default function AdmonitionIconWarning(): React.JSX.Element {
  return <Icon path={mdiAlertOutline} size="20px" />;
}
