import { Icons } from "../components/Icons/Icons";
import { current_page_id } from "../constants/shared";
import { defineTraits, getProjectData } from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";

/**
 *
 * @param {import('grapesjs').Editor} param0
 */
export const Link = async ({ editor }) => {
  editor.Components.removeType("link");
  editor.Components.addType("link", {
    // extend: "link",
    isComponent: (el) => {
      if (el.tagName && el.tagName.toLowerCase() == "a") {
        return { type: "link" };
      }
      return false;
    },
    model: {
      defaults: {
        icon: reactToStringMarkup(
          Icons.link({
            strokeColor: "white",
            fill: "white",
            width: 20,
            height: 20,
          })
        ),
        droppable: false,
        draggable: true,
        editable: true,
        tagName: "a",
        traits: defineTraits([
          {
            name: "href",
            label: `choose link`,
            placeholder: "Choose link or type custom",
            role: "attribute",
            type: "select",
            keywords: ({ projectData }) => {
              console.log("project Data : ", projectData);

              if (!projectData || !Object.keys(projectData).length) return [];
              //   const pages = await (await getProjectData()).pages;
              const pagesLinks = Object.keys(projectData.pages)
                .map((key) => {
                  const currentPage = localStorage
                    .getItem(current_page_id)
                    .toLowerCase();
                  if (currentPage == "index") {
                    return key.toLowerCase() == "index"
                      ? null
                      : `./pages/${key.toLowerCase()}.html`;
                  } else {
                    return key.toLowerCase() == "index"
                      ? "../index.html"
                      : `../pages/${key.toLowerCase()}.html`;
                  }
                })
                .filter(Boolean);

              return pagesLinks;
            },
          },
          {
            name: "target",
            label: "Open in new tap",
            role: "handler",
            type: "switch",
            init({ editor, trait, model }) {
              trait.value = Boolean(model.getAttributes().target);
            },
            onSwitch(value) {
              const sle = editor.getSelected();
              if (!sle) return;
              console.log("sitch value  : ", value);

              sle.addAttributes({ target: value ? "_blank" : "" });
            },
          },
        ]),
      },
    },
  });
};
