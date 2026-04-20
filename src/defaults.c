/*
 * This file is part of DeskHop (https://github.com/hrvach/deskhop).
 * Copyright (c) 2025 Hrvoje Cavrak
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * See the file LICENSE for the full license text.
 */
#include "main.h"

/* Default configuration */
const config_t default_config = {
    .magic_header = 0xB00B1E5,
    .version = CURRENT_CONFIG_VERSION,
    .output[OUTPUT_A] =
        {
            .number = OUTPUT_A,
            .speed_x = MOUSE_SPEED_A_FACTOR_X,
            .speed_y = MOUSE_SPEED_A_FACTOR_Y,
            .border = {
                .top = 0,
                .bottom = MAX_SCREEN_COORD,
            },
            .screen_count = 1,
            .screen_index = 1,
            .os = OUTPUT_A_OS,
            .pos = RIGHT,
            .screensaver = {
                .mode = SCREENSAVER_A_MODE,
                .only_if_inactive = SCREENSAVER_A_ONLY_IF_INACTIVE,
                .idle_time_us = (uint64_t)SCREENSAVER_A_IDLE_TIME_SEC * 1000000,
                .max_time_us = (uint64_t)SCREENSAVER_A_MAX_TIME_SEC * 1000000,
            },
            .gaming_edge_threshold = GAMING_EDGE_THRESHOLD,
            .gaming_edge_window_ms = GAMING_EDGE_WINDOW_MS,
            .gaming_edge_max_vertical = GAMING_EDGE_MAX_VERTICAL,
        },
    .output[OUTPUT_B] =
        {
            .number = OUTPUT_B,
            .speed_x = MOUSE_SPEED_B_FACTOR_X,
            .speed_y = MOUSE_SPEED_B_FACTOR_Y,
            .border = {
                .top = 0,
                .bottom = MAX_SCREEN_COORD,
            },
            .screen_count = 1,
            .screen_index = 1,
            .os = OUTPUT_B_OS,
            .pos = LEFT,
            .screensaver = {
                .mode = SCREENSAVER_B_MODE,
                .only_if_inactive = SCREENSAVER_B_ONLY_IF_INACTIVE,
                .idle_time_us = (uint64_t)SCREENSAVER_B_IDLE_TIME_SEC * 1000000,
                .max_time_us = (uint64_t)SCREENSAVER_B_MAX_TIME_SEC * 1000000,
            },
            .gaming_edge_threshold = GAMING_EDGE_THRESHOLD,
            .gaming_edge_window_ms = GAMING_EDGE_WINDOW_MS,
            .gaming_edge_max_vertical = GAMING_EDGE_MAX_VERTICAL,
        },
.enforce_ports = ENFORCE_PORTS,
    .force_kbd_boot_protocol = ENFORCE_KEYBOARD_BOOT_PROTOCOL,
    .force_mouse_boot_mode = false,
    .force_gaming_mode = false,
    .enable_acceleration = ENABLE_ACCELERATION,
    .kbd_led_as_indicator = KBD_LED_AS_INDICATOR,
    .jump_threshold = JUMP_THRESHOLD,
    .gaming_edge_enabled = false,
    .keybind_output_toggle = {
        .modifier = KEYBOARD_MODIFIER_LEFTCTRL,
        .key1 = HID_KEY_CAPS_LOCK,
        .key2 = 0,
    },
    .keybind_mouse_zoom = {
        .modifier = KEYBOARD_MODIFIER_RIGHTALT | KEYBOARD_MODIFIER_RIGHTCTRL,
        .key1 = 0,
        .key2 = 0,
    },
    .keybind_switch_lock = {
        .modifier = KEYBOARD_MODIFIER_RIGHTCTRL,
        .key1 = HID_KEY_K,
        .key2 = 0,
    },
    .keybind_screen_lock = {
        .modifier = KEYBOARD_MODIFIER_RIGHTCTRL,
        .key1 = HID_KEY_L,
        .key2 = 0,
    },
    .keybind_gaming_mode = {
        .modifier = KEYBOARD_MODIFIER_LEFTCTRL | KEYBOARD_MODIFIER_RIGHTSHIFT,
        .key1 = HID_KEY_G,
        .key2 = 0,
    },
    .keybind_screensaver_pong = {
        .modifier = KEYBOARD_MODIFIER_LEFTCTRL | KEYBOARD_MODIFIER_RIGHTSHIFT,
        .key1 = HID_KEY_S,
        .key2 = 0,
    },
    .keybind_screensaver_jitter = {
        .modifier = KEYBOARD_MODIFIER_LEFTCTRL | KEYBOARD_MODIFIER_RIGHTSHIFT,
        .key1 = HID_KEY_J,
        .key2 = 0,
    },
    .keybind_screensaver_disable = {
        .modifier = KEYBOARD_MODIFIER_LEFTCTRL | KEYBOARD_MODIFIER_RIGHTSHIFT,
        .key1 = HID_KEY_X,
        .key2 = 0,
    },
    .keybind_record_border = {
        .modifier = KEYBOARD_MODIFIER_RIGHTSHIFT,
        .key1 = HID_KEY_F12,
        .key2 = HID_KEY_Y,
    },
    .keybind_config_mode = {
        .modifier = KEYBOARD_MODIFIER_LEFTCTRL | KEYBOARD_MODIFIER_RIGHTSHIFT,
        .key1 = HID_KEY_C,
        .key2 = HID_KEY_O,
    },
};
