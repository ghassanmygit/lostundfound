function SelectField({ id, label, children, ...selectProps }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="control" {...selectProps}>
        {children}
      </select>
    </div>
  );
}

export default SelectField;
