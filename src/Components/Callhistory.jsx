import React, { useEffect, useState } from "react";

/*
  Reads callHistory from localStorage and shows list.
  For entries with audioBase64, creates playable blob URLs on the fly.
*/
export default function CallHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem("callHistory") || "[]");
    setHistory(raw);
  }, []);

  const refresh = () => {
    const raw = JSON.parse(localStorage.getItem("callHistory") || "[]");
    setHistory(raw);
  };

  const downloadAudio = (entry) => {
    if (!entry.audioBase64) {
      alert("No recording available for this entry.");
      return;
    }
    const byteString = atob(entry.audioBase64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: entry.mime || "audio/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `call-${entry.number}-${entry.id}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 16, borderRadius: 8, background: "#fff", boxShadow: "0 6px 30px rgba(2,6,23,0.06)" }}>
      <h3>Call History</h3>
      <button onClick={refresh} style={{ marginBottom: 8 }}>Refresh</button>
      {!history.length && <p style={{ color: "#666" }}>No calls yet</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {history.map((h) => (
          <li key={h.id} style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{h.number} <span style={{ fontWeight: 400, color: "#666", marginLeft: 8 }}>({h.direction})</span></div>
                <div style={{ fontSize: 12, color: "#666" }}>{new Date(h.start).toLocaleString()} • {Math.round((h.durationMs || 0)/1000)}s</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {h.audioBase64 && (
                  <audio
                    controls
                    src={h.audioBase64 ? `data:${h.mime};base64,${h.audioBase64}` : undefined}
                    style={{ width: 180 }}
                  />
                )}
                <button onClick={() => downloadAudio(h)} style={{ padding: "6px 10px" }}>Download</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}