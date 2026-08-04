import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);

      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      navigate("/chat");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="auth-page">

      <div className="orb orb-one"></div>
      <div className="orb orb-two"></div>

      <form 
        className="auth-card" 
        onSubmit={submit}
      >

        <div className="brand-mark">
          
        </div>

        <h1>

          Create Account
        </h1>
        <p>
          Join ChatSphere and start chatting.
        </p>


        {error && (
          <div className="form-error">
            {error}
          </div>
        )}


        <label>
          Name

          <input
            type="text"
            placeholder="Enter your name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            required
          />

        </label>


        <label>
          Email

          <input
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
          />

        </label>


        <label>
          Password

          <input
            type="password"
            placeholder="Create password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            required
          />

        </label>


        <button
          className="primary-btn"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create Account"}
        </button>


        <p className="auth-switch">

          Already have an account?{" "}

          <Link to="/login">
            Sign In
          </Link>

        </p>


      </form>

    </main>
  );
}