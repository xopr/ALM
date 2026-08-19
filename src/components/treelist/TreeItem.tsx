import { Component, For, Show, splitProps } from "solid-js";
import ListItem from "../ListItem";

export type TreeItemProps<T = any> = {
  name?: string;
  children?: TreeItemProps[];
  selected?: boolean;
  disabled?: boolean;
  outlined?: boolean;
  icon?: string;
  id?: string;
  data?: T;
  type?: string;
};

export const TreeItem: Component<TreeItemProps> = (props) => {
  const [treeItemProps, listItemProps] = splitProps(props, ["children"]);
  return <ListItem
    {...listItemProps}
  >
    <Show when={treeItemProps.children?.length}>
      <ul>
        <For each={treeItemProps.children}>{(child, idx) => <TreeItem {...child} id={`${props.id}_${idx()}`}/>}</For>
      </ul>
    </Show>
  </ListItem>;
};

export default TreeItem;
