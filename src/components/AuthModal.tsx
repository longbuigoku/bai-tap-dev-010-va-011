"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, LogOut, User, Building, Phone, Mail } from "lucide-react";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

interface UserProfile {
  username: string;
  name?: string;
  distribution?: string;
  phone?: string;
  email?: string;
  role?: string;
}

export const AuthModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [loggedInUser, setLoggedInUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Khôi phục phiên đăng nhập nếu đã có trong sessionStorage
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("sensa_auth") === "true";
      const savedUser = sessionStorage.getItem("sensa_user");
      if (isAuth && savedUser) {
        try {
          setLoggedInUser(JSON.parse(savedUser));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("sensa_auth");
    sessionStorage.removeItem("sensa_user");
    setLoggedInUser(null);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black font-sans">
      {/* Background container replicating Imperia Sensa Park style */}
      <div
        className="fixed inset-0 z-[99999] overflow-y-auto transition-all duration-500 ease-in-out opacity-100 scale-100"
        style={{
          backgroundColor: "rgb(127, 136, 88)",
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(167, 181, 120, 0.25), transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(44, 55, 24, 0.4), transparent 60%),
            linear-gradient(to bottom, rgba(18, 22, 11, 0.75), rgba(18, 22, 11, 0.92))
          `,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Subtle Top-To-Bottom Dark Vignette Overlay */}
        <div className="fixed inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60 pointer-events-none" />

        {/* Back Button */}
        <button
          type="button"
          onClick={() => {
            if (loggedInUser) {
              handleLogout();
            } else {
              alert("Quay lại trang chủ");
            }
          }}
          className="fixed top-4 left-4 md:top-6 md:left-6 z-10 flex items-center gap-2 px-3 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 text-sm transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Quay lại</span>
        </button>

        {/* Modal Container */}
        <div className="relative min-h-full flex flex-col items-center justify-center px-4 pt-16 pb-28 md:pb-32">
          <div
            className="w-full max-w-[540px] rounded-2xl border border-[#FFDE87]/35 bg-gradient-to-b from-[#1E2514]/80 via-[#161B0E]/80 to-[#12160B]/85 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.45),0_0_30px_rgba(167,181,120,0.15)] px-6 py-6 md:px-8 md:py-7 auth-fade"
            style={{ maxWidth: 540 }}
          >
            {loggedInUser ? (
              <div className="text-center py-4 space-y-5 auth-fade">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FFDE87]/15 border border-[#FFDE87]/50 flex items-center justify-center text-[#FFDE87] text-2xl font-bold">
                  ✓
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#FFDE87] tracking-wide">
                    Xin chào, {loggedInUser.name || loggedInUser.username}!
                  </h2>
                  <p className="text-white/70 text-xs md:text-sm mt-1">
                    Đăng nhập thành công vào cổng thông tin Imperia Sensa Park.
                  </p>
                </div>

                {/* Profile Summary Card */}
                <div className="p-4 rounded-xl bg-black/45 border border-white/10 text-left space-y-2.5 text-xs md:text-sm">
                  <div className="flex items-center justify-between text-white/70">
                    <span className="flex items-center gap-2 text-white/50">
                      <User className="w-4 h-4 text-[#FFDE87]" />
                      Tài khoản:
                    </span>
                    <span className="font-mono font-medium text-[#FFDE87]">{loggedInUser.username}</span>
                  </div>

                  {loggedInUser.distribution && (
                    <div className="flex items-center justify-between text-white/70">
                      <span className="flex items-center gap-2 text-white/50">
                        <Building className="w-4 h-4 text-[#FFDE87]" />
                        Sàn phân phối:
                      </span>
                      <span className="font-medium text-white">{loggedInUser.distribution}</span>
                    </div>
                  )}

                  {loggedInUser.phone && (
                    <div className="flex items-center justify-between text-white/70">
                      <span className="flex items-center gap-2 text-white/50">
                        <Phone className="w-4 h-4 text-[#FFDE87]" />
                        Số điện thoại:
                      </span>
                      <span className="text-white">{loggedInUser.phone}</span>
                    </div>
                  )}

                  {loggedInUser.email && (
                    <div className="flex items-center justify-between text-white/70">
                      <span className="flex items-center gap-2 text-white/50">
                        <Mail className="w-4 h-4 text-[#FFDE87]" />
                        Email:
                      </span>
                      <span className="text-white truncate max-w-[220px]">{loggedInUser.email}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => alert("Chuyển tới bản đồ VR 360 Imperia Sensa Park")}
                    className="flex-1 py-3 rounded-xl text-white font-semibold text-sm tracking-wide bg-gradient-to-r from-[#2c3718] via-[#4C5538] to-[#2c3718] hover:from-[#3a4920] hover:to-[#3a4920] border border-[#FFDE87]/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all cursor-pointer"
                  >
                    Vào trải nghiệm VR 360
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/20 text-white/80 hover:text-white hover:bg-white/10 text-sm transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Tabs switcher */}
                <div className="grid grid-cols-2 border-b border-white/15">
                  <button
                    type="button"
                    onClick={() => setActiveTab("signin")}
                    className={`relative pb-3 text-sm md:text-base font-semibold tracking-wide transition-colors cursor-pointer ${
                      activeTab === "signin"
                        ? "text-[#FFDE87]"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    Đăng nhập
                    <span
                      className={`absolute left-0 right-0 -bottom-px h-[2px] bg-gradient-to-r from-transparent via-[#FFDE87] to-transparent transition-opacity ${
                        activeTab === "signin" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className={`relative pb-3 text-sm md:text-base font-semibold tracking-wide transition-colors cursor-pointer ${
                      activeTab === "signup"
                        ? "text-[#FFDE87]"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    Đăng ký
                    <span
                      className={`absolute left-0 right-0 -bottom-px h-[2px] bg-gradient-to-r from-transparent via-[#FFDE87] to-transparent transition-opacity ${
                        activeTab === "signup" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Form Content */}
                {activeTab === "signin" ? (
                  <SignInForm
                    onSuccess={(user) => setLoggedInUser(user)}
                    onSwitchToSignUp={() => setActiveTab("signup")}
                  />
                ) : (
                  <SignUpForm
                    onSuccess={() => {}}
                    onSwitchToSignIn={() => setActiveTab("signin")}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
