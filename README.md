## Prerequisites
* [VS Code](https://code.visualstudio.com/)
* [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
*  [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
* `apt autoremove rustc`
* `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
* `sudo apt install webkitgtk3-devel libgtk-3-dev libsoup-3.0-dev javascriptcoregtk-4.1-dev`

->
download linuxdeploy.appimg -> symlink in bin
https://github.com/linuxdeploy/linuxdeploy.git

in lib.rs, add
.plugin(tauri_plugin_udp::init())

`npm i @kuyoonjo/tauri-plugin-udp`
in src-tauri: `cargo add tauri-plugin-udp`


## Run / debug
`npm run tauri dev`

## Maintenance
npm update

npm outdated

npm install vite@latest

cargo add tauri@2.11.1
cargo add tauri-plugin-fs@2.5.1


## Troubleshooting
* white background
  https://github.com/tauri-apps/wry/issues/884
  edit
  `code ~/.config/gtk-3.0/settings.ini`
  set
  ```
  [Settings]
  gtk-application-prefer-dark-theme=1
  ```




#gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
GTK_THEME=Mint-L-Dark-Purple:dark npm run tauri dev

https://github.com/tauri-apps/wry/issues/884
