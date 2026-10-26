
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);

    try {
      await api.post("/logout");
    } catch (error) {
      // Still clear local authentication if the
      // backend is unavailable.
      console.error("Logout request failed:", error.message);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setLoading(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      style={styles.button}
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}

const styles = {
  button: {
    padding: "2px 16px",
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
};
