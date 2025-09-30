/**
 *
 * @param {import('grapesjs').Editor} editor
 * @returns
 */
export const editorKeymaps = (editor) => {
  //   editor.Keymaps.add("save-project", {
  //     keys: "ctrl+s, command+s", // Supports multiple keys, like Ctrl+S or Cmd+S
  //     handler: (editor, e) => {
  //       e.preventDefault(); // Prevent the browser's default action
  //       console.log("Shortcut triggered: Save");
  //       editor.store(); // Example: save the project
  //     },
  //   });

  editor.Keymaps.add("store-shortcut", "ctrl+s, command+s", "store", {
    prevent: true,
    force: true,
  });
  editor.Keymaps.add(
    "preview-shortcut",
    "ctrl+p, command+p",
    "toggle-preview",
    { prevent: true, force: true }
  );
  editor.Keymaps.add("outline-shortcut", "ctrl+o, command+o", "ui:outline", {
    prevent: true,
    force: true,
  });
  editor.Keymaps.add("gsap-run", "ctrl+g, command+g", "gsap:run-all", {
    prevent: true,
    force: true,
  });
  editor.Keymaps.add("gsap-run", "ctrl+k, command+k", "gsap:kill-all", {
    prevent: true,
    force: true,
  });
};
