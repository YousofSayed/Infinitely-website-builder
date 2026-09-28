import { ContentEditable } from "@/components/Editor/Protos/ContentEditable";
import { Input } from "@/components/Editor/Protos/Input";
import { Select } from "@/components/Editor/Protos/Select";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { OptionsButton } from "@/components/Protos/OptionsButton";
import { ShowIf } from "@/components/ShowIf";
import { current_page_id, LLM_PROVIDERS } from "@/constants/shared";
import { aiChatsState, aiChatState } from "@/helpers/atoms";
import { defineRoot } from "@/helpers/bridge";
import {
  addClickClass,
  parse,
  parseAndReturnInputIfNot,
  uniqueID,
} from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import { AIWorker, assetsWorker } from "@/helpers/defineWorkers";
import {
  callWorkerCommand,
  chatWithLLM,
  createLLM,
  detectDir,
  doInNormal,
  doInNormalAsync,
  doInWordpressAsync,
  getAIProviderAPIKey,
  getComponentRules,
  getCurrentPageName,
  getProjectData,
  getProjectId,
  getWpPageConfig,
  gjsComponentsToJSON,
  isJSONLLMResponse,
  preventSelectNavigation,
  reorderCss,
  safeParseLLMResponse,
} from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { useBusyCallback } from "@/hooks/useBusyCallback";
import { cloneDeep, isPlainObject, isString, uniqueId } from "lodash";
import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useRecoilState, useSetRecoilState } from "recoil";
import { flushSync } from "react-dom";
import FastMarkdown from "@/components/AI/FastMarkdown";
import { useEditorMaybe } from "@grapesjs/react";
import LLM from "@themaximalist/llm.js";
import { ChooseFile } from "@/components/Protos/ChooseFile";
import { minify } from "csso";
import { useWpTokens } from "@/queries/wp.queries";
import { SwitchButton } from "@/components/Protos/SwitchButton";
import { Wordpress } from "@/components/Protos/wordpress/Wordpress";

const sortByDateDesc = (a, b) => new Date(b.date) - new Date(a.date);

const getModelValue = (model) => {
  if (!model) return "";
  if (typeof model === "string") return model;

  return model.model || model.id || model.name || model.value || "";
};

const getModelTitle = (model) => {
  if (!model) return "";
  if (typeof model === "string") return model;

  return model.name || model.title || model.model || model.id || "";
};

const isChatModel = (model) => {
  const value = getModelValue(model).toLowerCase();

  if (!value) return false;

  if (
    value.includes("tts") ||
    value.includes("text-to-speech") ||
    value.includes("speech") ||
    value.includes("embedding")
  ) {
    return false;
  }

  if (model?.capabilities?.chat === false) return false;

  if (Array.isArray(model?.supported_generation_methods)) {
    return model.supported_generation_methods.some((method) =>
      /generate_content|chat|multiturn/i.test(String(method)),
    );
  }

  return true;
};

export const AIThinkingBubble = memo(function AIThinkingBubble() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <section className="flex flex-col gap-3 p-4 rounded-2xl animate-fade-in-up w-[calc(100%-60px)] self-end bg-surface-tertiary/40 backdrop-blur-md border border-slate-700/30 shadow-xl shadow-black/5">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border border-brand-primary/20 overflow-hidden">
            <Icons.ai className="w-5 h-5 text-brand-primary z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-brand-primary tracking-wider uppercase flex items-center gap-2">
              Infinitely AI
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce"></span>
              </span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Analyzing context & generating...
            </span>
          </div>
        </div>

        <div className="space-y-3 pl-12">
          <div className="h-2.5 bg-slate-700/40 rounded-full w-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-500/30 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-2.5 bg-slate-700/40 rounded-full w-[92%] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-500/30 to-transparent animate-shimmer [animation-delay:0.2s]"></div>
          </div>
          <div className="h-2.5 bg-slate-700/40 rounded-full w-[75%] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-500/30 to-transparent animate-shimmer [animation-delay:0.4s]"></div>
          </div>
          <div className="h-2.5 bg-slate-700/40 rounded-full w-[40%] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-500/30 to-transparent animate-shimmer [animation-delay:0.6s]"></div>
          </div>
        </div>
      </section>
    </>
  );
});

