"use client";

import React, { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { ArrowIcon } from "./ArrowIcon";
import { RecaptchaV2, RecaptchaV2Handle } from "./RecaptchaV2";
import { signInSchema, SignInFormValues } from "../schemas/auth.schema";

interface UserProfile {
  username: string;
  name?: string;
  distribution?: string;
  phone?: string;
  email?: string;
  role?: string;
}

interface SignInFormProps {
  onSuccess: (user: UserProfile) => void;
  onSwitchToSignUp: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSuccess, onSwitchToSignUp }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [signedInUser, setSignedInUser] = useState<UserProfile | null>(null);

  const recaptchaRef = useRef<RecaptchaV2Handle>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
      recaptchaToken: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: SignInFormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (!res.ok || result.success === false) {
        // Tự động reset captcha khi không hợp lệ hoặc đăng nhập thất bại
        recaptchaRef.current?.reset();
        setValue("recaptchaToken", "");

        if (result.field === "recaptchaToken") {
          setError("recaptchaToken", {
            type: "manual",
            message: result.message || "Xác thực reCAPTCHA không hợp lệ, vui lòng thử lại!",
          });
        }
        throw new Error(result.message || "Tài khoản hoặc mật khẩu không chính xác");
      }

      // Lưu phiên xác thực
      sessionStorage.setItem("sensa_auth", "true");
      sessionStorage.setItem("sensa_user", JSON.stringify(result.user));

      // Kích hoạt trạng thái hiển thị thành công
      setSignedInUser(result.user);
      setIsSuccess(true);

      setTimeout(() => {
        onSuccess(result.user);
      }, 1200);
    } catch (err: any) {
      setServerError(err.message || "Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.");
    }
  };

  if (isSuccess && signedInUser) {
    return (
      <div className="pt-6 pb-2 text-center space-y-4 auth-fade">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 text-[#FFDE87] border border-[#FFDE87]/40 mb-1">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#FFDE87] tracking-wide">
          Đăng nhập thành công!
        </h3>
        <p className="text-sm text-white/80 leading-relaxed px-2">
          Chào mừng <span className="font-semibold text-[#FFDE87]">{signedInUser.name || signedInUser.username}</span> quay trở lại.
        </p>
        {signedInUser.distribution && (
          <p className="text-xs text-white/60">
            Sàn phân phối: <span className="text-white/90">{signedInUser.distribution}</span>
          </p>
        )}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs text-white/50">
          <span className="w-2 h-2 rounded-full bg-[#FFDE87] animate-ping" />
          <span>Đang chuyển hướng vào hệ thống...</span>
        </div>
      </div>
    );
  }

  return (
    <form
      className="pt-5 md:pt-6 space-y-4 md:space-y-4 auth-fade"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {serverError && (
        <div className="p-3 text-xs md:text-sm text-red-200 bg-red-950/40 border border-red-500/50 rounded-lg auth-fade">
          {serverError}
        </div>
      )}

      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-semibold tracking-wide text-[#FFDE87]">
          Tài khoản<span className="text-red-400 ml-0.5">*</span>
        </label>
        <div className="relative">
          <input
            id="username"
            type="text"
            placeholder="Nhập tài khoản"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            maxLength={50}
            aria-invalid={!!errors.username}
            {...register("username")}
            className={`w-full border-b bg-transparent pb-2 pt-2.5 text-sm md:text-base text-white placeholder:text-white/40 outline-none transition-colors ${
              errors.username
                ? "border-red-400 focus:border-red-300"
                : "border-white/30 hover:border-white/50 focus:border-[#FFDE87]"
            }`}
          />
        </div>
        {errors.username?.message && (
          <p id="username-error" className="mt-1 text-xs md:text-[13px] text-red-300 auth-fade">
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-semibold tracking-wide text-[#FFDE87]">
          Mật khẩu<span className="text-red-400 ml-0.5">*</span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
            maxLength={100}
            aria-invalid={!!errors.password}
            {...register("password")}
            className={`w-full border-b bg-transparent pb-2 pt-2.5 text-sm md:text-base text-white placeholder:text-white/40 outline-none transition-colors pr-9 ${
              errors.password
                ? "border-red-400 focus:border-red-300"
                : "border-white/30 hover:border-white/50 focus:border-[#FFDE87]"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 bottom-2 p-1 text-white/50 hover:text-white transition-colors cursor-pointer"
            tabIndex={-1}
            title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password?.message && (
          <p id="password-error" className="mt-1 text-xs md:text-[13px] text-red-300 auth-fade">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* reCAPTCHA v2 Checkbox ("I'm not a robot") */}
      <Controller
        name="recaptchaToken"
        control={control}
        render={({ field }) => (
          <RecaptchaV2
            ref={recaptchaRef}
            onChange={(token) => field.onChange(token || "")}
            onExpired={() => {
              setValue("recaptchaToken", "");
              setError("recaptchaToken", {
                type: "manual",
                message: "Mã xác minh reCAPTCHA đã hết hạn. Vui lòng tick lại!",
              });
            }}
            onError={() => {
              setValue("recaptchaToken", "");
              setError("recaptchaToken", {
                type: "manual",
                message: "Có lỗi khi tải reCAPTCHA. Vui lòng thử lại!",
              });
            }}
            error={errors.recaptchaToken?.message}
          />
        )}
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group w-full mt-2 py-3 md:py-3.5 rounded-xl text-white font-semibold text-base tracking-wide bg-gradient-to-r from-[#2c3718] via-[#4C5538] to-[#2c3718] hover:from-[#3a4920] hover:to-[#3a4920] border border-[#FFDE87]/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <span>{isSubmitting ? "Đang kiểm tra..." : "Đăng nhập"}</span>
        <span className="w-6 h-auto text-white transition-transform duration-300 group-hover:translate-x-1.5 flex items-center justify-center">
          <ArrowIcon />
        </span>
      </button>

      {/* Switch to Sign Up */}
      <p className="text-center text-white/60 text-xs md:text-sm pt-1">
        Chưa có tài khoản?{" "}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-semibold text-[#FFDE87] hover:underline cursor-pointer"
        >
          Đăng ký ngay
        </button>
      </p>
    </form>
  );
};
