import React from "react";

import BrowserOnly from "@docusaurus/BrowserOnly";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import { translate } from "@docusaurus/Translate";
import SchemaNode from "@site/src/theme/Schema";
import Details from "@theme/Details";
import TabItem from "@theme/TabItem";
import type { MediaTypeObject } from "docusaurus-plugin-openapi-docs/lib/openapi/types";
import Markdown from "docusaurus-theme-openapi-docs/lib/theme/Markdown";
import MimeTabs from "docusaurus-theme-openapi-docs/lib/theme/MimeTabs";
import {
  ExampleFromSchema,
  ResponseExample,
  ResponseExamples,
} from "docusaurus-theme-openapi-docs/lib/theme/ResponseExamples";
import SchemaTabs from "docusaurus-theme-openapi-docs/lib/theme/SchemaTabs";
import SkeletonLoader from "docusaurus-theme-openapi-docs/lib/theme/SkeletonLoader";
import {
  OPENAPI_SCHEMA,
  OPENAPI_SCHEMA_ITEM,
} from "docusaurus-theme-openapi-docs/lib/theme/translationIds";

interface Props {
  style?: React.CSSProperties;
  title: string;
  body: {
    content?: {
      [key: string]: MediaTypeObject;
    };
    description?: string;
    required?: string[] | boolean;
  };
}

const ResponseSchemaComponent: React.FC<Props> = ({
  title,
  body,
  style,
}): any => {
  const { frontMatter } = useDoc();
  const rootSchemaName = `${String(frontMatter.id)}-response`;

  if (
    body === undefined ||
    body.content === undefined ||
    Object.keys(body).length === 0 ||
    Object.keys(body.content).length === 0
  ) {
    return null;
  }

  // Get all MIME types, including vendor-specific
  const mimeTypes = Object.keys(body.content);
  if (mimeTypes && mimeTypes.length) {
    return (
      <MimeTabs className="openapi-tabs__mime" schemaType="response">
        {mimeTypes.map((mimeType: any) => {
          const mediaTypeObject = body.content?.[mimeType];
          const responseExamples = mediaTypeObject?.examples;
          const responseExample = mediaTypeObject?.example;
          const firstBody = mediaTypeObject?.schema;

          if (
            !firstBody ||
            (firstBody.properties &&
              Object.keys(firstBody.properties).length === 0)
          ) {
            return (
              // @ts-ignore
              <TabItem key={mimeType} label={mimeType} value={mimeType}>
                <div>
                  {translate({
                    id: OPENAPI_SCHEMA.NO_SCHEMA,
                    message: "No schema",
                  })}
                </div>
              </TabItem>
            );
          }

          return (
            // @ts-ignore
            <TabItem key={mimeType} label={mimeType} value={mimeType}>
              {/* @ts-expect-error upstream SchemaTabsProps type chain is broken */}
              <SchemaTabs className="openapi-tabs__schema">
                {/* @ts-ignore */}
                <TabItem key={title} label={title} value={title}>
                  <Details
                    className="openapi-markdown__details response"
                    data-collapsed={false}
                    open={true}
                    style={style}
                    summary={
                      <>
                        <summary>
                          <strong className="openapi-markdown__details-summary-response">
                            {title}
                            {body.required === true && (
                              <span className="openapi-schema__required">
                                {translate({
                                  id: OPENAPI_SCHEMA_ITEM.REQUIRED,
                                  message: "required",
                                })}
                              </span>
                            )}
                          </strong>
                        </summary>
                      </>
                    }
                  >
                    <div style={{ textAlign: "left", marginLeft: "1rem" }}>
                      {body.description && (
                        <div
                          style={{ marginTop: "1rem", marginBottom: "1rem" }}
                        >
                          <Markdown>{body.description}</Markdown>
                        </div>
                      )}
                    </div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaNode
                        schema={firstBody}
                        schemaType={rootSchemaName}
                      />
                    </ul>
                  </Details>
                </TabItem>
                {firstBody &&
                  ExampleFromSchema({
                    schema: firstBody,
                    mimeType: mimeType,
                  })}

                {responseExamples &&
                  ResponseExamples({ responseExamples, mimeType })}

                {responseExample &&
                  ResponseExample({ responseExample, mimeType })}
              </SchemaTabs>
            </TabItem>
          );
        })}
      </MimeTabs>
    );
  }
  return undefined;
};

const ResponseSchema: React.FC<Props> = (props) => {
  return (
    <BrowserOnly fallback={<SkeletonLoader size="md" />}>
      {() => {
        return <ResponseSchemaComponent {...props} />;
      }}
    </BrowserOnly>
  );
};

export default ResponseSchema;
