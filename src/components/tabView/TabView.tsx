import { Component, createSignal, For, JSX, Show } from "solid-js";

import ControlIcon from "/src/assets/control.svg";
import EffectOnIcon from "/src/assets/effect.svg";
import LightOnIcon from "/src/assets/light_on.svg";
import HelpIcon from "/src/assets/help.svg";

import styles from "./TabView.module.css";

type Tab = {
  label: string;
  icon?: string;
  component: () => JSX.Element;
};

type TabViewProps = {
  tabs: Tab[];
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

return (
  <div class={`itemContainer ${styles.tabs}`}>
    <ul class="itemContainer horizontal">
      <For each={props.tabs}>
        {(tab, index) => (
          <li
            aria-selected={index() === activeTab()}
            onClick={() => setActiveTab(index())}
            tabindex={0}
          >
            <Show when={tab.icon}>
              {icons[tab.icon as keyof typeof icons]}
            </Show>
            {tab.label}
          </li>
        )}
      </For>
    </ul>
    <section>
      {props.tabs[activeTab()].component()}
    </section>
  </div>);
};

export default TabView;
