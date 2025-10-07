import { Component, Show } from "solid-js";
import TreeList from "./TreeList";
import ListItem from "../ListItem";

export type TreeItemProps = {
  name: string;
  children?: TreeItemProps[];
  selected?: boolean;
  onClick?: (indexes?: number[], ctrl?: boolean) => void;
};

export const TreeItem: Component<TreeItemProps> = (props) => {
  return <ListItem name={props.name} onClick={(ctrlKey) => props.onClick?.(undefined, ctrlKey)} selected={props.selected}>
    <Show when={props.children}>
      <TreeList partial children={props.children!} onClick={(indexes, ctrl) => props.onClick?.(indexes, ctrl)}/>
    </Show>
  </ListItem>;
};

export default TreeItem;
