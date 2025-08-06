import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ import điều hướng
import "./AuthPage.css";

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // ✅ khởi tạo navigate

  const handleLogin = async () => {
    try {
      const url = `${import.meta.env.VITE_SPECIALIZED_API_URL}/api/auth/login`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Sai tài khoản hoặc mật khẩu");

      const data = await res.json();
      localStorage.setItem("token", data.token);
      onLoginSuccess?.(); // Gọi callback nếu có
      navigate("/");       // ✅ Điều hướng đến trang chính
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Đăng nhập</h2>
        <input
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Đăng nhập</button>
        {error && <p className="error">{error}</p>}
        <p className="link" onClick={() => navigate("/register")}>
          Chưa có tài khoản? Đăng ký
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
