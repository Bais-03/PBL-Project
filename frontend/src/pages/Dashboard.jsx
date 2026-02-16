import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Student Trade Platform</h1>
        <p>Buy & sell academic resources securely within your campus</p>

        <div className="dashboard-buttons">
          <Link to="/login">
            <button className="dashboard-btn login-btn">Login</button>
          </Link>

          <Link to="/register">
            <button className="dashboard-btn register-btn">Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
}