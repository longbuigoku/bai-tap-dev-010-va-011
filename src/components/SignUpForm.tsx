"use client";

import React, { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CheckCircle2 } from "lucide-react";
import { ArrowIcon } from "./ArrowIcon";
import { RecaptchaV2, RecaptchaV2Handle } from "./RecaptchaV2";
import {
  signUpSchema,
  SignUpFormValues,
} from "../schemas/auth.schema";

interface SignUpFormProps {
  onSuccess: (data: { username: string; email: string }) => void;
  onSwitchToSignIn: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onSwitchToSignIn }) => {
  const [successInfo, setSuccessInfo] = useState<{
    username: string;
    email: string;
    password?: string;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const recaptchaRef = useRef<RecaptchaV2Handle>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      salesName: "",
      agency: "",
      phone: "",
      email: "",
      agreePolicy: false,
      recaptchaToken: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setServerError(null);
    try {
      // Gửi yêu cầu đăng ký qua Next.js API route kèm recaptchaToken
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (!res.ok || result.success === false) {
        // Tự động reset captcha khi API trả về lỗi hoặc token không hợp lệ
        recaptchaRef.current?.reset();
        setValue("recaptchaToken", "");

        if (result.field === "recaptchaToken") {
          setError("recaptchaToken", {
            type: "manual",
            message: result.message || "Xác thực reCAPTCHA không hợp lệ, vui lòng thử lại!",
          });
        }
        throw new Error(result.message || "Đăng ký không thành công");
      }

      const info = {
        username: result.data.username,
        email: result.data.email,
        password: result.data.password || "mikgroup@isp",
      };

      setSuccessInfo(info);
      onSuccess(info);
    } catch (err: any) {
      setServerError(
        err.message || "Có lỗi xảy ra khi lưu vào Google Sheet. Vui lòng kiểm tra lại kết nối mạng!"
      );
    }
  };

  if (successInfo) {
    return (
      <div className="pt-6 pb-2 text-center space-y-5 auth-fade">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 text-[#FFDE87] border border-[#FFDE87]/40 mb-1">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#FFDE87] tracking-wide">Đăng ký thành công!</h3>
        <p className="text-sm text-white/80 leading-relaxed px-2">
          Thông tin tài khoản đã được lưu vào Google Sheet và gửi tới hòm thư:
          <span className="block font-semibold text-[#FFDE87] mt-1">{successInfo.email}</span>
        </p>

        <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-left space-y-2 text-sm">
          <div className="flex justify-between items-center text-white/70">
            <span>Tài khoản:</span>
            <span className="font-mono font-medium text-white">{successInfo.username}</span>
          </div>
          <div className="flex justify-between items-center text-white/70">
            <span>Mật khẩu:</span>
            <span className="font-mono font-medium text-white">
              {successInfo.password || "mikgroup@isp"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="w-full py-3 rounded-xl text-white font-semibold text-base tracking-wide bg-gradient-to-r from-[#2c3718] via-[#4C5538] to-[#2c3718] hover:from-[#3a4920] hover:to-[#3a4920] border border-[#FFDE87]/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-300 cursor-pointer"
        >
          Đăng nhập ngay
        </button>
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

      {/* Sales Name */}
      <div>
        <label htmlFor="salesName" className="block text-sm font-semibold tracking-wide text-[#FFDE87]">
          Tên nhân viên<span className="text-red-400 ml-0.5">*</span>
        </label>
        <div className="relative">
          <input
            id="salesName"
            type="text"
            placeholder="Nhập họ và tên nhân viên"
            autoComplete="name"
            maxLength={50}
            aria-invalid={!!errors.salesName}
            {...register("salesName")}
            className={`w-full border-b bg-transparent pb-2 pt-2.5 text-sm md:text-base text-white placeholder:text-white/40 outline-none transition-colors ${
              errors.salesName
                ? "border-red-400 focus:border-red-300"
                : "border-white/30 hover:border-white/50 focus:border-[#FFDE87]"
            }`}
          />
        </div>
        {errors.salesName?.message && (
          <p className="mt-1 text-xs md:text-[13px] text-red-300 auth-fade">{errors.salesName.message}</p>
        )}
      </div>

      {/* Agency */}
      <div>
        <label htmlFor="agency" className="block text-sm font-semibold tracking-wide text-[#FFDE87]">
          Sàn phân phối<span className="text-red-400 ml-0.5">*</span>
        </label>
        <div className="relative">
          <input
            id="agency"
            type="text"
            placeholder="Nhập tên sàn / đại lý phân phối"
            maxLength={100}
            aria-invalid={!!errors.agency}
            {...register("agency")}
            className={`w-full border-b bg-transparent pb-2 pt-2.5 text-sm md:text-base text-white placeholder:text-white/40 outline-none transition-colors ${
              errors.agency
                ? "border-red-400 focus:border-red-300"
                : "border-white/30 hover:border-white/50 focus:border-[#FFDE87]"
            }`}
          />
        </div>
        {errors.agency?.message && (
          <p className="mt-1 text-xs md:text-[13px] text-red-300 auth-fade">{errors.agency.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold tracking-wide text-[#FFDE87]">
          Số điện thoại<span className="text-red-400 ml-0.5">*</span>
        </label>
        <div className="relative">
          <input
            id="phone"
            type="tel"
            placeholder="Nhập số điện thoại di động (10 số)"
            autoComplete="tel"
            maxLength={15}
            aria-invalid={!!errors.phone}
            {...register("phone")}
            className={`w-full border-b bg-transparent pb-2 pt-2.5 text-sm md:text-base text-white placeholder:text-white/40 outline-none transition-colors ${
              errors.phone
                ? "border-red-400 focus:border-red-300"
                : "border-white/30 hover:border-white/50 focus:border-[#FFDE87]"
            }`}
          />
        </div>
        {errors.phone?.message && (
          <p className="mt-1 text-xs md:text-[13px] text-red-300 auth-fade">{errors.phone.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold tracking-wide text-[#FFDE87]">
          Email<span className="text-red-400 ml-0.5">*</span>
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            placeholder="Nhập địa chỉ email nhận tài khoản"
            autoComplete="email"
            maxLength={254}
            aria-invalid={!!errors.email}
            {...register("email")}
            className={`w-full border-b bg-transparent pb-2 pt-2.5 text-sm md:text-base text-white placeholder:text-white/40 outline-none transition-colors ${
              errors.email
                ? "border-red-400 focus:border-red-300"
                : "border-white/30 hover:border-white/50 focus:border-[#FFDE87]"
            }`}
          />
        </div>
        {errors.email?.message && (
          <p className="mt-1 text-xs md:text-[13px] text-red-300 auth-fade">{errors.email.message}</p>
        )}
      </div>

      {/* Privacy Agreement Checkbox */}
      <div className="pt-1">
        <Controller
          name="agreePolicy"
          control={control}
          render={({ field }) => (
            <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs md:text-sm text-white/70">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                    field.value
                      ? "bg-[#FFDE87] border-[#FFDE87] text-black"
                      : errors.agreePolicy
                      ? "border-red-400 bg-transparent"
                      : "border-white/40 bg-white/5 hover:border-white/70"
                  }`}
                >
                  {field.value && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <span>
                Tôi đồng ý với{" "}
                <a target="_blank" href="https://360.ecovillagesaigon.com.vn/chinh-sach-bao-mat" className="text-[#FFDE87] underline hover:text-[#FFF3D0]">
                  chính sách bảo mật
                </a>{" "}
                và điều khoản sử dụng
              </span>
            </label>
          )}
        />
        {errors.agreePolicy?.message && (
          <p className="mt-1 text-xs md:text-[13px] text-red-300 auth-fade">
            {errors.agreePolicy.message}
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
        className="group w-full mt-3 py-3 md:py-3.5 rounded-xl text-white font-semibold text-base tracking-wide bg-gradient-to-r from-[#2c3718] via-[#4C5538] to-[#2c3718] hover:from-[#3a4920] hover:to-[#3a4920] border border-[#FFDE87]/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <span>{isSubmitting ? "Đang kiểm tra & đăng ký..." : "Đăng ký tài khoản"}</span>
        <span className="w-6 h-auto text-white transition-transform duration-300 group-hover:translate-x-1.5 flex items-center justify-center">
          <ArrowIcon />
        </span>
      </button>

      {/* Switch to Sign In */}
      <p className="text-center text-white/60 text-xs md:text-sm pt-1">
        Đã có tài khoản?{" "}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-semibold text-[#FFDE87] hover:underline cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </p>
    </form>
  );
};
