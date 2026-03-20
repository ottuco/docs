import React, { useMemo, useRef } from "react";

import { mdiLinkVariant } from "@mdi/js";
import Icon from "@mdi/react";
import SchemaItem from "@site/src/theme/SchemaItem";
import Details from "@theme/Details";
import TabItem from "@theme/TabItem";
import {
  ClosingArrayBracket,
  OpeningArrayBracket,
} from "docusaurus-theme-openapi-docs/lib/theme/ArrayBrackets";
import DiscriminatorTabs from "docusaurus-theme-openapi-docs/lib/theme/DiscriminatorTabs";
import Markdown from "docusaurus-theme-openapi-docs/lib/theme/Markdown";
import SchemaTabs from "docusaurus-theme-openapi-docs/lib/theme/SchemaTabs";
// eslint-disable-next-line import/no-extraneous-dependencies
import useLayoutEffect from "@docusaurus/useIsomorphicLayoutEffect";
import { copyAnchorUrl, getFragmentId } from "@site/src/utils";
import { merge } from "allof-merge";
import clsx from "clsx";
import {
  getQualifierMessage as _getQualifierMessage,
  getSchemaName,
} from "docusaurus-plugin-openapi-docs/lib/markdown/schema";
import {
  SchemaObject,
  SchemaType,
} from "docusaurus-plugin-openapi-docs/lib/openapi/types";
import isEmpty from "lodash/isEmpty";

// Wrapper: strip "Possible values:" when no actual values follow (upstream bug)
function getQualifierMessage(schema: any): string | undefined {
  const msg = _getQualifierMessage(schema);
  if (!msg) return undefined;
  const stripped = msg.replace(/\*\*Possible values:\*\*\s*/i, "").trim();
  if (!stripped) return undefined;
  return msg;
}

// eslint-disable-next-line import/no-extraneous-dependencies
// const jsonSchemaMergeAllOf = require("json-schema-merge-allof");

const mergeAllOf = (allOf: any) => {
  const onMergeError = (msg: string) => {
    console.warn(msg);
  };

  const mergedSchemas = merge(allOf, { onMergeError });

  return mergedSchemas;
};

interface MarkdownProps {
  text: string | undefined;
}

// Renders string as markdown, useful for descriptions and qualifiers
const MarkdownWrapper: React.FC<MarkdownProps> = ({ text }) => {
  return (
    <div style={{ marginTop: ".5rem", marginBottom: ".5rem" }}>
      <Markdown>{text}</Markdown>
    </div>
  );
};

interface SummaryProps {
  parentSchemaName?: string;
  schemaType: string;
  name: string;
  schemaName: string | undefined;
  schema: {
    deprecated?: boolean;
    nullable?: boolean;
  };
  required?: boolean | string[];
}

const Summary: React.FC<SummaryProps> = ({
  parentSchemaName,
  schemaType,
  name,
  schemaName,
  schema,
  required,
}) => {
  const { deprecated, nullable } = schema;

  const isRequired = Array.isArray(required)
    ? required.includes(name)
    : required === true;

  const anchorRef = useRef<HTMLAnchorElement>(null);

  const id = useMemo(
    () => getFragmentId(schemaType, parentSchemaName, name),
    [schemaType, parentSchemaName, name],
  );

  useLayoutEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash === `#${id}`) {
      anchorRef.current?.scrollIntoView({ block: "start" });
    }
  }, [id]);

  return (
    <summary>
      <span id={id} className="openapi-schema__container">
        <a
          ref={anchorRef}
          href={`#${id}`}
          onClick={(e) => {
            e.stopPropagation();
            copyAnchorUrl(id);
          }}
        >
          <Icon
            path={mdiLinkVariant}
            size={0.75}
            style={{ display: "inline-block", verticalAlign: "middle" }}
          />
        </a>
        &nbsp;
        <strong
          className={clsx("openapi-schema__property", {
            "openapi-schema__strikethrough": deprecated,
          })}
        >
          {name}
        </strong>
        <span className="openapi-schema__name"> {schemaName}</span>
        {(isRequired || deprecated || nullable) && (
          <span className="openapi-schema__divider" />
        )}
        {nullable && <span className="openapi-schema__nullable">nullable</span>}
        {isRequired && (
          <span className="openapi-schema__required">required</span>
        )}
        {deprecated && (
          <span className="openapi-schema__deprecated">deprecated</span>
        )}
      </span>
    </summary>
  );
};

