// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Window;

#[tauri::command]
fn hide_app(window: Window) {
    window.hide().expect("Unable to hide window");
}

#[tauri::command]
fn show_app(window: Window) {
    window.show().expect("Unable to show window");
}

#[tauri::command]
fn log_message(_: Window, message: String) {
    println!("{}", message);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![hide_app, show_app, log_message])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

