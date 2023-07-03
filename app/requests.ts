import type { ChatRequest, ChatResponse } from "./api/openai/typing";
import {
  Message,
  ModelConfig,
  ModelType,
  useAccessStore,
  useAppConfig,
  useChatStore,
} from "./store";
import { showToast } from "./components/ui-lib";
import { StoreKey } from "./constant";

const TIME_OUT_MS = 60000;

const makeRequestParam = (
  messages: Message[],
  options?: {
    filterBot?: boolean;
    stream?: boolean;
    model?: ModelType;
  },
): ChatRequest => {
  let sendMessages = messages.map((v) => ({
    role: v.role,
    content: v.content,
  }));

  if (options?.filterBot) {
    sendMessages = sendMessages.filter((m) => m.role !== "assistant");
  }

  const modelConfig = {
    ...useAppConfig.getState().modelConfig,
    ...useChatStore.getState().currentSession().mask.modelConfig,
  };

  // override model config
  if (options?.model) {
    modelConfig.model = options.model;
  }

  return {
    messages: sendMessages,
    stream: options?.stream,
    model: modelConfig.model,
    temperature: modelConfig.temperature,
    presence_penalty: modelConfig.presence_penalty,
  };
};

function getHeaders(sessionIndex?: number) {
  const accessStore = useAccessStore.getState();
  let headers: Record<string, string> = {};

  if (accessStore.enabledAccessControl()) {
    headers["access-code"] = accessStore.accessCode;
  }

  if (accessStore.token && accessStore.token.length > 0) {
    headers["token"] = accessStore.token;
  }
  const chatStoreObj = getChatStoreFromLS();
  const sessions = chatStoreObj.state.sessions || [];
  let pid = sessions.length > 0 ? sessions[sessionIndex].pid : "";
  let cid = sessions.length > 0 ? sessions[sessionIndex].cid : "";

  // console.log("sessionIndex", sessionIndex);
  // pid = pid || `pid-${uuidv4()}`;
  // cid = cid || `cid-${uuidv4()}`;
  headers["pid"] = pid;
  headers["cid"] = cid;

  return headers;
}

export function requestOpenaiClient(path: string, sessionIndex?: number) {
  return (body: any, method = "POST") =>
    fetch("/api/openai", {
      method,
      headers: {
        "Content-Type": "application/json",
        path,
        ...getHeaders(sessionIndex),
      },
      body: body && JSON.stringify(body),
    });
}

export async function requestChat(
  messages: Message[],
  options?: {
    model?: ModelType;
  },
  sessionIndex?: number,
) {
  const req: ChatRequest = makeRequestParam(messages, {
    filterBot: true,
    model: options?.model,
  });

  const res = await requestOpenaiClient(
    "v1/chat/completions",
    sessionIndex,
  )(req);

  try {
    const response = (await res.json()) as ChatResponse;
    return response;
  } catch (error) {
    console.error("[Request Chat] ", error, res.body);
  }
}

export async function requestUsage() {
  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  const ONE_DAY = 2 * 24 * 60 * 60 * 1000;
  const now = new Date(Date.now() + ONE_DAY);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDate = formatDate(startOfMonth);
  const endDate = formatDate(now);

  const [used, subs] = await Promise.all([
    requestOpenaiClient(
      `dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`,
    )(null, "GET"),
    requestOpenaiClient("dashboard/billing/subscription")(null, "GET"),
  ]);

  const response = (await used.json()) as {
    total_usage?: number;
    error?: {
      type: string;
      message: string;
    };
  };

  const total = (await subs.json()) as {
    hard_limit_usd?: number;
  };

  if (response.error && response.error.type) {
    showToast(response.error.message);
    return;
  }

  if (response.total_usage) {
    response.total_usage = Math.round(response.total_usage) / 100;
  }

  if (total.hard_limit_usd) {
    total.hard_limit_usd = Math.round(total.hard_limit_usd * 100) / 100;
  }

  return {
    used: response.total_usage,
    subscription: total.hard_limit_usd,
  };
}

const getChatStoreFromLS = () => {
  const chatStore = window.localStorage.getItem(StoreKey.Chat);
  if (chatStore) {
    return JSON.parse(chatStore);
  }
  return {};
};

