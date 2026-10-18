#[tauri::command]  
fn get_args() -> Vec<String> {  
    std::env::args().collect()  
}  

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_udp::init())
        .invoke_handler(tauri::generate_handler![get_args])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                use tauri::Manager;

                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            Ok(())
        })
        // .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
