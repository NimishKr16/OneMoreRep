"use client";

import { useEffect, useState } from "react";
import { HiBell, HiBellSlash } from "react-icons/hi2";
import {
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
  registerServiceWorker,
} from "@/lib/notifications/pushClient";

type SubscriptionStatus = "loading" | "unsupported" | "denied" | "on" | "off";

const IS_DEV = process.env.NODE_ENV === "development";

export default function NotificationToggle() {
  const [status, setStatus] = useState<SubscriptionStatus>("loading");
  const [isToggling, setIsToggling] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"sent" | "error" | null>(null);

  // Determine the current subscription state on mount
  useEffect(() => {
    async function checkStatus() {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        setStatus("unsupported");
        return;
      }

      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }

      try {
        await registerServiceWorker();
        const existing = await getCurrentSubscription();
        setStatus(existing ? "on" : "off");
      } catch {
        setStatus("off");
      }
    }

    checkStatus();
  }, []);

  async function handleToggle() {
    if (isToggling || status === "unsupported" || status === "denied") return;

    setIsToggling(true);
    try {
      if (status === "on") {
        // Unsubscribe from push + remove from server
        await unsubscribeFromPush();
        await fetch("/api/notifications/unsubscribe", { method: "DELETE" });
        setStatus("off");
      } else {
        // Subscribe in the browser + save to server
        const subscription = await subscribeToPush();
        const res = await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription.toJSON()),
        });

        if (!res.ok) throw new Error("Failed to save subscription.");
        setStatus("on");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      // If the user denied the permission prompt
      if (message.includes("granted") || Notification.permission === "denied") {
        setStatus("denied");
      }

      console.error("[NotificationToggle]", err);
    } finally {
      setIsToggling(false);
    }
  }

  async function handleTest() {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/notifications/test", { method: "POST" });
      setTestResult(res.ok ? "sent" : "error");
    } catch {
      setTestResult("error");
    } finally {
      setIsTesting(false);
      // Clear the result badge after 4 seconds
      setTimeout(() => setTestResult(null), 4000);
    }
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: icon + text */}
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              status === "on"
                ? "bg-cyan-500/20 text-cyan-400"
                : "bg-gray-800 text-gray-500"
            }`}
          >
            {status === "on" ? (
              <HiBell className="w-5 h-5" />
            ) : (
              <HiBellSlash className="w-5 h-5" />
            )}
          </div>

          <div>
            <p className="text-white font-semibold text-sm leading-tight">
              Daily Workout Reminder
            </p>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              {status === "unsupported" &&
                "Push notifications aren't supported in this browser."}
              {status === "denied" &&
                "Notifications blocked. Enable them in your browser settings."}
              {status === "loading" && "Checking notification status…"}
              {status === "on" &&
                "You'll get a nudge at 9 PM every day to log your workout."}
              {status === "off" &&
                "Get a daily reminder at 9 PM to keep your streak alive."}
            </p>
          </div>
        </div>

        {/* Right: toggle switch */}
        <ToggleSwitch
          enabled={status === "on"}
          disabled={
            isToggling ||
            status === "loading" ||
            status === "unsupported" ||
            status === "denied"
          }
          onToggle={handleToggle}
        />
      </div>

      {/* Denied tip */}
      {status === "denied" && (
        <p className="mt-4 text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 leading-relaxed">
          To re-enable, go to your browser&apos;s site settings and allow
          notifications for this site.
        </p>
      )}

      {/* Dev-only test button */}
      {IS_DEV && status === "on" && (
        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-3">
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? "Sending…" : "Send test notification"}
          </button>

          {testResult === "sent" && (
            <span className="text-xs text-green-400 font-medium">
              ✓ Notification sent
            </span>
          )}
          {testResult === "error" && (
            <span className="text-xs text-red-400 font-medium">
              ✗ Failed — check console
            </span>
          )}

          <span className="ml-auto text-xs text-gray-600 italic">dev only</span>
        </div>
      )}
    </div>
  );
}

// ── Toggle Switch sub-component ──────────────────────────────────────────────

interface ToggleSwitchProps {
  enabled: boolean;
  disabled: boolean;
  onToggle: () => void;
}

function ToggleSwitch({ enabled, disabled, onToggle }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 ${
        enabled ? "bg-cyan-500 shadow-lg shadow-cyan-500/30" : "bg-gray-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
