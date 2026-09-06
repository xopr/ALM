import { JSX, Show, type ParentComponent } from "solid-js";

import styles from "./treelist/Treelist.module.css";

export type ListItemProps = {
  id?: string;
  name?: string;
  selected?: boolean;
  disabled?: boolean;
  outlined?: boolean;
  type?: string;
  icon?: JSX.Element;
};

export const ListItem: ParentComponent<ListItemProps> = (props) => {

  return <li class={`${styles.item} ${props.name ? "" : "flat"}`}>
    <Show when={props.name}>
      <div
        id={props.id}
        data-draggable={!!props.type}
        data-type={props.type}
        tabindex={0}
        aria-selected={props.selected ? true : undefined}
        aria-disabled={props.disabled ? true : undefined}
        style={{ outline: props.outlined ? "2px dashed" : undefined}}
      >
      <Show when={props.icon}>
        {props.icon}
      </Show>
        {props.name}
      </div>
    </Show>
    {props.children}
  </li>;
};

export default ListItem;
