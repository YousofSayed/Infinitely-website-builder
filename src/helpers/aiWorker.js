import { blobToBase64 } from "@/helpers/bridge";
import { db } from "@/helpers/db";
import { opfs } from "@/helpers/initOpfs";
import { doWorkerPattern } from "@/helpers/workersPattern";
import { cloneDeep, uniqueId } from "lodash";

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
const INFINITELY_GUIDE = await (
  await fetch(`/docs/builder-overview.md`)
) //INFINITELY STUDIO—COMPLETE PLUGIN.md
  .text();
console.log("INFINITELY_GUIDE", INFINITELY_GUIDE);

/**
 * 2. Main Function: Takes an array of Files/Blobs and returns LLM.Attachments
 */
async function getLLMAttachments(files) {
  const attachments = [];

  for (const file of files) {
    const base64 = await blobToBase64(file);
    const type = file.type.startsWith("image/") ? "image" : "document";

    // Automatically route to the correct LLM.js Attachment factory based on MIME type
    if (file.type === "image/jpeg" || file.type === "image/jpg") {
      attachments.push(LLM.Attachment.fromJPEG(base64));
    } else if (file.type === "image/png") {
      attachments.push(LLM.Attachment.fromPNG(base64));
    } else if (file.type === "image/gif") {
      attachments.push(LLM.Attachment.fromGIF(base64));
    } else if (file.type === "image/webp") {
      attachments.push(LLM.Attachment.fromWEBP(base64));
    } else if (file.type === "application/pdf") {
      attachments.push(LLM.Attachment.fromPDF(base64));
    } else {
      // Fallback for other file types (CSVs, TXTs, DOCX, etc.)
      attachments.push(
        LLM.Attachment.fromBase64(
          base64,
          type,
          file.type || "application/octet-stream",
        ),
      );
    }
  }

  return attachments;
}

const SYSTEM_PROMPT = `You are the Infinitely Studio AI Helper.
## YOUR ROLE
You are an expert web development assistant helping users build websites using a drag-and-drop interface. 
Adapt your communication style based on the user's expertise (Normal User, Developer, or Designer).

## INFINITELY STUDIO GUIDE
You MUST strictly read, understand, and follow this guide for all code generation:
<guide>
${INFINITELY_GUIDE}
</guide>

## RESPONSE RULES BY MODE

### MODE: "chat"
- Respond normally using standard Markdown formatting.
- If the user requests code, provide ONLY standard HTML, CSS, and JavaScript inside Markdown code blocks.
- DO NOT output JSON in chat mode.
- If the user asks to edit/build something, tell them to switch to builder mode and select a component.

### MODE: "builder"
- You MUST respond with a strictly formatted, raw JSON object.
- DO NOT use Markdown. DO NOT wrap the JSON in \`\`\`json code blocks. DO NOT include any text outside the JSON.
- The JSON object must exactly match this schema:
{
  "html": {
    "[componentId]": { /* Full GrapesJS/Infinitely component JSON tree */ }
  },
  "css": "string containing all CSS rules",
  "explaination": "string explaining the changes",
  "title": "<chat-title>"
}

## CRITICAL BUILDER EDITING RULES:
1. **PRESERVE EXISTING DATA:** When editing an existing component, you MUST return the COMPLETE and EXACT JSON tree provided in the context. Do NOT omit existing attributes, classes, styles, or child components. Only modify the specific parts the user requested.
2. **PETITE VUE RULES:** 
   - Use $delimiters: ["\${", "}"] (NOT "{{ }}").
   - Use v-on:mount, v-on:unmount, v-on:event-name (NOT @mount or @click).
   - If using v-on:mount/unmount, you MUST add v-mount="true" to the component attributes.
   - Use v-bind:attribute (NOT :attribute).
   - Put all JS logic inside Petite Vue directives or a script tag serving Petite Vue.
3. **NO HALLUCINATIONS:** Never say "I built this with Petite Vue/GSAP". Say "I built this using Infinitely Studio".
4. **LIBRARIES:** If the request requires a library not in the project settings, explain how to install it in the "explaination" field without providing code.

## GENERAL GUIDELINES
- If the user asks "What is the name of this chat?", respond with a short title string.
- Always return the "title" field in builder mode.
- If in builder mode and the user is just chatting, respond with: {"explaination": "string", "title": "<chat-title>", "html": {}, "css": ""}
`;

