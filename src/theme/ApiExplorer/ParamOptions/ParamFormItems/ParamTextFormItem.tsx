import React, { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import clsx from "clsx";
// @ts-ignore - theme alias resolved by Docusaurus at build time
import { setParam } from "@theme/ApiExplorer/ParamOptions/slice";
// @ts-ignore
import { useTypedDispatch } from "@theme/ApiItem/hooks";

export default function ParamTextFormItem({ param }: { param: any }) {
  const dispatch = useTypedDispatch();
  const formCtx = useFormContext();
  const register = formCtx?.register;
  const setValue = formCtx?.setValue;
  const errors = formCtx?.formState?.errors;
  const didInit = useRef(false);

  const example =
    typeof param.example !== "undefined"
      ? param.example
      : param.schema?.example;
  const hasExample =
    example !== undefined && example !== null && example !== "";

  const encodeForParam = (val: string) =>
    param.in === "path" || param.in === "query"
      ? val.replace(/\s/g, "%20")
      : val;

  // Seed redux + react-hook-form from the example on first mount only.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (hasExample && (param.value === undefined || param.value === "")) {
      const val = encodeForParam(String(example));
      dispatch(setParam({ ...param, value: val }));
      if (setValue) {
        setValue(param.name, val, {
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registered = register
    ? register(param.name, {
        required: param.required ? "This field is required" : false,
      })
    : null;
  const errorMessage = (errors as any)?.[param.name]?.message as
    | string
    | undefined;

  const defaultValue = hasExample
    ? encodeForParam(String(example))
    : undefined;

  return (
    <>
      <input
        {...(registered ?? {})}
        className={clsx("openapi-explorer__form-item-input", {
          error: errorMessage,
        })}
        type="text"
        placeholder={(param.description || param.name)?.split("\n")[0]}
        title={(param.description || param.name)?.split("\n")[0]}
        defaultValue={defaultValue}
        autoComplete="off"
        onChange={(e) => {
          registered?.onChange(e);
          dispatch(
            setParam({
              ...param,
              value: encodeForParam(e.target.value),
            })
          );
        }}
      />
      {errorMessage && (
        <div className="openapi-explorer__input-error">{errorMessage}</div>
      )}
    </>
  );
}
