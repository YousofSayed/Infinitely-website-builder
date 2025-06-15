import { Link, useNavigate } from "react-router-dom";
import { Icons } from "../components/Icons/Icons";
import { defaultAttributeNames } from "../constants/hsValues";
import { media_types } from "../constants/shared";
import { html, parse } from "../helpers/cocktail";
import { defineTraits } from "../helpers/functions";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";
import { Button } from "../components/Protos/Button";

/**
 *
 * @param {{editor : import('grapesjs').Editor}} param0
 * @returns
 */
export const Media = ({ editor }) => {
  editor.Components.removeType("iframe");
  editor.Components.removeType("video");
  editor.Components.removeType("audio");

  editor.Components.addType("media", {
    view: {
      onRender({ el, model, editor }) {
        const typeTraitVal = model.getTrait("type").attributes.value;
        // const mediaAttributes = model.getTrait('media-attributes').attributes.value;

        model.updateTrait("choose-file", {
          mediaType: typeTraitVal,
        });

        model.updateTrait("media-attributes", {
          value: JSON.stringify(model.components().models[0].getAttributes()),
        });
      },
    },
    model: {
      defaults: {
        icon: reactToStringMarkup(Icons.video({ fill: "white" , width:18 , height:18})),
        tagName: "section",
        attributes: {
          class: "h-60 inline-block",
        },
        components: html`
          <div class="choose-media h-full no-pointer">
            <h3 style="margin:0; padding:0; height:100%;" class="flex-center">
              Please select media 💙
            </h3>
          </div>
        `,
        traits: defineTraits([
          {
            name: "type",
            label: "Media type",
            placeholder: "Choose media type",
            role: "attribute",
            type: "select",
            // value:'',
            bindToAttribute: true,
            keywords: media_types,
            callback({ editor, newValue }) {
              const sle = editor.getSelected();
              if (!sle) return;
              sle.removeClass(["h-300", "minh-60", "h-60"]);
              sle.components({
                tagName: newValue,
                attributes: {
                  class: "w-full h-full no-pointer block",
                  controls: true,
                  poster: "",
                },
              });
              sle.updateTrait("choose-file", {
                mediaType: newValue,
              });
            },
          },

          {
            name: "choose-file",
            label: "Choose file",
            role: "attribute",
            type: "media",
            mediaType: "",
            // value:'',
            bindToAttribute: true,
            showCallback() {
              const sle = editor.getSelected();
              const trait = sle?.getTrait?.("type");
              if (!sle) return;
              if (!trait) return;
              const type = trait.attributes.value;
              console.log(
                "from choose callback : ",
                type != "audio" && type != "video"
              );

              return type == "audio" || type == "video";
            },
            callback({ editor, newValue }) {
              const sle = editor.getSelected();
              const child = sle.components().models[0];
              if (!sle && !child) return;
              child.addAttributes({ src: newValue });
            },
          },

          {
            name: "iframe-src",
            label: "Iframe src",
            placeholder: "Type iframe src",
            role: "attribute",
            type: "text",
            bindToAttribute: true,
            showCallback() {
              const sle = editor.getSelected();
              const trait = sle?.getTrait?.("type");
              if (!sle) return;
              if (!trait) return;
              const type = sle.getTrait("type").attributes.value;
              return type == "iframe";
            },
            callback({ editor, newValue }) {
              const sle = editor.getSelected();
              const child = sle.components().models[0];
              if (!sle && !child) return;
              child.addAttributes({ src: newValue });
            },
          },

          {
            name: "media-attributes",
            label: "Media attributes",
            placeholder: "choose attribute",
            default: "{}",
            role: "handler",
            type: "add-props",
            keywords: defaultAttributeNames,
            addPropsInputType: "text",
            // addPropsCodeLanguage: "javascript",
            // allowCmdsContext: true,

            callback({ editor, newValue }) {
              const sle = editor.getSelected();
              const child = sle.components().models[0];
              if (!sle && !child) return;

              child.addAttributes(parse(newValue || "{}"));
            },
          },

          {
            name: "access-media",
            label: "Access media",
            role: "attribute",
            type: "switch",
            onSwitch(value) {
              const sle = editor.getSelected();
              const child = sle.components().models[0];
              if (!sle && !child) return;
              //   const parsedValue = Boolean(parse(newValue));
              value
                ? child.removeClass("no-pointer")
                : child.addClass("no-pointer");
            },
            // callback({ editor, newValue }) {},
          },

          {
            name: "edite-commands",
            label: "Edite commands",
            role: "handler",
            type: "custom",
            component: ({}) => {
              const navigate = useNavigate();
              const sle = editor?.getSelected?.();
              const child = sle?.components?.()?.models?.[0];

              return (
                <Button
                className="w-full justify-center items-center flex"
                  onClick={(ev) => {
                    if (!sle && !child) return;
                    editor.select(child);
                    navigate("/edite/commands");
                  }}
                >
                  Edite commands
                </Button>
              );
            },
          },
        ]),
      },
    },
  });
};
