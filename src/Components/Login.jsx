import React, { useState } from "react";

/*
  This component simulates OTP flow:
  - User enters phone -> "send OTP" (simulated)
  - User enters OTP -> verifies (simulated) -> onLogin(phone)
*/
export default function LoginPhone({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const sendOtp = () => {
    if (!phone.match(/^\+?\d{7,15}$/)) {
      setMessage("Enter valid phone with country code (e.g. +919876543210).");
      return;
    }
    // In real app: call backend to send OTP via SMS provider
    setOtpSent(true);
    setMessage("OTP sent (demo code is 1234)");
    // For demo, show OTP in console
    console.info("Demo OTP: 1234");
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    if (otp === "1234") {
      onLogin(phone);
    } else {
      setMessage("Invalid OTP (demo OTP is 1234).");
    }
  };

  return (
    <div style={{ background: "#f8fafc", padding: 20, borderRadius: 8, boxShadow: "0 4px 18px rgba(0,0,0,0.06)" }}>
      <h2>Login with Mobile (demo)</h2>
      {!otpSent ? (
        <>
          <label>Mobile number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." style={{ width: "100%", padding: 8, marginTop: 6 }} />
          <div style={{ marginTop: 12 }}>
            <button onClick={sendOtp} style={{ padding: "8px 12px" }}>Send OTP</button>
          </div>
        </>
      ) : (
        <form onSubmit={verifyOtp}>
          <label>Enter OTP</label>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="1234" style={{ width: "100%", padding: 8, marginTop: 6 }} />
          <div style={{ marginTop: 12 }}>
            <button type="submit" style={{ padding: "8px 12px" }}>Verify & Login</button>
            <button type="button" onClick={() => setOtpSent(false)} style={{ padding: "8px 12px", marginLeft: 8 }}>Back</button>
          </div>
        </form>
      )}
      {message && <p style={{ marginTop: 12, color: "#444" }}>{message}</p>}
      <p style={{ fontSize: 12, color: "#666", marginTop: 10 }}>
        Note: This demo uses a simulated OTP. For production integrate SMS/OTP provider + backend.
      </p>
    </div>
  );
}