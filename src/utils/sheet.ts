export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuote && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === "," && !insideQuote) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Lấy danh sách tất cả username đã tồn tại trong Google Sheet
 */
export async function getExistingUsernames(sheetId: string): Promise<Set<string>> {
  const existingSet = new Set<string>();
  try {
    const sheetCsvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=0&t=${Date.now()}`;
    const resp = await fetch(sheetCsvUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!resp.ok) {
      console.warn(`Không thể đọc Google Sheet để kiểm tra username: ${resp.status}`);
      return existingSet;
    }

    const csvText = await resp.text();
    const rows = csvText
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    for (const row of rows) {
      const cols = parseCSVLine(row);
      // Cột 5 là username: [0: STT, 1: Name, 2: Distribution, 3: Phone, 4: Email, 5: Username, 6: Password]
      const user = String(cols[5] ?? "").trim().toLowerCase();
      if (user && user !== "tài khoản" && user !== "username") {
        existingSet.add(user);
      }
    }
  } catch (err) {
    console.error("Lỗi khi kiểm tra username tồn tại:", err);
  }

  return existingSet;
}

/**
 * Tự động sinh username duy nhất nếu username đã tồn tại.
 * Ví dụ:
 *  - nguyenvanty@goku đã tồn tại -> nguyenvanty1@goku
 *  - nguyenvanty1@goku đã tồn tại -> nguyenvanty2@goku
 */
export function generateUniqueUsername(
  baseUsername: string,
  existingUsernames: Set<string>
): string {
  const lowerBase = baseUsername.trim().toLowerCase();
  if (!existingUsernames.has(lowerBase)) {
    return baseUsername;
  }

  // Tách phần tên và đuôi (ví dụ: "nguyenvanty" và "@goku")
  let namePart = lowerBase;
  let domainPart = "";

  if (lowerBase.includes("@")) {
    const parts = lowerBase.split("@");
    namePart = parts[0];
    domainPart = `@${parts.slice(1).join("@")}`;
  }

  // Tăng dần số thứ tự 1, 2, 3... cho tới khi không bị trùng
  let counter = 1;
  while (true) {
    const candidate = `${namePart}${counter}${domainPart}`;
    if (!existingUsernames.has(candidate)) {
      return candidate;
    }
    counter++;
  }
}
