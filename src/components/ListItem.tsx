import { type ParentComponent } from "solid-js";

import styles from "./treelist/Treelist.module.css";

export type ListItemProps = {
  id?: string;
  name: string;
  selected?: boolean;
  outlined?: boolean;
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
      style={{ border: props.outlined ? "2px dashed" : undefined}}
    >
      {props.name}
    </div>
    {props.children}
  </li>;
};

export default ListItem;