// Common props interface
interface SchemaProps {
  parentSchemaName?: string;
  schema: SchemaObject;
  schemaType: "request" | "response";
}

const AnyOneOf: React.FC<SchemaProps> = ({
  parentSchemaName,
  schema,
  schemaType,
}) => {
  const type = schema.oneOf ? "oneOf" : "anyOf";

  // Find which tab should be selected based on the URL hash
  const hash =
    typeof window !== "undefined" ? window.location.hash?.slice(1) : "";
  const defaultIndex = schema[type]?.findIndex((anyOneSchema: any) => {
    const label = anyOneSchema.title || anyOneSchema.type;
    const prefix = getFragmentId(schemaType, parentSchemaName, label);
    return hash === prefix || hash.startsWith(prefix + "-");
  });
  const defaultValue =
    defaultIndex >= 0 ? `${defaultIndex}-item-properties` : undefined;

  return (
    <>
      <span className="badge badge--info" style={{ marginBottom: "1rem" }}>
        {type}
      </span>
      {/* @ts-expect-error upstream SchemaTabsProps type chain is broken */}
      <SchemaTabs defaultValue={defaultValue}>
        {schema[type]?.map((anyOneSchema: any, index: number) => {
          const label = anyOneSchema.title || anyOneSchema.type;
          return (
            // @ts-ignore
            <TabItem
              key={index}
              label={label}
              value={`${index}-item-properties`}
            >
              {/* Handle primitive types directly */}
              {(isPrimitive(anyOneSchema) || anyOneSchema.const) && (
                <SchemaItem
                  parentSchemaName={parentSchemaName}
                  schemaType={schemaType}
                  collapsible={false}
                  name={undefined}
                  schemaName={anyOneSchema.type}
                  qualifierMessage={getQualifierMessage(anyOneSchema)}
                  schema={anyOneSchema}
                  discriminator={false}
                  children={null}
                />
              )}

              {/* Handle empty object as a primitive type */}
              {anyOneSchema.type === "object" &&
                !anyOneSchema.properties &&
                !anyOneSchema.allOf &&
                !anyOneSchema.oneOf &&
                !anyOneSchema.anyOf && (
                  <SchemaItem
                    parentSchemaName={parentSchemaName}
                    schemaType={schemaType}
                    collapsible={false}
                    name={undefined}
                    schemaName={anyOneSchema.type}
                    qualifierMessage={getQualifierMessage(anyOneSchema)}
                    schema={anyOneSchema}
                    discriminator={false}
                    children={null}
                  />
                )}

              {/* Handle actual object types with properties or nested schemas */}
              {anyOneSchema.type === "object" && anyOneSchema.properties && (
                <Properties
                  parentSchemaName={getFragmentId(parentSchemaName, label)}
                  schema={anyOneSchema}
                  schemaType={schemaType}
                />
              )}
              {anyOneSchema.allOf && (
                <SchemaNode
                  parentSchemaName={getFragmentId(parentSchemaName, label)}
                  schema={anyOneSchema}
                  schemaType={schemaType}
                />
              )}
              {anyOneSchema.oneOf && (
                <SchemaNode
                  parentSchemaName={getFragmentId(parentSchemaName, label)}
                  schema={anyOneSchema}
                  schemaType={schemaType}
                />
              )}
              {anyOneSchema.anyOf && (
                <SchemaNode
                  parentSchemaName={getFragmentId(parentSchemaName, label)}
                  schema={anyOneSchema}
                  schemaType={schemaType}
                />
              )}
              {anyOneSchema.items && (
                <Items
                  parentSchemaName={getFragmentId(parentSchemaName, label)}
                  schema={anyOneSchema}
                  schemaType={schemaType}
                />
              )}
            </TabItem>
          );
        })}
      </SchemaTabs>
    </>
  );
};

