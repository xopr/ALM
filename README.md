# Tauri + Solid + Typescript

This template should help get you started developing with Tauri, Solid and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)





apt autoremove rustc

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh





sudo apt install webkitgtk3-devel

sudo apt install libgtk-3-dev


sudo apt install libsoup-3.0-dev


sudo apt install javascriptcoregtk-4.1-dev



->
download linuxdeploy.appimg -> symlink in bin
https://github.com/linuxdeploy/linuxdeploy.git



in lib.rs, add
.plugin(tauri_plugin_udp::init())

`npm i @kuyoonjo/tauri-plugin-udp`
in src-tauri: `cargo add tauri-plugin-udp`









`npm run tauri dev`




?? white webview in dev
export WEBKIT_DISABLE_COMPOSITING_MODE=1
export WEBKIT_DISABLE_DMABUF_RENDERER=1


https://github.com/tauri-apps/wry/issues/884

edit
code ~/.config/gtk-3.0/settings.ini
set
[Settings]
gtk-application-prefer-dark-theme=1
