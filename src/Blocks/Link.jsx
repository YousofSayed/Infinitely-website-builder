import { wp_get_post_types } from "@/Apps/wordpress/functions";
import { Select } from "@/components/Editor/Protos/Select";
import { Icons } from "@/components/Icons/Icons";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { current_page_id } from "@/constants/shared";
import { fetcherWorker } from "@/helpers/defineWorkers";
import {
  callWorkerCommand,
  defineTraits,
  doInNormal,
  getProjectData,
  getProjectId,
  isNormal,
  isWordpress,
} from "@/helpers/functions";
import { reactToStringMarkup } from "@/helpers/reactToStringMarkup";
import { useWpAllPosts, useWpPostTypes } from "@/queries/wp.queries";
import { useMemo } from "react";

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
          }),
        ),
        droppable: false,
        draggable: true,
        editable: true,
        tagName: "a",
        traits: defineTraits([
          isNormal() && {
            name: "href",
            label: `choose link`,
            placeholder: "Choose link or type custom",
            role: "attribute",
            type: "select",
            showCallback: () => isNormal(),
            keywords: ({ projectData }) => {
              console.log("link keywords fired", projectData);

              return isNormal()
                ? doInNormal(() => {
                    console.log("project Data : ", projectData);

                    if (!projectData || !Object.keys(projectData).length)
                      return [];
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
                  })
                : [];
            },
          },

         isWordpress() && {
            name: "post_type",
            label: `Post Type`,
            placeholder: "Post Type",
            role: "attribute",
            type: "custom",
            // init({ editor, trait, model }) {
            //   const callback = async () => {
            //     const postTypes = await callWorkerCommand(
            //       fetcherWorker,
            //       "wp_get_post_types",
            //       {
            //         projectId: getProjectId(),
            //       },
            //     );

            //     if (!postTypes.success) return;

            //     console.log("post types", postTypes);

            //     trait.keywords = postTypes.data.map((postType) => ({
            //       value: postType.label,
            //       label: postType.name,
            //     }));

            //     editor.trigger("trait:value");
            //     // editor.off(InfinitelyEvents.traits.start, callback);
            //   };

            //   editor.on(InfinitelyEvents.traits.start, callback);
            // },
            showCallback: () => isWordpress(),
            component: ({ editor, trait, model }) => {
              const {
                data: postTypesData,
                isLoading: isPostTypesLoading,
                isError: isPostTypesError,
                error: postTypesError,
              } = useWpPostTypes({});

              const postTypes = useMemo(() => {
                if (!postTypesData || !postTypesData.data) return [];
                return postTypesData.data.map((postType) => ({
                  value: postType.name,
                  title: postType.label,
                }));
              }, [postTypesData]);

              return (
                <Select
                  useLoader={isPostTypesLoading}
                  keywords={postTypes || []}
                  value={trait.value}
                  placeholder="Select post type"
                  onAll={(value) => {
                    trait.value = value;
                    model.addAttributes({ post_type: value });
                    editor.trigger("trait:value");
                  }}
                />
              );
            },
          },

          isWordpress() && {
            name: "href",
            label: `choose link`,
            placeholder: "Choose link or type custom",
            role: "attribute",
            type: "custom",
           
            component: ({ editor, trait, model }) => {
              const postType = model.getTrait("post_type").attributes.value;
              const { data: postsData , isLoading: isPostsLoading, isError: isPostsError } = useWpAllPosts({
                post_type: postType,
              });

              const posts = useMemo(() => {
                if (!postsData || !postsData.data) return [];
                return postsData.data.map((post) => ({
                  value: post.link,
                  title: post.link,//post.post_title,
                }));
              }, [postsData]);

              console.log("posts data : ", postsData, " post type : ", postType , " posts : ", posts);

              return (
                <Select
                  keywords={posts || []}
                  useLoader={isPostsLoading}
                  value={trait.value}
                  placeholder="Select post "
                  onAll={(value) => {
                    trait.value = value;
                    model.addAttributes({ href: value });
                    editor.trigger("trait:value");
                  }}
                />
              );
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
