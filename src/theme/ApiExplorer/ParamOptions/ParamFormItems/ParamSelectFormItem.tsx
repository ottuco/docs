import React, { useEffect, useRef, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { translate } from "@docusaurus/Translate";
import { ErrorMessage } from "@hookform/error-message";
// @ts-ignore - theme alias resolved by Docusaurus at build time
import FormSelect from "@theme/ApiExplorer/FormSelect";
// @ts-ignore
import { setParam } from "@theme/ApiExplorer/ParamOptions/slice";
// @ts-ignore
import { useTypedDispatch } from "@theme/ApiItem/hooks";
// @ts-ignore
import { OPENAPI_FORM } from "@theme/translationIds";

export default function ParamSelectFormItem({ param }: { param: any }) {
  const formCtx = useFormContext();
  const control = formCtx?.control;
  const errors = formCtx?.formState?.errors;
  const setValue = formCtx?.setValue;
  const dispatch = useTypedDispatch();
  const didInit = useRef(false);
  const options: string[] = param.schema?.enum ?? [];

  const example =
    typeof param.example !== "undefined" ? param.example : param.schema?.example;
  const exampleStr =
    example !== undefined && example !== null && example !== ""
      ? String(example)
      : null;
  const hasExample = exampleStr !== null && options.includes(exampleStr);

  const defaultValue = hasExample ? exampleStr! : "---";
  const [localValue, setLocalValue] = useState(defaultValue);

  // Seed redux + react-hook-form from the example on first mount only.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (exampleStr !== null && !hasExample) {
      console.warn(
        `[ParamSelectFormItem] Example value "${exampleStr}" for param "${param.name}" is not in enum options [${options.join(", ")}]. Pre-fill skipped.`
      );
    }
    if (hasExample && (param.value === undefined || param.value === "")) {
      dispatch(setParam({ ...param, value: exampleStr }));
      if (setValue) {
        setValue(param.name, exampleStr, {
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showErrorMessage = (errors as any)?.[param.name];

  if (!control) {
    // Rendered outside FormProvider (e.g. params list panel) — uncontrolled fallback
    return (
      <FormSelect
        options={["---", ...options]}
        value={localValue}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          const val = e.target.value;
          setLocalValue(val);
          dispatch(setParam({ ...param, value: val === "---" ? undefined : val }));
        }}
      />
    );
  }

  return (
    <>
      <Controller
        control={control}
        rules={{
          required: param.required
            ? translate({
                id: OPENAPI_FORM.FIELD_REQUIRED,
                message: "This field is required",
              })
            : false,
        }}
        name={param.name}
        defaultValue={defaultValue}
        render={({ field: { onChange, value } }) => (
          <FormSelect
            options={["---", ...options]}
            value={value ? value : "---"}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const val = e.target.value;
              const normalized = val === "---" ? "" : val;
              dispatch(
                setParam({
                  ...param,
                  value: normalized || undefined,
                })
              );
              onChange(normalized);
            }}
          />
        )}
      />
      {showErrorMessage && (
        <ErrorMessage
          errors={errors}
          name={param.name}
          render={({ message }) => (
            <div className="openapi-explorer__input-error">{message}</div>
          )}
        />
      )}
    </>
  );
}