const Properties: React.FC<SchemaProps> = ({
  parentSchemaName,
  schema,
  schemaType,
}) => {
  const discriminator = schema.discriminator;
  if (discriminator && !discriminator.mapping) {
    const anyOneOf = schema.oneOf ?? schema.anyOf ?? {};
    const inferredMapping = {} as any;
    Object.entries(anyOneOf).map(([_, anyOneSchema]: [string, any]) => {
      // ensure discriminated property only renders once
      if (
        schema.properties![discriminator.propertyName] &&
        anyOneSchema.properties[discriminator.propertyName]
      )
        delete anyOneSchema.properties[discriminator.propertyName];
      return (inferredMapping[anyOneSchema.title] = anyOneSchema);
    });
    discriminator["mapping"] = inferredMapping;
  }
  if (Object.keys(schema.properties as {}).length === 0) {
    return (
      <SchemaItem
        parentSchemaName={parentSchemaName}
        schemaType={schemaType}
        collapsible={false}
        name=""
        required={false}
        schemaName="object"
        qualifierMessage={undefined}
        schema={{}}
      />
    );
  }

  return (
    <>
      {Object.entries(schema.properties as {}).map(
        ([key, val]: [string, any]) => (
          <SchemaEdge
            parentSchemaName={parentSchemaName}
            key={key}
            name={key}
            schema={val}
            required={
              Array.isArray(schema.required)
                ? schema.required.includes(key)
                : false
            }
            discriminator={discriminator}
            schemaType={schemaType}
          />
        ),
      )}
    </>
  );
};

const PropertyDiscriminator: React.FC<SchemaEdgeProps> = ({
  parentSchemaName,
  name,
  schemaName,
  schema,
  schemaType,
  discriminator,
  required,
}) => {
  if (!schema) {
    return null;
  }

  return (
    <>
      <div className="openapi-discriminator__item openapi-schema__list-item">
        <div>
          <span className="openapi-schema__container">
            <strong className="openapi-discriminator__name openapi-schema__property">
              {name}
            </strong>
            {schemaName && (
              <span className="openapi-schema__name"> {schemaName}</span>
            )}
            {required && <span className="openapi-schema__divider"></span>}
            {required && (
              <span className="openapi-schema__required">required</span>
            )}
          </span>
          <div style={{ marginLeft: "1rem" }}>
            {schema.description && (
              <MarkdownWrapper text={schema.description} />
            )}
            {getQualifierMessage(discriminator) && (
              <MarkdownWrapper text={getQualifierMessage(discriminator)} />
            )}
          </div>
          <DiscriminatorTabs className="openapi-tabs__discriminator">
            {Object.keys(discriminator.mapping).map((key, index) => (
              // @ts-ignore
              <TabItem
                key={index}
                label={key}
                value={`${index}-item-discriminator`}
              >
                <SchemaNode
                  parentSchemaName={parentSchemaName}
                  schema={discriminator.mapping[key]}
                  schemaType={schemaType}
                />
              </TabItem>
            ))}
          </DiscriminatorTabs>
        </div>
      </div>
      {schema.properties &&
        Object.entries(schema.properties as {}).map(
          ([key, val]: [string, any]) =>
            key !== discriminator.propertyName && (
              <SchemaEdge
                parentSchemaName={parentSchemaName}
                key={key}
                name={key}
                schema={val}
                required={
                  Array.isArray(schema.required)
                    ? schema.required.includes(key)
                    : false
                }
                discriminator={false}
                schemaType={schemaType}
              />
            ),
        )}
    </>
  );
};

interface DiscriminatorNodeProps {
  parentSchemaName?: string;
  discriminator: any;
  schema: SchemaObject;
  schemaType: "request" | "response";
}

