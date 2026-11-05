import { NextRequest, NextResponse } from "next/server";
import { getExistingUsernames } from "@/utils/sheet";
import { GOOGLE_SHEET_ID } from "@/constants/config";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim().toLowerCase();

  if (!username) {
    return NextResponse.json({ exists: false }, { status: 400 });
  }

  const existingUsernames = await getExistingUsernames(GOOGLE_SHEET_ID);
  const exists = existingUsernames.has(username);

  return NextResponse.json({ exists, username });
}

