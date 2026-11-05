import crypto from "crypto";

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || "isp_sensa_captcha_secret_2026";

export interface CaptchaData {
  id: string;
  question: string;
  svg: string;
}

/**
 * Sinh chuỗi ngẫu nhiên 5 ký tự (chữ hoa và số rõ ràng, tránh ký tự dễ nhầm lẫn như 0, O, 1, I)
 */
function generateRandomCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Tạo token đã được ký kèm timestamp để verify mà không cần lưu in-memory session
 */
function signToken(text: string, timestamp: number): string {
  const payload = `${text.toUpperCase()}:${timestamp}:${CAPTCHA_SECRET}`;
  const hash = crypto.createHash("sha256").update(payload).digest("hex").slice(0, 16);
  return `${timestamp}.${hash}`;
}

/**
 * Tạo hình ảnh SVG chứa mã captcha với nét vẽ uốn lượn, màu sắc vàng kim hợp tông Imperia
 */
export function generateCaptcha(): CaptchaData {
  const code = generateRandomCode();
  const timestamp = Date.now();
  const id = `${code}:${signToken(code, timestamp)}`;

  // Tạo hiệu ứng ký tự nghiêng và lệch vị trí tự nhiên
  const letters = code.split("").map((char, index) => {
    const x = 20 + index * 26 + (Math.random() * 6 - 3);
    const y = 28 + (Math.random() * 8 - 4);
    const rotate = (Math.random() * 30 - 15).toFixed(1);
    const opacity = (0.85 + Math.random() * 0.15).toFixed(2);
    return `<text x="${x}" y="${y}" font-family="'Courier New', monospace, sans-serif" font-size="24" font-weight="bold" fill="#FFDE87" fill-opacity="${opacity}" transform="rotate(${rotate} ${x} ${y})">${char}</text>`;
  }).join("");

  // Các đường vẽ gây nhiễu mờ ảo hợp với nền tối
  const noiseLines = Array.from({ length: 3 }).map(() => {
    const x1 = Math.floor(Math.random() * 20);
    const y1 = Math.floor(Math.random() * 40);
    const x2 = 130 + Math.floor(Math.random() * 30);
    const y2 = Math.floor(Math.random() * 40);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFDE87" stroke-opacity="0.35" stroke-width="1.2" stroke-dasharray="4,2"/>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="42" viewBox="0 0 160 42" class="w-full h-full select-none">
    <rect width="100%" height="100%" fill="#1a2212" rx="8" />
    <rect width="100%" height="100%" fill="none" stroke="#FFDE87" stroke-opacity="0.25" stroke-width="1" rx="8" />
    ${noiseLines}
    ${letters}
  </svg>`;

  return {
    id: Buffer.from(id).toString("base64"),
    question: "Nhập mã xác nhận",
    svg,
  };
}

/**
 * Kiểm tra mã captcha nhập vào
 */
export function verifyCaptcha(userAnswer: string, captchaId: string): boolean {
  try {
    if (!userAnswer || !captchaId) return false;

    const decoded = Buffer.from(captchaId, "base64").toString("utf-8");
    const [realText, token] = decoded.split(":");
    if (!realText || !token) return false;

    const [timeStr, expectedHash] = token.split(".");
    const timestamp = parseInt(timeStr, 10);

    // Hạn sử dụng của captcha là 10 phút
    if (Date.now() - timestamp > 10 * 60 * 1000) {
      return false;
    }

    const payload = `${realText.toUpperCase()}:${timestamp}:${CAPTCHA_SECRET}`;
    const calculatedHash = crypto.createHash("sha256").update(payload).digest("hex").slice(0, 16);

    if (calculatedHash !== expectedHash) {
      return false;
    }

    return realText.toUpperCase() === userAnswer.trim().toUpperCase();
  } catch {
    return false;
  }
}