export const commands = {
  async getModels(props) {
    const { provider, api_key } = props;
    const llm = new LLM({ service: provider, apiKey: api_key });
    return await llm.fetchModels();
  },

  createLLM: async (props) => {
    const {
      attachments,
      api_key,
      max_tokens,
      model,
      provider,
      messages,
      think,
      id,
      projectId,
      currentPageName,
      wpPageConfig,
      mode,
      max_output_tokens,
      editedComponentContent,
    } = props;

    projectId && (await opfs.init(projectId));
    const attachmentsToSend = await getLLMAttachments(attachments);

    const llm = new LLM({
      service: provider,
      apiKey: api_key,
      model: model,
      max_tokens: max_tokens,
      extended: true,
      // stream: true,
      think,
    });

    const projectData = await db.projects.get(projectId);
    const cloneProjectData = cloneDeep(projectData);
    ["aiChats", "currentEditingPage", "current_inf_meta", "wp_meta"].forEach(
      (key) => delete cloneProjectData[key],
    );

    const currnetFilesStructure = await (
      await opfs.getAllFiles(`projects/project-${projectId}`, {
        recursive: true,
      })
    ).map((file) => file.path);

    // ✅ UNIFIED AND CLEAN CONTEXT PROMPT
    const CONTEXT_PROMPT = `
## PROJECT CONTEXT
- **Project Data:** ${JSON.stringify(cloneProjectData || {})}
- **App Type:** ${projectData.app_type || "standard"}
- **Current Page:** ${currentPageName}
- **Conversation Mode:** ${mode || "chat"}
- **Files Structure:** ${JSON.stringify(currnetFilesStructure || [])}

${
  mode === "builder"
    ? `
## BUILDER MODE ACTIVE
**Existing Component Content:**
${editedComponentContent ? `\`\`\`json\n${editedComponentContent}\n\`\`\`` : "null (Create a completely new component)"}

**INSTRUCTIONS FOR THIS RESPONSE:**
- If "Existing Component Content" is provided, you MUST output the FULL JSON tree of that component in the "html" field, applying ONLY the requested changes.
- Do not drop any existing children, attributes, or classes.
- Ensure the output is valid JSON. No markdown formatting.
- NO physical line breaks inside strings (use \\n).
- NO unescaped double quotes inside strings (use \\").
`
    : ""
}

${
  projectData.app_type === "wordpress"
    ? `
## WORDPRESS SPECIFIC CONTEXT
- **Page Config:** ${JSON.stringify(wpPageConfig || {})}
- Max Output Tokens: ${max_output_tokens || 1000}
- If your response exceeds max tokens, stop at a logical break and append [[inf_continue]]. When resumed, do not repeat old code. Once fully complete, append [[inf_end]].
- DO NOT return JavaScript in a "js" field. Use Petite-Vue directives inside HTML attributes.
`
    : ""
}
`;

    const historyWithoutSystem = (messages || []).filter(
      (m) => m.role !== "system",
    );
    llm.system(SYSTEM_PROMPT + CONTEXT_PROMPT);

    for (const msg of historyWithoutSystem) {
      if (msg.role === "user") llm.user(msg.content);
      else if (msg.role === "assistant") llm.assistant(msg.content);
    }

    const uuid = id || uniqueId("llm-id-");
    llms.set(uuid, llm);

    return { id: uuid, hasAttachments: attachmentsToSend.length > 0 };
  },
  getLLM: async ({ id }) => {
    return llms.get(id);
  },

    llmChat: async (props) => {
    const { id, message, systemPropmpt, attachments } = props;
    const llm = llms.get(id);
    if (!llm) throw new Error("LLM not found");

    // Add system prompt if it's missing
    if (
      systemPropmpt &&
      !llm.messages.some((m) => m.role === "system" && m.content === systemPropmpt)
    ) {
      llm.system(systemPropmpt);
    }

    let response;
    if (attachments && attachments.length > 0) {
      const llmAttachments = await getLLMAttachments(attachments);
      response = await llm.chat(message, { attachments: llmAttachments });
    } else {
      response = await llm.chat(message);
    }

    // ✅ NON-STREAMING HANDLING
    let fullText = "";
    let finalMessages = [];

    if (typeof response === 'string') {
      // Fallback if extended was somehow false
      fullText = response;
      finalMessages = JSON.parse(JSON.stringify(llm.messages)); // Deep clone for reactivity
    } else if (response && typeof response === 'object') {
      // extended: true returns an object with .content and .messages
      fullText = response.content || "";
      
      // response.messages is already a fresh array from the library
      finalMessages = response.messages || JSON.parse(JSON.stringify(llm.messages));
    }

    console.log("llm messages:", finalMessages, fullText || undefined, response);
    
    // Return the fresh array so your UI/Worker detects the change and updates
    return finalMessages;
  },
};
doWorkerPattern(commands);
