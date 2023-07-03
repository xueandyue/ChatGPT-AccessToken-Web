import { NextRequest, NextResponse } from "next/server";
import { requestOpenai } from "../common";

async function makeRequest(req: NextRequest) {
  try {
    const api = await requestOpenai(req);
    let titlejson = {
      object: "chat.completion",
      model: "gpt-3.5-turbo",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "",
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 360,
        completion_tokens: 7,
        total_tokens: 367,
      },
    };

    if (api.url.includes("api/conversation/gen_title")) {
      const bodyStr = await api.text();
      const title = JSON.parse(bodyStr).title;
      titlejson.choices[0].message.content = title;
      const res = new NextResponse(JSON.stringify(titlejson));
      res.headers.set("Content-Type", "application/json");
      res.headers.set("Cache-Control", "no-cache");
      return res;
    }
    const res = new NextResponse(api.body);
    res.headers.set("Content-Type", "application/json");
    res.headers.set("Cache-Control", "no-cache");
    return res;
  } catch (e) {
    console.error("[OpenAI] ", req.body, e);
    return NextResponse.json(
      {
        error: true,
        msg: JSON.stringify(e),
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: NextRequest) {
  return makeRequest(req);
}

export async function GET(req: NextRequest) {
  return makeRequest(req);
}

export const runtime = "edge";
