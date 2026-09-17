import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { wp_get_post_id } from "@/Apps/wordpress/functions_ui";
import { open_code_manager_modal } from "@/constants/InfinitelyCommands";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { editorContainerInstance } from "@/constants/InfinitelyInstances";
import {
  current_project_id,
  inf_symbol_Id_attribute,
  preview_url,
} from "@/constants/shared";
import {
  animationsState,
  asideControllersNotifiresState,
  cmdsBuildState,
  cmpRulesState,
  currentElState,
  isAnimationsChangedState,
  mediaConditionState,
  previewContentState,
  showPreviewState,
  zoomValueState,
} from "@/helpers/atoms";
import { wp_preview_bc } from "@/helpers/channels";
import {
  addClickClass,
  createBlobFileAs,
  html,
  transformToNumInput,
  uniqueID,
} from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import {
  AIWorker,
  fetcherWorker,
  offlineInstallerWorker,
  pageBuilderWorker,
} from "@/helpers/defineWorkers";
import {
  buildGsapMotionsScript,
  buildScriptFromCmds,
  callWorkerCommand,
  doInNormal,
  doInWordpress,
  doInWordpressAsync,
  exportProject,
  getComponentRules,
  getCurrentPageName,
  getProjectData,
  getProjectSettings,
  getWpPageConfig,
  getWpRestBase,
  gjsComponentsToJSON,
  isWordpress,
  preventSelectNavigation,
  reorderCss,
  shareProject,
  wpWorkerCallbackMaker,
} from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { detectedType } from "@/helpers/jsDocs";
import { useNotifiers } from "@/hooks/useNotifiers";
import { Icons } from "@/components/Icons/Icons";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Protos/Button";
import { Hr } from "@/components/Protos/Hr";
import { Li } from "@/components/Protos/Li";
import { OptionsButton } from "@/components/Protos/OptionsButton";
import { ScrollableToolbar } from "@/components/Protos/ScrollableToolbar";
import {
  UlContextProvider,
  useUlContext,
} from "@/components/Protos/UlProvider";
import { PagesSelector } from "@/components/Editor/PagesSelector";
import { IframeControllers } from "@/components/Editor/Protos/IframeControllers";
import { Input } from "@/components/Editor/Protos/Input";
import { Select } from "@/components/Editor/Protos/Select";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEditorMaybe } from "@grapesjs/react";
import { minify } from "csso";
import { useLiveQuery } from "dexie-react-hooks";
import { cloneDeep } from "lodash";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Wordpress } from "../Protos/wordpress/Wordpress";

