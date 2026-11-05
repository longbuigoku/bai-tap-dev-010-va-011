/**
 * Xác thực token reCAPTCHA v2 ("I'm not a robot" Checkbox) với Google API
 * URL: https://www.google.com/recaptcha/api/siteverify
 */
export async function verifyRecaptchaV2Token(
  token: string | null | undefined
): Promise<{ success: boolean; message?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // Nếu chưa cấu hình secret key trong môi trường phát triển (dev/local), cho phép bypass
  if (!secretKey) {
    return {
      success: true,
      message: "reCAPTCHA skipped (no secret key configured)",
    };
  }

  if (!token) {
    return {
      success: false,
      message: "Vui lòng xác minh 'Tôi không phải là người máy' (reCAPTCHA)",
    };
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
      console.warn("reCAPTCHA v2 validation failed:", data["error-codes"]);
      return {
        success: false,
        message: "Xác thực reCAPTCHA không hợp lệ hoặc đã hết hạn. Vui lòng tick lại!",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error verifying reCAPTCHA v2:", error);
    return {
      success: false,
      message: "Lỗi kết nối tới dịch vụ xác thực Google reCAPTCHA",
    };
  }
}
