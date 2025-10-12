import { type ParentComponent } from "solid-js";

import styles from "./treelist/Treelist.module.css";

export type ListItemProps = {
  id?: string;
  name: string;
  selected?: boolean;
  outlined?: boolean;
  /** @deprecated use parent click handler */
  onClick?: (ctrl?: boolean) => void;
  type?: string;
};

export const ListItem: ParentComponent<ListItemProps> = (props) => {

  return <li class={styles.item}>
    <div
      id={props.id}
      data-draggable={!!props.type}
      data-type={props.type}
      tabindex={0}
      aria-selected={props.selected ? true : undefined}
      onClick={(e) => props.onClick?.(e.ctrlKey)}
      style={{ border: props.outlined ? "2px dashed" : undefined}}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation();
        props.onClick?.(true);
        return false;
      }}
    >
      {props.name}
    </div>
    {props.children}
  </li>;
};

export default ListItem;
