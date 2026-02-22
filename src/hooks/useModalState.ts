import { useState } from "react";
import { Person } from "../types";

interface ConnectionDraft {
  personA?: Person;
  personB?: Person;
}

interface ModalState {
  isModalOpen: boolean;
  isFamilyModalOpen: boolean;
  isConnectionModalOpen: boolean;
  editingPersonId: string | null;
  editingActivityId: string | null;
  editingFamilyId: string | null;
  connectionDraft: ConnectionDraft;
  showSaveQueryModal: boolean;
}

interface ModalActions {
  setModalOpen: (open: boolean) => void;
  setFamilyModalOpen: (open: boolean) => void;
  setConnectionModalOpen: (open: boolean) => void;
  setEditingPersonId: (id: string | null) => void;
  setEditingActivityId: (id: string | null) => void;
  setEditingFamilyId: (id: string | null) => void;
  setConnectionDraft: (draft: ConnectionDraft) => void;
  setSaveQueryModalOpen: (open: boolean) => void;
  handleAddItem: () => void;
  handleEditPerson: (id: string) => void;
  handleEditActivity: (id: string) => void;
  handleAddFamily: () => void;
  handleEditFamily: (id: string) => void;
  handleAddConnection: (personA?: Person, personB?: Person) => void;
  handleClosePerson: () => void;
  handleCloseFamily: () => void;
  handleCloseConnection: () => void;
}

/**
 * Hook for managing modal state and related handlers
 * Centralizes all modal-related state to reduce App.tsx complexity
 */
export const useModalState = (): [ModalState, ModalActions] => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null,
  );
  const [editingFamilyId, setEditingFamilyId] = useState<string | null>(null);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [connectionDraft, setConnectionDraft] = useState<ConnectionDraft>({});
  const [showSaveQueryModal, setShowSaveQueryModal] = useState(false);

  const state: ModalState = {
    isModalOpen,
    isFamilyModalOpen,
    isConnectionModalOpen,
    editingPersonId,
    editingActivityId,
    editingFamilyId,
    connectionDraft,
    showSaveQueryModal,
  };

  const actions: ModalActions = {
    setModalOpen: setIsModalOpen,
    setFamilyModalOpen: setIsFamilyModalOpen,
    setConnectionModalOpen: setIsConnectionModalOpen,
    setEditingPersonId,
    setEditingActivityId,
    setEditingFamilyId,
    setConnectionDraft,
    setSaveQueryModalOpen: setShowSaveQueryModal,

    handleAddItem: () => {
      setEditingPersonId(null);
      setEditingActivityId(null);
      setIsModalOpen(true);
    },

    handleEditPerson: (id: string) => {
      setEditingPersonId(id);
      setEditingActivityId(null);
      setIsModalOpen(true);
    },

    handleEditActivity: (id: string) => {
      setEditingActivityId(id);
      setEditingPersonId(null);
      setIsModalOpen(true);
    },

    handleAddFamily: () => {
      setEditingFamilyId(null);
      setIsFamilyModalOpen(true);
    },

    handleEditFamily: (id: string) => {
      setEditingFamilyId(id);
      setIsFamilyModalOpen(true);
    },

    handleAddConnection: (personA?: Person, personB?: Person) => {
      setConnectionDraft({ personA, personB });
      setIsConnectionModalOpen(true);
    },

    handleClosePerson: () => {
      setIsModalOpen(false);
      setEditingPersonId(null);
      setEditingActivityId(null);
    },

    handleCloseFamily: () => {
      setIsFamilyModalOpen(false);
      setEditingFamilyId(null);
    },

    handleCloseConnection: () => {
      setIsConnectionModalOpen(false);
    },
  };

  return [state, actions];
};
