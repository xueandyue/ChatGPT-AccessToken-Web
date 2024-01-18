import fetch from "isomorphic-unfetch";
import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "./app/config/server";
import md5 from "spark-md5";


import { error } from "console";

export const config = {
  matcher: ["/api/openai", "/api/chat-stream"],
};

const serverConfig = getServerSideConfig();
let apiKey = "";
console.log("key",serverConfig.apiKey );
apiKey = serverConfig.apiKey
function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  console.log("ip: ",ip)
  const forwardedFor = req.headers.get("x-forwarded-for");
  console.log("forwardedFor: ",forwardedFor);
  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

function getIP2(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  console.log("ip: ",ip)
  const forwardedFor = req.headers.get("x-forwarded-for");
  console.log("forwardedFor: ",forwardedFor);
  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }
  if (ip === '::1') {
    ip = '127.0.0.1';
  }

  return ip;
}




async function checkApiResponse(ip:string|null,api_path :string) {

  try {
    const url = "http://127.0.0.1/check?ip="+ip+"&api_path="+api_path;
    console.log(url);
    const response = await fetch(url);
    const responseBody = await response.json()
    console.log(responseBody);
    const msg = responseBody.msg;
    console.log(msg);
    apiKey=responseBody.apiKey;

    return msg;
  } catch (err) {
    console.error(err);
    return "未知错误，请联系管理员";
  }
}


async function gettoken() {

  try {
    const url = "http://127.0.0.1/getjson";
    const response = await fetch(url);
    const responseBody = await response.json()
    apiKey=responseBody.token;
    return apiKey;
  } catch (err) {
    console.error(err);
    return "未知错误，请联系管理员";
  }
}



export async function middleware(req: NextRequest) {
  const accessCode = req.headers.get("access-code");
  const token = req.headers.get("token");
  console.log("用户token:",token);
  const hashedCode = md5.hash(accessCode ?? "").trim();
  const ip = getIP2(req);
  console.log("用户ip:",ip);
  const requestBody = await req.json(); // 解析请求体中的 JSON 内容
  // console.log("Request body:");
  // console.log(requestBody);
  const modelValue = requestBody.model; // 获取 model 的值
  const api_path = modelValue;
  console.log("api_path");
  console.log(api_path);
  

  console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[User IP] ", getIP(req));
  console.log("[Time] ", new Date().toLocaleString());


  const apiPath = req.nextUrl.pathname; // 获取请求的 URL 路径
  console.log("apiPath");
  console.log(apiPath);
  if (serverConfig.needCode && !serverConfig.codes.has(hashedCode) && !token) {
    return NextResponse.json(
      {
        error: true,
        needAccessCode: true,
        msg: "Please go settings page and fill your access code.",
      },
      {
        status: 401,
      }
    );
  }

    // inject api key
  if (!token) {
    req.headers.set("token", serverConfig.apiKey ?? "");
  }

  if (apiPath === "/api/openai"){
    req.headers.set("path","gpt12345/backend-api/conversation/gen_title")
  }




  // //使用次数限制
  if (apiPath === "/api/chat-stream"){

    const temp = await gettoken();
    req.headers.set("token", apiKey);


  }

  return NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
}
