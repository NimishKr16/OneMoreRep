"use client";

import { User } from "@supabase/supabase-js";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { HiArrowLeft, HiUser, HiMail } from "react-icons/hi";

interface ProfileClientProps {
  user: User;
}

export default function ProfileClient({ user }: ProfileClientProps) {
  return (
    <div className="min-h-screen bg-black">
      <div className="px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Back Button */}
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>

          {/* Profile Card */}
          <div className="rounded-2xl border border-gray-900 bg-gray-950 p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white mb-4 shadow-lg shadow-cyan-500/30">
                <HiUser className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                YOUR PROFILE
              </h1>
              <p className="text-gray-500 text-sm">
                Manage your account settings
              </p>
            </div>

            {/* User Info */}
            <div className="space-y-4 mb-8">
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                <div className="flex items-center gap-3">
                  <HiMail className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                      Email
                    </div>
                    <div className="text-white font-medium">{user.email}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                      Status
                    </div>
                    <div className="text-white font-medium">Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="h-px bg-gray-800"></div>

              <div className="flex justify-center pt-4">
                <LogoutButton />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 rounded-xl border border-cyan-900/30 bg-gradient-to-r from-cyan-950/30 to-blue-950/30 p-4">
            <p className="text-center text-cyan-400/90 text-sm font-medium">
              💡 Your data is securely stored and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
