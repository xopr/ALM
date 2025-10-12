import { Component, createSignal, For, JSX } from "solid-js";

import styles from "./TabView.module.css";

/*
function For<T, U extends JSX.Element>(props: {
  each: readonly T[]
  fallback?: JSX.Element
  children: (item: T, index: () => number) => U
}): () => U[]

*/

export type TabViewProps = {
  // TODO: move towards key: child so that we don't need to instantiate the components (twice) 
  children: JSX.Element[];
  class?: string;
  // onChange
};

export const TabView: Component<TabViewProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal<number>(0);

  return <div
    style={{flex: "1 1 100%", display: "flex", "flex-direction": "column"}}
    class={`${styles.tabView} ${styles.list} ${props.class ?? ""}`}>
    <ul>
      <For each={props.children}>{(tab, index) => {
        // Sanity check
        if (!(tab instanceof HTMLElement)) return undefined;

        return <li aria-selected={index() === activeTab()} onClick={() => setActiveTab(index())}>{tab.dataset.label ?? "Unnamed"}</li>;
      }}</For>
    </ul>
    {props.children[activeTab()]}
  </div>;
};





export default TabView;
