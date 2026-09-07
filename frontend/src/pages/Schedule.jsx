import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const days = [
  { key: "monday", label: "Thứ 2" },
  { key: "tuesday", label: "Thứ 3" },
  { key: "wednesday", label: "Thứ 4" },
  { key: "thursday", label: "Thứ 5" },
  { key: "friday", label: "Thứ 6" },
  { key: "saturday", label: "Thứ 7" },
  { key: "sunday", label: "Chủ nhật" }
];

const createEmptySchedule = () => {
  const schedule = {};

  days.forEach((day) => {
    schedule[day.key] = {
      subjects: ["", "", "", "", ""]
    };
  });

  return schedule;
};

function Schedule() {
  const [schedule, setSchedule] = useState(
    createEmptySchedule()
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

        const formattedSchedule =
          createEmptySchedule();

        days.forEach((day) => {
          if (data[day.key]?.subjects) {
            formattedSchedule[day.key] = {
              subjects: [
                ...data[day.key].subjects,
                "",
                "",
                "",
                "",
                "",
                ""
              ].slice(0, 6)
            };
          }
        });

        setSchedule(formattedSchedule);
      } catch (error) {
        console.error(
          "Fetch schedule error:",
          error
        );

        setMessage("Không thể tải thời khóa biểu.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const handleChange = (
    dayKey,
    periodIndex,
    value
  ) => {
    setSchedule((prev) => ({
      ...prev,

      [dayKey]: {
        ...prev[dayKey],

        subjects: prev[dayKey].subjects.map(
          (subject, index) =>
            index === periodIndex
              ? value
              : subject
        )
      }
    }));

    setMessage("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/schedule`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify(schedule)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessage(
        "Đã lưu thời khóa biểu thành công ✓"
      );
    } catch (error) {
      console.error(
        "Save schedule error:",
        error
      );

      setMessage(
        error.message ||
          "Không thể lưu thời khóa biểu."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">
        Đang tải thời khóa biểu...
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">
          Thời khóa biểu
        </h2>

        <p className="mt-2 text-gray-500">
          Nhập 5 môn học cho từng ngày.
        </p>
      </div>

      {/* Schedule */}
      <div className="space-y-6">
        {days.map((day) => (
          <div
            key={day.key}
            className="overflow-hidden rounded-2xl bg-white shadow"
          >
            {/* Day */}
            <div className="border-b bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-bold">
                {day.label}
              </h3>
            </div>

            {/* Subjects */}
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-5">
              {schedule[day.key].subjects.map(
                (subject, index) => (
                  <div key={index}>
                    <label className="mb-2 block text-sm font-medium text-gray-500">
                      Tiết {index + 1}
                    </label>

                    <input
                      type="text"
                      value={subject}
                      onChange={(event) =>
                        handleChange(
                          day.key,
                          index,
                          event.target.value
                        )
                      }
                      placeholder="Tên môn học"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                    />
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full max-w-xs rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Đang lưu..."
            : "💾 Lưu thời khóa biểu"}
        </button>

        {message && (
          <p className="text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Schedule;