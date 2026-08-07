import { wp_update_symbol } from "@/apps/wordpress/functions";
import { close_current_modal } from "@/constants/InfinitelyCommands";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { inf_symbol_Id_attribute } from "@/constants/shared";
import { defineRoot } from "@/helpers/bridge";
import {
  doInNormalAsync,
  doInWordpressAsync,
  getComponentRules,
  getInfinitelySymbolInfo,
  getProjectId,
  initSymbol,
  preventSelectNavigation,
  reorderCss,
} from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { Icons } from "@/components/Icons/Icons";
import { useBusy } from "@/components/Protos/BusyProvider";
import { Button } from "@/components/Protos/Button";
import { MultiTab } from "@/components/Protos/Multitabs";
import { CodeEditor } from "@/components/Editor/Protos/CodeEditor";
import { TabLabel } from "@/components/Editor/Protos/TabLabel";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { css_beautify, html_beautify } from "js-beautify";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const SymbolCodeEditor = () => {
  const editor = useEditorMaybe();
  const [code, setCode] = useState({
    html: "",
    css: "",
  });
  const { isBusy, runWithBusy } = useBusy();

  useEffect(() => {
    if (!editor) return;
    const sle = editor.getSelected?.();
    if (!sle) {
      console.log("sle : ", sle);

      editor.runCommand(close_current_modal);
      return;
    }
    const symbolInf = getInfinitelySymbolInfo(sle);
    if (!symbolInf.isSymbol) {
      editor.runCommand(close_current_modal);
      return;
    }

    const html = html_beautify(
      symbolInf.symbol.toHTML({
        keepInlineStyle: true,
        attributes: true,
        withProps: true,
      }),
    );
    // console.log('symbol html : ' , symbolInf.symbol.toHTML({
    //     keepInlineStyle: true,
    //     attributes: true,
    //     withProps: true,

    // }));

    const css = css_beautify(
      getComponentRules({
        editor,
        cmp: symbolInf.symbol,
        nested: true,
      }).stringRules,
    );

    setCode({
      html,
      css,
    });
  }, [editor]);

  const save = async () => {
    const sle = editor.getSelected();
    const symbolInf = getInfinitelySymbolInfo(sle);
    if (!symbolInf.isSymbol) {
      toast.error(<ToastMsgInfo msg={`This is not symbol`} />);
      return;
    }

    const parsedDoc = new DOMParser().parseFromString(code.html, "text/html");
    // console.log('childern' , parsedDoc.body.children);

    if (parsedDoc.body.children.length > 1) {
      toast.warn(<ToastMsgInfo msg={`Symbol must be one element 😤`} />);
      return;
    }

    if (
      !(
        parsedDoc.body.children.length &&
        parsedDoc.body.children[0].hasAttribute(inf_symbol_Id_attribute)
      )
    ) {
      toast.error(
        <ToastMsgInfo
          msg={`Symbol must have ${inf_symbol_Id_attribute} attribute to save 😑`}
        />,
      );
      return;
    }

    const tid = toast.loading(<ToastMsgInfo msg={`Loading...`} />);
    const sharedCb = () => {
      const newSymbol = symbolInf.symbol.replaceWith(code.html)[0];
      reorderCss(editor, `${editor.getCss()} ${code.css}`);
      initSymbol(symbolInf.mainId, editor);
      editor.trigger(
        `${InfinitelyEvents.symbols.update}:${symbolInf.mainId}`,
        symbolInf.mainId,
        sle,
        JSON.stringify(editor.Parser.parseHtml(code.html).html),
      );
      editor.trigger("block:update");
      preventSelectNavigation(editor, newSymbol);
      toast.done(tid);
      toast.success(<ToastMsgInfo msg={`symbol updated successfully 👌`} />);
    };

    const toastError = () => {
      toast.dismiss(tid);
      toast.error(<ToastMsgInfo msg={`Faild to update symbol 😑`} />);
    };

    await doInNormalAsync(async () => {
      await runWithBusy(async () => {
        try {
          await opfs.writeFiles([
            {
              path: defineRoot(`editor/symbols/${symbolInf.mainId}.html`),
              content: code.html,
            },
            {
              path: defineRoot(`editor/symbols/${symbolInf.mainId}.css`),
              content: code.css,
            },
          ]);

          sharedCb();
        } catch (error) {
          toastError();
          throw new Error(error);
        }
      });
    });

    await doInWordpressAsync(async () => {
      await runWithBusy(async () => {
        try {
          const htmlJson = editor.Parser.parseHtml(code.html).html;
          const res = await wp_update_symbol({
            projectId: getProjectId(),
            symbol_id: symbolInf.mainId,
            symbol_meta: {
              css: code.css,
              html: htmlJson,
            },
          });

          if (res?.success) {
            console.log("update symbol res : ", res, htmlJson);
            await opfs.writeFiles([
              {
                path: `tmp/symbols/${symbolInf.mainId}/html.json`,
                content: JSON.stringify(htmlJson),
              },
              {
                path: `tmp/symbols/${symbolInf.mainId}/style.css`,
                content: code.css,
              },
            ]);
            sharedCb();
          }
        } catch (error) {
            toastError();
            throw new Error(error);
        }
      });
    });
  };

  return (
    <section className="h-full w-full flex flex-col gap-2">
      <MultiTab
        tabs={[
          {
            title: <TabLabel icon={Icons.html({})} label="Html" />,
            content: (
              <CodeEditor
                props={{
                  language: "html",
                  value: code.html,
                  onChange(value) {
                    setCode({
                      ...code,
                      html: value,
                    });
                  },
                }}
              />
            ),
          },
          {
            title: <TabLabel icon={Icons.css({})} label="Css" />,
            content: (
              <CodeEditor
                props={{
                  language: "css",
                  value: code.css,
                  onChange(value) {
                    setCode({
                      ...code,
                      css: value,
                    });
                  },
                }}
              />
            ),
          },
        ]}
      />
      <footer>
        <Button
          disabled={isBusy}
          onClick={async () => {
            await save();
          }}
        >
          Save
        </Button>
      </footer>
    </section>
  );
};
