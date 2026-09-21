import { createMemo, createSignal, lazy, onMount, Show } from "solid-js";
import "./App.css";
import TabView from "./components/tabView/TabView";
const Effects = lazy(() => import("./sections/Effects"));

import { Lights } from "./sections/Lights";
import { Control } from "./sections/Control";
import { getAncestorEffect, getDescendingInstances, lightGroups, LightGroupTree, removeEffect, removeItem } from "./sections/LightGroupTree";
import DragNode from "./components/DragNode";
import { ChannelValues, IEffect, type Effect } from "../public/Effect";
import Help from "./sections/Help";

import DeleteIcon from "/src/assets/delete.svg";
import EditIcon from "/src/assets/edit.svg";
import EffectOnIcon from "/src/assets/effect.svg";
import EffectOffIcon from "/src/assets/effect_off1.svg";
import EffectRemoveIcon from "/src/assets/effect_remove.svg";
import LightGroupAddIcon from "/src/assets/lightgroup_add.svg";
import LightGroupRemoveIcon from "/src/assets/lightgroup_remove.svg";
import { instanceLeaf } from "./helpers/effectHelpers";
import { EffectHelper } from "./helpers/EffectHelper";
import type { SegmentTreeGroup, SegmentTreeItem } from "./types/ItemData";
import { invoke } from "@tauri-apps/api/core";
import { loadEffect } from "./helpers/classFileHelpers";
import { Action } from "./sections/Remote";
import { treeItemFromArray } from "./components/treelist/treeListHelpers";

import effect_svg from "/src/assets/effect.svg";

const Remote = lazy(() => import("./sections/Remote"));

// Assign EffectHelper base class
globalThis.Effect = EffectHelper;