const MessageItem = memo(function MessageItem({
  message,
  onContinue,
  isSendingMessage,
  isBuilder = false,
  buildData,
}) {
  const editor = useEditorMaybe();
  const isUser = message.role === "user";
  const [isReady, setIsReady] = useState(false);

  const hasContinueToken =
    isString(message.content) && message.content.includes("[[inf_continue]]");
  const hasEndToken =
    isString(message.content) && message.content.includes("[[inf_end]]");

  const displayContent = isString(message.content)
    ? message.content
        .replace("[[inf_continue]]", "")
        .replace("[[inf_end]]", "")
        .trim()
    : message.content.text;

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const saveData = async () => {
    const { componentId, html, css, js } = buildData;
    const wrapper = editor.getWrapper();
    const sle =
      wrapper.getId() === componentId
        ? wrapper
        : wrapper.find(`#${componentId}`)[0];

    await doInNormalAsync(async () => {
      const currentPageName = localStorage.getItem(current_page_id);
      const jsFile = await opfs.getFile(defineRoot(`js/${currentPageName}.js`));
      const jsContent = await jsFile.text();
      const newJsContent = jsContent + `\n\n${js}`;
      await opfs.writeFiles([
        {
          path: defineRoot(`js/${currentPageName}.js`),
          content: newJsContent,
        },
      ]);
      sle.components(html);
      reorderCss(editor, `${editor.getCss()} ${css}`, true);
    });
  };

  return (
    <section
      className={`flex flex-col p-2 gap-2 rounded-lg w-[calc(100%-60px)] shadow-md ${
        isUser
          ? "self-start bg-brand-primary text-white"
          : "self-end bg-surface-tertiary border border-slate-700/40 text-slate-200"
      }`}
    >
      {isReady ? (
        <FastMarkdown content={displayContent} isUser={isUser} />
      ) : (
        <p
          className="whitespace-pre-wrap break-words text-sm leading-relaxed font-medium"
          style={{
            direction: detectDir(displayContent),
          }}
        >
          {displayContent}
        </p>
      )}

      {hasContinueToken && !isUser && !hasEndToken && (
        <button
          onClick={onContinue}
          disabled={isSendingMessage}
          className={`mt-4 flex items-center gap-2 px-4 py-2.5 bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/50 text-brand-primary text-sm font-bold rounded-lg transition-all shadow-sm self-start group ${
            isSendingMessage ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:translate-x-0.5 transition-transform"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          {isSendingMessage ? "Generating..." : "Continue Generation"}
        </button>
      )}

      {/* FIXED: Added missing && operator before the parenthesis */}
      {/* {isBuilder &&
        buildData &&
        !isUser &&
        (!hasContinueToken || hasEndToken) && (
          <Button className="w-fit font-medium" onClick={saveData}>
            Save component
          </Button>
        )} */}
    </section>
  );
});

const MessageList = memo(function MessageList({
  messages,
  isSendingMessage,
  chatId,
  onContinue,
  isBuilder,
  buildData,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  useLayoutEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ block: "end" });
  }, [chatId]);

  useEffect(() => {
    if (!containerRef.current || !bottomRef.current) return;
    const container = containerRef.current;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      150;

    if (isNearBottom || isSendingMessage) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }
  }, [messages, isSendingMessage]);

  return (
    <section
      ref={containerRef}
      className="h-full flex flex-col gap-3 overflow-x-hidden overflow-y-auto hideScrollBar"
    >
      {messages
        ?.filter((message) => message.role !== "system")
        ?.map((message, i) => (
          <MessageItem
            key={`${message.role}-${i}`}
            message={message}
            onContinue={onContinue}
            isSendingMessage={isSendingMessage}
            isBuilder={isBuilder}
            buildData={buildData}
          />
        ))}

      {isSendingMessage && <AIThinkingBubble />}
      <div ref={bottomRef} className="h-1 w-full shrink-0" />
    </section>
  );
});

export const Chat = memo(function Chat({
  chat,
  showEdit,
  setShowEdit,
  isDisabled,
  onSelect,
  onDelete,
  onTogglePin,
  onRename,
}) {
  const isEditing = showEdit === chat.id;

  return (
    <li
      className="flex items-center gap-2 justify-between p-2 font-medium text-slate-200 bg-surface-main rounded-lg cursor-pointer transition-colors hover:bg-surface-tertiary"
      onClick={(e) => {
        e.stopPropagation();
        addClickClass(e.currentTarget, "click");
        if (!isDisabled) onSelect(chat);
      }}
    >
      <div className="flex items-center gap-2 auto-animate min-w-0">
        <i>
          <Icons.ai />
        </i>

        <ContentEditable
          showInput={isEditing}
          setShowInput={(show) => setShowEdit(show ? chat.id : null)}
          value={chat.name}
          onInput={(e) => onRename(chat.id, e.currentTarget.value)}
        >
          <h1 className="truncate">{chat.name}</h1>
        </ContentEditable>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <OptionsButton>
          <div className="flex flex-col gap-2">
            <SmallButton
              disabled={isDisabled}
              className="p-1 w-full aspect-square hover:!bg-[crimson]"
              tooltipTitle="Delete Chat"
              tooltipClassName="!bg-[crimson]"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(chat);
              }}
            >
              {Icons.trash("white", 2)}
            </SmallButton>

            <SmallButton
              disabled={isDisabled}
              className="p-1 w-full aspect-square"
              tooltipTitle={chat.is_pinned ? "Unpin Chat" : "Pin Chat"}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(chat);
              }}
            >
              {!chat.is_pinned ? (
                <Icons.pin fill="white" width={18} height={18} />
              ) : (
                <Icons.unpin fill="white" width={18} height={18} />
              )}
            </SmallButton>

            <SmallButton
              className="p-1 w-full aspect-square"
              tooltipTitle="Edit Chat"
              onClick={(e) => {
                e.stopPropagation();
                setShowEdit((prev) => (prev === chat.id ? null : chat.id));
              }}
            >
              <Icons.edite fill="white" width={18} height={18} />
            </SmallButton>
          </div>
        </OptionsButton>
      </div>
    </li>
  );
});

export const Chats = () => {
  const editor = useEditorMaybe();

  const [chats, setChats] = useRecoilState(aiChatsState);
  const [chat, setChat] = useRecoilState(aiChatState);

  const [showEdit, setShowEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [aiMessage, setAiMessage] = useState("");
  const [think, setThink] = useState(false);
  const [models, setModels] = useState([]);

  const [buildData, setBuildData] = useState();
  const buildDataRef = useRef(null); // ✅ Ref to track buildData synchronously
  const textareaRef = useRef(null);
  const [options, setOptions] = useState({
    wpTokens: false,
  });

  const {
    data: tokensRes,
    isPending: tokensLoading,
    isRefetching: tokensRefetch,
  } = useWpTokens();

  useEffect(() => {
    buildDataRef.current = buildData;
  }, [buildData]);

  const llmId = useRef("");
  const [attachments, setattachments] = useState([]);
  const [attachmentsMeta, setattachmentsMeta] = useState([]);
  const fileInputRef = useRef(/** @type {HTMLInputElement} */ (null));
  const latestBuilderModeChatHistory = useRef([]);

  const projectId = getProjectId();

  useEffect(() => {
    if (!projectId) return;

    (async () => {
      const projectData = await getProjectData();
      setChats(projectData?.aiChats || []);
    })();
  }, [projectId, setChats]);

  useEffect(() => {
    if (!projectId) return;

    const timer = setTimeout(async () => {
      await db.projects.update(projectId, { aiChats: chats });
    }, 800);

    return () => clearTimeout(timer);
  }, [chats, projectId]);

  useEffect(() => {
    if (!chat?.id) return;

    setChats((oldChats) => {
      return (oldChats || []).map((c) => {
        if (c.id === chat.id) {
          return {
            ...c,
            ...chat,
          };
        }

        return c;
      });
    });
  }, [chat]);

  useEffect(() => {
    if (!chat?.provider) return;
    getModels(chat.provider);
  }, [chat?.provider]);

  useEffect(() => {
    if (!chat?.id) return;
    const timer = setTimeout(() => {
      writeMessagesFile();
    }, 600);
    return () => clearTimeout(timer);
  }, [chat?.messages]);

  const [addChat, { isLoading: isAddingChat }] = useBusyCallback(async () => {
    const tid = toast.loading(<ToastMsgInfo msg="Creating new chat..." />);

    try {
      const projectData = await getProjectData();

      const newChat = /** @type {import("@/helpers/types").Chat} */ ({
        id: uniqueId(`chat-id-${uniqueID()}-${Date.now()}-`),
        name: "New Chat",
        date: Date.now(),
        messages: [],
        is_pinned: false,
        provider: projectData?.aiSettings?.defaultProvider,
        model: "",
      });

      setChats((prev) => [...(prev || []), newChat]);

      await opfs.writeFiles([
        {
          path: defineRoot(`ai/chats/${newChat.id}.json`),
          content: JSON.stringify([]),
        },
      ]);

      toast.done(tid);
      toast.success(<ToastMsgInfo msg="Chat created successfully 💙" />);
    } catch (error) {
      toast.done(tid);
      toast.error(<ToastMsgInfo msg="Failed to create chat" />);
      console.error(error);
    }
  });

  const [deleteChat, { isLoading: isDeletingChat }] = useBusyCallback(
    async (chat) => {
      const tid = toast.loading(<ToastMsgInfo msg="Deleting chat..." />);

      try {
        setChats((prev) => [...(prev || [])].filter((c) => c.id !== chat.id));

        await opfs.removeFiles([defineRoot(`ai/chats/${chat.id}.json`)]);

        toast.done(tid);
        toast.success(<ToastMsgInfo msg="Chat deleted successfully 💙" />);
      } catch (error) {
        toast.done(tid);
        toast.error(<ToastMsgInfo msg="Failed to delete chat" />);
        console.error(error);
      }
    },
  );

  const [goToChat, { isLoading: isGoToChat }] = useBusyCallback(
    async (chat) => {
      try {
        setIsLoading(true);

        const selectedChat = cloneDeep(chat);
        const projectData = await getProjectData();

        if (
          !(
            selectedChat.provider || projectData?.aiSettings?.defaultProvider
          ) ||
          !projectData?.aiSettings?.defaultProvider
        ) {
          toast.warn(<ToastMsgInfo msg="You must select provider" />);
          return;
        }

        if (
          !selectedChat.provider &&
          projectData?.aiSettings?.defaultProvider
        ) {
          selectedChat.provider = projectData?.aiSettings?.defaultProvider;
        }

        const file = await opfs.getFile(
          defineRoot(`ai/chats/${selectedChat.id}.json`),
        );

        const messages = JSON.parse(await file.text());

        selectedChat.messages = messages;
        const sle = editor.getSelected();
        const editedComponentContent = sle ? sle.getView().el.innerHTML : null;

        const { id: llm_id, hasAttachments } = await createLLM({
          chat: selectedChat,
          modelVal: selectedChat?.model?.model || "",
          think,
          attachments: attachments,
          previousMessages: messages,
          editedComponentContent:
            selectedChat.mode === "builder"
              ? JSON.stringify({
                  ...buildData,
                  html: editedComponentContent,
                  css: getComponentRules({
                    cmp: sle,
                    editor,
                    nested: true,
                  }).stringRules,
                })
              : null,
        });

        llmId.current = llm_id;

        selectedChat.llm_id = llmId.current;

        setChat(selectedChat);
      } catch (error) {
        toast.error(<ToastMsgInfo msg="Failed to open chat" />);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
  );

  const [pinAndUnPin, { isLoading: isPinning }] = useBusyCallback(
    async (chat) => {
      const updatedChat = cloneDeep(chat);
      updatedChat.is_pinned = !updatedChat.is_pinned;

      setChats((prev) =>
        [...(prev || [])].map((c) =>
          c.id === updatedChat.id ? updatedChat : c,
        ),
      );
    },
  );

  const prepareAndSend = () => {
    if (!chat?.provider)
      return toast.warn(<ToastMsgInfo msg="You must select provider" />);
    const modelVal = getModelValue(chat.model);
    if (!modelVal)
      return toast.warn(<ToastMsgInfo msg="You must select model" />);
    if (!aiMessage.trim()) return;

    const sle = editor.getSelected();
    if (chat.mode === "builder" && !sle) {
      return toast.warn(<ToastMsgInfo msg="You must select a component 😊" />);
    }
    const isWrapper = sle?.getType?.()?.toLowerCase?.() === "wrapper";

    if (chat.mode === "builder" && isWrapper) {
      return toast.warn(<ToastMsgInfo msg="You can't edite wrapper 😶" />);
    }

    const messageToSend = aiMessage;
    const previousMessages = chat.mode === "builder" ? [] : chat.messages || [];

    flushSync(() => {
      setAiMessage("");
      setChat((prev) => ({
        ...prev,
        messages: [
          ...(chat.mode === "builder" ? [] : prev.messages || []),
          { role: "user", content: messageToSend },
        ],
      }));
    });

    executeSend({ messageToSend, previousMessages, modelVal });
  };

  const [executeSend, { isLoading: isSendingMessage }] = useBusyCallback(
    async ({ messageToSend, previousMessages, modelVal }) => {
      try {
        const sle = editor.getSelected();

        const editedComponentContent = sle?.getView?.()?.el?.innerHTML;
        console.log("attachments when send", attachments);

        const chatHandler = async ({ messageToSend }) => {
          const previousContent =
            chat.mode === "builder"
              ? `
            - previous responses: ${JSON.stringify(latestBuilderModeChatHistory.current || [])},
            - current page components children : ${JSON.stringify(gjsComponentsToJSON(editor.getWrapper()))},
            - current Component Id  : ${sle?.getId?.()}
            - current Page CSS file : (${
              minify(
                // getComponentRules({
                //   cmp: sle,
                //   editor,
                //   nested: true,
                // }).stringRules,
                editor.getCss({
                  keepUnusedStyles: false,
                }),
              ).css
            }),
            ${
              options.wpTokens && tokensRes?.success
                ? `- wordpress tokens : ${JSON.stringify(
                    Object.values(tokensRes.groups ?? {})
                      .flatMap((g) => g?.tokens ?? [])
                      .filter(Boolean),
                  )} use it if current Infinitely Studio mode is wordpress and builder mode is on and make sure that you use Infinitely Studio blocks and our handling when building (this is a must).`
                : ""
            }
          `
              : "";
          const { updatedMessages, llm_id } = await chatWithLLM({
            attachments: attachments,
            chat,
            modelVal,
            previousMessages,
            think,
            message: messageToSend,
            editedComponentContent: previousContent,
          });

          return {
            updatedMessages,
            llm_id,
          };
        };

        const { updatedMessages, llm_id } = await chatHandler({
          messageToSend,
        });

        const lastMessage = updatedMessages[updatedMessages.length - 1];
        const safeResponse = safeParseLLMResponse(lastMessage.content);
        const isValidJsonResponse = !safeResponse?.faild;

        const parseedMessage =
          lastMessage.role === "assistant" &&
          lastMessage.content &&
          isValidJsonResponse
            ? safeResponse
              ? safeResponse
              : lastMessage.content
            : lastMessage.content;

        console.log(isValidJsonResponse, "isValidJsonResponse");

        if (isPlainObject(parseedMessage)) {
          console.log("parseedMessage : ", parseedMessage);

          latestBuilderModeChatHistory.current.length > 10 &&
            latestBuilderModeChatHistory.current.shift();

          latestBuilderModeChatHistory.current.push(
            ...[
              {
                role: "user",
                content: messageToSend,
              },
              {
                role: "assistant",
                content: parseedMessage,
              },
            ],
          );

          // ✅ Check if this is a continuation request
          const isContinuation = messageToSend.includes(
            "Continue generating exactly",
          );
          const prevData = buildDataRef.current;

          // ✅ Ensure we are still working on the same component before appending
          const isSameComponent = prevData?.componentId === sle?.getId?.();

          // ✅ Accumulate HTML, CSS, and JS if it's a continuation
          const accumulatedData = {
            componentId: sle?.getId?.(),
            html:
              isContinuation && isSameComponent
                ? (prevData?.html || "") + parseedMessage.html
                : parseedMessage.html,
            css:
              isContinuation && isSameComponent
                ? (prevData?.css || "") + "\n" + parseedMessage.css
                : parseedMessage.css,
            js:
              isContinuation && isSameComponent
                ? (prevData?.js || "") + "\n" + parseedMessage.js
                : parseedMessage.js,
          };

          if (chat.mode === "builder" && sle) {
            accumulatedData.css &&
              accumulatedData.css?.toLowerCase?.() !== "empty" &&
              reorderCss(
                editor,
                `${editor.getCss({
                  keepUnusedStyles: false,
                })} \n ${accumulatedData.css}`,
                true,
              );

            if (
              isPlainObject(accumulatedData.html) &&
              Object.keys(accumulatedData.html).length > 0
            ) {
              for (const [id, component] of Object.entries(
                accumulatedData.html,
              )) {
                // sle.components(accumulatedData.html);
                let currentSelected;
                editor
                  .getWrapper()
                  .find(`#${id}`)
                  .forEach((cmp) => {
                    const oldId = sle?.getId?.();
                    const newCmp = cmp.replaceWith(component)[0];
                    if (id === oldId) {
                      currentSelected = newCmp;
                    }
                  });

                preventSelectNavigation(editor, currentSelected);
              }
            }
            // accumulatedData.html &&
            //   accumulatedData.html?.toLowerCase?.() !== "empty" &&
            //   sle.components(accumulatedData.html);
          }
          // Update the DOM preview using the fully accumulated data
          // const script = `<script type="text/javascript" id="ai-script-${sle.getId()}">${accumulatedData.js}</script>`;
          // const style = `<style type="text/css" id="ai-style-${sle.getId()}">${accumulatedData.css}</style>`;

          // // sleView.insertAdjacentHTML("beforeend", style);
          // sleView.insertAdjacentHTML("beforeend", script);
          // sleView.insertAdjacentHTML("beforeend", accumulatedData.html);

          setBuildData(accumulatedData);

          lastMessage.content =
            parseedMessage?.explaination || lastMessage.content;

          if (chat.mode === "builder") {
            editor.refresh({ tools: true });
            editor.Canvas.refresh({ all: true, spots: true });
            editor.Canvas.refreshSpots();
            editor.store();
          }
        }

        flushSync(() => {
          setChat((prev) => ({
            ...prev,
            llm_id,
            messages: updatedMessages,
            name: parseedMessage?.title || prev.name,
          }));
        });

        if (
          (!chat.name ||
            chat.name === "New Chat" ||
            isJSONLLMResponse(chat.name).isValid) &&
          chat.mode === "chat"
        ) {
          setTimeout(async () => {
            const { llm_id, updatedMessages } = await chatHandler({
              messageToSend: `What is the name of this chat ? (respond with a string)`,
            });

            const lastMessage = updatedMessages[updatedMessages.length - 1];
            const isValidJsonResponse = isJSONLLMResponse(
              lastMessage.content,
            ).isValid;

            const newChatName =
              isValidJsonResponse && chat.mode === "builder"
                ? safeParseLLMResponse(lastMessage.content).explaination
                : chat.mode === "chat"
                  ? lastMessage.content
                  : chat.name;

            console.log("new chat name : ", newChatName);

            setChat((prev) => ({
              ...prev,
              name: newChatName,
            }));
          }, 10);
        }
      } catch (error) {
        console.error(error);
        toast.error(
          <ToastMsgInfo
            msg={
              error?.message ||
              error?.response?.data ||
              error?.response?.data?.message ||
              "Failed to send message"
            }
          />,
        );
      }
    },
  );

  const [getModels, { isLoading: idGetModels }] = useBusyCallback(
    async (provider) => {
      try {
        const models =
          (await callWorkerCommand(AIWorker, "getModels", {
            provider,
            api_key: getAIProviderAPIKey({ provider }),
          })) || [];
        console.log("ai provider models : ", models);

        setModels(models);
      } catch (error) {
        setModels([]);
        setChat((prev) => ({ ...prev, model: null, model_name: "" }));
      }
    },
  );

  const [writeMessagesFile, { isLoading: isWriting }] = useBusyCallback(
    async () => {
      callWorkerCommand(assetsWorker, "writeFilesToOPFS", {
        files: [
          {
            content: JSON.stringify(chat.messages),
            path: defineRoot(`ai/chats/${chat.id}.json`),
          },
        ],
      });
    },
  );

  const handleContinue = useCallback(() => {
    if (!chat?.provider)
      return toast.warn(<ToastMsgInfo msg="You must select provider" />);
    const modelVal = getModelValue(chat.model);
    if (!modelVal)
      return toast.warn(<ToastMsgInfo msg="You must select model" />);

    const continuationPrompt =
      "Continue generating exactly from where you left off. Do not repeat any previously generated code or text. Just output the next part.";

    // ✅ Keep history minimal in builder mode to save tokens!
    // The LLM will rely on editedComponentContent (accumulated buildData) for context.
    const previousMessages = chat.mode === "builder" ? [] : chat.messages || [];

    flushSync(() => {
      setChat((prev) => ({
        ...prev,
        messages: [
          ...(prev.messages || []),
          { role: "user", content: continuationPrompt },
        ],
      }));
    });

    executeSend({
      messageToSend: continuationPrompt,
      previousMessages,
      modelVal,
    });
  }, [chat, executeSend]);

  const handleRename = useCallback(
    (chatId, name) => {
      setChats((prev) =>
        [...(prev || [])].map((c) => (c.id === chatId ? { ...c, name } : c)),
      );
    },
    [setChats],
  );

  const setProivderToChat = useCallback(
    (provider) => {
      setChat({
        ...chat,
        provider,
      });
    },
    [chat],
  );

  const pinnedChats = useMemo(
    () => [...(chats || [])].filter((c) => c.is_pinned).sort(sortByDateDesc),
    [chats],
  );

  const unpinnedChats = useMemo(
    () => [...(chats || [])].filter((c) => !c.is_pinned).sort(sortByDateDesc),
    [chats],
  );

  const chatModels = useMemo(() => {
    return (models || []).filter(isChatModel);
  }, [models]);

  const isDisabled =
    isLoading ||
    isAddingChat ||
    isDeletingChat ||
    isGoToChat ||
    isPinning ||
    isSendingMessage;

  return (
    <section
      className={`
    flex flex-col gap-2 p-1 bg-surface-secondary overflow-x-hidden overflow-y-auto hideScrollBar rounded-lg w-full h-full  auto-animate
    `}
    >
      <ShowIf condition={!chat}>
        <ul className="flex flex-col gap-2">
          <li
            className="flex items-center gap-2 p-2 font-medium text-slate-200 bg-surface-main rounded-lg cursor-pointer transition-colors hover:bg-surface-tertiary [&:hover_svg]:fill-white"
            onClick={async () => {
              if (isDisabled) return;
              await addChat();
            }}
          >
            <i>{Icons.plus("white", 2)}</i>
            <h1>New Chat</h1>
          </li>
        </ul>

        <ShowIf condition={pinnedChats.length}>
          <div className="flex flex-col gap-2 border-b-[1px] border-slate-600 pb-2">
            <div className="flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-200">
              <Icons.pin fill="white" width={18} height={18} />{" "}
              <h1 className="select-none">Pinned</h1>
              <div className="w-full h-[1px] bg-slate-600"></div>
            </div>

            <ul className="flex flex-col gap-2">
              {pinnedChats.map((chat) => (
                <Chat
                  key={chat.id}
                  chat={chat}
                  showEdit={showEdit}
                  setShowEdit={setShowEdit}
                  isDisabled={isDisabled}
                  onSelect={goToChat}
                  onDelete={deleteChat}
                  onTogglePin={pinAndUnPin}
                  onRename={handleRename}
                />
              ))}
            </ul>
          </div>
        </ShowIf>

        <ShowIf condition={unpinnedChats.length}>
          {() => (
            <ul className="flex flex-col gap-2">
              {unpinnedChats.map((chat) => (
                <Chat
                  key={chat.id}
                  chat={chat}
                  showEdit={showEdit}
                  setShowEdit={setShowEdit}
                  isDisabled={isDisabled}
                  onSelect={goToChat}
                  onDelete={deleteChat}
                  onTogglePin={pinAndUnPin}
                  onRename={handleRename}
                />
              ))}
            </ul>
          )}
        </ShowIf>
      </ShowIf>

      <ShowIf condition={isPlainObject(chat)}>
        <header
          className="w-fit p-2 rounded-lg bg-surface-tertiary flex items-center gap-1 cursor-pointer transition-colors hover:bg-brand-primary"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setChat(null);
          }}
        >
          <i className="block rotate-90">{Icons.arrow("white", 2)}</i>
          <h1 className="text-slate-200 font-medium">Back to Chats</h1>
        </header>

        <ShowIf condition={chat?.messages?.length > 0 || isSendingMessage}>
          {() => (
            <MessageList
              key={chat.id}
              messages={chat?.messages || []}
              isSendingMessage={isSendingMessage}
              onContinue={handleContinue}
              isBuilder={chat.mode === "builder"}
              buildData={buildData}
            />
          )}
        </ShowIf>

        <section className="w-full p-2 border border-slate-600 rounded-lg self-end   ">
          <div className="w-full flex gap-2">
            <textarea
              ref={textareaRef}
              style={{ direction: detectDir(aiMessage) }}
              placeholder="Message Infinitely AI..."
              className="w-full p-4 pb-16 bg-surface-tertiary rounded-lg outline-none resize-none overflow-y-auto hideScrollBar text-[15px] leading-relaxed text-slate-100 placeholder-slate-400"
              rows={1}
              value={aiMessage}
              onChange={(e) => {
                setAiMessage(e.target.value);
                // Auto-resize logic
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 240) + "px";
              }}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (isDisabled) return;
                  prepareAndSend();
                }
              }}
            />
          </div>

          <section className="flex  justify-between gap-2 mt-2">
            <section className="flex gap-2">
              {/* <SmallButton
                disabled={isSendingMessage}
                tooltipTitle="Add attachment"
                className="w-fit p-2 aspect-square  transition-colors !bg-surface-tertiary hover:!bg-brand-primary"
                onClick={async () => {
                  if (isDisabled) return;
                  await clearChat();
                }}
              >
                <Icons.attachment
                  fill="white"
                  stroke="white"
                  strokeWidth={3}
                  onClick={() => fileInputRef.current.click()}
                />
              </SmallButton> */}

              <ChooseFile
                allowCheckBox
                checkedFilesState={attachmentsMeta}
                hideInput
                onSelect={async (files) => {
                  let filesToAttach = [];
                  const tid = toast.loading(
                    <ToastMsgInfo msg="Uploading..." />,
                  );
                  setattachmentsMeta(files);
                  doInNormal(() => {
                    filesToAttach = files.map((file) => file.file);
                  });

                  await doInWordpressAsync(async () => {
                    filesToAttach = await Promise.all(
                      files.map(async (file) => {
                        const res = await callWorkerCommand(
                          assetsWorker,
                          "wp_get_blob_media_by_slug",
                          {
                            file,
                            projectId,
                          },
                        );
                        return res;
                      }),
                    );
                  });
                  console.log("files selected : ", files, filesToAttach);

                  setattachments(filesToAttach);

                  // toast.update(tid, {
                  //   render: ()=><ToastMsgInfo msg="Files uploaded successfully" />,
                  //   type: "success",
                  // });
                  toast.dismiss(tid);
                  toast.success(
                    <ToastMsgInfo msg="Files uploaded successfully" />,
                  );
                }}
              />

              <OptionsButton>
                <div className="flex flex-col gap-2">
                  <Select
                    containerClassName="!p-0"
                    className="!p-0"
                    keywords={LLM_PROVIDERS}
                    placeholder="choose provider"
                    value={chat?.provider || ""}
                    onAll={(value) => {
                      setProivderToChat(value);
                    }}
                  />
                  <Select
                    containerClassName="!p-0"
                    className="!p-0"
                    keywords={chatModels?.map((model) => ({
                      title: model.model,
                      value: model,
                    }))}
                    value={chat?.model_name || ""}
                    placeholder="choose model"
                    onAll={(value) => {
                      console.log("value :", value);
                      if (isPlainObject(value)) {
                        setChat({
                          ...chat,
                          model: value,
                          model_name: value.model,
                        });
                      } else {
                        setChat({
                          ...chat,
                          model_name: value,
                        });
                      }
                    }}
                  />

                  <Wordpress>
                    <div className="flex items-center justify-between gap-2">
                      <h1>Access wordpress tokens</h1>
                      <SwitchButton
                        defaultValue={chat?.options?.wpTokens}
                        onSwitch={() =>
                          setChat({
                            ...chat,
                            options: {
                              ...chat?.options,
                              wpTokens: !chat?.options?.wpTokens,
                            },
                          })
                        }
                      />
                    </div>
                  </Wordpress>
                </div>
              </OptionsButton>
            </section>

            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={(e) => {
                attachments.current = [...e.target.files];
                e.target.value = "";
              }}
            />

            <section className="flex gap-2">
              <Select
                placeholder="Mode"
                keywords={["chat", "builder"]}
                className="!p-0 border border-slate-600 !w-[150px]"
                inputClassName="text-center bg-surface-secondary"
                value={chat?.mode || ""}
                preventInput
                onAll={(value) => {
                  let removeMessages = false;
                  if (value === "builder") {
                    const cnfrm = confirm(
                      `Are you sure to change mode this will remove all messages ?`,
                    );
                    removeMessages = cnfrm;
                  }

                  setChat({
                    ...chat,
                    mode: value,
                    messages: removeMessages ? [] : chat.messages,
                  });
                }}
              />

              <h1
                className={`
                 py-1 px-6 rounded-lg transition-all border ${think ? "border-brand-primary bg-brand-primary" : "border-slate-600"}
                 flex items-center justify-center font-medium 
                 cursor-pointer
                
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  setThink(!think);
                }}
              >
                Think
              </h1>

              <SmallButton
                disabled={isSendingMessage}
                tooltipTitle="Send message"
                className="w-fit p-2 aspect-square  transition-colors !bg-surface-tertiary hover:!bg-brand-primary"
                onClick={async () => {
                  if (isDisabled) return;
                  prepareAndSend();
                }}
              >
                <Icons.send fill="white" stroke="white" strokeWidth={3} />
              </SmallButton>
            </section>
          </section>
        </section>
      </ShowIf>
    </section>
  );
};
