import { toast } from "react-toastify";
import { uniqueID } from "../helpers/cocktail";
import {
  getInfinitelySymbolInfo,
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

const defaultDirectiveCallback = ({
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
    if (!value.trim()) {
      sle.removeAttributes([directive]);
      editor.trigger(InfinitelyEvents.directives.update);
    }
    const modifiersString =
      modifiers && modifiers.length
        ? modifiers.map((modifier) => `.${modifier}`).join("")
        : "";
    const attribute = `${directive}${
      (suffix && `:${suffix}`) || ""
    }${modifiersString}`;
    if (isValidAttribute(attribute, value)) {
      sle.addAttributes({ [attribute]: value }, { avoidStore: true });
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
      editor.store();
      callback?.();
    } else {
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
    keywordsForMulti: defaultAttributeNames,
    nestedtype: "code",
    name: "bind",
    preventDefault: false,
    preventNestedDefault: false,
    callback({ editor, value, callback }) {
      defaultDirectiveCallback({
        editor,
        directive: `${this.directive}${value}`,
        preventDefault: this.preventDefault,
        value: "",
        callback,
      });
    },
    nestedCallback({ editor, value, targetAttribute, callback }) {
      defaultDirectiveCallback({
        editor,
        directive: targetAttribute,
        preventDefault: this.preventNestedDefault,
        value,
        callback,
      });
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
