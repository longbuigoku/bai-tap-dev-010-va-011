"use client";

import React, { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";

interface CaptchaInputProps {
  value: string;
  onChange: (val: string) => void;
  onCaptchaIdChange: (id: string) => void;
  error?: string;
  onBlur?: () => void;
}

export const CaptchaInput: React.FC<CaptchaInputProps> = ({
  value,
  onChange,
  onCaptchaIdChange,
  error,
  onBlur,
}) => {
  const [captchaSvg, setCaptchaSvg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNewCaptcha = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/captcha?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setCaptchaSvg(data.svg);
        onCaptchaIdChange(data.id);
      }
    } catch (e) {
      console.error("Lỗi khi tải mã captcha:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewCaptcha();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          htmlFor="captcha-input"
          className="block text-sm font-semibold tracking-wide text-[#FFDE87]"
        >
          Mã bảo vệ<span className="text-red-400 ml-0.5">*</span>
        </label>
        <span className="text-[11px] text-white/50">Phân biệt chữ hoa, chữ thường</span>
      </div>

      <div className="mt-1 flex items-center gap-3">
        {/* Input box */}
        <div className="relative flex-1">
          <input
            id="captcha-input"
            type="text"
            placeholder="Nhập mã 5 ký tự"
            autoComplete="off"
            maxLength={5}
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            onBlur={onBlur}
            className={`w-full border-b bg-transparent pb-2 pt-2.5 text-sm md:text-base text-white tracking-widest uppercase font-mono placeholder:text-white/40 placeholder:normal-case placeholder:font-sans placeholder:tracking-normal outline-none transition-colors ${
              error
                ? "border-red-400 focus:border-red-300"
                : "border-white/30 hover:border-white/50 focus:border-[#FFDE87]"
            }`}
          />
        </div>

        {/* Captcha Image display & Refresh */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="w-[125px] h-[36px] md:w-[140px] md:h-[40px] rounded-lg overflow-hidden border border-[#FFDE87]/30 bg-[#161B0E] flex items-center justify-center cursor-pointer select-none"
            onClick={fetchNewCaptcha}
            title="Bấm để đổi mã khác"
            dangerouslySetInnerHTML={{ __html: captchaSvg }}
          />

          <button
            type="button"
            onClick={fetchNewCaptcha}
            disabled={isLoading}
            className="p-2 text-white/60 hover:text-[#FFDE87] hover:bg-white/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Đổi mã bảo vệ khác"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs md:text-[13px] text-red-300 auth-fade">
          {error}
        </p>
      )}
    </div>
  );
};

