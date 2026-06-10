import React, { useEffect, useState } from 'react'
import { MultiTab } from '../../Protos/Multitabs'
import { useEditorMaybe } from '@grapesjs/react';
import { doInNormalAsync, getComponentRules, getInfinitelySymbolInfo, initSymbol, preventSelectNavigation, reorderCss } from '../../../helpers/functions';
import { close_current_modal } from '../../../constants/InfinitelyCommands';
import { TabLabel } from '../Protos/TabLabel';
import { Icons } from '../../Icons/Icons';
import { CodeEditor } from '../Protos/CodeEditor';
import { css_beautify, html_beautify } from 'js-beautify';
import { Button } from '../../Protos/Button';
import { useBusy } from '../../Protos/BusyProvider';
import { opfs } from '../../../helpers/initOpfs';
import { toast } from 'react-toastify';
import { ToastMsgInfo } from '../Protos/ToastMsgInfo';
import { defineRoot } from '../../../helpers/bridge';
import { inf_symbol_Id_attribute } from '../../../constants/shared';
import { InfinitelyEvents } from '../../../constants/infinitelyEvents';

export const SymbolCodeEditor = () => {
    const editor = useEditorMaybe();
    const [code, setCode] = useState({
        html: '',
        css: ''
    });
    const { isBusy, runWithBusy } = useBusy();

    useEffect(() => {
        if (!editor) return;
        const sle = editor.getSelected?.();
        if (!sle) {
            console.log('sle : ', sle);

            editor.runCommand(close_current_modal);
            return
        };
        const symbolInf = getInfinitelySymbolInfo(sle);
        if (!symbolInf.isSymbol) {
            editor.runCommand(close_current_modal);
            return;
        }

        const html = html_beautify(symbolInf.symbol.toHTML({
            keepInlineStyle: true,
            attributes: true,
            withProps: true,
        }));

        const css = css_beautify(getComponentRules({
            editor,
            cmp: symbolInf.symbol,
            nested: true,
        }).stringRules);

        setCode({
            html,
            css
        })
    }, [editor]);

    const save = async () => {
        const sle = editor.getSelected();
        const symbolInf = getInfinitelySymbolInfo(sle);
        if (!symbolInf.isSymbol) {
            toast.error(<ToastMsgInfo msg={`This is not symbol`} />)
            return;
        }

        const parsedDoc = new DOMParser().parseFromString(code.html, 'text/html');
        if (parsedDoc.body.children.length > 1) {
            toast.error(<ToastMsgInfo msg={`Symbol must be one element 😤`} />)
            return;
        }

        if (!(parsedDoc.body.children.length && parsedDoc.body.children[0].hasAttribute(inf_symbol_Id_attribute))) {
            toast.error(<ToastMsgInfo msg={`Symbol must have ${inf_symbol_Id_attribute} attribute to save 😑`} />)
            return;
        }

        const tid = toast.loading(<ToastMsgInfo msg={`Loading...`} />);

        await doInNormalAsync(async () => {
            await runWithBusy(async () => {
                await opfs.writeFiles([
                    {
                        path: defineRoot(`editor/symbols/${symbolInf.mainId}.html`),
                        content: code.html
                    },
                    {
                        path: defineRoot(`editor/symbols/${symbolInf.mainId}.css`),
                        content: code.css
                    }
                ]);

                const newSymbol = symbolInf.symbol.replaceWith(code.html)[0];
                reorderCss(editor, `${editor.getCss()} ${code.css}`);
                initSymbol(symbolInf.mainId, editor);
                editor.trigger(
                    `${InfinitelyEvents.symbols.update}:${symbolInf.mainId}`,
                    symbolInf.mainId,
                    sle,
                    JSON.stringify(editor.Parser.parseHtml(code.html).html)
                );
                preventSelectNavigation(editor, newSymbol);
                toast.success(<ToastMsgInfo msg={`symbol updated successfully 👌`} />)
            });

            toast.done(tid);
        });
    }

    return (
        <section className='h-full w-full flex flex-col gap-2'>
            <MultiTab

                tabs={[
                    {
                        title: <TabLabel icon={Icons.html({})} label='Html' />,
                        content: <CodeEditor props={{
                            language: 'html',
                            value: code.html,
                            onChange(value) {
                                setCode({
                                    ...code,
                                    html: value,
                                })
                            }
                        }} />

                    },
                    {
                        title: <TabLabel icon={Icons.css({})} label='Css' />,
                        content: <CodeEditor props={{
                            language: 'css',
                            value: code.css,
                            onChange(value) {
                                setCode({
                                    ...code,
                                    css: value
                                })
                            }
                        }} />
                    }
                ]}
            />
            <footer>
                <Button disabled={isBusy} onClick={async () => {
                    await save()
                }}>Save</Button>
            </footer>
        </section>
    )
}
