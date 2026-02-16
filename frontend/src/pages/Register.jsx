import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../styles/auth.css";
import "../styles/form.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    collegeId: "",
    password: ""
  });

  const submit = async () => {
    try {
      await axios.post("/auth/register", form);
      alert("Registered successfully");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>

        <div className="form-group">
          <input placeholder="Name"
            onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>

        <div className="form-group">
          <input placeholder="College Email"
            onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>

        <div className="form-group">
          <input placeholder="College ID"
            onChange={e => setForm({ ...form, collegeId: e.target.value })} />
        </div>

        <div className="form-group">
          <input type="password" placeholder="Password"
            onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>

        <button className="auth-btn" onClick={submit}>
          Register
        </button>
      </div>
    </div>
  );
}