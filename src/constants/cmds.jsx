import { toast } from "react-toastify";
import { uniqueID } from "../helpers/cocktail";
import {
  getInfinitelySymbolInfo,
  getProjectSettings,
  isValidAttribute,
} from "../helpers/functions";
import {
  alpineEventModifiers,
  alpineTransition,
  alpineTransitionModifiers,
} from "./alpineConstants";
import { defaultAttributeNames, eventNames } from "./hsValues";
import { InfinitelyEvents } from "./infinitelyEvents";
import { ToastMsgInfo } from "../components/Editor/Protos/ToastMsgInfo";
import React from "react";
import { current_symbol_id } from "./shared";
import { isArray } from "lodash";

const defaultDirectiveCallback = async ({
  editor,
  directive,
  value = "",
  suffix,
  modifiers = [],
  preventDefault,
  callback,
}) => {
  if (!preventDefault) {
    /**
     * @type {import('grapesjs').Component}
     */
    const sle = editor.getSelected();
    const projectSettings = getProjectSettings();

    const modifiersString =
      modifiers && modifiers.length
        ? modifiers.map((modifier) => `.${modifier}`).join("")
        : "";
    const attribute = `${directive}${
      suffix && isArray(suffix)
        ? `${suffix.map((sufx) => `:${sufx}`).join()}`
        : (suffix && `:${suffix}`) || ""
    }${modifiersString}`;

    if (!(attribute.trim() && value.trim())) {
      console.log("from remover : ", attribute, value, sle);

      sle.removeAttributes(attribute);
      editor.trigger(InfinitelyEvents.directives.update);
      return;
    }

    if (isValidAttribute(attribute, value)) {
      console.log('attributes',sle.getAttributes());
      const oldAttrs = sle.getAttributes();
      sle.addAttributes({ ...oldAttrs, [attribute]: value }, { avoidStore:  projectSettings.projectSettings.enable_auto_save });
      console.log('attributes',sle.getAttributes());
      editor.trigger(InfinitelyEvents.directives.update);
      const symbolInfo = getInfinitelySymbolInfo(sle);
      if (symbolInfo.isSymbol) {
        sessionStorage.setItem(current_symbol_id, symbolInfo.mainId);
        editor.trigger(
          `${InfinitelyEvents.symbols.update}:${symbolInfo.mainId}`,
          symbolInfo.mainId,
          sle,
          JSON.stringify(symbolInfo.symbol)
        );
      }
      await callback?.();

      projectSettings.projectSettings.enable_auto_save &&
        (await editor.store());
    }
     else {
      console.log(attribute);

      toast.error(<ToastMsgInfo msg={`Directive is not valid`} />);
    }
  }
};

/**
 * @type {import('../helpers/types').Directive[]}
 */
