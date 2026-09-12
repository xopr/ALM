import { createMemo, createSignal, lazy, Show } from "solid-js";
import "./App.css";
import TabView from "./components/tabView/TabView";
const Effects = lazy(() => import("./sections/Effects"));

import { Lights } from "./sections/Lights";
import { Control } from "./sections/Control";
import { getDescendingEffect, ItemData, LightGroupTree, removeEffect, removeItem } from "./sections/LightGroupTree";
import DragNode from "./components/DragNode";
import { type Effect } from "../public/Effect";
import Help from "./sections/Help";
import { TreeItemProps } from "./components/treelist/TreeItem";

import DeleteIcon from "/src/assets/delete.svg";
import EditIcon from "/src/assets/edit.svg";
import EffectOnIcon from "/src/assets/effect.svg";
import EffectOffIcon from "/src/assets/effect_off1.svg";
import EffectRemoveIcon from "/src/assets/effect_remove.svg";
import LightGroupAddIcon from "/src/assets/lightgroup_add.svg";
import LightGroupRemoveIcon from "/src/assets/lightgroup_remove.svg";
import { instanceLeaf } from "./helpers/effectHelpers";
import { EffectHelper } from "./helpers/EffectHelper";

// Assign EffectHelper base class
globalThis.Effect = EffectHelper;

function App() {
  const [selectedEffect, setSelectedEffect] = createSignal<Effect>();
  const [channelValues, setChannelValues] = createSignal<number[]>([]);
  const [selectedItem, setSelectedItem] = createSignal<TreeItemProps<ItemData>>();

  const enabledEffect = createMemo(() => {
    return !!selectedItem()?.data?.effect && !selectedItem()?.data?.effectDisabled;
  });

  const onChannelValues = (channelValues: number[]) => {
    // Hacky way to keep values in sync and stored per tree item (group)
    const data = selectedItem()?.data;
    // console.log("onChannelValues", channelValues, data);
    if (data) data.channelValues = channelValues.slice(); // TODO: sparse?

    setChannelValues(channelValues);
  }

  const addLightGroup = (parent?: TreeItemProps<ItemData>) => {
    if (!parent) return;
    if (!parent.children) parent.children = [];

    parent.children.push({
      name: "New group",
      disabled: true,
      type: "group",
      id: `${parent.id}_${parent.children.length}`,
    });
  }

  const removeLightGroup = (item?: TreeItemProps<ItemData>) => {
    // TODO: also remove segments?
    if (item?.type !== "group") return;
    removeItem(item!);
  }

  const toggleEffect = (item?: TreeItemProps<ItemData>) => {
    if (!item?.data?.effect && !item?.data?.originalEffect) return;

    item.data.effectDisabled = !item.data.effectDisabled;

    // Clean up current effect and apply the given one if disabled..
    if (item.data.effectDisabled) {
      const { effect, channelValues } = getDescendingEffect(item);

      item.data.originalEffect = item.data?.effect;
      removeEffect(item);
      if (effect) instanceLeaf(item, effect, channelValues);
    } else {
      const { effect } = getDescendingEffect(item);
      item.data.effect = effect; // Store to match

      removeEffect(item);
      if (item.data.originalEffect) {
        // Instance original effect
        instanceLeaf(item, item.data.originalEffect);
        // Restore effect to enable channels (afterwards or the effect)
        item.data.effect = item.data.originalEffect;
        // TODO: reprocess setChannelValues
      }
    }

    item.icon = item.data.effectDisabled ? <EffectOffIcon/> : <EffectOnIcon/>;
  }

  const removeEffectHandler = (item?: TreeItemProps<ItemData>) => {
    if (!item?.data?.effect && !item?.data?.originalEffect) return;
      const { effect, channelValues } = getDescendingEffect(item);

      item.data.originalEffect = item.data?.effect;
      removeEffect(item);
      // Disabled effects are effectively not removed; delete icon
      delete item.icon;
      if (effect) {
        console.log("remove", channelValues);
        instanceLeaf(item, effect, channelValues);
        // TODO: reprocess setChannelValues
      }
  }

  const renameItem = (item?: TreeItemProps<ItemData>) => {
    if (!item) return;
    const name = prompt("New name", item.name);
    if (name) item.name = name;
  }

  return (
    <main>
      <div class="inbetweenContainer vertical" style="min-width:240px">
        <LightGroupTree
          class="contentContainer list"
          onSelect={setSelectedItem}
          onChannelValues={onChannelValues}
        />
        <div>
          <button title="Add child light group" onclick={() => addLightGroup(selectedItem())} disabled={!!selectedItem()?.data?.segment}>{LightGroupAddIcon}</button>
          <button title="Remove light group" onclick={() => removeLightGroup(selectedItem())} disabled={!!selectedItem()?.data?.segment}>{LightGroupRemoveIcon}</button>
          <button
            title="Toggle effect"
            onclick={() => toggleEffect(selectedItem())}
            disabled={!selectedItem()?.data?.effect && !selectedItem()?.data?.originalEffect}
          >
            {/* TODO verify deprecated !activeEffect() */}
            {(enabledEffect()) ? <EffectOffIcon/> : <EffectOnIcon/>}
          </button>
          <button title="Remove effect" onclick={() => removeEffectHandler(selectedItem())} disabled={!selectedItem()?.data?.effect && !selectedItem()?.data?.originalEffect}>{EffectRemoveIcon}</button>
          <button title="Rename group" onclick={() => renameItem(selectedItem())} disabled={!selectedItem()}>{EditIcon}</button>
          <Show when={false/*drag*/}>
            <button>{DeleteIcon}</button>
          </Show>
        </div>
      </div>
      <TabView>
        <section
          data-label="Control"
          data-icon="control"
          class="contentContainer"
        >
          <Control selectedItem={selectedItem()} channelValues={channelValues()} /*onChanelValues={onChannelValues}*//>
        </section>
        {/* <section
          data-label="Remote"
          data-icon="remote"
          class="contentContainer"
        >
        </section> */}
        <section
          data-label="Effects"
          data-icon="effect_on"
          class="contentContainer"
        >
          <Effects
            onClick={(e) => {
              // Invoke as function since Effect constructor is a function on its own.
              setSelectedEffect(() => e);
            }}
            effect={selectedEffect()}
          />
        </section>
        <section
          data-label="Lights"
          data-icon="light_on"
          class="contentContainer"
        >
        <Show when={process.env.NODE_ENV === "development"}>
          <button onClick={() => window.location.reload()}>reload</button>
        </Show>
          <Lights /*effect={}?*/ /*light={}*/ />
        </section>
        {/* <section
          data-label="Map"
          data-icon="map"
          class="contentContainer"
        >
        </section> */}
        <section
          data-label="Help"
          data-icon="help"
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
