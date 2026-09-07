import { useEffect, useState } from "react";
import Schedule from "./Schedule";
import PushNotification from "./PushNotification";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const dayMap = {
  0: {
    key: "sunday",
    label: "Chủ nhật"
  },
  1: {
    key: "monday",
    label: "Thứ 2"
  },
  2: {
    key: "tuesday",
    label: "Thứ 3"
  },
  3: {
    key: "wednesday",
    label: "Thứ 4"
  },
  4: {
    key: "thursday",
    label: "Thứ 5"
  },
  5: {
    key: "friday",
    label: "Thứ 6"
  },
  6: {
    key: "saturday",
    label: "Thứ 7"
  }
};

function Dashboard() {
  const [page, setPage] = useState("home");
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const today = dayMap[new Date().getDay()];

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/schedule`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setSchedule(data);
      } catch (error) {
        console.error(
          "Fetch schedule error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.reload();
  };

  const todaySchedule = schedule?.[today?.key];

  const outfit = (() => {
    const day = new Date().getDay();

    if ([1, 3, 5].includes(day)) {
      return "Nay mặc áo dài nhé cô bé.";
    }

    if ([2, 4, 6].includes(day)) {
      return "Nay mặc đồng phục thường. Nhớ chú ý ăn sáng.";
    }

    return "Hôm nay nghỉ ngơi nhé 💛";
  })();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">
            Daily Reminder
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Xin chào, {user?.name}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl gap-2 px-6 py-3">
          <button
            onClick={() => setPage("home")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              page === "home"
                ? "bg-black text-white"
                : "hover:bg-gray-100"
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setPage("schedule")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              page === "schedule"
                ? "bg-black text-white"
                : "hover:bg-gray-100"
            }`}
          >
            Thời khóa biểu
          </button>

          <button
            onClick={() => setPage("notification")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              page === "notification"
                ? "bg-black text-white"
                : "hover:bg-gray-100"
            }`}
          >
            🔔 Thông báo
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {page === "home" && (
          <>
            <h2 className="text-3xl font-bold">
              Chào {user?.name} 👋
            </h2>

            <p className="mt-2 text-gray-500">
              {today?.label}
            </p>

            {loading ? (
              <p className="mt-8 text-gray-500">
                Đang tải dữ liệu...
              </p>
            ) : (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {/* Outfit */}
                <div className="rounded-2xl bg-white p-6 shadow">
                  <div className="text-4xl">
                    👕
                  </div>

                  <h3 className="mt-4 text-xl font-bold">
                    Hôm nay mặc gì?
                  </h3>

                  <p className="mt-3 text-gray-600">
                    {outfit}
                  </p>
                </div>

                {/* Schedule */}
                <div className="rounded-2xl bg-white p-6 shadow">
                  <div className="text-4xl">
                    📚
                  </div>

                  <h3 className="mt-4 text-xl font-bold">
                    Hôm nay học gì?
                  </h3>

                  <div className="mt-4 space-y-3">
  {todaySchedule?.subjects?.some(
    (subject) => subject.trim() !== ""
  ) ? (
    todaySchedule.subjects.map(
      (subject, index) =>
        subject.trim() !== "" && (
          <div
            key={index}
            className="flex items-center gap-4 rounded-xl bg-gray-50 px-4 py-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold shadow-sm">
              {index + 1}
            </div>

            <p className="text-gray-800">
              {subject}
            </p>
          </div>
        )
    )
  ) : (
    <p className="text-gray-500">
      Hôm nay không có lịch học 🎉
    </p>
  )}
</div>
                </div>
              </div>
            )}

            <div className="mt-8">
              <button
                onClick={() => setPage("schedule")}
                className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                ✏️ Chỉnh sửa thời khóa biểu
              </button>
            </div>
          </>
        )}

        {page === "schedule" && (
          <Schedule />
        )}

        {page === "notification" && (
          <PushNotification />
        )}
      </main>
    </div>
  );
}

export default Dashboard;