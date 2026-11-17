function Alert({ type = "error", message, details = [], children }) {
  if (!message) return null;
  return (
    <div className={type === "ok" ? "alert-ok" : "alert-error"} role="alert">
      {message} {children}
      {details.length > 0 && (
        <ul>
          {details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Alert;
