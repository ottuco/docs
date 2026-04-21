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
  const hasExample =
    example !== undefined &&
    example !== null &&
    example !== "" &&
    options.includes(String(example));

  // Seed redux + react-hook-form from the example on first mount only.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (hasExample && (param.value === undefined || param.value === "")) {
      const val = String(example);
      dispatch(setParam({ ...param, value: val }));
      if (setValue) {
        setValue("paramSelect", val, {
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showErrorMessage = errors?.paramSelect;
  const defaultValue = hasExample ? String(example) : "---";

  const [localValue, setLocalValue] = useState(defaultValue);

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
        name="paramSelect"
        defaultValue={defaultValue}
        render={({ field: { onChange, value } }) => (
          <FormSelect
            options={["---", ...options]}
            value={value ?? "---"}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const val = e.target.value;
              dispatch(
                setParam({
                  ...param,
                  value: val === "---" ? undefined : val,
                })
              );
              onChange(val);
            }}
          />
        )}
      />
      {showErrorMessage && (
        <ErrorMessage
          errors={errors}
          name="paramSelect"
          render={({ message }) => (
            <div className="openapi-explorer__input-error">{message}</div>
          )}
        />
      )}
    </>
  );
}
