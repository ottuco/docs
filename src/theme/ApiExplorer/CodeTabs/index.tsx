/* ============================================================================
 * Swizzled from docusaurus-theme-openapi-docs to replace the horizontal
 * language tab carousel with a compact <select> dropdown.
 * ========================================================================== */

import React, { cloneElement, type ChangeEvent } from "react";
import { sanitizeTabsChildren, useTabs } from "@docusaurus/theme-common/internal";
import useIsBrowser from "@docusaurus/useIsBrowser";
import type { Language } from "docusaurus-theme-openapi-docs/lib/theme/ApiExplorer/CodeSnippets/code-snippets-types";

interface Props {
  action: {
    [key: string]: React.Dispatch<any>;
  };
  currentLanguage?: Language;
  languageSet: Language[];
  includeVariant?: boolean;
  includeSample?: boolean;
}

function LanguageDropdown({
  action,
  currentLanguage,
  languageSet,
  includeVariant,
  includeSample,
  selectedValue,
  selectValue,
  tabValues,
}: Props & {
  selectedValue: string;
  selectValue: (value: string) => void;
  tabValues: { value: string; label?: string }[];
}) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    if (newValue === selectedValue) return;

    selectValue(newValue);

    if (action) {
      let newLanguage: Language;
      if (currentLanguage && includeVariant) {
        newLanguage = languageSet.filter(
          (lang) => lang.language === currentLanguage.language
        )[0];
        newLanguage.variant = newValue;
        action.setSelectedVariant(newValue.toLowerCase());
      } else if (currentLanguage && includeSample) {
        newLanguage = languageSet.filter(
          (lang) => lang.language === currentLanguage.language
        )[0];
        newLanguage.sample = newValue;
        action.setSelectedSample(newValue);
      } else {
        newLanguage = languageSet.filter(
          (lang) => lang.language === newValue
        )[0];
        action.setSelectedVariant(newLanguage.variants[0].toLowerCase());
        action.setSelectedSample(newLanguage.sample);
      }
      action.setLanguage(newLanguage);
    }
  };

  return (
    <select
      className="openapi-tabs__code-dropdown"
      value={selectedValue}
      onChange={handleChange}
    >
      {tabValues.map(({ value, label }) => (
        <option key={value} value={value}>
          {(label ?? value).toUpperCase()}
        </option>
      ))}
    </select>
  );
}

function TabContent({
  lazy,
  children,
  selectedValue,
}: {
  lazy?: boolean;
  children: React.ReactNode;
  selectedValue: string;
}) {
  const childTabs = (Array.isArray(children) ? children : [children]).filter(
    Boolean
  ) as React.ReactElement<{ value: string }>[];

  if (lazy) {
    const selectedTabItem = childTabs.find(
      (tabItem) => tabItem.props.value === selectedValue
    );
    if (!selectedTabItem) return null;
    return cloneElement(selectedTabItem, { className: "margin-top--md" } as any);
  }

  return (
    <div className="margin-top--md openapi-tabs__code-content">
      {childTabs.map((tabItem, i) =>
        cloneElement(tabItem, {
          key: i,
          hidden: tabItem.props.value !== selectedValue,
        } as any)
      )}
    </div>
  );
}

function TabsComponent(props: any) {
  const tabs = useTabs(props);
  return (
    <div className="tabs-container openapi-tabs__code-container">
      <LanguageDropdown {...props} {...tabs} />
      <TabContent {...props} {...tabs} />
    </div>
  );
}

export default function CodeTabs(props: any): React.JSX.Element {
  const isBrowser = useIsBrowser();
  return (
    <TabsComponent key={String(isBrowser)} {...props}>
      {sanitizeTabsChildren(props.children)}
    </TabsComponent>
  );
}
