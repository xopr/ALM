import { Component, createMemo, For, Match, Show, Switch } from "solid-js";
import { ActionBinding } from "./ActionBinding";
import { Button, Slider } from "../../sections/Remote/types";

type Props = (Button| Slider) & {
  path?: Array<string | number>;
  onClose?: (newSetting?: Button| Slider) => void;
};

export const ControllerBinding: Component<Props> = (props) => {
  const modes = createMemo(() => {
    if (props.path?.includes("sliders")) {
      // Slider has no mode
      return undefined;
    }
    // Rotary mode
    if (props.path?.includes("rotaries")){
      return ["regular", "wrap"];
    }
    // Button modes
    return ["follow", "toggle", "latch"];
  });

  return <>
    <h3>
      <Switch fallback={<>Button {props.path?.[1] as number + 1} {props.path?.[2] ?? "(bottom)"}</>}>
        <Match when={props.path?.includes("sliders")}>Slider {props.path?.[1] as number + 1}</Match>
        <Match when={props.path?.includes("rotaries")}>Rotary {props.path?.[1] as number + 1}</Match>
      </Switch>
    </h3>
    <Show when={props && modes()}>
      <div>
        Button mode:
        <select>
          <For each={modes()}>{(mode) => 
            <option value={mode} selected={"mode" in props && mode === props.mode}>{mode}</option>
          }</For>
        </select>
      </div>
    </Show>
    Actions:
    <For each={props.actions}>{(action) => 
      // @ts-ignore
      <ActionBinding {...action}/>
    }</For>
    <button onClick={() => props.onClose?.()}>Cancel</button> <button disabled onClick={() => props.onClose?.()}>Apply</button>
  </>
};
