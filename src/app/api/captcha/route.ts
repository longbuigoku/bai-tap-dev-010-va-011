import { NextResponse } from "next/server";
import { generateCaptcha } from "@/utils/captcha";

export async function GET() {
  const captcha = generateCaptcha();
  return NextResponse.json(captcha, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