const DiscriminatorNode: React.FC<DiscriminatorNodeProps> = ({
  parentSchemaName,
  discriminator,
  schema,
  schemaType,
}) => {
  let discriminatedSchemas: any = {};
  let inferredMapping: any = {};

  // default to empty object if no parent-level properties exist
  const discriminatorProperty = schema.properties
    ? schema.properties![discriminator.propertyName]
    : {};

  if (schema.allOf) {
    const mergedSchemas = mergeAllOf(schema) as SchemaObject;
    if (mergedSchemas.oneOf || mergedSchemas.anyOf) {
      discriminatedSchemas = mergedSchemas.oneOf || mergedSchemas.anyOf;
    }
  } else if (schema.oneOf || schema.anyOf) {
    discriminatedSchemas = schema.oneOf || schema.anyOf;
  }

  // Handle case where no mapping is defined
  if (!discriminator.mapping) {
    Object.entries(discriminatedSchemas).forEach(
      ([_, subschema]: [string, any], index) => {
        inferredMapping[subschema.title ?? `PROP${index}`] = subschema;
      },
    );
    discriminator.mapping = inferredMapping;
  }

  // Merge sub schema discriminator property with parent
  Object.keys(discriminator.mapping).forEach((key) => {
    const subSchema = discriminator.mapping[key];

    // Handle discriminated schema with allOf
    let mergedSubSchema = {} as SchemaObject;
    if (subSchema.allOf) {
      mergedSubSchema = mergeAllOf(subSchema) as SchemaObject;
    }

    const subProperties = subSchema.properties || mergedSubSchema.properties;
    // Add a safeguard check to avoid referencing subProperties if it's undefined
    if (subProperties && subProperties[discriminator.propertyName]) {
      if (schema.properties) {
        schema.properties![discriminator.propertyName] = {
          ...schema.properties![discriminator.propertyName],
          ...subProperties[discriminator.propertyName],
        };
        if (subSchema.required && !schema.required) {
          schema.required = subSchema.required;
        }
        // Avoid duplicating property
        delete subProperties[discriminator.propertyName];
      } else {
        schema.properties = {};
        schema.properties[discriminator.propertyName] =
          subProperties[discriminator.propertyName];
        // Avoid duplicating property
        delete subProperties[discriminator.propertyName];
      }
    }
  });

  const name = discriminator.propertyName;
  const schemaName = getSchemaName(discriminatorProperty);
  // Default case for discriminator without oneOf/anyOf/allOf
  return (
    <PropertyDiscriminator
      parentSchemaName={parentSchemaName}
      name={name}
      schemaName={schemaName}
      schema={schema}
      schemaType={schemaType}
      discriminator={discriminator}
      required={
        Array.isArray(schema.required)
          ? schema.required.includes(name)
          : schema.required
      }
    />
  );
};

const AdditionalProperties: React.FC<SchemaProps> = ({
  parentSchemaName,
  schema,
  schemaType,
}) => {
  const additionalProperties = schema.additionalProperties;

  if (!additionalProperties) return null;

  // Handle free-form objects
  if (additionalProperties === true || isEmpty(additionalProperties)) {
    return (
      <SchemaItem
        parentSchemaName={parentSchemaName}
        schemaType={schemaType}
        name="property name*"
        required={false}
        schemaName="any"
        qualifierMessage={getQualifierMessage(schema)}
        schema={schema}
        collapsible={false}
        discriminator={false}
      />
    );
  }

  // Handle objects, arrays, complex schemas
  if (
    additionalProperties.properties ||
    additionalProperties.items ||
    additionalProperties.allOf ||
    additionalProperties.additionalProperties ||
    additionalProperties.oneOf ||
    additionalProperties.anyOf
  ) {
    const title =
      additionalProperties.title || getSchemaName(additionalProperties);
    const required = schema.required || false;
    return (
      <SchemaNodeDetails
        parentSchemaName={parentSchemaName}
        name="property name*"
        schemaName={title}
        required={required}
        nullable={schema.nullable}
        schema={additionalProperties}
        schemaType={schemaType}
      />
    );
  }

  // Handle primitive types
  if (
    additionalProperties.type === "string" ||
    additionalProperties.type === "boolean" ||
    additionalProperties.type === "integer" ||
    additionalProperties.type === "number" ||
    additionalProperties.type === "object"
  ) {
    const schemaName = getSchemaName(additionalProperties);
    return (
      <SchemaItem
        parentSchemaName={parentSchemaName}
        schemaType={schemaType}
        name="property name*"
        required={false}
        schemaName={schemaName}
        qualifierMessage={getQualifierMessage(schema)}
        schema={additionalProperties}
        collapsible={false}
        discriminator={false}
        children={null}
      />
    );
  }

  // Unknown type
  return null;
};

