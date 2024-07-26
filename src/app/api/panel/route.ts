import { NextRequest, NextResponse } from "next/server";
import { renderTrpcPanel } from "trpc-panel";
import { appRouter } from "../../../server/api/root";

export async function GET(request: NextRequest) {
  const panelHtml = renderTrpcPanel(appRouter, {
    url: "http://localhost:3000/api/trpc",
    transformer: "superjson",
  });

  return new NextResponse(panelHtml, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