// export const HomeHeader = () => <h1>helo</h1>
export const HomeHeader = memo(() => {
  const editor = useEditorMaybe();
  const widthRef = useRef("");
  const heightRef = useRef("");
  const customDevice = useRef();
  const [showPreview, setShowPreview] = useRecoilState(showPreviewState);
  const [currentEl, setCurrentEl] = useRecoilState(currentElState);
  const [zoomValue, setZoomValue] = useRecoilState(zoomValueState);
  const [mediaValue, setMediaValue] = useState("");
  const [detectedMedia, setDetectedMedia] = useState(detectedType);
  const [sizeAutoAnimate] = useAutoAnimate();
  const [widthMedia, setWidthMedia] = useState();
  const { selectedId, setSeletedId } = useUlContext();
  const [cmpRules, setCmpRules] = useRecoilState(cmpRulesState);
  const [mediaCond, setMediaCond] = useRecoilState(mediaConditionState);
  const [publish, setPublish] = useState(false);
  const [storeLoad, setStoreLoad] = useState(false);
  const [asideControllersNotifires, setAsideControllersNotifires] =
    useRecoilState(asideControllersNotifiresState);
  const [animatedRefForPublishBtn] = useAutoAnimate();
  const projectId = +localStorage.getItem(current_project_id);

  const [dimansions, setDimaonsion] = useState({
    width: "",
    height: "",
  });

  useLiveQuery(async () => {
    await doInWordpressAsync(async () => {
      const projectData = await getProjectData();
      // console.log(
      //   "publish state :",
      //   Boolean(projectData.currentEditingPage?.need_publish_to_wp),
      //   Boolean(projectData?.scripts_need_to_publish),
      // );

      return setPublish(
        Boolean(projectData.currentEditingPage?.need_publish_to_wp),
        //  ||
        //   Boolean(projectData?.scripts_need_to_publish),
      );
    });
  });

  const setMediaConditon = (value) => {
    setMediaCond(value);
    setMediaValue(value);
    editor.getConfig().mediaCondition = value;
    localStorage.setItem("media-condition", value);
  };
  // const [pages, setPages] = useState([]);

  const setCustomDevice = (prop, value) => {
    prop == "width" && (widthRef.current = value);
    prop == "height" && (heightRef.current = value);
    console.log("new value", value, prop);
    const uid = uniqueID();

    if (!value) {
      editor.DeviceManager.select("desktop");
      return;
    }
    const newDevice = {
      name: uid,
      id: uid,
      width: widthRef.current + "px",
      height: heightRef.current + (heightRef.current && "px") || undefined,
      widthMedia: widthRef.current ? widthRef.current + "px" : undefined,
      // priority: +widthRef.current,
    };
    const deviceManager = editor.Devices;
    const devices = deviceManager
      .getAll()
      .toArray()
      .map((dev) => dev.attributes);

    editor.DeviceManager.remove(customDevice.current);

    const concatedArray = devices.concat(newDevice);
    concatedArray.sort((a, b) => {
      const wa = parseFloat(a.widthMedia) || Infinity; // Desktop last
      const wb = parseFloat(b.widthMedia) || Infinity;
      return wa - wb;
    });

    // console.log("new devices : ", devices);

    const newDevices = cloneDeep(
      concatedArray.reverse().map((dev, i) => {
        dev = {
          ...dev,
          priority: i + 1,
        };
        // .set({ priority: i + 1 });
        return dev;
      }),
    );

    const newDeviceWithNewPiriority = newDevices.find(
      (dev) => dev.name === uid,
    );
    // console.log(`new deivce : `, newDeviceWithNewPiriority);

    customDevice.current = editor.DeviceManager.add(newDeviceWithNewPiriority);

    editor.setDevice(uid);
    editor.trigger("inf:rules:update");
  };

  const zoomCallback = (ev) => {
    const { value } = ev.detail;
    // console.log('value zoom : ' , value);

    setZoomValue((value * 100).toFixed(2));
  };

  const publishToWp = async () => {
    let tId = toast.loading(<ToastMsgInfo msg={`Publish to wordpress...✨`} />);
    const res_base = getWpRestBase();
    const wp_post = getWpPageConfig();
    const projectId = +localStorage.getItem(current_project_id);
    const projectData = await getProjectData();
    const { projectSettings } = getProjectSettings();
    const symbols = editor
      .getWrapper()
      .find(`[${inf_symbol_Id_attribute}]`)
      .map((cmp) => {
        const symbol_id = cmp.getAttributes()[inf_symbol_Id_attribute];

        if (!symbol_id) return null;

        return {
          symbol_id,
          post_meta: {
            before_save: "__DELETE__",
            saved: {
              html: gjsComponentsToJSON(cmp, true),
              css: minify(
                getComponentRules({
                  editor,
                  cmp,
                  nested: true,
                }).stringRules,
              ).css,
            },
          },
        };
      })
      .filter(Boolean);

    console.log("symbols before publish ", symbols);

    let steps = 0;
    const max_steps = 2 + Number(Boolean(symbols.length));
    setPublish(false);

    const afterSave = async () => {
      steps++;
      if (steps >= max_steps) {
        await db.projects.update(projectId, {
          scripts_need_to_publish: false,
          scripts_need_arranged: false,
          projectSetting: projectSettings,
          save_state: "saved",
          current_inf_meta: {
            before_save: {
              ...(projectData?.current_inf_meta?.before_save || {}),
            },
            saved: {
              ...(projectData?.current_inf_meta?.before_save || {}),
            },
          },
          currentEditingPage: {
            need_publish_to_wp: false,
            save_state: "saved",
          },
        });
        wp_preview_bc.postMessage({
          props: {
            url: wp_post.link,
            mode: "preview",
            save_state: "saved",
          },
        });
        toast.done(tId);
      }
    };

    // wp_update_symbols
    symbols.length &&
      wpWorkerCallbackMaker(
        offlineInstallerWorker,
        "wp_update_symbols",
        {
          symbols,
          projectId,
        },
        async (res) => {
          console.log("wp_update_symbols", res);
          if (res.done) {
            await afterSave();
            toast.success(<ToastMsgInfo msg={`Symbols updated 💙`} />);
          } else {
            toast.dismiss(tId);
            toast.error(<ToastMsgInfo msg={`Faild to update symbols 😡`} />);
            throw new Error(`Faild to update symbols 😡 , why?`);
          }
        },
      );

    // wp_update_meta;
    wpWorkerCallbackMaker(
      fetcherWorker,
      "wp_update_meta",
      {
        projectId,
        post_id: wp_get_post_id(),
        post_type: wp_post.type,
        meta_key: "inf_meta",
        merge: true,
        meta_value: {
          before_save: null,
          saved: {
            ...(projectData?.current_inf_meta?.before_save || {}),
          },
        },
      },
      async (res) => {
        if (res.done) {
          await afterSave();
          toast.success(
            <ToastMsgInfo msg={`Your amazing edits published 💙`} />,
          );
        } else {
          toast.dismiss(tId);
          toast.error(<ToastMsgInfo msg={`Post Edits not published 😡`} />);
          throw new Error(`User Edits not published 😡 , why?`);
        }
      },
    );

    // wp_update_option;
    wpWorkerCallbackMaker(
      infinitelyWorker,
      "wp_update_option",
      {
        optionName: "inf_config",
        value: { ...projectData, currentEditingPage: {}, current_inf_meta: {} },
        projectId,
        merge: true,
      },
      async (res) => {
        if (res.done) {
          await afterSave();
          toast.success(<ToastMsgInfo msg={`Config merged 💙`} />);
        } else {
          toast.dismiss(tId);
          toast.error(<ToastMsgInfo msg={`Config not published 😡`} />);
          throw new Error(`User Config not published 😡 , why?`);
        }
      },
    );
  };

  useMemo(() => {
    if (!editor) return;
    const saveStart = () => {
      setPublish(false);
      setStoreLoad(true);
    };

    const saveEnd = () => {
      setStoreLoad(false);
    };

    editor.on(InfinitelyEvents.storage.storeStart, saveStart);
    editor.on(InfinitelyEvents.storage.storeEnd, saveEnd);

    return () => {
      editor.off(InfinitelyEvents.storage.storeStart, saveStart);
      editor.off(InfinitelyEvents.storage.storeEnd, saveEnd);
    };
  }, [editor]);

  useMemo(() => {
    if (!(editor && editor.getContainer())) return;
    // console.log('html editor : ' , editor.getWrapper().getInnerHTML({withProps:true , withScripts: true}));
    // getHtml({withProps:true , asDocument:false , })
    setZoomValue((editor.getContainer().style.zoom * 100).toFixed(2));

    const changeDeviceCallback = () => {
      const currentDeviceName = editor.getDevice();

      const currentDevice = editor.Devices.get(currentDeviceName);
      console.log("currentDeviceName", currentDevice);
      setDimaonsion({
        height: parseFloat(currentDevice.attributes.height) || "",
        width:
          currentDevice.getName().toLowerCase() === "desktop"
            ? ""
            : parseFloat(currentDevice.attributes.widthMedia) || "",
      });
      setMediaValue(
        currentDevice.getName().toLowerCase() === "desktop"
          ? ""
          : editor.config.mediaCondition,
      );
      reorderCss(editor);
    };
    editor.on("change:device", changeDeviceCallback);
    editor.on(InfinitelyEvents.devices.update, changeDeviceCallback);
    editor.onReady(changeDeviceCallback);
    // setMediaValue(editor.config.mediaCondition);

    return () => {
      editor.off("change:device", changeDeviceCallback);
      editor.off(InfinitelyEvents.devices.update, changeDeviceCallback);
    };
  }, [editor]);

  useMemo(() => {
    if (!editor) return;
    if (!currentEl.currentEl) return;
    // if (!cmpRules.length) return;
    if (!cmpRules.length) {
      setDetectedMedia(cloneDeep(detectedType));
      return;
    }

    // const rules = cmpRules;

    const newDetected = cloneDeep(detectedType);

    for (const rule of cmpRules) {
      console.log("full rule", rule);
      if (!rule.atRuleParams && rule.rule) {
        newDetected.desktop.push(true);
      } else if (
        rule.atRuleParams &&
        rule.atRuleParams.includes("max-width") &&
        rule.atRuleParams.includes("900px")
      ) {
        newDetected.tablet.push(true);
      } else if (
        rule.atRuleParams &&
        rule.atRuleParams.includes("max-width") &&
        rule.atRuleParams.includes("480px")
      ) {
        newDetected.mobile.push(true);
      } else if (rule.atRuleParams) {
        newDetected.others.push(rule.atRuleParams.replace(/\(|\)/gi, ""));
      }
    }

    newDetected.others = [...new Set(newDetected.others)];
    setDetectedMedia(newDetected);
    console.log("ruules from header :", cmpRules);
  }, [currentEl, editor, cmpRules]);

  useMemo(() => {
    if (!editor) return;
    editorContainerInstance.on(
      InfinitelyEvents.editorContainer.update,
      zoomCallback,
    );

    const deviceChange = () => {
      console.log(editor.getDevice());
      if (!editor.getDevice()) return;

      const widthMedia = editor.Devices.get(editor.getDevice())
        ?.getWidthMedia?.()
        ?.match?.(/\d+/gi)?.[0];

      // console.log('widthMedia : ' , widthMedia);

      setWidthMedia(+widthMedia);
    };

    editor.on("change:device", deviceChange);
    editor.on("canvas:frame:load:body", deviceChange);

    return () => {
      editorContainerInstance.off(
        InfinitelyEvents.editorContainer.update,
        zoomCallback,
      );
      editor.off("change:device", deviceChange);
      editor.off("canvas:frame:load:body", deviceChange);
    };
  }, [editor]);

  useNotifiers();

  useEffect(() => {
    (async () => {
      const models = await callWorkerCommand(AIWorker, "getModels", {provider:'google'});
      console.log('response is : chat' ,  models);
      const id = await callWorkerCommand(AIWorker, "createLLM", {});
      console.log('response is : chat' , id );
      const response = await callWorkerCommand(AIWorker, "llmChat", {id , message:`
        Create a premium, modern coffee e-commerce website for a specialty coffee brand called **“Roast & Ritual”**.

The website should feel like a **high-end specialty coffee brand**, combining editorial luxury with modern e-commerce. It must look professionally designed by an experienced UI/UX designer — **not like a generic AI-generated template**.

## 1. Overall Visual Direction

Design language:

* Premium specialty coffee
* Warm, sophisticated, minimal
* Editorial / luxury lifestyle aesthetic
* Strong typography
* Beautiful product photography
* Generous whitespace
* Subtle animations
* Excellent visual hierarchy
* Modern but timeless
* Cozy without looking old-fashioned

Use a warm neutral palette:

* Background: \`#F7F3ED\`
* Primary dark: \`#171412\`
* Espresso brown: \`#3B2418\`
* Coffee brown: \`#6A4632\`
* Caramel: \`#B87945\`
* Accent orange: \`#D88945\`
* Cream:\`#FFFDF9\`
* Muted text: \`#756B63\`

Avoid excessive gradients, excessive rounded cards, glassmorphism, neon colors, or generic SaaS styling.

The design should feel closer to a **premium fashion/lifestyle brand mixed with a specialty coffee shop** than a typical online store.

## 2. Header

Create a sophisticated responsive navigation bar.

Desktop:

* Logo: Roast & Ritual
* Shop
* Coffee
* Subscriptions
* Equipment
* Our Story
* Journal
* Search icon
* Account icon
* Shopping bag/cart icon with item count

Make the header elegant and compact.

Add a subtle announcement bar above it:

“Free shipping on orders over $50”

The header should become sticky when scrolling.

Mobile:

* Hamburger menu
* Centered logo
* Search
* Cart

Create a smooth mobile navigation drawer.

## 3. Homepage

Create a visually impressive homepage.

### Hero section

Large editorial hero section with a premium coffee image.

Headline:

**“Coffee worth slowing down for.”**

Supporting text:

“Small-batch specialty coffee, roasted with intention and delivered at its peak.”

Buttons:

* Shop Coffee
* Explore Our Story

Use a large high-quality coffee image with warm natural lighting.

The hero should immediately communicate:

**premium + coffee + craftsmanship + lifestyle**

Add subtle entrance animations.

### Featured Products

Heading:

**“Your next favorite cup.”**

Display 4 premium coffee products.

Each product card should contain:

* Large product image
* Product name
* Origin
* Roast level
* Flavor notes
* Price
* Add to Cart button
* Wishlist icon

Example products:

1. Ethiopia Yirgacheffe

   * Floral
   * Bergamot
   * Peach
   * $22

2. Colombia Huila

   * Caramel
   * Red Apple
   * Chocolate
   * $20

3. Brazil Fazenda

   * Hazelnut
   * Cocoa
   * Brown Sugar
   * $19

4. Kenya Kirinyaga

   * Blackberry
   * Citrus
   * Honey
   * $24

## 4. Coffee Discovery Section

Create an interactive section:

**“Find your coffee.”**

Allow customers to choose:

* Roast level
* Flavor profile
* Brewing method
* Caffeine preference

Example:

“I'm looking for…”

☕ Light & fruity
☕ Balanced & sweet
☕ Dark & bold

Then show recommended coffees.

Make this feel like a premium coffee discovery experience rather than a boring form.

## 5. Best Sellers

Create a horizontal product carousel.

Heading:

**“Loved by coffee people.”**

Show best-selling products with:

* Product image
* Rating
* Reviews
* Price
* Quick add button

Include smooth horizontal scrolling.

## 6. Brand Story

Create a large editorial split section.

Image on one side.

Text on the other:

**“Good coffee starts long before the first sip.”**

Explain that the company works with carefully selected coffee farms, focuses on responsible sourcing, small-batch roasting, and freshness.

Add:

**Discover our story →**

Use elegant typography and plenty of whitespace.

## 7. Subscription Section

Create a premium subscription CTA.

Headline:

**“Never run out of great coffee.”**

Supporting text:

“Choose your coffee. Choose your schedule. We'll take care of the rest.”

Options:

* Every 2 weeks
* Every 4 weeks
* Every 6 weeks

CTA:

**Start a Subscription**

Visually distinguish this section from the rest of the page.

## 8. Brewing Equipment

Create an equipment section featuring:

* French Press
* V60
* AeroPress
* Coffee Grinder
* Digital Scale
* Kettle

Use large product imagery and minimal product information.

Heading:

**“Make better coffee at home.”**

CTA:

**Shop Equipment**

## 9. Journal

Create an editorial blog section.

Heading:

**“From the journal.”**

Cards:

* How to brew better pour-over coffee
* Understanding coffee roast levels
* Ethiopia vs Colombia: What's the difference?
* The ultimate guide to grinding coffee
* How to store coffee beans properly

Each article should have:

* Large image
* Category
* Title
* Short description
* Reading time

## 10. Product Listing Page

Create a complete shop page.

Include:

* Product grid
* Search
* Category filters
* Roast filters
* Origin filters
* Flavor filters
* Price filter
* Sort by
* Grid/list toggle

Categories:

* Coffee Beans
* Ground Coffee
* Capsules
* Equipment
* Accessories
* Gifts

Product cards should support:

* Quick Add
* Wishlist
* Product preview
* Sale badge
* Rating
* Price

## 11. Product Details Page

Create a premium product detail page.

Left side:

Large product image gallery.

Right side:

* Product name
* Rating
* Reviews
* Price
* Description
* Origin
* Roast level
* Flavor notes
* Processing method
* Altitude
* Weight selector
* Whole Bean / Ground selector
* Quantity selector
* Add to Cart
* Buy Now
* Wishlist

Add a coffee information visualization showing:

**Roast**
Light ─────●───── Dark

**Acidity**
Low ───●──────── High

**Body**
Light ───────●─── Full

Also include:

### Brewing recommendations

* V60
* Espresso
* French Press
* AeroPress

Show recommended grind size and brewing ratio.

## 12. Shopping Cart

Create a beautiful slide-out cart.

Show:

* Product image
* Product name
* Variant
* Quantity controls
* Price
* Remove

Then:

Subtotal

Shipping estimate

Total

CTA:

**Checkout**

Add:

“You're $12 away from free shipping.”

with a progress indicator.

## 13. Checkout

Create a clean distraction-free checkout.

Steps:

1. Information
2. Shipping
3. Payment
4. Confirmation

Include:

* Contact information
* Shipping address
* Delivery method
* Payment method
* Order summary

Do not make checkout visually complicated.

## 14. About Page

Create a strong brand story page.

Sections:

* Our philosophy
* Where our coffee comes from
* How we roast
* Sustainability
* Meet the team

Use large editorial photography.

## 15. Responsive Design

The website must be fully responsive.

Desktop:

* Large editorial layouts
* Wide product grids
* Large typography

Tablet:

* Adapt grid sizes
* Maintain generous spacing

Mobile:

* Single-column product layouts
* Touch-friendly buttons
* Horizontal product carousels
* Mobile navigation
* Sticky cart button where appropriate
* No horizontal overflow
* Proper image cropping

Do not simply shrink the desktop layout.

Design the mobile experience intentionally.

## 16. Animations

Use subtle premium animations:

* Fade-up on section entrance
* Image reveal animations
* Smooth hover transitions
* Product image zoom on hover
* Button micro-interactions
* Smooth cart drawer animation
* Navigation transitions
* Scroll-based editorial effects

Animations must be elegant and fast.

Avoid excessive animation.

## 17. UX Requirements

Prioritize:

* Fast shopping
* Clear product information
* Strong visual hierarchy
* Accessible contrast
* Large touch targets
* Clear CTA buttons
* Minimal checkout friction
* Excellent empty states
* Loading states
* Error states
* Product search
* Filtering
* Cart persistence

Every interactive element should have an obvious purpose.

## 18. Typography

Use a sophisticated typography pairing.

Use an elegant serif font for major editorial headlines and a clean modern sans-serif for UI/body text.

Headlines should feel premium and confident.

Example style:

**Coffee worth slowing down for.**

Large, dramatic, but not excessive.

## 19. Photography

Use realistic premium coffee photography:

* Coffee beans
* Espresso
* Pour-over
* Coffee farms
* Coffee bags
* Brewing equipment
* Hands preparing coffee
* Café atmosphere

Photography should have:

* Warm natural lighting
* Cinematic composition
* Rich coffee tones
* Realistic textures
* Professional commercial photography quality

Do not use obvious stock-photo-looking images.

Do not place text over busy images unless readability is excellent.

## 20. Footer

Create a large premium footer.

Columns:

### Shop

Coffee
Equipment
Subscriptions
Gifts

### Company

Our Story
Journal
Contact
FAQ

### Support

Shipping
Returns
Privacy
Terms

Include:

* Newsletter signup
* Social icons
* Payment icons
* Copyright
* Logo

Newsletter headline:

**“Good things are brewing.”**

Supporting text:

“Get brewing guides, new releases, and occasional coffee inspiration.”

## 21. Important Design Rules

Do NOT:

* Create a generic template
* Use excessive rounded cards
* Use random gradients
* Use neon colors
* Use excessive shadows
* Use huge unnecessary UI elements
* Use placeholder lorem ipsum
* Make every section look like a card
* Overuse icons
* Make the interface look like a SaaS dashboard

DO:

* Use strong editorial composition
* Use asymmetrical layouts where appropriate
* Use high-quality photography
* Use typography as a major design element
* Create clear visual rhythm
* Maintain consistent spacing
* Make products the visual focus
* Make the website feel like a real established coffee brand

## 22. Technical Quality

Build the website as a production-quality e-commerce interface.

Requirements:

* Semantic HTML
* Responsive CSS
* Accessible controls
* Keyboard navigation
* Proper focus states
* Optimized images
* Lazy loading
* Reusable components
* Clean component architecture
* No unnecessary dependencies
* No broken interactions
* No console errors
* No placeholder functionality presented as working functionality

All buttons and interactive elements should actually work.

Use realistic mock product data where backend functionality is unavailable.

The final result should look like a **real premium specialty coffee e-commerce brand ready to launch**, not a demo, wireframe, or AI template.

Before finishing, review every page for:

1. Visual consistency
2. Responsive behavior
3. Typography
4. Spacing
5. Accessibility
6. Product usability
7. Navigation
8. Cart interactions
9. Empty/loading/error states
10. Overall premium visual quality

Make the final website **beautiful, restrained, premium, fast, and conversion-focused**.

        `});
      console.log('response is : chat' ,  response );

      
      

        
    })();
  }, []);

  return (
    <header className="w-full h-[55px]  zoom-80 px-2 bg-surface-secondary  border-b-[1.5px]  border-slate-400    flex items-center justify-between gap-2 auto-animate animate-go-to">
      <ScrollableToolbar
        className="w-[37.5%] h-full flex shrink-0   max-w-[700px] py-2 "
        innerClassName="!justify-start"
        space={2}
      >
        {/* <ul className="flex gap-[25px] flex-shrink  h-full  items-center"> */}
        {/* <UlContextProvider> */}
        <ul
          ref={sizeAutoAnimate}
          className="flex items-center w-[150px]  h-full gap-2 justify-between shrink-0  bg-surface-tertiary shadow-2xl shadow-slate-950 rounded-lg  p-1"
        >
          <Li
            title="Default size"
            className="shrink-0"
            // className="max-xl:shrink-0"
            onClick={(ev) => {
              editor.setDevice("desktop");
              setMediaConditon("");
              // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
              editor.trigger("device:change");
            }}
            isObjectParamsIcon
            icon={Icons.desktop}
            id={"desktop-size"}
            notify={Boolean(detectedMedia.desktop.length)}
            mode={"group"}
            enableSelecting
          />
          <Li
            title="max-width: 900px"
            className="shrink-0"
            // className="max-xl:shrink-0"
            onClick={(ev) => {
              editor.setDevice("tablet");
              setMediaConditon("max-width");
              // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
              editor.trigger("device:change");
            }}
            isObjectParamsIcon
            fillObjectIconOnHover
            icon={Icons.tablet}
            notify={Boolean(detectedMedia.tablet.length)}
            id={"tablet-size"}
            mode={"group"}
            enableSelecting
          />

          <Li
            title="max-width: 360px"
            className="shrink-0 relative"
            onClick={(ev) => {
              editor.setDevice("mobile");
              setMediaConditon("max-width");
              // setCurrentEl({ currentEl: editor?.getSelected()?.getEl() });
              editor.trigger("device:change");
            }}
            isObjectParamsIcon
            fillObjectIconOnHover
            icon={Icons.mobile}
            notify={Boolean(detectedMedia.mobile.length)}
            id={"mobile-size"}
            mode={"group"}
            enableSelecting
          />
          {Boolean(detectedMedia.others.length) && (
            <OptionsButton
              className="hover:bg-brand-primary w-[30px!important] h-[30px] shrink-0 "
              notify={Boolean(detectedMedia.others.length)}
            >
              {
                <ul
                  onMouseOver={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                  }}
                  className=" relative flex flex-col gap-2"
                >
                  {detectedMedia.others.map((rule, i) => {
                    console.log(
                      "rule : ",
                      rule,
                      rule.trim() ==
                        `${editor.config.mediaCondition}: ${widthMedia}px`,
                    );

                    return (
                      <li
                        key={i}
                        style={{
                          backgroundColor:
                            rule.trim() ==
                            `${editor.config.mediaCondition}: ${widthMedia}px`
                              ? "var(--main-bg)"
                              : "",
                        }}
                        className="p-2 bg-slate-700 w-[200px!important] flex justify-center items-center  rounded-md  transition-all hover:bg-brand-primary"
                        onClick={(ev) => {
                          ev.preventDefault();
                          ev.stopPropagation();
                          addClickClass(ev.currentTarget, "click");
                          const widthValue = rule.match(/\d+/gi);
                          const mediaCondition = rule.split(":")[0];
                          // console.log("widthValue" , widthValue, mediaCondition);
                          setMediaValue(mediaCondition);
                          setMediaCond(mediaCondition);

                          editor.getConfig().mediaCondition = mediaCondition;
                          localStorage.setItem(
                            "media-condition",
                            mediaCondition,
                          );
                          const sle = editor.getSelected();
                          setDimaonsion({
                            ...dimansions,
                            width: +widthValue[0],
                          });
                          setCustomDevice("width", +widthValue[0]);

                          editor.trigger("device:change");
                          // preventSelectNavigation(editor, sle);
                        }}
                      >
                        {rule}
                      </li>
                    );
                  })}
                </ul>
              }
            </OptionsButton>
          )}
        </ul>

        <li className=" shrink-0 grow-0 w-[130px]">
          <Select
            preventInput
            keywords={["min-width", "max-width"]}
            placeholder="Media"
            value={mediaValue}
            onAll={(value) => {
              setMediaValue(value);
              editor.getConfig().mediaCondition = value;
              localStorage.setItem("media-condition", value);
              const sle = editor.getSelected();
              preventSelectNavigation(editor, sle);
            }}
          />
        </li>

        <li className="flex h-full   gap-2 max-lg:shrink-0">
          <Input
            type="number"
            placeholder="Width"
            className="bg-surface-tertiary p-1 w-[70px] text-center  h-full font-bold text-sm max-lg:shrink-0"
            value={dimansions.width}
            onInput={(ev) => {
              // transformToNumInput(ev.target);
              setCustomDevice("width", ev.target.value);
              setDimaonsion({ ...dimansions, width: ev.target.value });
              setCurrentEl({ currentEl: JSON.stringify(editor.getSelected()) });
            }}
          />

          <Input
            type="number"
            value={dimansions.height}
            placeholder="Height"
            className="bg-surface-tertiary w-[70px] p-1  text-center  h-full font-bold text-sm max-lg:shrink-0 "
            onInput={(ev) => {
              // transformToNumInput(ev.target);
              setCustomDevice("height", ev.target.value);
              setDimaonsion({ ...dimansions, height: ev.target.value });
              setCurrentEl({ currentEl: editor.getSelected().getEl() });
            }}
          />

          <Input
            value={zoomValue}
            placeholder="Zoom"
            className="bg-surface-tertiary w-[70px] p-1  text-center  h-full font-bold text-sm max-lg:shrink-0 "
            type="number"
            onInput={(ev) => {
              // transformToNumInput(ev.target);
              // editor.getContainer().style.zoom = ev.target.value / 100;

              // editor.trigger(InfinitelyEvents.devices.update_zoom , {value:true});
              const val = ev.target.value;
              const container = editor.getContainer();

              // ✅ 1. Add the "zooming" flag so the ResizeObserver ignores this manual change
              // container.setAttribute("zooming", "true");

              // 2. Apply the manual zoom
              container.style.zoom = val / 100;
              const parent = container.parentElement;
              if (parent) {
                parent.style.display = "flex";
                parent.style.justifyContent = "center";
                parent.style.alignItems = "center";
                parent.style.width = "100%";
                parent.style.height = "100%";
                parent.style.overflow = "hidden"; // Prevents scrollbars from zoom
              }
              // editor.Canvas.setZoom(val / 100);
              // editor.trigger(InfinitelyEvents.devices.update_zoom , {value:false});

              // 3. Keep the React state and Event Bus in sync (prevents UI flicker)
              setZoomValue(val);
              editorContainerInstance.emit(
                InfinitelyEvents.editorContainer.update,
                {
                  value: container.style.zoom,
                },
              );
            }}
          />
        </li>
        <PagesSelector />
        {/* </ul> */}
      </ScrollableToolbar>

      <ScrollableToolbar
        className=" w-full   h-full   [&_svg]:w-[20px] [&_svg]:h-[18px] tools"
        space={2}
      >
        <section className="flex items-center gap-2 w-full  grow-0 justify-between bg-surface-tertiary p-[5px] rounded-lg">
          <IframeControllers />
          <Hr />

          <>
            <Li
              onClick={() => {
                editor.runCommand(open_code_manager_modal);
              }}
              title="Code manager"
              className="shrink-0"
            >
              {Icons.code({ strokWidth: 3 })}
            </Li>
            <Li
              title="preview mode"
              icon={Icons.watch}
              onClick={(ev) => {
                // localStorage.setItem(preview_url, getCurrentPageName());
                // window.open(`/preview/${getCurrentPageName()}`, "_blank");

                setShowPreview((old) => !old);
              }}
              className="shrink-0"
            />

            <Li
              title="show in frontend"
              icon={Icons.showInFrontEnd}
              isObjectParamsIcon
              onClick={(ev) => {
                doInNormal(() => {
                  localStorage.setItem(preview_url, getCurrentPageName());
                  window.open(
                    `/${getCurrentPageName()}`,
                    "infinitely-preview",
                    // 'width=800,height=600,top=50,left=50,scrollbars=yes,resizable=yes,location=yes,menubar=no,toolbar=no,status=yes,titlebar=yes'
                  );
                });

                doInWordpress(async () => {
                  localStorage.setItem(preview_url, getCurrentPageName());
                  const wp_post = getWpPageConfig();
                  const projectData = await getProjectData();
                  window.open(
                    `/wordpress/preview?url=${wp_post.link}&save_state=${projectData.currentEditingPage.save_state}&mode=preview`,
                    "infinitely-preview",
                    // 'width=800,height=600,top=50,left=50,scrollbars=yes,resizable=yes,location=yes,menubar=no,toolbar=no,status=yes,titlebar=yes'
                  );
                });
                // console.log("navigated to frontend");

                // navigate("/preview" , {});
                // setShowPreview((old) => !old);
              }}
              className="shrink-0"
            />

            <Li
              icon={Icons.save}
              title="save"
              justHover={true}
              className="shrink-0"
              onClick={() => {
                editor.store();
              }}
            />

            <section className="relative">
              <Li
                icon={Icons.share}
                title="share"
                isObjectParamsIcon
                className="shrink-0"
                // justHover
                fillObjIconStroke
                fillObjectIconOnHover
                onClick={() => {
                  // editor.store();
                  shareProject();
                  /**
                   *
                   * @param {MessageEvent} ev
                   */
                  const callback = async (ev) => {
                    if (ev.data.command == "shareProject") {
                      console.log(ev);
                      const { response } = ev.data;
                      if (response.status == "success") {
                        // "http://tmpfiles.org/11276583/dasd.zip"
                        const fileUrl = response.data.url.replace(
                          "http://tmpfiles.org/",
                          "https://tmpfiles.org/dl/",
                        );
                        await navigator.clipboard.writeText(
                          `${window.origin}/workspace?file=${btoa(fileUrl)}`,
                        );
                        toast.info(
                          <ToastMsgInfo
                            msg={`Share URL is copied , so you can share now💙`}
                          />,
                          { progressClassName: "bg-brand-primary" },
                        );
                      }
                      fetcherWorker.removeEventListener("message", callback);
                    }
                  };
                  fetcherWorker.addEventListener("message", callback);
                }}
              />

              {/* <p className="absolute top-[100%] left-[-150px] w-[300px] p-2 bg-surface-tertiary rounded-lg z-[500]">dadsadadl dlas,dlsadlklsakdlaksldksalkdlsalkd</p> */}
            </section>

            <Li
              icon={Icons.export}
              title="export"
              justHover={true}
              className="shrink-0"
              onClick={async () => {
                exportProject();
              }}
            />
            <Li
              to={"/edite/styling"}
              className="shrink-0"
              icon={Icons.prush}
              isObjectParamsIcon
              fillObjIcon={false}
              fillObjectIconOnHover
              notify={Object.values(asideControllersNotifires).some(
                (val) => val === true,
              )}
              title="edite component"
            />
            <Li
              to={"/add-blocks"}
              className="shrink-0"
              icon={Icons.plus}
              fillIcon
              fillObjIcon
              title="add blocks"
            />
          </>
        </section>

        <Wordpress>
          <section className=" max-w-[200px] w-[calc(100%+25px)] h-full py-2">
            <Button
              refForward={animatedRefForPublishBtn}
              disabled={storeLoad || !publish}
              onClick={(ev) => {
                publishToWp();
              }}
              className="font-bold capitalize flex items-center justify-center gap-1 w-full h-full"
            >
              {storeLoad && (
                <section className="w-[15px] h-[15px]">
                  <Loader
                    width={15}
                    height={15}
                    loaderClassName={"border-white"}
                  />
                </section>
              )}
              {storeLoad ? <p>Process</p> : <p>Publish</p>}
            </Button>
          </section>
        </Wordpress>
      </ScrollableToolbar>
      {/* </section> */}
      {/* </ToolbarComponent> */}
    </header>
  );
});
