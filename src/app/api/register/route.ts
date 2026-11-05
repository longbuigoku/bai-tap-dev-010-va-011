import { NextRequest, NextResponse } from "next/server";
import {
  signUpSchema,
  generateUsername,
  normalizeWhitespace,
  normalizePhone,
} from "@/schemas/auth.schema";
import { hashCredentials } from "@/utils/crypto";
import { getExistingUsernames, generateUniqueUsername } from "@/utils/sheet";
import { GOOGLE_SHEET_ID, DEFAULT_PASSWORD } from "@/constants/config";

export async function POST(request: NextRequest) {
  try {
    const scriptUrl = process.env.GOOGLE_SHEET_API_URL;
    if (!scriptUrl) {
      console.error("GOOGLE_SHEET_API_URL is not set");
      return NextResponse.json(
        { success: false, message: "Máy chủ chưa được cấu hình" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const validationResult = signUpSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Dữ liệu gửi lên không hợp lệ",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { salesName, agency, phone, email, password } = validationResult.data;

    const rawPassword = password && password.trim() ? password.trim() : DEFAULT_PASSWORD;
    const formattedName = normalizeWhitespace(salesName);
    const cleanPhone = normalizePhone(phone);
    const baseUsername = generateUsername(formattedName) || `${cleanPhone}@goku`;
    const cleanEmail = email.trim().toLowerCase();
    const formattedAgency = normalizeWhitespace(agency);

    // 1. Kiểm tra username đã tồn tại chưa; nếu đã tồn tại, tự động sinh username mới duy nhất
    // Ví dụ: nguyenvanty@goku -> nguyenvanty1@goku -> nguyenvanty2@goku...
    const existingUsernames = await getExistingUsernames(GOOGLE_SHEET_ID);
    const assignedUsername = generateUniqueUsername(baseUsername, existingUsernames);

    // 2. Tạo chuỗi hash SHA-256 từ assignedUsername, password và salt
    const hashedPassword = hashCredentials(assignedUsername, rawPassword);

    // 3. Đưa mật khẩu đã băm (hashedPassword) vào cột password để ghi lên Google Sheet
    const googleSheetPayload = {
      action: "register",
      secret: process.env.SHEET_API_SECRET,
      name: formattedName,
      distribution: formattedAgency,
      phone: cleanPhone,
      email: cleanEmail,
      username: assignedUsername, // Username mới duy nhất
      password: hashedPassword,
      raw_password: rawPassword,
      send_email: true,
      email_subject: "[MIK Imperia Sensa Park] Thông tin tài khoản đăng nhập",
    };

    const googleResponse = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(googleSheetPayload),
      redirect: "follow",
    });

    const googleData = await googleResponse.json().catch(() => null);

    if (!googleResponse.ok || !googleData || googleData.success === false) {
      return NextResponse.json(
        {
          success: false,
          message:
            googleData?.message ||
            `Google Sheet API returned status ${googleResponse.status}`,
        },
        { status: 502 }
      );
    }

    const finalUsername = googleData.username ?? assignedUsername;

    return NextResponse.json({
      success: true,
      message: "Đăng ký thành công và đã lưu thông tin vào Google Sheet!",
      data: {
        username: finalUsername,
        email: cleanEmail,
        name: formattedName,
        distribution: formattedAgency,
        phone: cleanPhone,
        password: rawPassword,
        hashedPassword,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi lưu dữ liệu vào Google Sheet:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Lỗi máy chủ khi kết nối với Google Sheet",
      },
      { status: 500 }
    );
  }
}
