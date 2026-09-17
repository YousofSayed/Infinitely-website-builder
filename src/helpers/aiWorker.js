import { doWorkerPattern } from "@/helpers/workersPattern";
import { uniqueId } from "lodash";

console.log("AI Worker Fire 🔥");

globalThis.process = {
  env: {},
  browser: true,
};

/**
 * @type {Map<string, import("@themaximalist/llm.js").LLMServices>}
 */
const llms = new Map();
const { default: LLM } = await import("@themaximalist/llm.js");

export const commands = {
  /**
   *
   * @param {{provider : string}} props
   * @returns
   */
  async getModels(props) {
    const { provider } = props;
    const llm = new LLM({ service: provider , apiKey: "AIzaSyCiPV5nKj-nINHJ4hr24AbRjB9-TlozrfE",});
    return await llm.fetchModels();
  },

  createLLM: async ({}) => {
    // const { default: LLM } = await import("@themaximalist/llm.js");

    console.log("LLM loaded:", LLM);
    const llm = new LLM({
      service: "google",
      apiKey: "AIzaSyCiPV5nKj-nINHJ4hr24AbRjB9-TlozrfE",
      model: "gemini-3.5-flash-lite",
      max_tokens:1500000
    });

    llm.system(`
        You are Infinitely Studio ai ,
         and you are a web developer ,
          Infinitely can build a websites by drag and drop,
          do not to any message that is not related to Infinitely Studio 
          and say that this is not my topic or any response with you way,
          #your task is to build a website and return html/css/js .
        
        `);

    const uuid = uniqueId("llm-id-");
    llms.set(uuid, llm);
    return uuid;
  },
  getLLM: async ({ uuid }) => {
    return llms.get(uuid);
  },
  llmChat: async ({ id, message }) => {
    const llm = llms.get(id);
    if (!llm) throw new Error("LLM not found");
    console.log("llmChat", llm, message);

    return await llm.chat(message);
  },
};

doWorkerPattern(commands);
