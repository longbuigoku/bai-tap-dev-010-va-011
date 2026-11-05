import crypto from "crypto";

export const MASTER_HASH =
  process.env.MASTER_HASH ||
  "b470abefe57d986f2764cd3dc805e810bb1330dd07337da512ca1ff5e6ab7710";

export const AUTH_SALT =
  process.env.AUTH_SALT || "sensa_park_secure_salt_2026";

/**
 * Hàm băm mật khẩu chuẩn của Imperia Sensa Park:
 * SHA256(`${username.toLowerCase()}:${password}:${salt}`)
 */
export function hashCredentials(username: string, pass: string): string {
  const cleanUser = String(username || "").trim().toLowerCase();
  const cleanPass = String(pass || "").trim();
  const data = `${cleanUser}:${cleanPass}:${AUTH_SALT}`;
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

