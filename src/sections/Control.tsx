import { Component, createEffect, createMemo, createSignal } from "solid-js";
import SliderGroup from "../components/sliderGroup/SliderGroup";
import { ChannelValues, Effect, IEffect } from "../../public/Effect";
import { TreeItemProps } from "../components/treelist/TreeItem";
import { ItemData, lightGroups } from "./LightGroupTree";
import { arrayFromTreeItem, treeItemFromArray } from "../components/treelist/treeListHelpers";

type ControlProps = {
  // TODO: data (effect, channelvalues)
  /** @deprecated isolate from control into app */
  selectedItem?: TreeItemProps<ItemData>;

  channelValues?: number[];
  /** ChannelValues sparse array */
  onChanelValues?: (channelValues: number[]) => void;
}

const getInstances = (effect: Effect, item?: TreeItemProps<ItemData>): IEffect[] => {
  // We're not leaf level; collect our descendants
  if (item?.children?.length) {
    return Array.prototype.concat.call(item.children.map(getInstances.bind(this, effect))).flat();
  }

  // Do we have an instance that matches our effect?
  if (item?.data?.effectInstance && item?.data?.effectInstance instanceof effect)
    return [item.data.effectInstance];
  else
    return [];
}

export const Control: Component<ControlProps> = (props) => {
  // TODO: automatically (re)attach light group selection channels to slider groups
  // H+S+L, R+G+B, C+M+Y+K
  const [channelValues, setChannelValues] = createSignal<ChannelValues>([]);
  const effect = createMemo(() => {
    // TODO: props.selectedItem?.data?.effect tree logic
    const selectedItem = props.selectedItem;
    if (!selectedItem) return undefined;

    let effect: Effect | undefined;
    const indexes = arrayFromTreeItem(lightGroups, selectedItem);
    
    effect = selectedItem.data?.effect;
    // Get Effect class (recursively by parent)
    while (!effect && indexes.length) {
      indexes.pop();
      effect = treeItemFromArray<TreeItemProps<ItemData>>(lightGroups, indexes)?.data?.effect;
    }

    return effect;
  });
  const instances = createMemo(() => {
    // TODO: props.selectedItem?.data?.effectInstance tree logic
    if (!effect()) return [];

    // Only select instances of current effect
    return getInstances(effect()!, props.selectedItem);
  });

  createEffect(() => {
    // Apply channel values if provided externally.
    if (props.channelValues?.length)
      setChannelValues(
        effect()?.channels.map((chan, idx) => ({...chan, value: props.channelValues![idx] })) as ChannelValues
  );
  });

  createEffect(() => {
    instances()?.forEach(instance => {
      window.postMessage([instance.id, performance.now(), "channels", []] );
    })
  });

  const group1 = createMemo(() => {
    return channelValues()?.slice(0, 4);
  });
  const group2 = createMemo(() => {
    return channelValues()?.slice(4, 8);
  });

  const valueChanged = (idx: number, value: number) => {
    instances()?.forEach(instance => {
      // Set sparse array and post
      const data = [];
      data[idx] = value;

      props.onChanelValues?.(data);
      window.postMessage([instance.id, performance.now(), "channels", data]);
    })
  }
  return <div id="content" class="inbetweenContainer vertical">
    <h1>Control section - [{effect()?.name}]</h1>
    <div class="contentContainer horizontal">
      <SliderGroup channels={group1()} onValueChanged={valueChanged}/>
      <SliderGroup channels={group2()} onValueChanged={valueChanged} channelOffset={4}/>
    </div>

    
    Affected lights: {instances()?.length}
  </div>;
}

export default Control;
