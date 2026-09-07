import { useState } from "react";
import { loginUser, registerUser } from "../services/api";

function Login() {
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      let result;

      if (isRegister) {
        result = await registerUser({
          name,
          email,
          password
        });
      } else {
        result = await loginUser({
          email,
          password
        });
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      window.location.reload();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Daily Reminder
        </h1>

        <p className="mb-8 text-gray-500">
          {isRegister
            ? "Tạo tài khoản để bắt đầu"
            : "Đăng nhập để xem thời khóa biểu của bạn"}
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {isRegister && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Họ tên
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              minLength={isRegister ? 6 : undefined}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading
              ? isRegister
                ? "Đang đăng ký..."
                : "Đang đăng nhập..."
              : isRegister
              ? "Đăng ký"
              : "Đăng nhập"}
          </button>

        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {isRegister
            ? "Đã có tài khoản?"
            : "Chưa có tài khoản?"}

          <button
            type="button"
            onClick={switchMode}
            className="ml-1 font-medium text-black hover:underline"
          >
            {isRegister ? "Đăng nhập" : "Đăng ký"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;