export async function requestChatStream(
  messages: Message[],
  options?: {
    filterBot?: boolean;
    modelConfig?: ModelConfig;
    model?: ModelType;
    onMessage: (message: string, done: boolean) => void;
    onError: (error: Error, statusCode?: number) => void;
    onController?: (controller: AbortController) => void;
  },
  sessionIndex?: number,
) {
  const req = makeRequestParam(messages, {
    stream: true,
    filterBot: options?.filterBot,
    model: options?.model,
  });

  console.log("[Request] ", req);

  const controller = new AbortController();
  const reqTimeoutId = setTimeout(() => controller.abort(), TIME_OUT_MS);

  try {
    const res = await fetch("/api/chat-stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        path: "v1/chat/completions",
        ...getHeaders(sessionIndex),
      },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    clearTimeout(reqTimeoutId);

    let responseText = "";

    const finish = () => {
      options?.onMessage(responseText, true);
      controller.abort();
    };

    if (res.ok) {
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      // const resHeaders = res.headers;
      // const cid = resHeaders.get("cid");
      // const pid = resHeaders.get("pid");
      // console.log("cid", cid, "pid", pid);

      // useChatStore.getState().updateCurrentSession((session) => {
      //   session.pid = pid;
      //   session.cid = cid;
      //   return session;
      // });

      // const chatStoreObj = getChatStoreFromLS();
      // const sessions = chatStoreObj.state.sessions || [];

      // sessions.forEach((session: any) => {
      //   session.cid = cid || "";
      //   session.pid = pid || "";
      // });
      // const newChatStoreStr = JSON.stringify(chatStoreObj || {});
      // console.log(newChatStoreStr, null, 2);
      // window.localStorage.setItem(StoreKey.Chat, newChatStoreStr);

      // console.log("update");
      // console.log(JSON.stringify(getChatStoreFromLS()));

      options?.onController?.(controller);

      while (true) {
        const resTimeoutId = setTimeout(() => finish(), TIME_OUT_MS);
        const content = await reader?.read();
        clearTimeout(resTimeoutId);

        if (!content || !content.value) {
          break;
        }
        const textStr = decoder.decode(content.value, { stream: true });
        const partSplitter = "-|||-";
        const itemSplitter = "&";
        const partArr = textStr.split(partSplitter);

        let idPart, pid, cid;
        let textPart = "";
        if (partArr.length == 2) {
          idPart = partArr[0];
          textPart = partArr[1];
          const idArr = idPart.split(itemSplitter);
          pid = idArr[0];
          cid = idArr[1];
          console.log("pid", pid, "cid", cid);
          useChatStore.getState().updateCurrentSession((session) => {
            session.pid = pid;
            session.cid = cid;
            return session;
          });
        } else {
          textPart = partArr[0];
        }
        responseText += textPart;

        // const itemSplitter = "-|;|-";
        // const partSplitter = "-|||-";
        // const partArr = textStr.split(partSplitter);
        // partArr.forEach((part) => {
        //   const tempArr = part.split(itemSplitter);
        //   const id = tempArr[0];
        //   const text = tempArr[1] || "";
        //   console.log("111", id, text);
        //   if (text) {
        //     responseText += text;
        //   }
        // });

        const done = content.done;
        options?.onMessage(responseText, false);

        if (done) {
          break;
        }
      }

      finish();
    } else if (res.status === 401) {
      console.error("Unauthorized");
      options?.onError(new Error("Unauthorized"), res.status);
    } else {
      console.error("Stream Error", res.body);
      options?.onError(new Error("Stream Error"), res.status);
    }
  } catch (err) {
    console.error("NetWork Error", err);
    options?.onError(err as Error);
  }
}

export async function requestWithPrompt(
  messages: Message[],
  prompt: string,
  options?: {
    model?: ModelType;
  },
  sessionIndex?: number,
) {
  messages = messages.concat([
    {
      role: "user",
      content: prompt,
      date: new Date().toLocaleString(),
    },
  ]);

  const res = await requestChat(messages, options, sessionIndex);

  return res?.choices?.at(0)?.message?.content ?? "";
}

// To store message streaming controller
export const ControllerPool = {
  controllers: {} as Record<string, AbortController>,

  addController(
    sessionIndex: number,
    messageId: number,
    controller: AbortController,
  ) {
    const key = this.key(sessionIndex, messageId);
    this.controllers[key] = controller;
    return key;
  },

  stop(sessionIndex: number, messageId: number) {
    const key = this.key(sessionIndex, messageId);
    const controller = this.controllers[key];
    controller?.abort();
  },

  stopAll() {
    Object.values(this.controllers).forEach((v) => (v as any).abort());
  },

  hasPending() {
    return Object.values(this.controllers).length > 0;
  },

  remove(sessionIndex: number, messageId: number) {
    const key = this.key(sessionIndex, messageId);
    delete this.controllers[key];
  },

  key(sessionIndex: number, messageIndex: number) {
    return `${sessionIndex},${messageIndex}`;
  },
};
