'use client'

import { Modal, ModalContent, ModalHeader, ModalFooter, Button } from "@heroui/react";
import { FC, type ReactNode } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "secondary" | "success" | "warning" | "danger";
  isLoading?: boolean;
}

export const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmColor = "danger",
  isLoading = false,
}) => {
  return (
    <Modal isDismissable={false} isOpen={isOpen} onOpenChange={onClose} disableAnimation size="xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h4 className="text-lg font-semibold">{title}</h4>
          <span className="text-sm text-gray-700">{message}</span>
        </ModalHeader>
        <ModalFooter>
          <Button size="sm" variant="light" onPress={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            color={confirmColor}
            size="sm"
            isLoading={isLoading}
            onPress={onConfirm}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};