export const directives = [
  {
    directive: "v-scope",
    id: uniqueID(),
    type: "object",
    name: "data",
    preventDefault: false,
    showInAllComponents: true,
    callback({ editor, value, callback }) {
      defaultDirectiveCallback({
        editor,
        directive: this.directive,
        preventDefault: this.preventDefault,
        value: value,
        callback,
      });
    },
  },

  {
    directive: "v-effect",
    name: "effect",
    preventDefault: false,
    showInAllComponents: true,
    id: uniqueID(),
    type: "code",
    callback({ editor, value, callback }) {
      defaultDirectiveCallback({
        editor,
        directive: this.directive,
        preventDefault: this.preventDefault,
        value: value,
        callback,
      });
    },
  },

  {
    directive: "v-show",
    id: uniqueID(),
    type: "code",
    name: "show",
    preventDefault: false,
    callback({ editor, value, callback }) {
      defaultDirectiveCallback({
        editor,
        directive: this.directive,
        preventDefault: this.preventDefault,
        value: value,
        callback,
      });
    },
  },

  {
    directive: "v-bind",
    id: uniqueID(),
    type: "multi",
    isSuffixRequired: true,
    showInAllComponents: true,
    keywordsForMulti: defaultAttributeNames,
    codeLang: "javascript",
    nestedCodeLang: "javascript",
    nestedtype: "code",
    valueInputType: "code",
    nestedInputType: "code",
    nestedMaybeObjectModel: true,
    name: "bind",
    preventDefault: false,
    preventNestedDefault: false,
    callback({ editor, suffix, modifiers, value, callback }) {
      defaultDirectiveCallback({
        editor,
        directive: `${this.directive}`,
        suffix,
        modifiers,
        preventDefault: this.preventDefault,
        value: value,
        callback,
      });
    },
    nestedCallback({ editor, targetAttribute, value, callback }) {
      if (!this.preventNestedDefault) {
        const sle = editor.getSelected();
        sle.addAttributes({ [targetAttribute]: value });
      }
      callback?.();
    },
  },

  {
    directive: "v-on",
    id: uniqueID(),
    type: "multi",
    keywordsForMulti: eventNames,
    modifiers: alpineEventModifiers,
    valueInputType: "code",
    codeLang: "javascript",
    nestedInputType: "code",
    nestedCodeLang: "javascript",
    name: "on",
    isSuffixRequired: true,
    isValueRequired: true,
    preventDefault: false,
    preventNestedDefault: false,
    showInAllComponents: true,
    callback({ editor, suffix, modifiers, value, callback }) {
      defaultDirectiveCallback({
        editor,
        directive: `${this.directive}`,
        suffix,
        modifiers,
        preventDefault: this.preventDefault,
        value: value,
        callback,
      });
    },
    nestedCallback({ editor, targetAttribute, value, callback }) {
      if (!this.preventNestedDefault) {
        const sle = editor.getSelected();
        sle.addAttributes({ [targetAttribute]: value });
      }
      callback?.();
    },
  },

  // {
  //   directive: "v-ref",
  //   type: "code",
  //   id: uniqueID(),
  //   name: "ref",
  //   preventDefault: false,
  //   callback({ editor, value, callback }) {
  //     defaultDirectiveCallback({
  //       editor,
  //       directive: this.directive,
  //       value,
  //       preventDefault: this.preventDefault,
  //       callback,
  //     });
  //   },
  // },

  {
    directive: "v-text",
    name: "text",
    id: uniqueID(),
    type: "code",
    preventDefault: false,
    callback({ editor, value, callback }) {
      defaultDirectiveCallback({
        editor,
        directive: this.directive,
        value,
        preventDefault: this.preventDefault,
        callback,
      });
    },
  },

  {
    directive: "v-html",
    name: "html",
    id: uniqueID(),
    type: "code",
    codeLang: "html",
    preventDefault: false,
    showInAllComponents: true,
    callback({ editor, value, callback }) {
      defaultDirectiveCallback({
        editor,
        directive: this.directive,
        value,
        preventDefault: this.preventDefault,
        callback,
      });
    },
  },

  {
    directive: "v-view",
    name: "view",
    id: uniqueID(),
    type: "check",
    showInAllComponents: true,
    preventDefault: false,
    callback({ editor, value, callback }) {
      defaultDirectiveCallback({
        editor,
        directive: this.directive,
        value,
        preventDefault: this.preventDefault,
        callback,
      });
    },
  },

  {
    directive: "v-ref",
    name: "ref",
    id: uniqueID(),
    type: "code",
    showInAllComponents: true,
    preventDefault: false,
    codeLang: "text",
    callback({ editor, value, callback }) {
      defaultDirectiveCallback({
        editor,
        directive: this.directive,
        value,
        preventDefault: this.preventDefault,
        callback,
      });
    },
  },

  // {
  //   directive: "x-modelable",
  //   name: "modelable",
  //   id: uniqueID(),
  //   type: "code",
  //   preventDefault: false,
  //   callback({ editor, value, callback }) {
  //     defaultDirectiveCallback({
  //       editor,
  //       directive: this.directive,
  //       value,
  //       preventDefault: this.preventDefault,
  //       callback,
  //     });
  //   },
  // },

  // {
  //   directive: "x-transition",
  //   name: "transition",
  //   type: "multi",
  //   suffixes: alpineTransition,
  //   modifiers: alpineTransitionModifiers,
  //   valueInputType:'code',
  //   codeLang:'text',
  //   nestedInputType: "code",
  //   nestedCodeLang: "text",
  //   // isModifiersRequired:false,
  //   // isSuffixRequired:false,
  //   // isValueRequired:false,
  //   // preventDefault:false,
  //   callback({ editor, suffix, modifiers, value, callback }) {
  //     defaultDirectiveCallback({
  //       editor,
  //       directive: this.directive,
  //       value,
  //       suffix,
  //       modifiers,
  //       preventDefault: this.preventDefault,
  //       callback,
  //     });
  //   },
  //   nestedCallback({ editor, targetAttribute, value, callback }) {
  //     if (!this.preventNestedDefault) {
  //       const sle = editor.getSelected();
  //       sle.addAttributes({ [targetAttribute]: value });
  //       editor.trigger(InfinitelyEvents.directives.update)
  //     }
  //     callback?.();
  //   },
  // },

  // {
  //   directive: "x-id",
  //   name: "id",
  //   id: uniqueID(),
  //   type: "code",
  //   callback({ editor, value, callback }) {
  //     defaultDirectiveCallback({
  //       editor,
  //       directive: this.directive,
  //       value,
  //       preventDefault: this.preventDefault,
  //       callback,
  //     });
  //   },
  // },
];
