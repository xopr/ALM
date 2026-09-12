import { Component, createMemo, createSignal, For, on, onMount } from "solid-js";
import { loadEffect } from "../helpers/classFileHelpers";
import { type Effect } from "../../public/Effect";
import ListItem from "../components/ListItem";
import { DragDropData } from "../components/DragNode";

import effect_off_svg from "/src/assets/effect_off1.svg";
import { invoke } from "@tauri-apps/api/core";


type EffectList = {
  effect: Effect;
  selected?: boolean;
}

type EffectsProps = {
  effect?: Effect;
  onClick?: (effect?: Effect) => void;
}

export const Effects: Component<EffectsProps> = (props) => {
  // List of available effects
  const [effectList, setEffectList] = createSignal<EffectList[]>([]);
  
  onMount(async () => {
    const effectPaths = await invoke<string[]>("effect_list");

    try {
      effectPaths.forEach(async (effectPath) => {
        const effect = await loadEffect(effectPath);
        if (!effect) return;
        setEffectList((list) => [...list, { effect }])
      });
    } catch (e) {
      console.warn(e)
    }
  });

  // Raw for element doesn't seem to work; create a memo for our list
  const list = createMemo(on(
    effectList,
    () => {
    return <For each={effectList()}>{(listItem, idx) =>
        <ListItem
          id={`${idx()}`}
          icon={effect_off_svg}
          name={listItem.effect.name}
          selected={listItem.selected}
          type="effect"
        />
      }</For>;
  }));

  const onClick = (event: MouseEvent & {currentTarget: HTMLUListElement; target: Element;}) => {
    const { target } = event;
    if (!target.id) return;
    const newList = [...effectList()];
    newList.forEach((listItem) => listItem.selected = false);
    newList[parseInt(target.id)].selected = true;
    const effect = newList[parseInt(target.id)].effect
    setEffectList(newList);
    props.onClick?.(effect);
  }

  return <>
    <div class="contentContainer vertical">
      <h1>Effects section [{props.effect?.name}]</h1>
      <div>{props.effect?.description}</div>
      <div>
        Channels:
        <ul>
          <For each={props.effect?.channels}>{(channel) =>
            <li>{channel.name}: {channel.description}, default: {(channel.default * 100).toFixed(1)}%</li>
          }</For>
        </ul>
      </div>
      {/* TODO: find a way to read renderDelay */}
      {/* <div>Frame every {(props.effect?.renderDelay)?.toFixed(3)} seconds</div> */}
      {/* <div>Frame {(1 / props.effect?.renderDelay)?.toFixed(0)} times a second</div> */}
      <div>Horizontal support: {props.effect?.minMax.x[0]}-{props.effect?.minMax.x[1]} LEDs</div>
      <div>Vertical support: {props.effect?.minMax.y[0]}-{props.effect?.minMax.y[1]} LEDs</div>
    </div>
    <ul
      class="itemContainer list"
      onDragStart={(event: CustomEvent<DragDropData>) => {
        const { sourceId } = event.detail;
        if (!sourceId) return;
        event.detail.sourceData = effectList()[parseInt(sourceId)].effect;
      }}
      onClick={onClick}
    >
      {list()}
    </ul>
  </>;
}

export default Effects;
