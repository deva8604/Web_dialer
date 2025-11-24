import React, { useState } from "react";
import LoginPhone from "./Login";
import {Dialer} from "./Dialer";
import CallHistory from "./Callhistory";

export default function DialerApp() {
  const [userPhone, setUserPhone] = useState(
    localStorage.getItem("dialerUser") || null
  );

  const handleLogin = (phone) => {
    localStorage.setItem("dialerUser", phone);
    setUserPhone(phone);
  };

  const handleLogout = () => {
    localStorage.removeItem("dialerUser");
    setUserPhone(null);
  };

  return (
    <div style={{ maxWidth: 980, margin: "2rem auto", padding: 16 }}>
      {!userPhone ? (
        <LoginPhone onLogin={handleLogin} />
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Logged in as: {userPhone}</h3>
            <button onClick={handleLogout} style={{ padding: "8px 12px" }}>
              Logout
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, marginTop: 16 }}>
            <Dialer userPhone={userPhone} />
            <CallHistory />
          </div>
        </>
      )}
    </div>
  );
}