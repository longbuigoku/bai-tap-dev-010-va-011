import { z } from "zod";

export const normalizeWhitespace = (text = "") => text.replace(/\s+/g, " ").trim();

export const normalizePhone = (phone = "") => {
  let cleaned = phone.replace(/[\s.\-()]/g, "");
  if (cleaned.startsWith("+84")) {
    cleaned = `0${cleaned.slice(3)}`;
  } else if (/^84\d{9}$/.test(cleaned)) {
    cleaned = `0${cleaned.slice(2)}`;
  }
  return cleaned;
};

// Convert Vietnamese name to username format e.g. "Nguyen Van A" -> "nguyenvana@goku"
export const generateUsername = (name = "") => {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
  return normalized ? `${normalized}@goku` : "";
};

const VIETNAMESE_NAME_REGEX = /^[\p{L}\s.'-]+$/u;
const VIETNAM_PHONE_REGEX = /^0(3|5|7|8|9)\d{8}$/;

// --- Zod Schema cho Sign In ---
export const signInSchema = z.object({
  username: z
    .string()
    .min(1, "Vui lòng nhập tài khoản")
    .refine((val) => !/\s/.test(val.trim()), {
      message: "Tài khoản không được chứa khoảng trắng",
    })
    .refine((val) => val.trim().length >= 3, {
      message: "Tài khoản phải có ít nhất 3 ký tự",
    })
    .refine((val) => val.trim().length <= 50, {
      message: "Tài khoản tối đa 50 ký tự",
    }),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .max(100, "Mật khẩu tối đa 100 ký tự"),
  recaptchaToken: z.string().optional().nullable(),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

// --- Zod Schema cho Sign Up ---
export const signUpSchema = z.object({
  salesName: z
    .string()
    .transform((val) => normalizeWhitespace(val))
    .pipe(
      z
        .string()
        .min(1, "Vui lòng nhập tên nhân viên")
        .min(2, "Tên nhân viên phải có ít nhất 2 ký tự")
        .max(50, "Tên nhân viên tối đa 50 ký tự")
        .regex(
          VIETNAMESE_NAME_REGEX,
          "Tên nhân viên chỉ được chứa chữ cái và khoảng trắng"
        )
    ),
  agency: z
    .string()
    .transform((val) => normalizeWhitespace(val))
    .pipe(
      z
        .string()
        .min(1, "Vui lòng nhập sàn phân phối")
        .min(2, "Sàn phân phối phải có ít nhất 2 ký tự")
        .max(100, "Sàn phân phối tối đa 100 ký tự")
    ),
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .transform((val) => normalizePhone(val))
    .refine((val) => /^\d+$/.test(val), {
      message: "Số điện thoại chỉ được chứa chữ số",
    })
    .refine((val) => val.length === 10, {
      message: "Số điện thoại phải gồm 10 chữ số",
    })
    .refine((val) => VIETNAM_PHONE_REGEX.test(val), {
      message: "Số điện thoại không đúng đầu số di động Việt Nam",
    }),
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .max(254, "Email tối đa 254 ký tự")
    .refine((val) => !/\s/.test(val), {
      message: "Email không được chứa khoảng trắng",
    })
    .refine((val) => !val.includes(".."), {
      message: "Email không hợp lệ (ví dụ: ten@congty.vn)",
    })
    .pipe(
      z.string().email("Email không hợp lệ (ví dụ: ten@congty.vn)")
    ),
  agreePolicy: z
    .boolean()
    .refine((val) => val === true, {
      message: "Vui lòng đồng ý với chính sách bảo mật để tiếp tục",
    }),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .max(100, "Mật khẩu tối đa 100 ký tự")
    .optional(),
  recaptchaToken: z.string().optional().nullable(),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

