import { Component, Show, splitProps } from "solid-js";
import TreeList from "./TreeList";
import ListItem from "../ListItem";

export type TreeItemProps<T = any> = {
  name: string;
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
    id={props.id}
    {...listItemProps}
  >
    <Show when={treeItemProps.children}>
      <TreeList
        idPrefix={props.id}
        partial
        children={treeItemProps.children!}
      />
    </Show>
  </ListItem>;
};

export default TreeItem;