function App() {
  const [selectedEffect, setSelectedEffect] = createSignal<Effect>();
  const [selectedItem, setSelectedItem] = createSignal<SegmentTreeItem>();
  const [remoteTreeItem, setRemoteTreeItem] = createSignal<SegmentTreeItem>();

  const effectClass = createMemo<Effect | undefined>(() => {
    const item = selectedItem();
    if (!item) return undefined;

    // Look for effect class up the ancestry, skipping originalEffect
    return getAncestorEffect(item).effect;
  });

  const effectInstances = createMemo<IEffect[] | undefined>(() => {
    const effect = effectClass();
    const item = selectedItem();
    if (!item || !effect) return [];

    // Look for/aggregate effect instances down the descendants
    return getDescendingInstances(effect, item);
  });

  const channels = createMemo<ChannelValues | undefined>(() => {
    const item = selectedItem();
    const effect = effectClass();

    if (!effect || !item?.data?.channelValues) return undefined;
    return effect.channels.map((channel, idx) => ({
      ...channel,
      value: item.data.channelValues![idx] ?? channel.default,
    }));
  });

  const enabledEffect = createMemo(() => {
    const item = selectedItem();
    return !!item?.data?.effect && !item.data.originalEffect;
  });

  const [effectList, setEffectList] = createSignal<Array<{effect: Effect}>>([]);
  onMount(async () => {
    const effectPaths = await invoke<string[]>("effect_list");

    try {
      effectPaths.forEach(async (effectPath) => {
        const effect = await loadEffect(effectPath);
        if (!effect) return;
        setEffectList((list) => [...list, {effect}])
      });
    } catch (e) {
      console.warn(e)
    }
  });

  const addLightGroup = (parent?: SegmentTreeItem) => {
    if (!parent || parent.type !== "group") return;
    console.assert(!!parent.children, "Expected children");
    if (!parent.children) parent.children = [];

    const group: SegmentTreeGroup = {
      name: "New group",
      disabled: true,
      type: "group",
      id: `${parent.id}_${parent.children.length}`,
      children: [],
      data: {}
    };

    parent.children.push(group);
  }

  const removeLightGroup = (item?: SegmentTreeItem) => {
    // TODO: also remove segments?
    if (item?.type !== "group") return;
    removeItem(item!);
  }

  const toggleEffect = (item?: SegmentTreeItem, active?: boolean) => {
    // Only with effect applied
    if (!item?.data?.effect && !item?.data?.originalEffect) return;

    // If we ask explicit active state which already represents the effect state, we're done
    if (active !== undefined && !item.data.originalEffect === active) return;

    // Clean up current effect and apply the given one if "disabled"..
    if (!item.data.originalEffect) {
      item.data.originalEffect = item.data?.effect;
      removeEffect(item);

      // TODO: first channel value found
      const { effect, channelValues } = getAncestorEffect(item);
      if (effect) {
        instanceLeaf(item, effect, channelValues);
      }
    } else {
      const { effect } = getAncestorEffect(item);
      item.data.effect = effect; // Store to match

      removeEffect(item);
      if (item.data.originalEffect) {
        // Instance original effect
        instanceLeaf(item, item.data.originalEffect, /* item.data.originalChannelValues */);
        // Restore effect to enable channels (afterwards or the effect)
        item.data.effect = item.data.originalEffect;
        // TODO: reprocess setChannelValues
        delete item.data.originalEffect;
      }
    }

    item.icon = item.data.originalEffect ? <EffectOffIcon/> : <EffectOnIcon/>;
  }

  const removeEffectHandler = (item?: SegmentTreeItem) => {
    if (!item?.data?.effect && !item?.data?.originalEffect) return;
    delete item.data.originalEffect;
    removeEffect(item);

    // Disabled effects are effectively not removed; delete icon
    delete item.icon;

    // TODO: first channel value found
    const { effect, channelValues } = getAncestorEffect(item);
    if (effect) {
      instanceLeaf(item, effect, channelValues);
    }
  }

  const renameItem = (item?: SegmentTreeItem) => {
    if (!item) return;
    const name = prompt("New name", item.name);
    if (name) item.name = name;
  }

  const resolveTarget = (target: Action["target"]): SegmentTreeItem | undefined => {
    switch (target) {
      case "current":
        return remoteTreeItem();

      case "selected":
        return selectedItem();

      // TODO: Navigation items
      // case "prevGroup":
      // case "prevEffect":
      // case "prevLeaf":
      // case "nextGroup":
      // case "nextEffect":
      // case "nextLeaf":

      default:
        return treeItemFromArray<SegmentTreeItem>(lightGroups, target.split("_").map(s => parseInt(s)));
    }
  }

  const onData = <T extends Action = Action>(name: T["name"], target: T["target"], value: T["value"], index?: number) => {
    const item = resolveTarget(target);
    switch (name) {
      case "current":
      {
        setRemoteTreeItem(item);
        setSelectedItem(item); // TODO: remove; for now, show navigation
        break;
      }

      case "emit":
      {
        if (!item) break;
        const effect = getAncestorEffect(item).effect;
        const instances = getDescendingInstances(effect!, item);
        instances.forEach((instance) => {
          // TODO: throttle postMessage!
          //       for now, don't relay on instant frame
          instance.channelValues[index!] = value as number;

          // const values: number[] = [];
          // values[index!] = value as number;
          // window.postMessage([instance.id, performance.now(), "channels", values]);
        })
        break;
      }

      case "setEffect":
      {
        if (!item) break;
        const effect = value ? effectList().find((effect) => effect.effect.name === value)?.effect : undefined;

        if (!effect) {
          removeEffectHandler(item);
        } else {
          item.data!.effect = undefined;
          // Set effect icon      
          item.icon = effect_svg;

          instanceLeaf(item, effect, effect.channels.map(c => c.default));

          // Store effect we just dropped
          item.data!.effect = effect;
        }
        break;
      }

      case "toggleEffect":
      {
        toggleEffect(item, value as boolean | undefined);
        break;
      }
    }
  }

  return (
    <main>
      <div class="inbetweenContainer vertical" style="min-width:240px">
        <LightGroupTree
          class="contentContainer list"
          onSelect={setSelectedItem}
        />
        <div>
          {/* @ts-ignore -- optional chain check */}
          <button title="Add child light group" onclick={() => addLightGroup(selectedItem())} disabled={!!selectedItem()?.data?.segment}>{LightGroupAddIcon}</button>
          {/* @ts-ignore -- optional chain check */}
          <button title="Remove light group" onclick={() => removeLightGroup(selectedItem())} disabled={!!selectedItem()?.data?.segment}>{LightGroupRemoveIcon}</button>
          <button
            title="Toggle effect"
            onclick={() => toggleEffect(selectedItem())}
            disabled={!selectedItem()?.data?.effect && !selectedItem()?.data?.originalEffect}
          >
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
        >
          <Control
            channels={channels()}
            name={effectClass()?.name}
            onChannelValues={(values) => {

              effectInstances()?.forEach((instance) => {
                window.postMessage([instance.id, performance.now(), "channels", values]);
              })
              const item = selectedItem();
              if (item?.data.channelValues) {
                // sparse
                values.forEach((v,i) => item.data.channelValues![i] = v);
              }
            }}
          />
        </section>
        <section
          data-label="Effects"
          data-icon="effect_on"
        >
          <Effects
            effectList={effectList()}
            onClick={(e) => {
              // Invoke as function since Effect constructor is a function on its own.
              setSelectedEffect(() => e);
            }}
            effect={selectedEffect()}
          />
        </section>
        <section
          data-label="Remote"
          data-icon="remote"
        >
          <Remote onData={onData}/>
        </section>
        <section
          data-label="Lights"
          data-icon="light_on"
        >
        <Show when={process.env.NODE_ENV === "development"}>
          <button onClick={() => window.location.reload()}>reload</button>
        </Show>
          <Lights /*effect={}?*/ /*light={}*/ />
        </section>
        {/* <section
          data-label="Map"
          data-icon="map"
        >
        </section> */}
        <section
          data-label="Help"
          data-icon="help"
        >
          <Help/>
        </section>
      </TabView>
      <DragNode/>
    </main>
  );
}

export default App;