const SchemaNodeDetails: React.FC<SchemaEdgeProps> = ({
  parentSchemaName,
  name,
  schemaName,
  schema,
  required,
  schemaType,
}) => {
  const prefix = getFragmentId(schemaType, parentSchemaName, name);
  const hash =
    typeof window !== "undefined" ? window.location.hash?.slice(1) : "";
  const isOpen = hash === prefix || hash.startsWith(prefix + "-");

  return (
    <SchemaItem collapsible={true}>
      <Details
        open={isOpen}
        className="openapi-markdown__details"
        summary={
          <Summary
            parentSchemaName={parentSchemaName}
            schemaType={schemaType}
            name={name}
            schemaName={schemaName}
            schema={schema}
            required={required}
          />
        }
      >
        <div style={{ marginLeft: "1rem" }}>
          {schema.description && <MarkdownWrapper text={schema.description} />}
          {getQualifierMessage(schema) && (
            <MarkdownWrapper text={getQualifierMessage(schema)} />
          )}
          <SchemaNode
            parentSchemaName={getFragmentId(parentSchemaName, name)}
            schema={schema}
            schemaType={schemaType}
          />
        </div>
      </Details>
    </SchemaItem>
  );
};

const Items: React.FC<{
  parentSchemaName?: string;
  schema: any;
  schemaType: "request" | "response";
}> = ({ parentSchemaName, schema, schemaType }) => {
  // Process schema.items to handle allOf merging
  let itemsSchema = schema.items;
  if (schema.items?.allOf) {
    itemsSchema = mergeAllOf(schema.items) as SchemaObject;
  }

  // Handle complex schemas with multiple schema types
  const hasOneOfAnyOf = itemsSchema?.oneOf || itemsSchema?.anyOf;
  const hasProperties = itemsSchema?.properties;
  const hasAdditionalProperties = itemsSchema?.additionalProperties;

  if (hasOneOfAnyOf || hasProperties || hasAdditionalProperties) {
    return (
      <>
        <OpeningArrayBracket />
        {hasOneOfAnyOf && (
          <AnyOneOf
            parentSchemaName={parentSchemaName}
            schema={itemsSchema}
            schemaType={schemaType}
          />
        )}
        {hasProperties && (
          <Properties
            parentSchemaName={parentSchemaName}
            schema={itemsSchema}
            schemaType={schemaType}
          />
        )}
        {hasAdditionalProperties && (
          <AdditionalProperties
            parentSchemaName={parentSchemaName}
            schema={itemsSchema}
            schemaType={schemaType}
          />
        )}
        <ClosingArrayBracket />
      </>
    );
  }

  // Handles basic types (string, number, integer, boolean, object)
  if (
    itemsSchema?.type === "string" ||
    itemsSchema?.type === "number" ||
    itemsSchema?.type === "integer" ||
    itemsSchema?.type === "boolean" ||
    itemsSchema?.type === "object"
  ) {
    return (
      <div style={{ marginLeft: ".5rem" }}>
        <OpeningArrayBracket />
        <SchemaItem
          parentSchemaName={parentSchemaName}
          schemaType={schemaType}
          collapsible={false}
          name="" // No name for array items
          schemaName={getSchemaName(itemsSchema)}
          qualifierMessage={getQualifierMessage(itemsSchema)}
          schema={itemsSchema}
          discriminator={false}
          children={null}
        />
        <ClosingArrayBracket />
      </div>
    );
  }

  // Handles fallback case (use createEdges logic)
  return (
    <>
      <OpeningArrayBracket />
      {Object.entries(itemsSchema || {}).map(([key, val]: [string, any]) => (
        <SchemaEdge
          parentSchemaName={parentSchemaName}
          key={key}
          name={key}
          schema={val}
          schemaType={schemaType}
          required={
            Array.isArray(schema.required)
              ? schema.required.includes(key)
              : false
          }
        />
      ))}
      <ClosingArrayBracket />
    </>
  );
};

interface SchemaEdgeProps {
  parentSchemaName?: string;
  name: string;
  schemaName?: string;
  schema: SchemaObject;
  required?: boolean | string[];
  nullable?: boolean | undefined;
  discriminator?: any;
  schemaType: "request" | "response";
}

