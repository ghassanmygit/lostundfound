const icons = {
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M4 8l8 6 8-6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="3" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  tag: (
    <>
      <path d="M3 12V4h8l9 9-8 8z" />
      <circle cx="7.5" cy="8.5" r="1" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11.5a7 7 0 10-14 0C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="3" />
      <path d="M11 18h2" />
    </>
  ),
};

function FormField({ id, label, icon, hint, ...inputProps }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {icons[icon]}
        </svg>
        <input id={id} {...inputProps} />
      </div>
      {hint && <small className="field-hint">{hint}</small>}
    </div>
  );
}

export default FormField;
