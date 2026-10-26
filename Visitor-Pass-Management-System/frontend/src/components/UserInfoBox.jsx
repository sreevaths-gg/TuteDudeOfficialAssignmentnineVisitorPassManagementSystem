
import React from "react";

export default function UserInfoBox() {
  let user = {};

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "{}" );
    //  user = JSON.parse( localStorage.getItem("user"));
    //  console.log(user,user.name,user.email,user.role);
   
  } catch {
    user = {};
  }

  if (!user.name && !user.email && !user.role) {
    return null;
    //console.log("No User");
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "12px",
        right: "16px",
        zIndex: 1000,
        background: "white",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "12px 16px",
        boxShadow: "0 2px 8px #00000015",
        fontSize: "14px",
      }}
    >
      <div><strong>{user.name || "User"}</strong></div>
      {/* <div>{user.email || ""}</div> */}
      <div style={{ color: "#0d6efd", marginTop: "4px" }}>
        Role: {user.role || "Unknown"}
      </div>
    </div>
  );
}