const SchemaEdge: React.FC<SchemaEdgeProps> = ({
  parentSchemaName,
  name,
  schema,
  required,
  discriminator,
  schemaType,
}) => {
  if (
    (schemaType === "request" && schema.readOnly) ||
    (schemaType === "response" && schema.writeOnly)
  ) {
    return null;
  }

  const schemaName = getSchemaName(schema);

  if (discriminator && discriminator.propertyName === name) {
    return (
      <PropertyDiscriminator
        parentSchemaName={parentSchemaName}
        name={name}
        schemaName={schemaName}
        schema={schema}
        schemaType={schemaType}
        discriminator={discriminator}
        required={required}
      />
    );
  }

  if (schema.oneOf || schema.anyOf) {
    // return <AnyOneOf schema={schema} schemaType={schemaType} />;
    return (
      <SchemaNodeDetails
        parentSchemaName={parentSchemaName}
        name={name}
        schemaName={schemaName}
        schemaType={schemaType}
        required={required}
        schema={schema}
        nullable={schema.nullable}
      />
    );
  }

  if (schema.properties) {
    return (
      <SchemaNodeDetails
        parentSchemaName={parentSchemaName}
        name={name}
        schemaName={schemaName}
        schemaType={schemaType}
        required={required}
        schema={schema}
        nullable={schema.nullable}
      />
    );
  }

  if (schema.additionalProperties) {
    return (
      <SchemaNodeDetails
        parentSchemaName={parentSchemaName}
        name={name}
        schemaName={schemaName}
        schemaType={schemaType}
        required={required}
        schema={schema}
        nullable={schema.nullable}
      />
    );
  }

  if (schema.items?.properties) {
    return (
      <SchemaNodeDetails
        parentSchemaName={parentSchemaName}
        name={name}
        schemaName={schemaName}
        required={required}
        nullable={schema.nullable}
        schema={schema}
        schemaType={schemaType}
      />
    );
  }

  if (schema.items?.anyOf || schema.items?.oneOf) {
    return (
      <SchemaNodeDetails
        parentSchemaName={parentSchemaName}
        name={name}
        schemaName={schemaName}
        required={required}
        nullable={schema.nullable}
        schema={schema}
        schemaType={schemaType}
      />
    );
  }

  if (schema.allOf) {
    // handle circular properties
    if (
      schema.allOf &&
      schema.allOf.length &&
      schema.allOf.length === 1 &&
      typeof schema.allOf[0] === "string"
    ) {
      return (
        <SchemaItem
          parentSchemaName={parentSchemaName}
          schemaType={schemaType}
          collapsible={false}
          name={name}
          required={
            Array.isArray(required) ? required.includes(name) : required
          }
          schemaName={schema.allOf[0]}
          qualifierMessage={undefined}
          schema={schema.allOf[0]}
          discriminator={false}
          children={null}
        />
      );
    }
    const mergedSchemas = mergeAllOf(schema) as SchemaObject;

    if (
      (schemaType === "request" && mergedSchemas.readOnly) ||
      (schemaType === "response" && mergedSchemas.writeOnly)
    ) {
      return null;
    }

    const mergedSchemaName = getSchemaName(mergedSchemas);

    if (mergedSchemas.oneOf || mergedSchemas.anyOf) {
      return (
        <SchemaNodeDetails
          parentSchemaName={parentSchemaName}
          name={name}
          schemaName={mergedSchemaName}
          required={
            Array.isArray(mergedSchemas.required)
              ? mergedSchemas.required.includes(name)
              : mergedSchemas.required
          }
          nullable={mergedSchemas.nullable}
          schema={mergedSchemas}
          schemaType={schemaType}
        />
      );
    }

    if (mergedSchemas.properties !== undefined) {
      return (
        <SchemaNodeDetails
          parentSchemaName={parentSchemaName}
          name={name}
          schemaName={mergedSchemaName}
          required={
            Array.isArray(mergedSchemas.required)
              ? mergedSchemas.required.includes(name)
              : mergedSchemas.required
          }
          nullable={mergedSchemas.nullable}
          schema={mergedSchemas}
          schemaType={schemaType}
        />
      );
    }

    if (mergedSchemas.items?.properties) {
      return (
        <SchemaNodeDetails
          parentSchemaName={parentSchemaName}
          name={name}
          schemaName={mergedSchemaName}
          required={
            Array.isArray(mergedSchemas.required)
              ? mergedSchemas.required.includes(name)
              : mergedSchemas.required
          }
          nullable={mergedSchemas.nullable}
          schema={mergedSchemas}
          schemaType={schemaType}
        />
      );
    }

    return (
      <SchemaItem
        parentSchemaName={parentSchemaName}
        schemaType={schemaType}
        collapsible={false}
        name={name}
        required={Array.isArray(required) ? required.includes(name) : required}
        schemaName={mergedSchemaName}
        qualifierMessage={getQualifierMessage(mergedSchemas)}
        schema={mergedSchemas}
        discriminator={false}
        children={null}
      />
    );
  }

  return (
    <SchemaItem
      parentSchemaName={parentSchemaName}
      schemaType={schemaType}
      collapsible={false}
      name={name}
      required={Array.isArray(required) ? required.includes(name) : required}
      schemaName={schemaName}
      qualifierMessage={getQualifierMessage(schema)}
      schema={schema}
      discriminator={false}
      children={null}
    />
  );
};

