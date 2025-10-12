import { Component, Show } from "solid-js";
import TreeList from "./TreeList";
import ListItem from "../ListItem";

export type TreeItemProps<T = any> = {
  name: string;
  children?: TreeItemProps[];
  selected?: boolean;
  outlined?: boolean;
  id?: string;
  data?: T;
  type?: string;
};

export const TreeItem: Component<TreeItemProps> = (props) => {
  // TODO: splitprops
  return <ListItem
    id={props.id}
    name={props.name}
    type={props.type}
    selected={props.selected} outlined={props.outlined}
  >
    <Show when={props.children}>
      <TreeList
        idPrefix={props.id}
        partial
        children={props.children!}
      />
    </Show>
  </ListItem>;
};

export default TreeItem;
