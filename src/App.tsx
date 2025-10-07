import { lazy, onCleanup, onMount, Show } from "solid-js";
import "./App.css";
// import { Effect } from "./helpers/Effect";
// import { Matrix } from "./helpers/Matrix";
// import { Strip2D } from "./helpers/Strip2D";
// import { Fire2 } from "./helpers/Fire";
import TabView from "./components/tabView/TabView";
// import { Effects } from "./sections/Effects";
const Effects = lazy(() => import("./sections/Effects"));

import sectionStyles from "./sections/Section.module.css";
import { Lights } from "./sections/Lights";
import { Control } from "./sections/Control";
import { LightGroupTree } from "./sections/LightGroupTree";

// let effect: Effect;

function App() {
  onMount(async () => {
    // effect = new Matrix(new Strip2D(7,21));
    // effect = new Fire2(new Strip2D(7,21));
    // effect.run()
  });

  onCleanup(async () => {
    // effect.cleanup();
  })

  return (
    <main class={sectionStyles.container}>
      <LightGroupTree/>
      <TabView>
        <section
          data-label="Lights"
          class={sectionStyles.vertical}
        >
          <Lights/>
        </section>
        <section
          data-label="Control"
          class={sectionStyles.vertical}
        >
          <Control/>
        </section>
        <section
          data-label="Effects"
          class={sectionStyles.vertical}
        >
          <Show when={true}>
            <Effects/>
          </Show>
        </section>
      </TabView>
    </main>
  );
}

export default App;
