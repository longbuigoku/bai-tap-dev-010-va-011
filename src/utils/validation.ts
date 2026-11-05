export const VALIDATION_LIMITS = {
  salesName: { min: 2, max: 50 },
  agency: { min: 2, max: 100 },
  email: { max: 254 },
  username: { min: 3, max: 50 },
  password: { max: 100 },
};

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

// Convert Vietnamese string to slug/username format e.g. "Nguyen Van A" -> "nguyenvana@goku"
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

const checkLength = (val: string, limits: { min?: number; max?: number }, fieldName: string) => {
  if (limits.min && val.length < limits.min) {
    return `${fieldName} phải có ít nhất ${limits.min} ký tự`;
  }
  if (limits.max && val.length > limits.max) {
    return `${fieldName} tối đa ${limits.max} ký tự`;
  }
  return "";
};

const VIETNAMESE_NAME_REGEX = /^[\p{L}\s.'-]+$/u;
const VIETNAM_PHONE_REGEX = /^0(3|5|7|8|9)\d{8}$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export const validators = {
  salesName: (value: string) => {
    const clean = normalizeWhitespace(value);
    if (!clean) return "Vui lòng nhập tên nhân viên";
    const lenErr = checkLength(clean, VALIDATION_LIMITS.salesName, "Tên nhân viên");
    if (lenErr) return lenErr;
    if (!VIETNAMESE_NAME_REGEX.test(clean)) {
      return "Tên nhân viên chỉ được chứa chữ cái và khoảng trắng";
    }
    return "";
  },

  agency: (value: string) => {
    const clean = normalizeWhitespace(value);
    if (!clean) return "Vui lòng nhập sàn phân phối";
    return checkLength(clean, VALIDATION_LIMITS.agency, "Sàn phân phối");
  },

  phone: (value: string) => {
    if (!value || !value.trim()) return "Vui lòng nhập số điện thoại";
    const clean = normalizePhone(value);
    if (!/^\+?\d+$/.test(clean)) return "Số điện thoại chỉ được chứa chữ số";
    if (clean.length !== 10) return "Số điện thoại phải gồm 10 chữ số";
    if (!VIETNAM_PHONE_REGEX.test(clean)) {
      return "Số điện thoại không đúng đầu số di động Việt Nam";
    }
    return "";
  },

  email: (value: string) => {
    const clean = (value ?? "").trim();
    if (!clean) return "Vui lòng nhập email";
    if (clean.length > VALIDATION_LIMITS.email.max) {
      return `Email tối đa ${VALIDATION_LIMITS.email.max} ký tự`;
    }
    if (/\s/.test(clean)) return "Email không được chứa khoảng trắng";
    if (!EMAIL_REGEX.test(clean) || clean.includes("..")) {
      return "Email không hợp lệ (ví dụ: ten@congty.vn)";
    }
    return "";
  },

  username: (value: string) => {
    const clean = (value ?? "").trim();
    if (!clean) return "Vui lòng nhập tài khoản";
    if (/\s/.test(clean)) return "Tài khoản không được chứa khoảng trắng";
    return checkLength(clean, VALIDATION_LIMITS.username, "Tài khoản");
  },

  password: (value: string) => {
    const clean = value ?? "";
    if (!clean.trim()) return "Vui lòng nhập mật khẩu";
    if (clean.length > VALIDATION_LIMITS.password.max) {
      return `Mật khẩu tối đa ${VALIDATION_LIMITS.password.max} ký tự`;
    }
    return "";
  },

  agreePolicy: (value: boolean) => {
    return value ? "" : "Vui lòng đồng ý với chính sách bảo mật để tiếp tục";
  },
};

