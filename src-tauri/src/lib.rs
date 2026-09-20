use std::fs;
use std::collections::HashMap;
use std::sync::mpsc::{self, Sender};
use std::thread;

use midir::{Ignore, MidiInput, MidiOutput};
use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, Wry};


pub struct MidiState {
    command_tx: Sender<MidiCommand>,
}

enum MidiCommand {
    ConnectInput {
        port_index: usize,
        response: Sender<Result<String, String>>,
    },
    DisconnectInput,

    ConnectOutput {
        port_index: usize,
        response: Sender<Result<String, String>>,
    },
    DisconnectOutput,

    SendOutput {
        message: Vec<u8>,
        response: Sender<Result<(), String>>,
    },
}

#[derive(Debug, Clone, Serialize)]
pub struct MidiMessage {
    pub timestamp: u64,
    pub message: Vec<u8>,
}

fn start_midi_worker(app: AppHandle<Wry>) -> Sender<MidiCommand> {
    let (command_tx, command_rx) = mpsc::channel::<MidiCommand>();

    thread::spawn(move || {
        let mut input_connection = None;
        let mut output_connection = None;

        while let Ok(command) = command_rx.recv() {
            match command {
                MidiCommand::ConnectInput {
                    port_index,
                    response,
                } => {
                    // input_connection = None;

                    let result = (|| -> Result<String, String> {
                        let mut midi_in =
                            MidiInput::new("m-vave-input")
                                .map_err(|e| e.to_string())?;

                        midi_in.ignore(Ignore::None);

                        let ports = midi_in.ports();

                        let port = ports.get(port_index).ok_or_else(|| {
                            format!(
                                "Invalid MIDI input port: {} ({} ports available)",
                                port_index,
                                ports.len()
                            )
                        })?;

                        let port_name =
                            midi_in.port_name(port).map_err(|e| e.to_string())?;

                        let app_handle = app.clone();

                        let connection = midi_in
                            .connect(
                                port,
                                "m-vave-input",
                                move |timestamp, message, _| {
                                    let event = MidiMessage {
                                        timestamp,
                                        message: message.to_vec(),
                                    };

                                    if let Err(err) =
                                        app_handle.emit("midi-input", event)
                                    {
                                        eprintln!(
                                            "Failed to emit MIDI event: {}",
                                            err
                                        );
                                    }
                                },
                                (),
                            )
                            .map_err(|e| e.to_string())?;

                        input_connection = Some(connection);

                        Ok(port_name)
                    })();

                    let _ = response.send(result);
                }

                MidiCommand::DisconnectInput => {
                    // input_connection = None;
                }

                MidiCommand::ConnectOutput {
                    port_index,
                    response,
                } => {
                    output_connection = None;

                    let result = (|| -> Result<String, String> {
                        let midi_out =
                            MidiOutput::new("m-vave-output")
                                .map_err(|e| e.to_string())?;

                        let ports = midi_out.ports();

                        let port = ports.get(port_index).ok_or_else(|| {
                            format!(
                                "Invalid MIDI output port: {} ({} ports available)",
                                port_index,
                                ports.len()
                            )
                        })?;

                        let port_name =
                            midi_out.port_name(port).map_err(|e| e.to_string())?;

                        let connection = midi_out
                            .connect(
                                port,
                                "m-vave-output",
                            )
                            .map_err(|e| e.to_string())?;

                        output_connection = Some(connection);

                        Ok(port_name)
                    })();

                    let _ = response.send(result);
                }

                MidiCommand::DisconnectOutput => {
                    // output_connection = None;
                }

                MidiCommand::SendOutput {
                    message,
                    response,
                } => {
                    let result = match output_connection.as_mut() {
                        Some(connection) => {
                            connection
                                .send(&message)
                                .map_err(|e| e.to_string())
                        }
                        None => Err("No MIDI output connected".to_string()),
                    };

                    let _ = response.send(result);
                }
            }
        }

        // Connections are dropped when the worker exits.
        // input_connection = None;
        // output_connection = None;
    });

    command_tx
}

fn start_midi_monitor(app: AppHandle<Wry>) {
    thread::spawn(move || {
        let mut was_present = false;

        loop {
            let present = midi_input_exists("SMC-Mixer");

            if present && !was_present {
                let _ = app.emit("midi-device-connected", ());
            }

            if !present && was_present {
                let _ = app.emit("midi-device-disconnected", ());
            }

            was_present = present;

            thread::sleep(std::time::Duration::from_secs(1));
        }
    });
}

