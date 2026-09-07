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

  const enableNotification = async () => {
    try {
      setLoading(true);
      setMessage("");

      // Kiểm tra trình duyệt có hỗ trợ Notification không
      if (!("Notification" in window)) {
        throw new Error(
          "Trình duyệt này không hỗ trợ thông báo."
        );
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error(
          "Trình duyệt này không hỗ trợ thông báo đẩy."
        );
      }

      // Xin quyền thông báo
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        throw new Error(
          "Bạn chưa cho phép nhận thông báo."
        );
      }

      // Lấy Service Worker
      const registration =
        await navigator.serviceWorker.ready;

      if (!import.meta.env.VITE_VAPID_PUBLIC_KEY) {
        throw new Error("Thiếu VAPID public key ở frontend.");
      }

      // Dùng subscription hiện có nếu trình duyệt đã cấp quyền trước đó.
      const subscription =
        await registration.pushManager.getSubscription() ||
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            import.meta.env.VITE_VAPID_PUBLIC_KEY
          )
        });

      // Lấy JWT
      const token = localStorage.getItem("token");

      // Gửi subscription lên backend
      const response = await fetch(
        `${API_URL}/push/subscribe`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify(subscription)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Không thể đăng ký thông báo."
        );
      }

      setMessage(
        "Đã bật thông báo thành công 🔔"
      );
    } catch (error) {
      console.error(error);
      setMessage(error.message);
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