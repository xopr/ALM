import { Component, For, Show } from "solid-js";
import ListItem from "../ListItem";
import type { SegmentTreeItem, LightTreeItem } from "../../types/ItemData";

export const TreeItem: Component<SegmentTreeItem | LightTreeItem> = (props) => {
  return <ListItem
    {...props}
  >
    <Show when={props.type === "group" && props}>{(parent) =>
      <ul>
        <For each={parent().children}>{(child, idx) => <TreeItem {...child} id={`${props.id}_${idx()}`}/>}</For>
      </ul>}
    </Show>
  </ListItem>;
};

export default TreeItem;
