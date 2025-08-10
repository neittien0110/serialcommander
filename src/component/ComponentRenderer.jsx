import React from "react";
import "./ComponentRenderer.css";

function ComponentRenderer({ component, value, onChange, onSend, feedback }) {
  const { name, type, list, defaultValue } = component;

  const handleSend = () => {
    if (type === "button") {
      onSend(defaultValue || "");
    } else {
      onSend(value);
    }
  };

  return (
    <div className="step-block">
      <label className="step-label">{name}</label>

      <div className="step-controls">
        {type === "text" && (
          <>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
            <button onClick={handleSend}>Send</button>
          </>
        )}

        {type === "dropdown" && (
          <>
            <select value={value} onChange={(e) => onChange(e.target.value)}>
              {(list || "").split(";").map((item, idx) => (
                <option key={idx} value={item}>{item}</option>
              ))}
            </select>
            <button onClick={handleSend}>Send</button>
          </>
        )}

        {type === "para" && (
          <>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={4}
              style={{ width: "100%" }}
            />
            <button onClick={handleSend}>Send</button>
          </>
        )}

        {type === "button" && (
          <button onClick={handleSend}>{name}</button>
        )}
      </div>

      <p className="serial-feedback">
        {feedback ? <>↪ <code>{feedback}</code></> : "Không có phản hồi."}
      </p>
    </div>
  );
}

export default ComponentRenderer;
