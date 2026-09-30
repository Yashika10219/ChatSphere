import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://chatsphere-1-8q32.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const user = {
  _id: data.user._id,
  name: data.user.name,
  email: data.user.email,
  profilePic: data.user.profilePic,
};

console.log("SAVING USER:", user);

localStorage.setItem(
  "user",
  JSON.stringify(user)
);

if (data.token) {
  localStorage.setItem("token", data.token);
}

navigate("/chat");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="orb orb-one"></div>
      <div className="orb orb-two"></div>

      <form className="auth-card" onSubmit={submit}>
        <div className="brand-mark">Hi!</div>

        <h1>ChatSphere</h1>
        <p>Welcome back — your conversations are waiting.</p>

        {error && <div className="form-error">{error}</div>}

        <label>
          Email
          <input
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />
        </label>

        <button
          className="primary-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </main>
  );
}