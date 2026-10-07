import { Component, createSignal, For, Index, Match, onMount, Switch } from "solid-js";
import { Action } from "../../sections/Remote/types";
import { invoke } from "@tauri-apps/api/core";

export const ActionBinding: Component<Action> = (props) => {
  return <div>
    <Switch>
      <Match when={props.name === "selected"}>
        <SelectAction {...props}/>
      </Match>
      <Match when={props.name === "emit"}>
        <EmitAction {...props}/>
      </Match>
      <Match when={props.name === "local"}>
        <LocalAction {...props}/>
      </Match>
      <Match when={props.name === "setEffect"}>
        <SetEffectAction {...props}/>
      </Match>
      <Match when={props.name === "toggleEffect"}>
        <ToggleEffectAction {...props}/>
      </Match>
    </Switch>
  </div>
};

/** Select */
const SelectAction: Component<Action> = (props) => {
  // select: selected(nav)
  return <>Select <ActionTarget target={props.target}/></>
}

/** Emit */
const EmitAction: Component<Action> = (props) => {
  // emit(target, value?)
  return <>Emit for <ActionTarget target={props.target}/><ActionChannel channel={props.value}/></>
}


/** Local */
const LocalAction: Component<Action> = (props) => {
  // local(local, value)
  return <>Local <ActionTarget target={props.target}/> <ActionValue value={props.value}/></>
}


/** Set effect */
const SetEffectAction: Component<Action> = (props) => {
  const [effectList, setEffectList] = createSignal<string[]>();
  onMount(async () => {
    const paths = await invoke<string[]>("effect_list");
    // Ugly way to strip path and extension
    setEffectList(paths.map((path) => path.match(/([^\/\\]+)\.ts$/)?.[1] ?? "?"));
  })

  return <>
    SetEffect for <ActionTarget target={props.target}/>
    <select>
      <option value={undefined} selected={!!props.value}>None (remove)</option>
      <For each={effectList()}>{(effect) => <option selected={props.value === effect}>{effect}</option>}</For>
    </select>
    </>
}


/** Toggle effect */
const ToggleEffectAction: Component<Action> = (props) => {
  // toggleEffect(target, value)
  return <>ToggleEffect for <ActionTarget target={props.target}/> <ActionValue value={props.value}/></>
}


const ActionValue: Component<{value?: boolean | number | string}> = (props) => {
  // TODO: allow percentage for sliders and rotaries
  return <select>
    <option value={undefined} selected={props.value === undefined}>Follow</option>
    <option value={-1} selected={props.value === -1}>Invert</option>
    <option value={1} selected={!!props.value && props.value !== -1}>On</option>
    <option value={0} selected={!props.value && props.value !== undefined}>Off</option>
  </select>
}

const ActionTarget: Component<{target?: string}> = (props) => {
  // TODO: selected, tree item label?
  // targets: Navigation, Target, Local
  return <code>{props.target}</code>
}

const ActionChannel: Component<{channel?: number}> = (props) => {
  // TODO: allow percentage for sliders and rotaries
  return <select>
    <Index each={new Array(8)}>{(_, idx) =>
      <option value={idx} selected={props.channel === idx}>{idx + 1}</option>
      }</Index>
  </select>
}

