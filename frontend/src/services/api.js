const API_URL = import.meta.env.VITE_API_URL || "https://thongbaotoiemne.onrender.com/api";

export const registerUser = async (data) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Đăng ký thất bại");
  }

  return result;
};

export const loginUser = async (data) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Đăng nhập thất bại");
  }

  return result;
};