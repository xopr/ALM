import { createMemo, createSignal, lazy, Show } from "solid-js";
import "./App.css";
import TabView from "./components/tabView/TabView";
const Effects = lazy(() => import("./sections/Effects"));

import { Lights } from "./sections/Lights";
import { Control } from "./sections/Control";
import { ItemData, LightGroupTree, removeEffect, removeItem } from "./sections/LightGroupTree";
import DragNode from "./components/DragNode";
import { type Effect, type IEffect } from "../public/Effect";
import Help from "./sections/Help";
import { TreeItemProps } from "./components/treelist/TreeItem";

import control from "/src/assets/control.svg";
import delete_svg from "/src/assets/delete.svg";
import edit_svg from "/src/assets/edit.svg";
import effect_on_svg from "/src/assets/effect.svg";
import effect_off_svg from "/src/assets/effect_off1.svg";
import effect_remove_svg from "/src/assets/effect_remove.svg";
import help from "/src/assets/help.svg";
import light_on from "/src/assets/light_on.svg";
import lightgroup_add_svg from "/src/assets/lightgroup_add.svg";
import lightgroup_remove_svg from "/src/assets/lightgroup_remove.svg";

function App() {
  const [activeEffect, setActiveEffect] = createSignal<Effect>();
  const [effect, setEffect] = createSignal<Effect>();
  const [effectInstances, setEffectInstances] = createSignal<IEffect[]>();
  const [channelValues, setChannelValues] = createSignal<number[]>([]);
  const [selectedItem, setSelectedItem] = createSignal<TreeItemProps<ItemData>>();

  const enabledEffect = createMemo(() => {
    return !!selectedItem()?.data?.effect;
  });

  const addLightGroup = (parent?: TreeItemProps<ItemData>) => {
    if (!parent) return;
    if (!parent.children) parent.children = [];

    parent.children.push({
      name: "New group",
      disabled: true,
      type: "group",
    });
  }

  const removeLightGroup = (item?: TreeItemProps<ItemData>) => {
    if (item?.type !== "group") return;
    removeItem(item!);
  }

  const toggleEffect = (item?: TreeItemProps<ItemData>) => {
    if (!item?.data?.effect) return;
    console.log("TODO", item.data.effect);
  }

  const removeEffectHandler = (item?: TreeItemProps<ItemData>) => {
    if (!item?.data?.effect) return;
    removeEffect(item);
  }

  const renameItem = (item?: TreeItemProps<ItemData>) => {
    if (!item) return;
    const name = prompt("New name", item.name);
    if (name) item.name = name;
  }

  return (
    <main>
      <div class="inbetweenContainer vertical">
        <LightGroupTree
          class="contentContainer list"
          onEffect={setActiveEffect}
          onSelect={setSelectedItem}
          onChannelValues={setChannelValues}
          onInstances={setEffectInstances}
        />
        <div>
          <button onclick={() => addLightGroup(selectedItem())} disabled={!!selectedItem()?.data?.segment}><img src={lightgroup_add_svg}/></button>
          <button onclick={() => removeLightGroup(selectedItem())} disabled={!!selectedItem()?.data?.segment}><img src={lightgroup_remove_svg}/></button>
          <button onclick={() => toggleEffect(selectedItem())} disabled={!activeEffect()}><img src={(!activeEffect() || enabledEffect()) ? effect_off_svg : effect_on_svg}/></button>
          <button onclick={() => removeEffectHandler(selectedItem())} disabled={!activeEffect()}><img src={effect_remove_svg}/></button>
          <button onclick={() => renameItem(selectedItem())} disabled={!selectedItem()}><img src={edit_svg}/></button>
          <Show when={false/*drag*/}>
            <button><img src={delete_svg}/></button>
          </Show>
        </div>
      </div>
      <TabView>
        <section
          data-label="Lights"
          data-icon={light_on}
          class="contentContainer"
        >
          <Lights /*effect={}?*/ /*light={}*/ />
        </section>
        {/* <section
          data-label="Map"
          data-icon={map}
          class="contentContainer"
        >
        </section> */}
        <section
          data-label="Control"
          data-icon={control}
          class="contentContainer"
        >
          <Control effect={activeEffect()} instances={effectInstances()} channelValues={channelValues()}/>
        </section>
        {/* <section
          data-label="Remote"
          data-icon={remote}
          class="contentContainer"
        >
        </section> */}
        <section
          data-label="Effects"
          data-icon={effect_on_svg}
          class="contentContainer"
        >
          <Effects
            onClick={(e) => {
              // Invoke as function since Effect constructor is a function on its own.
              setEffect(() => e);
            }}
            effect={effect()}
          />
        </section>
        <section
          data-label="Help"
          data-icon={help}
          class="contentContainer"
        >
          <Help/>
        </section>
      </TabView>
      <DragNode/>
    </main>
  );
}

export default App;
