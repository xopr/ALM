use std::fs;

#[tauri::command]
fn read_file(file_name: String) -> String {
    fs::read_to_string(file_name).unwrap_or_default()
}

#[tauri::command]
fn effect_list() -> Vec<String> {
    let dirs = [
        "../../../public/effects/",
        "../public/effects/",
        "./effects/",
    ];

    dirs.iter()
        .flat_map(|dir| {
            fs::read_dir(dir)
                .into_iter()
                .flatten()
                .flatten()
        })
        .map(|entry| entry.path())
        .filter(|path| {
            path.is_file()
                && path.extension().and_then(|ext| ext.to_str()) == Some("ts")
        })
        .filter_map(|path| {
            fs::canonicalize(path)
                .ok()
                .map(|path| path.to_string_lossy().into_owned())
        })
        .collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_udp::init())
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                use tauri::Manager;

                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
          read_file,
          effect_list,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
