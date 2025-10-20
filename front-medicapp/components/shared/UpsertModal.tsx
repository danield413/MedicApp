'use client'

import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react"
import { FC } from "react"

interface UpsertModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  entity?: T;
  title: string;
  FormComponent: FC<{ onClose: () => void; data?: T }>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
}

export const UpsertModal = <T extends { id: string }>({
  isOpen,
  onClose,
  entity,
  title,
  FormComponent,
  size = 'xl'
}: UpsertModalProps<T>) => {
  return (
    <Modal isDismissable={false} isOpen={isOpen} onOpenChange={onClose} disableAnimation size={size}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h4 className="text-lg font-semibold">
            {entity ? `Actualizar ${title}` : `Crear Nuevo ${title}`}
          </h4>
          <span className="text-sm text-gray-400">
            {entity
              ? `Modifica la información del ${title.toLowerCase()} seleccionado.`
              : `Completa los datos para crear un nuevo ${title.toLowerCase()}.`
            }
          </span>
        </ModalHeader>
        <ModalBody>
          <FormComponent onClose={onClose} data={entity} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};