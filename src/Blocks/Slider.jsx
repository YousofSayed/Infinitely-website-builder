import {
  cloneDeep,
  isArray,
  isBoolean,
  isNumber,
  isPlainObject,
  isString,
} from "lodash";
import { Icons } from "../components/Icons/Icons";
import { swiperJsProps } from "../constants/swiperjsProps";
import { reactToStringMarkup } from "../helpers/reactToStringMarkup";
import { parse, parseAndReturnInputIfNot } from "../helpers/cocktail";
import { editNestedObject, getNestedValue } from "../helpers/bridge";
import {
  defineTraits,
  getMediaBreakpoint,
  getProjectSettings,
  preventSelectNavigation,
} from "../helpers/functions";
import { MiniTitle } from "../components/Editor/Protos/MiniTitle";

/**
 *
 * @param {{editor:import('grapesjs').Editor}} param0
 * @returns
 */
export const Slider = ({ editor }) => {
  function setPropsAsTraits(props = {}) {
    /**
     * @type {import('../helpers/types').InfinitelyTrait[]}
     */
    const traits = [];

    /**
     *
     * @param {{}} props
     * @param {import('../helpers/types').InfinitelyTrait} customPropsToNewTrait
     */
    function createTrait(props = {}, customPropsToNewTrait = {}) {
      for (const [key, val] of Object.entries(props)) {
        /**
         * @type {import('../helpers/types').InfinitelyTrait}
         */
        const trait = {
          name: key,
          placeholder: key,
          label: key,
          role: "attribute",
          bindToAttribute: true,
          //   ...customPropsToNewTrait,
        };
        if (!isPlainObject(val)) {
          //   trait.name = key;
          //   trait.label = key;
          //   trait.placeholder = key;
          //   trait.role = "attribute";
          //   trait.bindToAttribute = true;
          trait.type = isArray(val)
            ? "select"
            : isBoolean(val)
            ? "switch"
            : isNumber(val)
            ? "number"
            : "text";

          trait.default = isArray(val)
            ? ""
            : isBoolean(val)
            ? val
            : isNumber(val)
            ? val
            : "";

          isArray(val) && (trait.options = val);
          isArray(val) && (trait.keywords = val);

          Object.keys(customPropsToNewTrait).forEach((key) => {
            const obj = cloneDeep(customPropsToNewTrait);
            trait[key] = obj[key];
          });

          trait.nestedKeys = customPropsToNewTrait.nestedKeys
            ? [...customPropsToNewTrait.nestedKeys, key]
            : [];
        } else if (isPlainObject(val)) {
          trait.type = "switch";
          trait.onSwitch = (value) => {
            const sle = editor.getSelected();

            if (!value) {
              for (const key in val) {
                const trait = sle.getTrait(key);

                //   trait.attributes.init &&
                //     trait.attributes.init({ editor, model: sle, trait:trait.attributes });
                trait.set({ value: "" });
                sle.removeAttributes([key]);
                console.log("from re init in switch", trait);

                //   const role = trait.get("role");
                //   if (role == "attribute") {
                //     console.log("this is attribute");

                // sle.addAttributes({
                //   [name]: isString(value)
                //     ? value
                //     : JSON.stringify(trait.get("value")),
                // });
                //   }
                // isString(value) ? value : JSON.stringify(trait.get("value"))
                // sle.addAttributes({ [name]: isString(value) ? value : stringify(value) });
              }
            } else {
              for (const key in val) {
                const trait = sle.getTrait(key);
                trait.set("value", undefined);
                trait.set("default", undefined);
                console.log("from switcher : ", trait);
              }
              // editor.trigger("trait:value");
            }
            //     console.log("update should be done");
          };

          const _keys = Object.keys(val).filter((key) => key.startsWith("_"));
          for (const key of _keys) {
            trait[key.slice(1)] = val[key];
            delete val[key];
          }

          createTrait(val, {
            nestedKeys: [key],
            isChild: true,
            default: undefined,
            value: undefined,
            role: "handler",
            // name:undefined,
            // bindToAttribute: false,
            // value: "",
            showCallback(trait) {
              const selected = editor.getSelected();
              if (!selected) return false;
              const currentTrait = selected.getTrait(trait.nestedKeys[0]);
              // console.log("current trait : ", currentTrait);

              if (!currentTrait) return false;
              const currentValue = currentTrait.get("value");
              const parsedValue = parse(currentValue);
              return isBoolean(parsedValue)
                ? parsedValue
                : Boolean(currentValue);
            },
            callback({ editor, trait, newValue }) {
              const selected = editor.getSelected();
              if (!selected) return;
              const currentTrait = selected.getTrait(trait.nestedKeys[0]);
              if (!currentTrait) return;
              const currentValue = currentTrait.get("value");
              const parsedValue = parse(currentValue);
              // console.log(
              //   "from call back : ",
              //   parsedValue,
              //   trait.nestedKeys,
              //   newValue
              // );

              if (
                parsedValue &&
                isArray(trait.nestedKeys) &&
                trait.nestedKeys.length
              ) {
                const newObject = editNestedObject(
                  isPlainObject(parsedValue) ? parsedValue : {},
                  trait.nestedKeys.slice(1),
                  newValue
                );
                console.log("from call back (after): ", newObject);

                selected.addAttributes({
                  [trait.nestedKeys[0]]: JSON.stringify(newObject),
                });
              } else {
                throw new Error(
                  `currentTrait.attributes.nestedKeys is not array or may it is not contains keys!`
                );
              }
            },
            init({ editor, model, trait }) {
              const parentTrait = model.getTrait(
                trait.nestedKeys[0]
              )?.attributes;
              if (!parentTrait || !parentTrait.value) return;
              console.log("ininininininititititititi");
              // is
              const value = parseAndReturnInputIfNot(parentTrait.value);
              if (!isBoolean(value) && isPlainObject(value)) {
                trait.value = getNestedValue(value, trait.nestedKeys.slice(1));
              }
              // const parsedValue = isBoolean(parentTrait.value) ? parentTrait.value :
            },
            // onSwitch(value){

            // }
          });

        }
        // Object.keys(customPropsToNewTrait).forEach((propName) => {
        //   trait[propName] = customPropsToNewTrait[propName];
        // });
        if (Object.keys(trait).length > 0) traits.push(trait);
      }
    }
    createTrait(props);
    return traits.reverse();
  }

  /**
   *
   * @param {import('../helpers/types').TraitCallProps} param0
   * @returns
   */
  const breakpointsCallback = ({
    editor,
    trait,
    mediaBreakpoint,
    newValue,
  }) => {
    console.log('from call back : ' , mediaBreakpoint);
    
    const model = editor.getSelected();
    const breakpointsAttr = model.getAttributes()["breakpoints"];
    const parsedValue = parse(breakpointsAttr);
    if (breakpointsAttr) {
      if (!(parsedValue && isPlainObject(parsedValue))) return;
      const newBreakpoints = {
        ...parsedValue,
        [mediaBreakpoint]: {
          ...(parsedValue[mediaBreakpoint] || {}),
          [trait.name]: newValue,
        },
      };

      model.addAttributes({
        breakpoints: JSON.stringify(newBreakpoints),
        [`breakpoints-${mediaBreakpoint}-${trait.name}`]: newValue,
      });
    } else {
      const newBreakpoints = {
        [mediaBreakpoint]: {
          [trait.name]: newValue,
        },
      };

      model.addAttributes({
        breakpoints: JSON.stringify(newBreakpoints),
        [`breakpoints-${mediaBreakpoint}-${trait.name}`]: newValue,
      });
    }
  };

  /**
   *
   * @param {import('../helpers/types').TraitCallProps & {model:import('grapesjs').Component}} param0
   */
  const breakpointsInit = ({ editor, trait, model, mediaBreakpoint }) => {
    const attrs = model.getAttributes();
    const breakpointKey = `breakpoints-${mediaBreakpoint}-${trait.name.toLowerCase()}`;
    const breakpointAttr = attrs[breakpointKey];
    trait.value = breakpointAttr;

    editor.on("change:device", () => {
      const currentBreakpoint = getMediaBreakpoint(editor);
       const breakpointKey = `breakpoints-${currentBreakpoint}-${trait.name.toLowerCase()}`;
      const attrs = model.getAttributes();
      // console.log(` trait.value = attrs[breakpointKey] || ''; ` ,  trait.value = attrs[breakpointKey]);
      
      trait.value = attrs[breakpointKey] || 0;
      editor.trigger('trait:value')
    });
  };

  editor.Components.addType("slider", {
    isComponent: (el) => {
      if (!el.tagName) return false;
      return el.tagName.toLowerCase() === "swiper-container";
    },
    view:{
      onRender({editor  ,el ,model}){
        const { projectSettings } = getProjectSettings();
        if(!projectSettings.enable_swiperjs){
          el.classList.add('enable-swiper')
          el.classList.remove('drop');
          el.querySelectorAll('*').forEach(el=>{
            el.classList.remove('drop')
          })
        }
      }
    },
    model: {
      
      defaults: {
        icon: reactToStringMarkup(
          Icons.slider({
            width: 25,
            height: 25,
            fill: "white",
            strokeColor: "white",
          })
        ),
        components: [
          { type: "slide" },
          { type: "slide" },
          { type: "slide" },
          { type: "slide" },
        ],
        attributes: {
          autoplay: "false",
          navigation: "true",
          pagination: "true",
          effect: "slide",
        },
        tagName: "swiper-container",
        traits: defineTraits([
          {
            role: "attribute",
            name: "slides",
            type: "number",
            label: "Slides",

            default: 4,
            callback({ editor, trait, newValue }) {
              const selected = editor.getSelected();
              if (!selected) return;
              //   const selectedTrait = selected.getTrait(trait.name);
              const parsedValue = parse(newValue);
              if (!parsedValue) return;
              const selectedChilds = [...selected.components().models].map(
                (cmp) => cmp.clone()
              );
              const selectedChildsLength = selectedChilds.length;
              if (parsedValue <= selectedChildsLength) {
                selected.components(selectedChilds.slice(0, parsedValue));
              } else {
                for (let i = 0; i < parsedValue - selectedChildsLength; i++) {
                  selectedChilds.push({ type: "slide" });
                }
                selected.components(selectedChilds);
              }
            },

            init({ editor, model, trait }) {
              const childs = model.components().models;
              trait.value = childs.length;
              trait.default = childs.length;
            },
          },
        ])
          .concat(setPropsAsTraits(swiperJsProps))
          .concat(
            defineTraits([
              {
                role: "handler",
                type: "custom",
                component: () => <MiniTitle>Breakpoints</MiniTitle>,
              },

              {
                role: "handler",
                name: "slidesPerView",
                label: "slidesPerView",
                placeholder: "slidesPerView",
                value: 1,
                type: "number",
                showMediaBreakpoint: true,
                callback: breakpointsCallback,
                init: breakpointsInit,
                hint({editor , mediaBreakpoint , trait}){
                  return `Width < ${mediaBreakpoint}`
                }
              },

              {
                role: "handler",
                name: "spaceBetween",
                label: "spaceBetween",
                placeholder: "spaceBetween",
                value: 0,
                type: "number",
                showMediaBreakpoint: true,
                callback: breakpointsCallback,
                init: breakpointsInit,
              },
            ])
          )
          .map((trait) => {
            const originalCallback = trait.callback;
            trait.callback = ({ editor, asset, newValue, oldValue, trait , mediaBreakpoint }) => {
              originalCallback &&
                originalCallback({ editor, asset, newValue, oldValue, trait ,mediaBreakpoint});
              const selected = editor.getSelected();

              const swiperEl = selected.getEl();
              // Destroy old instance if needed
              if (swiperEl.swiper) {
                swiperEl.swiper.destroy(true, true);
              }
          
              setTimeout(() => {
                swiperEl.initialize();
              });

            };
            return trait;
          }),
        draggable: true,
        droppable: true,
      },
    },
  });

  editor.Components.addType("slide", {
    isComponent: (el) => {
      if (!el.tagName) return false;
      return el.tagName.toLowerCase() === "swiper-slide";
    },
    model: {
      defaults: {
        icon: reactToStringMarkup(
          Icons.slider({
            width: 25,
            height: 25,
            fill: "white",
            strokeColor: "white",
          })
        ),
        tagName: "swiper-slide",
        draggable: false,
        droppable: true,
      },
    },
  });
};
