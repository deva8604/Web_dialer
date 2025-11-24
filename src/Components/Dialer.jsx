import React, { useEffect, useRef, useState } from "react";

/*
  Dialer features:
  - number input, copy, paste
  - Outgoing Call (Call / Hang up)
  - Simulate Incoming Call (Receive / Decline)
  - Record call via MediaRecorder (microphone)
  - Save history in localStorage (audio stored as base64)
*/

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(blob);
  });
}

export default function Dialer({ userPhone }) {
  const [number, setNumber] = useState("");
  const [status, setStatus] = useState("idle"); // idle, calling, in-call, incoming
  const [currentCall, setCurrentCall] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [micAllowed, setMicAllowed] = useState(true);

  useEffect(() => {
    // ensure history key exists
    if (!localStorage.getItem("callHistory")) localStorage.setItem("callHistory", JSON.stringify([]));
  }, []);

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(number);
      alert("Number copied");
    } catch {
      alert("Clipboard not available");
    }
  };

  const pasteNumber = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setNumber(text);
    } catch {
      alert("Paste failed");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
      setMicAllowed(false);
      alert("Microphone access required to record.");
    }
  };

  const stopRecordingAndSave = async (meta) => {
    if (!mediaRecorderRef.current) return null;
    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const base64 = await blobToBase64(blob);
        // save into history
        const history = JSON.parse(localStorage.getItem("callHistory") || "[]");
        const entry = {
          id: Date.now(),
          number: meta.number,
          direction: meta.direction,
          start: meta.start,
          end: Date.now(),
          durationMs: Date.now() - meta.start,
          audioBase64: base64,
          mime: blob.type,
        };
        history.unshift(entry);
        localStorage.setItem("callHistory", JSON.stringify(history));
        setIsRecording(false);
        resolve(entry);
      };
      mediaRecorderRef.current.stop();
      // stop tracks
      try {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      } catch {}
    });
  };

  const placeCall = async () => {
    if (!number.match(/^\+?\d{7,15}$/)) {
      alert("Enter valid number with country code (e.g. +919876543210).");
      return;
    }
    setStatus("calling");
    const callMeta = { number, direction: "outgoing", start: Date.now() };
    setCurrentCall(callMeta);
    // start recording
    await startRecording();
    setStatus("in-call");
    // In real app: call backend / telephony API here to initiate actual call
  };

  const hangup = async () => {
    if (status === "in-call" && isRecording) {
      await stopRecordingAndSave(currentCall);
    }
    setStatus("idle");
    setCurrentCall(null);
  };

  // incoming simulation
  const simulateIncoming = () => {
    setStatus("incoming");
    setCurrentCall({ number: "+911234567890", direction: "incoming", start: null });
  };

  const receiveCall = async () => {
    const meta = { ...currentCall, start: Date.now() };
    setCurrentCall(meta);
    await startRecording();
    setStatus("in-call");
    // real app: accept call via backend/SIP
  };

  const declineCall = () => {
    setStatus("idle");
    setCurrentCall(null);
    // optionally save missed call entry
    const history = JSON.parse(localStorage.getItem("callHistory") || "[]");
    history.unshift({
      id: Date.now(),
      number: currentCall.number,
      direction: "missed",
      start: Date.now(),
      end: Date.now(),
      durationMs: 0,
      audioBase64: null,
    });
    localStorage.setItem("callHistory", JSON.stringify(history));
  };

  return (
    <div style={{ padding: 16, borderRadius: 8, background: "#fff", boxShadow: "0 6px 30px rgba(2,6,23,0.06)" }}>
      <h2>Dialer</h2>
      <div style={{ marginTop: 8 }}>
        <input
  placeholder="+91 1234567890"
  value={number}
  onChange={(e) => setNumber(e.target.value)}
  style={{
  width: "100%",
  padding: "10px 8px",   // ⬅️ Reduced + balanced padding
  fontSize: "16px",
  borderRadius: "10px",
  border: "1px solid #d0d0d0",
  outline: "none",
  background: "#fafafa",
  transition: "0.3s",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
}}

 
/>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={copyNumber} style={{ flex: 1, padding: 10 }}>Copy</button>
          <button onClick={pasteNumber} style={{ flex: 1, padding: 10 }}>Paste</button>
          <button onClick={() => setNumber("")} style={{ flex: 1, padding: 10 }}>Clear</button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {status === "idle" && (
          <>
            <button onClick={placeCall} style={{ padding: "10px 18px", marginRight: 8, background: "#06b6d4", color: "#fff" }}>
              Call
            </button>
            <button onClick={simulateIncoming} style={{ padding: "10px 18px" }}>
              Simulate Incoming
            </button>
          </>
        )}

        {status === "calling" && <p>Calling {number}... (simulated)</p>}

        {status === "incoming" && (
          <div style={{ marginTop: 10 }}>
            <p>Incoming from {currentCall?.number}</p>
            <button onClick={receiveCall} style={{ padding: "10px 18px", marginRight: 8, background: "#10b981", color: "#fff" }}>
              Receive
            </button>
            <button onClick={declineCall} style={{ padding: "10px 18px", background: "#ef4444", color: "#fff" }}>
              Decline
            </button>
          </div>
        )}

        {status === "in-call" && (
          <div style={{ marginTop: 10 }}>
            <p>In call with {currentCall?.number}</p>
            <button onClick={hangup} style={{ padding: "10px 18px", background: "#ef4444", color: "#fff" }}>
              Hang up
            </button>
            <span style={{ marginLeft: 12, color: isRecording ? "red" : "#666" }}>
              {isRecording ? "Recording..." : "Not recording"}
            </span>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, fontSize: 13, color: "#666" }}>
        <p>Note: Recording uses microphone. Grant permission when prompted.</p>
      </div>
    </div>
  );
}