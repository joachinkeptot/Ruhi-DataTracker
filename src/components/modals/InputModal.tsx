import React, { useState, useEffect } from "react";

interface Field {
  key: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

interface InputModalProps {
  isOpen: boolean;
  title: string;
  /** If provided with no fields, renders as a confirmation dialog */
  message?: string;
  fields?: Field[];
  confirmLabel?: string;
  confirmDanger?: boolean;
  onConfirm: (values: Record<string, string>) => void;
  onClose: () => void;
}

export const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  title,
  message,
  fields = [],
  confirmLabel = "Confirm",
  confirmDanger = false,
  onConfirm,
  onClose,
}) => {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const defaults: Record<string, string> = {};
      fields.forEach((f) => {
        defaults[f.key] = f.defaultValue ?? "";
      });
      setValues(defaults);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(values);
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal__content">
        <h3>{title}</h3>
        {message && <p style={{ marginBottom: "1rem" }}>{message}</p>}
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div className="form-row" key={field.key}>
              <label className="muted">{field.label}</label>
              <input
                type="text"
                placeholder={field.placeholder}
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                required={field.required}
                autoFocus={fields[0]?.key === field.key}
              />
            </div>
          ))}
          <div className="modal__actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn--primary${confirmDanger ? " btn--danger" : ""}`}
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
