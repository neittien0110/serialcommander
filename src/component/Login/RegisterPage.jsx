import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ thêm dòng này

import "./AuthPage.css";

function RegisterPage({ }) {
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("https://be-datn-mc6y.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng ký thất bại");

      setSuccess("Đăng ký thành công, hãy đăng nhập!");
      setError("");
    } catch (err) {
      setError(err.message);
      setSuccess("");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Đăng ký</h2>
        <input name="username" placeholder="Tên đăng nhập" value={form.username} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input type="password" name="password" placeholder="Mật khẩu" value={form.password} onChange={handleChange} />
        <button onClick={handleRegister}>Đăng ký</button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <p className="link" onClick={() => navigate("/login")}>
          Đã có tài khoản? Đăng nhập
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
