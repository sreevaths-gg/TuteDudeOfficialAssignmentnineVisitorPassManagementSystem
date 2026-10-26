import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

function AddUsers() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Visitor");

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);

    try {
      const response = await api.get("/users");
      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load users. Check your login and backend API."
      );
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/users", {
        name,
        email,
        password,
        role,
      });

      setSuccess("User added successfully.");

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("Visitor");

      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to add user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleAddUser} style={styles.form}>
        <h2>Visitor Pass Management System</h2>
        <h3>Add New User</h3>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter full name"
          autoComplete="name"
          required
          style={styles.input}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          autoComplete="email"
          required
          style={styles.input}
        />

        <label htmlFor="role">Role</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          style={styles.input}
        >
          <option value="visitor">Visitor</option>
          <option value="admin">Admin</option>
          <option value="security">Security</option>
          <option value="employee">Employee</option>
        </select>

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          autoComplete="new-password"
          minLength={6}
          required
          style={styles.input}
        />

        <label htmlFor="confirmPassword">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          placeholder="Re-enter password"
          autoComplete="new-password"
          minLength={6}
          required
          style={styles.input}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading
              ? { opacity: 0.65, cursor: "not-allowed" }
              : {}),
          }}
        >
          {loading ? "Adding User..." : "Add User"}
        </button>
      </form>
       <div style={styles.tableContainer}>
        <h3>All Users</h3>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={loadingUsers}
          style={styles.refreshButton}
        >
          {loadingUsers ? "Loading..." : "Refresh Users"}
        </button>

        {loadingUsers ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                   
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                   <th style={styles.th}>Image</th>
                  
                </tr>
              </thead>

              <tbody>
              {users.map((user) => {
    const role = (user.role || "visitor").toLowerCase();

    const imageName = {
      admin: "admin.jpg",
      security: "security.jpg",
      employee: "employee.jpg",
    }[role];

    const imageUrl = imageName
      ? `http://localhost:5000/uploads/logos/${imageName}`
      : null;

    return (
      <tr key={user._id}>
           <td style={styles.td}>{user._id}</td>
        <td style={styles.td}>{user.name}</td>
        <td style={styles.td}>{user.email}</td>
        <td style= {{ ...styles.td,textTransform: 'capitalize' }}>{user.role}</td>
        <td style={styles.td}> 
 {imageUrl ? (             <img   src={imageUrl}  alt={`${role} logo`}  style={styles.userImage}
   onError={(e) => {     e.currentTarget.style.display = "none";  }} height="50px" width="50px" />
          ) : (             "No image"            )}         </td>

     
      </tr>
    );
  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
   
    
  );
}

const styles = {
  container: {
  //  display: "flex",
  //  justifyContent: "center",
  //  alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    padding: "20px",
    left: "100px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
    maxWidth: "400px",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
    backgroundColor: "#fff",
  },
  button: {
    padding: "12px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "#dc2626",
    margin: 0,
  },
  success: {
    color: "#15803d",
    margin: 0,
  },
   tableContainer: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
   refreshButton: {
    padding: "9px 14px",
    marginBottom: "15px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "12px",
    backgroundColor: "#e5e7eb",
    border: "1px solid #d1d5db",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px",
    border: "1px solid #d1d5db",
    overflowWrap: "anywhere",
  },
};

export default AddUsers;
