import { Component, createSignal, onMount } from "solid-js";

export const DRAG_THRESHOLD = 20;

/** Drag drop data */
export type DragDropData<T = any> = {
  /** Source identifier, used for dragstart handler to determine custom data */
  sourceId?: string;
  /** Source data to provide */
  sourceData?: T;
  /** Type to provide (or from ) */
  type: string;
  targetId?: string;
}

let detail: DragDropData;

export const DragNode: Component = () => {
  const [activePointer, setActivePointer] = createSignal<{x: number, y: number}>();
  const [dragNode, setDragNode] = createSignal<HTMLElement>();
  const [originNode, setOriginNode] = createSignal<HTMLElement>();

  // store identifier (as primary touch)

  // check if item allows panning/scrolling
  // maybe gripper or check if pan is blocked before dragging

  //data-draggable

  //var hasHorizontalScrollbar = div.scrollWidth > div.clientWidth;
  //var hasVerticalScrollbar = div.scrollHeight > div.clientHeight;

  // var overflowY = window.getComputedStyle(node)['overflow-y'];
  // var overflowX = window.getComputedStyle(node)['overflow-x'];
  // return {
  //   // auto scroll
  //   vertical: (overflowY === 'scroll' || overflowY === 'auto') && node.scrollHeight > node.clientHeight,
  //   horizontal: (overflowX === 'scroll' || overflowX === 'auto') && node.scrollWidth > node.clientWidth,
  // };

  const touchDown = (event: TouchEvent | MouseEvent) => {
    const { target } = event;

    if (!target || (target as HTMLElement).dataset.draggable !== "true" || event.touches?.length > 1 || activePointer()) return;

    const { pageX, pageY } = "touches" in event ? event.touches[0] : event;

    // Explicitly set mouse pointer capture since touch is inherent
    if (event instanceof MouseEvent) {
      (target as HTMLElement).setPointerCapture(1);
    }
 
    setActivePointer({x: pageX, y: pageY});

    if (event instanceof TouchEvent) {
      document.body.addEventListener("touchmove", touchMove);
    } else {
      document.body.addEventListener("mousemove", touchMove);
    }
  };

  const touchMove = (event: TouchEvent | MouseEvent) => {
    const target = originNode() ?? event.target as HTMLElement;
    if (!target || target.dataset.draggable !== "true" || event.touches?.length > 1) return;

    const { pageX, pageY } = "touches" in event ? event.touches[0] : event;
    const { x, y } = activePointer()!;

    if (!dragNode() && (Math.abs(x - pageX) > DRAG_THRESHOLD || Math.abs(y - pageY) > DRAG_THRESHOLD))
    {
      detail = {
        sourceId: target.id,
        type: target.dataset.type ?? "unknown",
      };
      const dragStart = new CustomEvent("dragstart", {
        bubbles: true,
        detail,
      });
      target.dispatchEvent(dragStart);
      setOriginNode(target);

      const clone = target.cloneNode(true) as HTMLElement;
      clone.style.backgroundColor = "Highlight";
      clone.style.color = "HighlightText";
      clone.style.padding = "0.85em";
      clone.style.pointerEvents = "none";
      clone.style.position = "absolute";
      clone.style.zIndex = "1000";

      const { x: offsetX, y: offsetY } = target.getBoundingClientRect();

      // Update the grab position relative to the pointer/element
      setActivePointer({ x: x - offsetX, y: y - offsetY });
      setDragNode(clone);
    }

    const node = dragNode();
    if (!node) return;

    // Update drag node
    node.style.top = `${pageY - activePointer()!.y}px`;
    node.style.left = `${pageX - activePointer()!.x}px`;

    // Find drop node
    const elements = document.elementsFromPoint(pageX, pageY);
    const dropNode = elements.find((element) => {
      return (element as HTMLElement)?.dataset?.accept;
    });
    if (!dropNode) return;

    const dragOver = new CustomEvent("dragover", {
      bubbles: true,
      detail,
    });
    // Note that the UL is still hit at first...
    elements[0].dispatchEvent(dragOver);
  };

  const touchUp = (event: TouchEvent | MouseEvent) => {
    if (event instanceof TouchEvent) {
      document.body.removeEventListener("touchmove", touchMove);
    } else {
      document.body.removeEventListener("mousemove", touchMove);
    }

    setOriginNode();
    setActivePointer();

    // Stop on touchcancel
    if (event.type === "touchcancel" || !dragNode()) return;
    setDragNode();

    // Drop
    const { pageX, pageY } = "changedTouches" in event ? event.changedTouches[0] : event;

    // Find drop node
    const elements = document.elementsFromPoint(pageX, pageY);
    const dropNode = elements.find((element) => {
      return (element as HTMLElement)?.dataset?.accept;
    });

    if (!dropNode) return;
    
    const drop = new CustomEvent("drop", {
      bubbles: true,
      detail,
    });
    // Note that the UL is still hit at first...
    elements[0].dispatchEvent(drop);

  };
  
  onMount(() => {
    // Tie to body touchDown up cancel...
    document.body.addEventListener("touchstart", touchDown);
    document.body.addEventListener("mousedown", touchDown);
    document.body.addEventListener("touchend", touchUp);
    document.body.addEventListener("touchcancel", touchUp);
    document.body.addEventListener("mouseup", touchUp);
  });

  return <>{dragNode()}</>;
};

export default DragNode;
