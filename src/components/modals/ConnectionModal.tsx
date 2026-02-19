import React, { useState, useEffect } from "react";
import { useApp } from "../../context";
import { Person } from "../../types";
import { notifyWarning, notifyError } from "../../utils";

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  personA?: Person;
  personB?: Person;
  onConnectionSave?: () => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  personA,
  personB,
  onConnectionSave,
}) => {
  const { people, updatePerson } = useApp();
  const [selectedPersonA, setSelectedPersonA] = useState<string>(
    personA?.id || "",
  );
  const [selectedPeople, setSelectedPeople] = useState<string[]>(
    personB?.id ? [personB.id] : [],
  );

  useEffect(() => {
    if (personA?.id) setSelectedPersonA(personA.id);
    if (personB?.id) setSelectedPeople([personB.id]);
  }, [personA, personB, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPersonA || selectedPeople.length === 0) {
      notifyWarning(
        "Please select a base person and at least one other person",
      );
      return;
    }

    const personAObj = people.find((p) => p.id === selectedPersonA);
    if (!personAObj) {
      notifyError("People not found");
      return;
    }

    const uniqueTargets = selectedPeople.filter((id) => id !== selectedPersonA);
    if (uniqueTargets.length === 0) {
      notifyWarning("Please select at least one different person");
      return;
    }

    const timestamp = new Date().toISOString();
    const newConnectionsA = personAObj.connections.filter(
      (c) => !uniqueTargets.includes(c.personId),
    );

    uniqueTargets.forEach((targetId) => {
      const personBObj = people.find((p) => p.id === targetId);
      if (!personBObj) return;

      newConnectionsA.push({
        personId: targetId,
        dateAdded: timestamp,
      });

      const newConnectionsB = personBObj.connections.filter(
        (c) => c.personId !== selectedPersonA,
      );
      newConnectionsB.push({
        personId: selectedPersonA,
        dateAdded: timestamp,
      });
      updatePerson(targetId, { connections: newConnectionsB });
    });

    updatePerson(selectedPersonA, { connections: newConnectionsA });

    onConnectionSave?.();
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedPersonA(personA?.id || "");
    setSelectedPeople(personB?.id ? [personB.id] : []);
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal__content">
        <h3>Add Connections</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="muted">Base Person *</label>
            <select
              value={selectedPersonA}
              onChange={(e) => setSelectedPersonA(e.target.value)}
              required
            >
              <option value="">Select a person...</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label className="muted">Connect With *</label>
            <select
              multiple
              size={6}
              value={selectedPeople}
              onChange={(e) =>
                setSelectedPeople(
                  Array.from(e.target.selectedOptions, (opt) => opt.value),
                )
              }
              required
            >
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
            <small className="hint">Hold Ctrl/Cmd to select multiple</small>
          </div>

          <div className="modal__actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Save Connection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