function renderChildren(
  schema: SchemaObject,
  schemaType: "request" | "response",
  parentSchemaName?: string,
) {
  return (
    <>
      {schema.oneOf && (
        <AnyOneOf
          parentSchemaName={parentSchemaName}
          schema={schema}
          schemaType={schemaType}
        />
      )}
      {schema.anyOf && (
        <AnyOneOf
          parentSchemaName={parentSchemaName}
          schema={schema}
          schemaType={schemaType}
        />
      )}
      {schema.properties && (
        <Properties
          parentSchemaName={parentSchemaName}
          schema={schema}
          schemaType={schemaType}
        />
      )}
      {schema.additionalProperties && (
        <AdditionalProperties
          parentSchemaName={parentSchemaName}
          schema={schema}
          schemaType={schemaType}
        />
      )}
      {schema.items && (
        <Items
          parentSchemaName={parentSchemaName}
          schema={schema}
          schemaType={schemaType}
        />
      )}
    </>
  );
}

const SchemaNode: React.FC<SchemaProps> = ({
  parentSchemaName,
  schema,
  schemaType,
}) => {
  if (
    (schemaType === "request" && schema.readOnly) ||
    (schemaType === "response" && schema.writeOnly)
  ) {
    return null;
  }

  if (schema.discriminator) {
    const { discriminator } = schema;
    return (
      <DiscriminatorNode
        parentSchemaName={parentSchemaName}
        discriminator={discriminator}
        schema={schema}
        schemaType={schemaType}
      />
    );
  }

  // Handle allOf, oneOf, anyOf without discriminators
  if (schema.allOf) {
    const mergedSchemas = mergeAllOf(schema) as SchemaObject;

    if (
      (schemaType === "request" && mergedSchemas.readOnly) ||
      (schemaType === "response" && mergedSchemas.writeOnly)
    ) {
      return null;
    }

    return (
      <div>
        {mergedSchemas.oneOf && (
          <AnyOneOf
            parentSchemaName={parentSchemaName}
            schema={mergedSchemas}
            schemaType={schemaType}
          />
        )}
        {mergedSchemas.anyOf && (
          <AnyOneOf
            parentSchemaName={parentSchemaName}
            schema={mergedSchemas}
            schemaType={schemaType}
          />
        )}
        {mergedSchemas.properties && (
          <Properties
            parentSchemaName={parentSchemaName}
            schema={mergedSchemas}
            schemaType={schemaType}
          />
        )}
        {mergedSchemas.items && (
          <Items
            parentSchemaName={parentSchemaName}
            schema={mergedSchemas}
            schemaType={schemaType}
          />
        )}
      </div>
    );
  }

  // Handle primitives
  if (
    schema.type &&
    !schema.oneOf &&
    !schema.anyOf &&
    !schema.properties &&
    !schema.allOf &&
    !schema.items &&
    !schema.additionalProperties
  ) {
    const schemaName = getSchemaName(schema);
    return (
      <SchemaItem
        parentSchemaName={parentSchemaName}
        schemaType={schemaType}
        collapsible={false}
        name={schema.type}
        required={Boolean(schema.required)}
        schemaName={schemaName}
        qualifierMessage={getQualifierMessage(schema)}
        schema={schema}
        discriminator={false}
        children={null}
      />
    );
  }

  return renderChildren(schema, schemaType, parentSchemaName);
};

export default SchemaNode;

type PrimitiveSchemaType = Exclude<SchemaType, "object" | "array">;

const PRIMITIVE_TYPES: Record<PrimitiveSchemaType, true> = {
  string: true,
  number: true,
  integer: true,
  boolean: true,
  null: true,
} as const;

const isPrimitive = (schema: SchemaObject) => {
  return PRIMITIVE_TYPES[schema.type as PrimitiveSchemaType];
};
