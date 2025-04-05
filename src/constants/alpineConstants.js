export const alpineEventModifiers = [
  "prevent", // Prevents default event behavior (e.g., form submission)
  "stop", // Stops event propagation (e.g., bubbling)
  "once", // Runs handler once, then removes it
  "passive", // Marks listener as passive for performance
  "capture", // Triggers during capture phase instead of bubbling
  "window", // Attaches listener to window object
  "document", // Attaches listener to document object
  "debounce", // Delays execution until pause (e.g., `.debounce.500ms`)
  "throttle", // Limits execution to once per interval (e.g., `.throttle.200ms`)
  "self", // Triggers only if target is the element itself
  "camel", // Converts camelCase events to kebab-case (e.g., `myEvent` → `my-event`)
  "dot", // Supports events with dots (e.g., `show.bs.modal`)
  "outside", // Triggers on clicks outside the element (mouse-specific)
  "shift", // Triggers when Shift key is held (mouse or keyboard)
  "ctrl", // Triggers when Ctrl key is held (mouse or keyboard)
  "alt", // Triggers when Alt key is held (mouse or keyboard)
  "meta", // Triggers when Meta key (Command/Windows) is held (mouse or keyboard)
  "left", // Mouse: left button; Keyboard: ArrowLeft key
  "middle", // Mouse: middle button
  "right", // Mouse: right button; Keyboard: ArrowRight key
  "enter", // Triggers on Enter key (keyboard)
  "space", // Triggers on Spacebar (keyboard)
  "tab", // Triggers on Tab key (keyboard)
  "esc", // Triggers on Escape key (keyboard, alias for "escape")
  "escape", // Triggers on Escape key (keyboard)
  "up", // Triggers on ArrowUp key (keyboard)
  "down", // Triggers on ArrowDown key (keyboard)
  "home", // Triggers on Home key (keyboard)
  "end", // Triggers on End key (keyboard)
  "pageup", // Triggers on PageUp key (keyboard)
  "pagedown", // Triggers on PageDown key (keyboard)
  "exact", // Requires exact modifier match (keyboard, e.g., `.ctrl.exact`)
];

export const alpineTransition = [
  "enter",
  "enter-start",
  "enter-end",
  "leave",
  "leave-start",
  "leave-end",
];

export const alpineTransitionModifiers = [
  "opacity", // Transitions only opacity, no scale
  "scale", // Transitions only scale, no opacity
  "duration", // Sets transition duration (e.g., `.duration.500ms`)
  "delay", // Delays the transition (e.g., `.delay.200ms`)
  "origin", // Sets the transform origin (e.g., `.origin.top`)
  "ease",
];

