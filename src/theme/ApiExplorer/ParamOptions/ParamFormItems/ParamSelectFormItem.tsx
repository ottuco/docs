import React from "react";
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
  const { control, formState: { errors } } = useFormContext();
  const showErrorMessage = errors?.paramSelect;
  const dispatch = useTypedDispatch();
  const options: string[] = param.schema?.enum ?? [];

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
        render={({ field: { onChange } }) => (
          <FormSelect
            options={["---", ...options]}
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
