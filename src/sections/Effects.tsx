import { Component, createMemo, createSignal, For, on, onMount } from "solid-js";
import { type ClassConstructor, loadEffect } from "../helpers/classFileHelpers";
import { type Effect } from "../../public/Effect";
import sectionStyles from "../sections/Section.module.css";
import ListItem from "../components/ListItem";

// const effectList = [
//   { name: "Matrix", module: "[Matrix]" }, // Channels w/ type
// ];

type EffectList = {
  effect: ClassConstructor<Effect>;
  selected?: boolean;
}

export const Effects: Component = () => {
  // List of available effects
  const [effectList, setEffectList] = createSignal<EffectList[]>([]);
  
  onMount(async () => {
    console.log(sectionStyles);
    // TODO: invoke file list
    const effectPaths = [
      "/effects/MyEffectTemplate.ts",
      "/effects/Turquoise.ts",
    ];

    try {
      effectPaths.forEach(async (effectPath) => {
        const MyEffect = await loadEffect(effectPath);
        console.log("effect", MyEffect?.name);
        if (MyEffect)
        {
          setEffectList((list) => [...list, { effect: MyEffect }])
        }       
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
        <ListItem name={listItem.effect.name} selected={listItem.selected} onClick={() => {
          console.log("ITEM SELECT", listItem.effect.name, idx(), !!listItem.selected);
          const newList = [...effectList()];
          newList.forEach((listItem) => listItem.selected = false);
          newList[idx()].selected = !newList[idx()].selected;
          setEffectList(newList);
        }}/>
      }</For>;
  }));
  return <>
        <h1>Effects section</h1>
        <div class={sectionStyles.container}>
          <div class={sectionStyles.container}>description, timing info, channel info</div>
          <ul class={`${sectionStyles.container} ${sectionStyles.vertical}`} style={{flex: "0 0 20vw"}}>
            {list()}
          </ul>
        </div>
      </>;
}

export default Effects;
