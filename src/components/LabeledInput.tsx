import { Component, JSX, splitProps } from "solid-js";

export type LabeledInputProps = {
  label: string,
} & JSX.InputHTMLAttributes<HTMLInputElement>;

export const LabeledInput: Component<LabeledInputProps> = (props) => {
  const [labelProps, inputProps] = splitProps(props, ["label"]);
  return <div>
    <span>{labelProps.label}</span><input {...inputProps}/>
  </div>;
};

export default LabeledInput;
