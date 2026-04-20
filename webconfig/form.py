#!/usr/bin/python3

from dataclasses import dataclass, field


@dataclass
class FormField:
    offset: int
    name: str
    default: int | None = None
    values: dict[int, str] = field(default_factory=dict)
    data_type: str = "int32"
    elem: str | None = None


@dataclass
class KeybindField:
    name: str
    modifier_key: int
    key1_key: int
    key2_key: int
    default_modifier: int = 0
    default_key1: int = 0
    default_key2: int = 0


KEY_OPTIONS = {
    0x00: "None",
    0x04: "A",
    0x05: "B",
    0x06: "C",
    0x07: "D",
    0x08: "E",
    0x09: "F",
    0x0A: "G",
    0x0B: "H",
    0x0C: "I",
    0x0D: "J",
    0x0E: "K",
    0x0F: "L",
    0x10: "M",
    0x11: "N",
    0x12: "O",
    0x13: "P",
    0x14: "Q",
    0x15: "R",
    0x16: "S",
    0x17: "T",
    0x18: "U",
    0x19: "V",
    0x1A: "W",
    0x1B: "X",
    0x1C: "Y",
    0x1D: "Z",
    0x1E: "1",
    0x1F: "2",
    0x20: "3",
    0x21: "4",
    0x22: "5",
    0x23: "6",
    0x24: "7",
    0x25: "8",
    0x26: "9",
    0x27: "0",
    0x28: "Enter",
    0x29: "Escape",
    0x2A: "Backspace",
    0x2B: "Tab",
    0x2C: "Space",
    0x2D: "Minus",
    0x2E: "Equal",
    0x2F: "[",
    0x30: "]",
    0x31: "\\",
    0x33: ";",
    0x34: "'",
    0x35: "`",
    0x36: ",",
    0x37: ".",
    0x38: "/",
    0x39: "Caps Lock",
    0x3A: "F1",
    0x3B: "F2",
    0x3C: "F3",
    0x3D: "F4",
    0x3E: "F5",
    0x3F: "F6",
    0x40: "F7",
    0x41: "F8",
    0x42: "F9",
    0x43: "F10",
    0x44: "F11",
    0x45: "F12",
    0x46: "Print Screen",
    0x47: "Scroll Lock",
    0x48: "Pause",
    0x49: "Insert",
    0x4A: "Home",
    0x4B: "Page Up",
    0x4C: "Delete",
    0x4D: "End",
    0x4E: "Page Down",
    0x4F: "Right",
    0x50: "Left",
    0x51: "Down",
    0x52: "Up",
    0x53: "Num Lock",
}

MODIFIER_BITS = {
    0x01: "Left Ctrl",
    0x02: "Left Shift",
    0x04: "Left Alt",
    0x08: "Left GUI",
    0x10: "Right Ctrl",
    0x20: "Right Shift",
    0x40: "Right Alt",
    0x80: "Right GUI",
}

STATUS_ = [
    FormField(78, "Running FW version", None, {}, "uint16", elem="fw_version"),
    FormField(79, "Running FW checksum", None, {}, "uint32", elem="hex_info"),
]

CONFIG_ = [
    FormField(1001, "Mouse", elem="label"),
    FormField(71, "Force Mouse Boot Mode", None, {}, "uint8", "checkbox"),
    FormField(78, "Start in Gaming Mode", None, {}, "uint8", "checkbox"),
    FormField(75, "Enable Acceleration", None, {}, "uint8", "checkbox"),
    FormField(77, "Jump Threshold", 0, {"min": 0, "max": 3000}, "uint16", "range"),
    FormField(1002, "Keyboard", elem="label"),
    FormField(72, "Force KBD Boot Protocol", None, {}, "uint8", "checkbox"),
    FormField(73, "KBD LED as Indicator", None, {}, "uint8", "checkbox"),
    FormField(76, "Enforce Ports", None, {}, "uint8", "checkbox"),
]

OUTPUT_ = [
    FormField(1, "Screen Count", 1, {1: "1", 2: "2", 3: "3"}, "uint32"),
    FormField(2, "Speed X", 16, {"min": 1, "max": 100}, "int32", "range"),
    FormField(3, "Speed Y", 16, {"min": 1, "max": 100}, "int32", "range"),
    FormField(4, "Border Top", None, {}, "int32"),
    FormField(5, "Border Bottom", None, {}, "int32"),
    FormField(
        6,
        "Operating System",
        1,
        {1: "Linux", 2: "MacOS", 3: "Windows", 4: "Android", 255: "Other"},
        "uint8",
    ),
    FormField(7, "Screen Position", 1, {1: "Left", 2: "Right"}, "uint8"),
    FormField(
        8, "Cursor Park Position", 0, {0: "Top", 1: "Bottom", 3: "Previous"}, "uint8"
    ),
    FormField(1003, "Screensaver", elem="label"),
    FormField(9, "Mode", 0, {0: "Disabled", 1: "Pong", 2: "Jitter"}, "uint8"),
    FormField(10, "Only If Inactive", None, {}, "uint8", "checkbox"),
    FormField(11, "Idle Time (μs)", None, {}, "uint64"),
    FormField(12, "Max Time (μs)", None, {}, "uint64"),
]

KEYBINDS_ = [
    KeybindField("Output Toggle", 83, 84, 85, 0x01, 0x39, 0x00),
    KeybindField("Mouse Zoom", 86, 87, 88, 0x50, 0x00, 0x00),
    KeybindField("Switch Lock", 89, 90, 91, 0x10, 0x0E, 0x00),
    KeybindField("Screen Lock", 92, 93, 94, 0x10, 0x0F, 0x00),
    KeybindField("Gaming Mode", 95, 96, 97, 0x21, 0x0A, 0x00),
    KeybindField("Screensaver Pong", 98, 99, 100, 0x21, 0x16, 0x00),
    KeybindField("Screensaver Jitter", 101, 102, 103, 0x21, 0x0B, 0x00),
    KeybindField("Screensaver Disable", 104, 105, 106, 0x21, 0x1B, 0x00),
    KeybindField("Record Border Y", 107, 108, 109, 0x20, 0x45, 0x1C),
    KeybindField("Config Mode", 110, 111, 112, 0x21, 0x07, 0x12),
]


def generate_output(base, data):
    output = [
        {
            "name": field.name,
            "key": base + field.offset,
            "default": field.default,
            "values": field.values,
            "type": field.data_type,
            "elem": field.elem,
        }
        for field in data
    ]
    return output


def generate_keybinds(data):
    output = [
        {
            "name": field.name,
            "elem": "keybind",
            "modifier_key": field.modifier_key,
            "key1_key": field.key1_key,
            "key2_key": field.key2_key,
            "default_modifier": field.default_modifier,
            "default_key1": field.default_key1,
            "default_key2": field.default_key2,
            "key_options": KEY_OPTIONS,
            "modifier_bits": MODIFIER_BITS,
        }
        for field in data
    ]
    return output


def output_A(base=10):
    return generate_output(base, data=OUTPUT_)


def output_B(base=40):
    return generate_output(base, data=OUTPUT_)


def output_status():
    return generate_output(0, data=STATUS_)


def output_config():
    return generate_output(0, data=CONFIG_)


def output_keybinds():
    return generate_keybinds(data=KEYBINDS_)
