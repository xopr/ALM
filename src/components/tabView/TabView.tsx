import { Component, createMemo, createSignal, For, JSX, Show } from "solid-js";

import ControlIcon from "/src/assets/control.svg";
import EffectOnIcon from "/src/assets/effect.svg";
import LightOnIcon from "/src/assets/light_on.svg";
import HelpIcon from "/src/assets/help.svg";

export type TabViewProps = {
  children: JSX.Element[];
  class?: string;
};

const icons = {
  control: ControlIcon,
  // remote: ,
  effect_on: EffectOnIcon,
  light_on: LightOnIcon,
  // map
  help: HelpIcon,
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
            {icons[tab.dataset.icon as keyof typeof icons]}
          </Show>
          {tab.dataset.label ?? "Unnamed"}
          </li>;
      }}</For>
    </ul>
    {child()}
  </div>;
};





export default TabView;
