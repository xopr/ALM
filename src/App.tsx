import { createSignal, lazy } from "solid-js";
import "./App.css";
import TabView from "./components/tabView/TabView";
const Effects = lazy(() => import("./sections/Effects"));

import sectionStyles from "./sections/Section.module.css";
import { Lights } from "./sections/Lights";
import { Control } from "./sections/Control";
import { LightGroupTree } from "./sections/LightGroupTree";
import DragNode from "./components/DragNode";
import { Effect } from "../public/Effect";
import Help from "./sections/Help";

function App() {
  const [effectName, setEffectName] = createSignal<string>();
  const [effect, setEffect] = createSignal<Effect>();
  // const [effectInstance, setEffectInstance] = createSignal<Effect>();

  return (
    <main class={`${sectionStyles.container}`}>
      <LightGroupTree onEffectName={setEffectName}/>
      <TabView>
        <section
          data-label="Lights"
          class={sectionStyles.vertical}
        >
          <Lights /*effect={}?*/ /*light={}*/ />
        </section>
        {/* <section
          data-label="Map"
          class={sectionStyles.vertical}
        >
        </section> */}
        <section
          data-label="Control"
          class={sectionStyles.vertical}
        >
          <Control effectName={effectName()} effect={undefined} />
        </section>
        {/* <section
          data-label="Remote"
          class={sectionStyles.vertical}
        >
        </section> */}
        <section
          data-label="Effects"
          class={sectionStyles.vertical}
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
          class={sectionStyles.vertical}
        >
          <Help/>
        </section>
      </TabView>
      <DragNode/>
    </main>
  );
}

export default App;
