import { Component, Show } from "solid-js";
import TreeList from "./TreeList";
import ListItem from "../ListItem";

export type TreeItemProps<T = any> = {
  name: string;
  children?: TreeItemProps[];
  selected?: boolean;
  outlined?: boolean;
  /** @deprecated use tree control click handler */
  onClick?: (indexes?: number[], ctrl?: boolean) => void;
  id?: string;
  data?: T;
  type?: string;
};

export const TreeItem: Component<TreeItemProps> = (props) => {
  // TODO: splitprops
  // todo: move out clickhandler(?)
  return <ListItem id={props.id} name={props.name} type={props.type} onClick={(ctrlKey) => props.onClick?.(undefined, ctrlKey)} selected={props.selected} outlined={props.outlined}>
    <Show when={props.children}>
      <TreeList idPrefix={props.id} partial children={props.children!} onClick={(indexes, ctrl) => props.onClick?.(indexes, ctrl)}/>
    </Show>
  </ListItem>;
};

export default TreeItem;
