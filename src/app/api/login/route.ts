import { NextRequest, NextResponse } from "next/server";
import { MASTER_HASH, hashCredentials } from "@/utils/crypto";
import { parseCSVLine } from "@/utils/sheet";
import { verifyRecaptchaToken } from "@/utils/recaptcha";
import { GOOGLE_SHEET_ID } from "@/constants/config";

export async function POST(request: NextRequest) {
  try {
    const { username, password, recaptchaToken } = await request.json();

    // 1. Xác thực reCAPTCHA v3 với action "login"
    const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, "login");
    if (!recaptchaResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: recaptchaResult.message || "Xác thực reCAPTCHA không thành công",
        },
        { status: 400 }
      );
    }

    const cleanUsername = String(username || "").trim().toLowerCase();
    const cleanPassword = String(password || "").trim();

    if (!cleanUsername || !cleanPassword) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tài khoản và mật khẩu" },
        { status: 400 }
      );
    }

    // 2. Tính toán inputHash: SHA-256(`${cleanUsername}:${cleanPassword}:${salt}`)
    const inputHash = hashCredentials(cleanUsername, cleanPassword);

    // Kiểm tra tài khoản Master / Admin bypass
    if (inputHash === MASTER_HASH) {
      return NextResponse.json({
        success: true,
        message: "Đăng nhập thành công!",
        user: {
          username: cleanUsername,
          name: "Admin / Master",
          role: "master",
        },
      });
    }

    // 3. Tra cứu tài khoản từ Google Sheet
    const sheetCsvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&gid=0&t=${Date.now()}`;
    const sheetResp = await fetch(sheetCsvUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!sheetResp.ok) {
      throw new Error(`Không thể đọc dữ liệu từ Google Sheet: ${sheetResp.status}`);
    }

    const csvText = await sheetResp.text();
    const rows = csvText
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    let matchedUser = null;

    for (const row of rows) {
      const cols = parseCSVLine(row);
      // Cấu trúc cột Google Sheet:
      // [0: STT, 1: Name, 2: Distribution, 3: Phone, 4: Email, 5: Username, 6: Password]
      const userCol = String(cols[5] ?? "").trim().toLowerCase();
      const storedPassCol = String(cols[6] ?? "").trim();

      if (
        userCol &&
        userCol !== "tài khoản" &&
        userCol !== "username" &&
        userCol === cleanUsername
      ) {
        const isMatch = storedPassCol === inputHash || storedPassCol === cleanPassword;

        if (isMatch) {
          matchedUser = {
            name: String(cols[1] ?? "").trim(),
            distribution: String(cols[2] ?? "").trim(),
            phone: String(cols[3] ?? "").trim(),
            email: String(cols[4] ?? "").trim(),
            username: userCol,
          };
          break;
        }
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Tài khoản hoặc mật khẩu không chính xác",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: matchedUser,
    });
  } catch (error: any) {
    console.error("Login verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Lỗi máy chủ khi xác thực đăng nhập",
      },
      { status: 500 }
    );
  }
}
