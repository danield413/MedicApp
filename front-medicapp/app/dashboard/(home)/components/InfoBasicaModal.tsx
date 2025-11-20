'use client';

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from '@heroui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InfoBasicaSchema, InfoBasica } from '@/schema/perfilSchema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateInfoBasica } from '@/services/userService';
import { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userData: any; // Recibir los datos del usuario como prop
}

const tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function InfoBasicaModal({ isOpen, onClose, userData }: Props) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<InfoBasica>({
    resolver: zodResolver(InfoBasicaSchema),
  });
  
  // Resetear el form cuando se abre el modal o cambian los datos
  useEffect(() => {
     if (userData && isOpen) {
        reset({
          nombre: userData.nombre || '',
          apellidos: userData.apellidos || '',
          celular: userData.celular || '',
          fechaNacimiento: userData.fechaNacimiento ? new Date(userData.fechaNacimiento).toISOString().split('T')[0] : '',
          ciudadNacimiento: userData.ciudadNacimiento || '',
          ciudadResidencia: userData.ciudadResidencia || '',
          direccion: userData.direccion || '',
          tipoSangre: userData.tipoSangre || '',
        });
     }
  }, [userData, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: updateInfoBasica,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userData'] });
      onClose();
      // TODO: Mostrar toast de éxito
    },
    onError: (error) => {
      console.error(error);
      // TODO: Mostrar toast de error
    }
  });

  const onSubmit = (data: InfoBasica) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="top-center" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader className="flex flex-col gap-1">Editar Información Básica</ModalHeader>
            <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                {...register('nombre')}
                isInvalid={!!errors.nombre}
                errorMessage={errors.nombre?.message}
                isRequired
              />
              <Input
                label="Apellidos"
                {...register('apellidos')}
                isInvalid={!!errors.apellidos}
                errorMessage={errors.apellidos?.message}
                isRequired
              />
              <Input
                label="Celular"
                {...register('celular')}
                isInvalid={!!errors.celular}
                errorMessage={errors.celular?.message}
              />
               <Input
                label="Fecha de Nacimiento"
                type="date"
                {...register('fechaNacimiento')}
              />
              <Input
                label="Ciudad de Nacimiento"
                {...register('ciudadNacimiento')}
              />
              <Input
                label="Ciudad de Residencia"
                {...register('ciudadResidencia')}
              />
              <Input
                label="Dirección"
                {...register('direccion')}
                className="md:col-span-2"
              />
              <Controller
                name="tipoSangre"
                control={control}
                rules={{ required: 'El tipo de sangre es obligatorio' }}
                render={({ field }) => (
                  <Select
                    label="Tipo de Sangre"
                    placeholder="Seleccione su tipo de sangre"
                    isInvalid={!!errors.tipoSangre}
                    errorMessage={errors.tipoSangre?.message}
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      field.onChange(value);
                    }}
                    isRequired
                  >
                    {tiposSangre.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </Select>
                )}
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