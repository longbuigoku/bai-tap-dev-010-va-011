/**
 * Xác thực token reCAPTCHA v3 với Google API
 * URL: https://www.google.com/recaptcha/api/siteverify
 */
export async function verifyRecaptchaToken(
  token: string | null | undefined,
  expectedAction?: string
): Promise<{ success: boolean; score?: number; message?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // Nếu chưa cấu hình secret key trong môi trường phát triển (dev/local), cho phép bypass
  if (!secretKey) {
    return { success: true, score: 1.0, message: "reCAPTCHA skipped (no secret key configured)" };
  }

  if (!token) {
    return { success: false, message: "Không tìm thấy token reCAPTCHA" };
  }

  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!data.success) {
      console.warn("reCAPTCHA validation failed:", data["error-codes"]);
      return {
        success: false,
        message: "Xác thực reCAPTCHA không thành công",
      };
    }

    // reCAPTCHA v3 trả về điểm score từ 0.0 (chắc chắn là bot) đến 1.0 (người dùng thật)
    // Ngưỡng khuyến nghị của Google là 0.5
    if (typeof data.score === "number" && data.score < 0.5) {
      return {
        success: false,
        score: data.score,
        message: "Phát hiện hành vi bất thường (nghi ngờ spam/bot)",
      };
    }

    // Kiểm tra đúng action mong muốn (nếu có chỉ định)
    if (expectedAction && data.action && data.action !== expectedAction) {
      return {
        success: false,
        message: `Action không khớp: mong muốn ${expectedAction}, nhận được ${data.action}`,
      };
    }

    return {
      success: true,
      score: data.score,
    };
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return {
      success: false,
      message: "Lỗi kết nối tới dịch vụ reCAPTCHA của Google",
    };
  }
}