fn midi_input_exists(name: &str) -> bool {
    let midi_in = match MidiInput::new("m-vave-monitor") {
        Ok(midi_in) => midi_in,
        Err(_) => return false,
    };

    // for port in midi_in.ports() {
    //     match midi_in.port_name(&port) {
    //         Ok(port_name) => {
    //             println!("MIDI input: {}", port_name);
    //         }
    //         Err(err) => {
    //             println!("Failed to get MIDI port name: {}", err);
    //         }
    //     }
    // }

    midi_in
        .ports()
        .iter()
        .filter_map(|port| midi_in.port_name(port).ok())
        .any(|port_name| port_name.contains(name))
}

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

#[tauri::command]
fn collect_midi_inputs() -> HashMap<usize, String>  {
    let midi_in = MidiInput::new("m-vave-input");

    match midi_in {
      Ok(midi_in) => {
        let mut midi_input_connections = HashMap::new();
        for (i, p) in midi_in.ports().iter().enumerate() {
          let port_name = midi_in.port_name(p);
          
          match port_name {
            Ok(port_name) => {
              midi_input_connections.insert(i, port_name);
            }
            Err(e) => {
              println!("Error getting port name: {}", e);
            }
          }
        }
        midi_input_connections
      }
      Err(_) => HashMap::new(),
    }
}

#[tauri::command]
fn connect_midi_output(
    state: tauri::State<'_, MidiState>,
    port_index: usize,
) -> Result<String, String> {
    let (response_tx, response_rx) = mpsc::channel();

    state
        .command_tx
        .send(MidiCommand::ConnectOutput {
            port_index,
            response: response_tx,
        })
        .map_err(|e| e.to_string())?;

    response_rx
        .recv()
        .map_err(|e| e.to_string())?
}

#[tauri::command]
fn disconnect_midi_output(
    state: tauri::State<'_, MidiState>,
) -> Result<(), String> {
    state
        .command_tx
        .send(MidiCommand::DisconnectOutput)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn connect_midi_input(
    state: tauri::State<'_, MidiState>,
    port_index: usize,
) -> Result<String, String> {
    let (response_tx, response_rx) = mpsc::channel();

    state
        .command_tx
        .send(MidiCommand::ConnectInput {
            port_index,
            response: response_tx,
        })
        .map_err(|e| e.to_string())?;

    response_rx
        .recv()
        .map_err(|e| e.to_string())?
}

#[tauri::command]
fn disconnect_midi_input(
    state: tauri::State<'_, MidiState>,
) -> Result<(), String> {
    state
        .command_tx
        .send(MidiCommand::DisconnectInput)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn collect_midi_outputs() -> HashMap<usize, String>  {
    let midi_out = MidiOutput::new("m-vave-outputs");

    match midi_out {
      Ok(midi_out) => {
        let mut midi_output_connections = HashMap::new();
        for (i, p) in midi_out.ports().iter().enumerate() {
          let port_name = midi_out.port_name(p);
          
          match port_name {
            Ok(port_name) => {
              midi_output_connections.insert(i, port_name);
            }
            Err(e) => {
              println!("Error getting port name: {}", e);
            }
          }
        }
        midi_output_connections
      }
      Err(_) => HashMap::new(),
    }
}

#[tauri::command]
fn list_midi_connections() -> HashMap<String, HashMap<usize, String>> {
  let mut midi_connections = HashMap::new();
  midi_connections.insert("inputs".to_string(), collect_midi_inputs());
  midi_connections.insert("outputs".to_string(), collect_midi_outputs());
  midi_connections
}

#[tauri::command]
fn trigger_note(
    state: tauri::State<'_, MidiState>,
    c: u8,
    n: u8,
    v: u8,
) -> Result<(), String> {
    let message = vec![c, n, v];

    let (response_tx, response_rx) = mpsc::channel();

    state
        .command_tx
        .send(MidiCommand::SendOutput {
            message,
            response: response_tx,
        })
        .map_err(|e| e.to_string())?;

    response_rx
        .recv()
        .map_err(|e| e.to_string())?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_udp::init())
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }

            let command_tx = start_midi_worker(app.handle().clone());
            app.manage(MidiState { command_tx });
            start_midi_monitor(app.handle().clone());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            read_file,
            effect_list,
            collect_midi_inputs,
            collect_midi_outputs,
            list_midi_connections,
            trigger_note,
            connect_midi_output,
            disconnect_midi_output,
            connect_midi_input,
            disconnect_midi_input,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
