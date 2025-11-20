// front-medicapp/app/dashboard/(home)/components/ResumenMedicoModal.tsx
'use client';

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResumenMedicoSchema, ResumenMedico } from '@/schema/perfilSchema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { updateResumenMedico, getResumenMedico, IResumenMedico } from '@/services/userService';
import { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumenMedicoModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();

  // Query para obtener el resumen actual
  const { data: resumen, isLoading: isLoadingResumen } = useQuery<IResumenMedico>({
    queryKey: ['resumenMedico'],
    queryFn: getResumenMedico,
    enabled: isOpen, // Solo hacer fetch cuando el modal se abre
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ResumenMedico>({
    resolver: zodResolver(ResumenMedicoSchema),
    defaultValues: { descripcion: '' }
  });

  // Resetear el form cuando 'resumen' se carga
  useEffect(() => {
    if (resumen && isOpen) {
      reset({ descripcion: resumen.descripcion || '' });
    }
  }, [resumen, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: updateResumenMedico,
    onSuccess: (data) => {
      // Invalidar la query del resumen para que la próxima vez que se abra (o en el dashboard) esté actualizada
      queryClient.invalidateQueries({ queryKey: ['resumenMedico'] });
      onClose(); // Cierra el modal
      // TODO: Mostrar toast de éxito
    },
    onError: (error) => {
      console.error(error);
      // TODO: Mostrar toast de error
    }
  });

  const onSubmit = (data: ResumenMedico) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="top-center">
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader className="flex flex-col gap-1">Editar Resumen Médico</ModalHeader>
            <ModalBody>
              <Textarea
                label="Resumen Médico"
                placeholder="Describa su historial médico, alergias, condiciones..."
                {...register('descripcion')}
                isInvalid={!!errors.descripcion}
                errorMessage={errors.descripcion?.message}
                minRows={10}
                isLoading={isLoadingResumen}
                defaultValue={resumen?.descripcion || ''} // Usar defaultValue para textarea
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button color="primary" type="submit" isLoading={mutation.isPending}>
                Guardar
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}