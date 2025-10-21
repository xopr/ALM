import { createEffect, createSignal, lazy, onMount, Show } from "solid-js";
import "./App.css";
import TabView from "./components/tabView/TabView";
const Effects = lazy(() => import("./sections/Effects"));

import { Lights } from "./sections/Lights";
import { Control } from "./sections/Control";
import { ItemData, LightGroupTree } from "./sections/LightGroupTree";
import DragNode from "./components/DragNode";
import { DataFrame, Effect, IEffect } from "../public/Effect";
import Help from "./sections/Help";

import lightgroup_add_svg from "/src/assets/lightgroup.svg";
import lightgroup_remove_svg from "/src/assets/lightgroup.svg";
import effect_on_svg from "/src/assets/effect.svg";
import effect_off_svg from "/src/assets/effect.svg";
import effect_remove_svg from "/src/assets/effect.svg";
import delete_svg from "/src/assets/delete.svg";
import { TreeItemProps } from "./components/treelist/TreeItem";

function App() {
  const [activeEffect, setActiveEffect] = createSignal<Effect>();
  const [effect, setEffect] = createSignal<Effect>();
  const [effectInstances, setEffectInstances] = createSignal<IEffect[]>();
  const [selectedItem, setSelectedItem] = createSignal<TreeItemProps<ItemData>>();

  createEffect(() => {
    // Selected effect instances to control
    // console.log(effectInstances());
  })

  return (
    <main>
      <div class="inbetweenContainer vertical">
        <LightGroupTree class="itemContainer inbetweenChild list" onEffect={setActiveEffect} onSelect={setSelectedItem} onInstances={setEffectInstances}/>
        <div>
          <button disabled={!selectedItem()?.data?.segment}><img src={lightgroup_add_svg}/></button>
          <button disabled={!selectedItem()?.data?.segment}><img src={lightgroup_remove_svg}/></button>
          {/* <button><img src={effect_on_svg}/></button> */}
          <button disabled={!selectedItem()?.data?.effect}><img src={effect_remove_svg}/></button>
          <Show when={false/*drag*/}>
            <button><img src={delete_svg}/></button>
          </Show>
        </div>
      </div>
      <TabView>
        <section
          data-label="Lights"
          class="contentContainer"
        >
          <Lights /*effect={}?*/ /*light={}*/ />
        </section>
        {/* <section
          data-label="Map"
          class="contentContainer"
        >
        </section> */}
        <section
          data-label="Control"
          class="contentContainer"
        >
          <Control effect={activeEffect()} instances={effectInstances()} />
        </section>
        {/* <section
          data-label="Remote"
          class="contentContainer"
        >
        </section> */}
        <section
          data-label="Effects"
          class="contentContainer"
        >
          <Effects
            onClick={(e) => {
              // Invoke as function since Effect constructor is a function on its own.
              setEffect(() => e);
            }}
            effect={effect()}
          />
        </section>
        <section
          data-label="Help"
          class="contentContainer"
        >
          <Help/>
        </section>
      </TabView>
      <DragNode/>
    </main>
  );
}

export default App;
