function TextareaField({ id, label, hint, ...textareaProps }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} className="control" {...textareaProps} />
      {hint && <small className="field-hint">{hint}</small>}
    </div>
  );
}

export default TextareaField;
