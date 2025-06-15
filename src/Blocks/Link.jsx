import { Icons } from "../components/Icons/Icons";
import { current_page_id } from "../constants/shared";
import { defineTraits, getProjectData } from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";

/**
 *
 * @param {import('grapesjs').Editor} param0
 */
export const Link = async ({ editor }) => {
  editor.Components.addType("link", {
    extend: "link",
    model: {
      defaults: {
        icon:reactToStringMarkup(Icons.link({strokeColor:'white', fill:'white' , width:20 , height:20})),
        droppable:false,
        editable:true,
        traits: defineTraits([
          {
            name: "href",
            label: `choose link`,
            placeholder: "Choose link or type custom",
            role: "attribute",
            type: "select",
            keywords:  ({ projectData }) => {
                console.log('project Data : ' , projectData);
                
                if(!projectData || !Object.keys(projectData).length)return[]
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
        ]),
      },
    },
  });
};
