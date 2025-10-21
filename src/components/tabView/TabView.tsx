import { Component, createSignal, For, JSX } from "solid-js";

export type TabViewProps = {
  // TODO: move towards key: child so that we don't need to instantiate the components (twice) 
  children: JSX.Element[];
  class?: string;
};

export const TabView: Component<TabViewProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal<number>(0);

  return <div class="itemContainer tabs">
    <ul class="itemContainer horizontal">
      <For each={props.children}>{(tab, index) => {
        // Sanity check
        if (!(tab instanceof HTMLElement)) return undefined;

        return <li
          aria-selected={index() === activeTab()}
          onClick={() => setActiveTab(index())}
          tabindex={0}
        >{tab.dataset.label ?? "Unnamed"}</li>;
      }}</For>
    </ul>
    {props.children[activeTab()]}
  </div>;
};





export default TabView;
