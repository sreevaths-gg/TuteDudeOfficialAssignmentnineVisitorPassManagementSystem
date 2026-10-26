
import { useState } from "react";
import api from "../services/api";

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  company: "",
  role: "Visitor",
};

export default function AddVisitor() {
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [registeredVisitor, setRegisteredVisitor] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    const selectedPhoto = event.target.files?.[0] || null;

    setPhoto(selectedPhoto);
    setError("");

    if (!selectedPhoto) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(selectedPhoto.type)) {
      setError("Only JPG, PNG, and WEBP images are allowed.");
      setPhoto(null);
      event.target.value = "";
      return;
    }

    if (selectedPhoto.size > maxSize) {
      setError("Photo size must not exceed 5 MB.");
      setPhoto(null);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setRegisteredVisitor(null);

    if (!form.fullName.trim() || !form.phone.trim()) {
      setError("Please enter the visitor's name and phone number.");
      return;
    }

    const allowedRoles = ["Admin", "Security", "Employee", "Visitor"];

    if (!allowedRoles.includes(form.role)) {
      setError("Please select a valid system role.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("fullName", form.fullName.trim());
      formData.append("phone", form.phone.trim());
      formData.append("email", form.email.trim());
      formData.append("company", form.company.trim());
      formData.append("role", form.role);

      if (photo) {
        formData.append("photo", photo);
      }

      const response = await api.post("/visitors", formData);

      const visitor = response.data?.visitor || response.data;

      setRegisteredVisitor(visitor);
      setMessage(
        response.data?.message || "Visitor registered successfully."
      );

      setForm(initialForm);
      setPhoto(null);

      event.target.reset();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to register visitor. Check your login and backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Add Visitor</h2>

        <p style={styles.subtitle}>
          Register a visitor before creating an appointment.
        </p>

        {error && (
          <p role="alert" style={styles.error}>
            {error}
          </p>
        )}

        {message && (
          <p role="status" style={styles.success}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="fullName" style={styles.label}>
            Full Name *
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Enter visitor's full name"
            autoComplete="name"
            required
            style={styles.input}
          />

          <label htmlFor="phone" style={styles.label}>
            Phone Number *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            autoComplete="tel"
            required
            style={styles.input}
          />

          <label htmlFor="email" style={styles.label}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email address"
            autoComplete="email"
            style={styles.input}
          />

          <label htmlFor="company" style={styles.label}>
            Company
          </label>
          <input
            id="company"
            name="company"
            type="text"
            value={form.company}
            onChange={handleChange}
            placeholder="Enter company name"
            style={styles.input}
          />

          <label htmlFor="role" style={styles.label}>
            System Role *
          </label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="visitor">Visitor</option>
            {/* <option value="Employee">Employee</option>
            <option value="Security">Security</option>
            <option value="Admin">Admin</option> */}
          </select>

          <p style={styles.helpText}>
            Select the system access role. The backend must verify that your
            account is authorized to assign this role.
          </p>

          <label htmlFor="photo" style={styles.label}>
            Visitor Photo (Optional)
          </label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            style={styles.input}
          />

          {photo && (
            <p style={styles.subtitle}>
              Selected photo: {photo.name}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.primaryButton,
              ...(loading ? styles.disabledButton : {}),
            }}
          >
            {loading ? "Registering..." : "Register Visitor"}
          </button>
        </form>

        {registeredVisitor && (
          <div style={styles.resultSection}>
            <h3>Registered Visitor</h3>

            <div style={styles.visitorDetails}>
              <p>
                <strong>Visitor ID:</strong>{" "}
                {registeredVisitor.visitorId ||
                  registeredVisitor._id ||
                  "-"}
              </p>

              <p>
                <strong>Name:</strong>{" "}
                {registeredVisitor.fullName || "-"}
              </p>

              <p>
                <strong>Phone:</strong> {registeredVisitor.phone || "-"}
              </p>

              <p>
                <strong>Email:</strong> {registeredVisitor.email || "-"}
              </p>

              <p>
                <strong>Company:</strong> {registeredVisitor.company || "-"}
              </p>

              <p>
                <strong>System Role:</strong>{" "}
                {registeredVisitor.role || "-"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "30px 16px",
    background: "#f3f6fb",
    minHeight: "100vh",
    boxSizing: "border-box",
  },

  card: {
    maxWidth: 650,
    margin: "0 auto",
    padding: 28,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
  },

  heading: {
    marginTop: 0,
    color: "#1d2939",
  },

  subtitle: {
    color: "#667085",
    fontSize: 14,
    lineHeight: 1.6,
  },

  label: {
    display: "block",
    marginTop: 20,
    marginBottom: 8,
    fontWeight: 600,
    color: "#344054",
  },

  input: {
    display: "block",
    width: "100%",
    padding: 12,
    border: "1px solid #ccd3df",
    borderRadius: 6,
    boxSizing: "border-box",
    fontSize: 14,
    background: "#fff",
  },

  helpText: {
    marginTop: 8,
    color: "#667085",
    fontSize: 12,
    lineHeight: 1.5,
  },

  primaryButton: {
    display: "block",
    width: "100%",
    padding: "12px 16px",
    marginTop: 24,
    background: "#1565c0",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
  },

  disabledButton: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  success: {
    color: "#16834a",
    background: "#ecfdf3",
    border: "1px solid #abefc6",
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
    overflowWrap: "anywhere",
  },

  error: {
    color: "#c62828",
    background: "#fef3f2",
    border: "1px solid #fecdca",
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
    overflowWrap: "anywhere",
  },

  resultSection: {
    marginTop: 28,
    paddingTop: 20,
    borderTop: "1px solid #e5e7eb",
    overflowWrap: "anywhere",
  },

  visitorDetails: {
    padding: 14,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
  },
};
