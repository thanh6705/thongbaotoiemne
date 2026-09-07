import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Chuyển VAPID Public Key từ Base64 URL sang Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
};

function PushNotification() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const waitForServiceWorker = async () => {
    const timeoutMs = 15000;

    const timer = new Promise((_, reject) => {
      setTimeout(() => 
        reject(new Error("Service Worker chưa sẵn sàng sau 15 giây. Hãy kiểm tra quyền trình duyệt và HTTPS.")),
      timeoutMs
      );
    });

    const ready = navigator.serviceWorker.ready;
    return Promise.race([ready, timer]);
  };

  const enableNotification = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (!("Notification" in window)) {
        throw new Error("Trình duyệt này không hỗ trợ thông báo.");
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Trình duyệt này không hỗ trợ thông báo đẩy.");
      }

      if (Notification.permission === "denied") {
        throw new Error("Thông báo đã bị chặn trong trình duyệt. Hãy bật lại ở cài đặt trang web.");
      }

      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          throw new Error("Bạn chưa cho phép nhận thông báo.");
        }
      }

      if (!navigator.serviceWorker.controller) {
        await navigator.serviceWorker.register("/sw.js");
      }

      const registration = await waitForServiceWorker();

      if (!import.meta.env.VITE_VAPID_PUBLIC_KEY) {
        throw new Error("Thiếu VAPID public key ở frontend.");
      }

      const existingSubscription = await registration.pushManager.getSubscription();

      const subscription = existingSubscription || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY
        )
      });

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(subscription)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể đăng ký thông báo.");
      }

      setMessage("Đã bật thông báo thành công 🔔");
    } catch (error) {
      console.error("Enable notification error:", error);
      setMessage(error.message || "Không thể bật thông báo.");
    } finally {
      setLoading(false);
    }
  };
  const sendTestNotification = async () => {
  try {
    setMessage("");

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/push/test`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    setMessage("Đã gửi notification thử nghiệm 🔔");
  } catch (error) {
    console.error(error);
    setMessage(error.message);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-3 text-2xl font-bold">
          Thông báo
        </h1>

        <p className="mb-6 text-gray-500">
          Bật thông báo để nhận lời nhắc mỗi ngày.
        </p>

        <button
          onClick={enableNotification}
          disabled={loading}
          className="w-full rounded-lg bg-black py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading
            ? "Đang bật..."
            : "🔔 Bật thông báo"}
        </button>
<button
  onClick={sendTestNotification}
  className="mt-3 w-full rounded-lg border border-gray-300 py-3 font-medium hover:bg-gray-100"
>
  🧪 Gửi thông báo thử
</button>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default PushNotification;