import { createParser } from "eventsource-parser";
import { NextRequest } from "next/server";
import { requestOpenai } from "../common";

async function createStream(req: NextRequest) {
  let temptext = "";
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await requestOpenai(req);

  const contentType = res.headers.get("Content-Type") ?? "";
  if (!contentType.includes("stream")) {
    const content = await (
      await res.text()
    ).replace(/provided:.*. You/, "provided: ***. You");
    console.log("[Stream] error ", content);
    return "```json\n" + content + "```";
  }

  let start = true;
  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: any) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            if (json.hasOwnProperty("message")) {
              if (json.message.author.role === "assistant") {
                let text = json.message.content.parts[0];
                text = text.trim();
                if (text != "") {
                  if (text != temptext) {
                    let queue = encoder.encode();
                    const pid = json.message.id;
                    const cid = json.conversation_id;
                    const partSplitter = "-a|||c-";
                    const resultText = text.replace(temptext, "");
                    if (start && pid && cid) {
                      start = false;
                      queue = encoder.encode(
                        `${pid}&${cid}${partSplitter}${resultText}`,
                      );
                    } else {
                      queue = encoder.encode(resultText);
                    }
                    controller.enqueue(queue);
                    temptext = text;
                  }
                }
              }

            } else {
            }
          } catch (e) {
            controller.error(e);
          }
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk, { stream: true }));
      }
    },
  });

  return stream;
}

export async function POST(req: NextRequest) {
  try {
    const stream = await createStream(req);

    return new Response(stream);
  } catch (error) {
    console.error("[Chat Stream]", error);
    return new Response(
      ["```json\n", JSON.stringify(error, null, "  "), "\n```"].join(""),
    );
  }
}

export const runtime = "edge";
