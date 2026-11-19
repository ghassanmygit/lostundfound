import { useEffect, useMemo } from "react";

function FotoField({ id, label, file, onChange }) {
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <label className="foto-drop" htmlFor={id}>
        {preview ? (
          <img src={preview} alt="Pratinjau foto barang" />
        ) : (
          <span>Ketuk untuk memilih foto (JPG atau PNG, maks 5 MB)</span>
        )}
      </label>
      <input
        id={id}
        className="foto-input"
        type="file"
        accept="image/jpeg,image/png"
        onChange={(e) => onChange(e.target.files[0] ?? null)}
      />
      {file && <small className="field-hint">{file.name}</small>}
    </div>
  );
}

export default FotoField;
