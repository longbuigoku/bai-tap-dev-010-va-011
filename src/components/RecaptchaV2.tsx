"use client";

import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export interface RecaptchaV2Handle {
  reset: () => void;
}

interface RecaptchaV2Props {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  error?: string;
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export const RecaptchaV2 = forwardRef<RecaptchaV2Handle, RecaptchaV2Props>(
  ({ onChange, onExpired, onError, error }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [keyAvailable] = useState<boolean>(Boolean(SITE_KEY));

    // Cung cấp hàm reset ra ngoài component cha thông qua ref
    useImperativeHandle(ref, () => ({
      reset: () => {
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        onChange(null);
      },
    }));

    // Tự động xử lý khi token hết hạn
    const handleExpired = () => {
      onChange(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      if (onExpired) {
        onExpired();
      }
    };

    // Tự động xử lý khi có lỗi kết nối / không hợp lệ
    const handleError = () => {
      onChange(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      if (onError) {
        onError();
      }
    };

    if (!keyAvailable) {
      return (
        <div className="p-2.5 rounded-lg border border-amber-400/40 bg-amber-950/30 text-amber-200 text-xs text-center">
          ⚠️ Chưa cấu hình <code>NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code> trong <code>.env.local</code>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="overflow-hidden rounded-lg border border-[#FFDE87]/30 shadow-md">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={SITE_KEY}
            onChange={(token) => onChange(token)}
            onExpired={handleExpired}
            onErrored={handleError}
            theme="dark"
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-300 auth-fade text-center font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

RecaptchaV2.displayName = "RecaptchaV2";
