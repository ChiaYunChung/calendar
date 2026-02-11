// server-side Node runtime，使用 ws 套件作為 client
import { NextRequest, NextResponse } from "next/server";
import WebSocket from "ws"; // <-- 使用 ws 套件

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const message = body.message ?? body;
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8888";

    console.log("接收到的請求:", message);

    if (!message) {
      return NextResponse.json({ error: "消息不能为空" }, { status: 400 });
    }

    return await new Promise((resolve) => {
      const ws = new WebSocket(WS_URL);

      const timeout = setTimeout(() => {
        try { ws.terminate(); } catch {}
        resolve(NextResponse.json({ error: "WebSocket 超时" }, { status: 504 }));
      }, 10000);

      ws.on("open", () => {
        // ws client 已開
        ws.send(JSON.stringify({message:message,flag:'register'}));
      });

      ws.on("message", (data: WebSocket.Data) => {
        clearTimeout(timeout);
        try {
          const parsed = typeof data === "string" ? JSON.parse(data) : JSON.parse(data.toString());
          console.log("WebSocket 回傳:", parsed);
          ws.close();
          resolve(NextResponse.json({ success: true, data: parsed }, { status: 200 }));
        } catch (e) {
          console.error("解析回傳失敗:", e);
          ws.close();
          resolve(NextResponse.json({ error: "回傳資料格式錯誤" }, { status: 500 }));
        }
      });

      ws.on("error", (err:any) => {
        clearTimeout(timeout);
        console.error("WebSocket client error:", err);
        try { ws.terminate(); } catch {}
        resolve(NextResponse.json({ error: "WebSocket 连接失败" }, { status: 500 }));
      });

      ws.on("close", () => {
        console.log("WebSocket 已关闭（client）");
      });
    });
  } catch (e) {
    console.error("POST handler error:", e);
    return NextResponse.json({ error: "无效的请求体" }, { status: 400 });
  }
}