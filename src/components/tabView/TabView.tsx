import { Component, createMemo, createSignal, For, JSX, Show } from "solid-js";

export type TabViewProps = {
  children: JSX.Element[];
  class?: string;
};

export const TabView: Component<TabViewProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal<number>(0);
  const child = createMemo(() => props.children[activeTab()]);

  return <div class="itemContainer tabs">
    <ul class="itemContainer horizontal">
      <For each={props.children}>{(tab, index) => {
        // Sanity check
        if (!(tab instanceof HTMLElement)) return undefined;

        return <li
          aria-selected={index() === activeTab()}
          onClick={() => setActiveTab(index())}
          tabindex={0}
        >
          <Show when={tab.dataset.icon}>
            <img src={tab.dataset.icon}/>
          </Show>
          {tab.dataset.label ?? "Unnamed"}
          </li>;
      }}</For>
    </ul>
    {child()}
  </div>;
};





export default TabView;
