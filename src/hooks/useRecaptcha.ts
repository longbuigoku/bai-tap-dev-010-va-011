import { useEffect, useState, useCallback } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export function useRecaptcha() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;

    if (window.grecaptcha) {
      window.grecaptcha.ready(() => setIsLoaded(true));
      return;
    }

    const scriptId = "google-recaptcha-v3";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.grecaptcha?.ready(() => setIsLoaded(true));
      };
      document.head.appendChild(script);
    }
  }, []);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!RECAPTCHA_SITE_KEY) {
        // Nếu chưa cấu hình site key thì trả về null để backend bypass hoặc dùng dev mode
        return null;
      }

      if (!window.grecaptcha) {
        console.warn("reCAPTCHA v3 script not loaded yet");
        return null;
      }

      return new Promise<string | null>((resolve) => {
        window.grecaptcha?.ready(async () => {
          try {
            const token = await window.grecaptcha!.execute(RECAPTCHA_SITE_KEY, {
              action,
            });
            resolve(token);
          } catch (error) {
            console.error("reCAPTCHA execute error:", error);
            resolve(null);
          }
        });
      });
    },
    []
  );

  return { executeRecaptcha, isLoaded };
}

