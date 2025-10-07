import { createSignal, onMount, type ParentComponent } from "solid-js";
import { getCurrentWindow } from '@tauri-apps/api/window';

import styles from "./treelist/Treelist.module.css";

export type ListItemProps = {
  name: string;
  selected?: boolean;
  onClick?: (ctrl?: boolean) => void;
};

export const ListItem: ParentComponent<ListItemProps> = (props) => {
  const [activePointer, setActivePointer] = createSignal<{x:Number, y: number}>();

  const pointerDown = (event: PointerEvent) => {
    console.log("PD", event.pointerType);
    if (!event.isPrimary) return;
    const { pageY: x, pageY: y } = event;
    setActivePointer({x ,y});
    // (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);

    // event.preventDefault();
  };
  const pointerMove = (event: PointerEvent) => {
    if (!event.isPrimary || !activePointer()) return;
    console.log(event.pageX, event.pageY);
    // event.preventDefault();
  };
  const pointerUp = (event: PointerEvent) => {
    if (!event.isPrimary) return;
    setActivePointer();
    console.log(event.pageX, event.pageY);
    // event.preventDefault();
  };

  onMount(() => {
    getCurrentWindow().listen("pointerdown", (event) => {
      console.log("CURWINPOINTERDN", event.pointerType); // Check the type of pointer event
    });
  });

  return <li class={styles.item}>
    <div
      tabindex={0}
      aria-selected={props.selected ? true : undefined}
      // onClick={(e) => props.onClick?.(e.ctrlKey)}
      // onContextMenu={(e) => {
      //   e.preventDefault()
      //   e.stopPropagation();
      //   props.onClick?.(true);
      //   return false;
      // }}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
    >
      {props.name}
    </div>
    {props.children}
  </li>;
};

export default ListItem;
