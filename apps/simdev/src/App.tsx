import { createEffect, onCleanup, onMount } from "solid-js";
import "./App.css";
import { bind, listen, unbind } from "@kuyoonjo/tauri-plugin-udp";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { createStore } from "solid-js/store";

function App() {
  let ref!: HTMLCanvasElement
  const [size, setSize] = createStore({width: 70, height: 210});
  
  createEffect(() => {
    ref.width = size.width;
    ref.height = size.height;
  })

  onMount(async () => {
    const window = getCurrentWindow();
    const { width, height } = await window.innerSize();
    setSize({ width, height });

    const args = await invoke<string[]>("get_args");
    const port = parseInt(args[1] ?? 7000, 10); // Original Art-Net is 6454

    await window.setTitle(`SimDev ${port}`);

    ref.addEventListener("pointerdown", (e) => {
      // data-tauri-drag-region is not working on Linux using touch
      const appWindow = getCurrentWindow();
      appWindow.startDragging();
    });
    ref.addEventListener("touchstart", (e) => {
      const appWindow = getCurrentWindow();
      appWindow.startDragging();
    });

    window.onResized(({ payload }) => {
      const { width, height } = payload;
      setSize({ width, height });
    });

    try {
      await bind("SimDev", `0.0.0.0:${port}`);
    } catch (e) {
      console.warn("Failed to bind:", e);
    }

    try {
      const unlisten = await listen(({ payload }) => {
        const data = payload.data.slice(18 + 9);
        const context = ref.getContext("2d");
        if (!context) return;

        let x = 6;
        let y = 0;
        for (let ch = 0; ch < data.length; ch += 3) {
          const r = data[ch + 0];
          const g = data[ch + 1];
          const b = data[ch + 2];

          context.fillStyle = `rgb(${r}, ${g}, ${b})`;
          context.fillRect(10 * x, 10 * y, 10, 10);
          x--;
          if (x < 0) {
            x = 6;
            y++;
          }
        }
      });

      onCleanup(() => {
        unlisten();
        unbind("SimDev");

      })
    } catch (e) {
      console.warn("Failed to bind:", e);
    }
  })

  return <canvas ref={ref}/>;
}

export default App;
