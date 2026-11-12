// "N min read" under a doc's title. src/remark/readingTime.ts adds it to
// every doc with the minutes counted at build time; not written by hand.
import React from "react";
import styles from "./styles.module.css";

export default function ReadingTime({
  minutes,
}: {
  minutes: number;
}): React.JSX.Element {
  return <p className={styles.readingTime}>{minutes} min read</p>;
}
