'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  useDisclosure,
} from '@heroui/react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFamiliaresByUsuario,
  createFamiliar,
  updateFamiliar,
  deleteFamiliar,
  type Familiar,
} from '../../../../services/familiaresService';
import { PencilIcon } from '@/components/icons/PencilIcon';
import { TrashIcon } from '@/components/icons/TrashIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import toast from 'react-hot-toast';

interface FamiliaresModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FamiliaresModal({ isOpen, onClose }: FamiliaresModalProps) {
  const { userId, token } = useAuth();
  const queryClient = useQueryClient();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();

  const [formData, setFormData] = useState<Partial<Familiar>>({
    nombre: '',
    apellido: '',
    cedula: '',
    celular: '',
    correo: '',
    parentesco: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Query para obtener familiares
  const { data: familiares = [], isLoading } = useQuery({
    queryKey: ['familiares', userId],
    queryFn: () => getFamiliaresByUsuario(userId!, token!),
    enabled: !!userId && !!token && isOpen,
  });

  // Mutación para crear familiar
  const createMutation = useMutation({
    mutationFn: (data: Omit<Familiar, '_id' | 'usuario' | 'createdAt' | 'updatedAt'>) =>
      createFamiliar(userId!, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familiares', userId] });
      toast.success('Familiar agregado exitosamente');
      resetForm();
      onFormClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al agregar familiar');
    },
  });

  // Mutación para actualizar familiar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Familiar> }) =>
      updateFamiliar(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familiares', userId] });
      toast.success('Familiar actualizado exitosamente');
      resetForm();
      onFormClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar familiar');
    },
  });

  // Mutación para eliminar familiar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFamiliar(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familiares', userId] });
      toast.success('Familiar eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar familiar');
    },
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      cedula: '',
      celular: '',
      correo: '',
      parentesco: '',
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData as Omit<Familiar, '_id' | 'usuario' | 'createdAt' | 'updatedAt'>);
    }
  };

  const handleEdit = (familiar: Familiar) => {
    setFormData({
      nombre: familiar.nombre,
      apellido: familiar.apellido,
      cedula: familiar.cedula,
      celular: familiar.celular,
      correo: familiar.correo,
      parentesco: familiar.parentesco,
    });
    setEditingId(familiar._id!);
    onFormOpen();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este familiar?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    resetForm();
    onFormOpen();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold">Familiares</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Button color="primary" onPress={handleAddNew} startContent={<PlusIcon />}>
                Agregar Familiar
              </Button>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner label="Cargando familiares..." />
                </div>
              ) : familiares.length === 0 ? (
                <p className="text-center text-default-500 py-8">No hay familiares registrados</p>
              ) : (
                <Table aria-label="Tabla de familiares">
                  <TableHeader>
                    <TableColumn>NOMBRE</TableColumn>
                    <TableColumn>CÉDULA</TableColumn>
                    <TableColumn>CELULAR</TableColumn>
                    <TableColumn>CORREO</TableColumn>
                    <TableColumn>PARENTESCO</TableColumn>
                    <TableColumn>ACCIONES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {familiares.map((familiar) => (
                      <TableRow key={familiar._id}>
                        <TableCell>{`${familiar.nombre} ${familiar.apellido}`}</TableCell>
                        <TableCell>{familiar.cedula}</TableCell>
                        <TableCell>{familiar.celular}</TableCell>
                        <TableCell>{familiar.correo}</TableCell>
                        <TableCell>{familiar.parentesco}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              color="warning"
                              isIconOnly
                              onPress={() => handleEdit(familiar)}
                            >
                              <PencilIcon />
                            </Button>
                            <Button
                              size="sm"
                              variant="flat"
                              color="danger"
                              isIconOnly
                              onPress={() => handleDelete(familiar._id!)}
                              isLoading={deleteMutation.isPending}
                            >
                              <TrashIcon />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Formulario */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              <h3 className="text-xl font-bold">
                {editingId ? 'Editar Familiar' : 'Agregar Familiar'}
              </h3>
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  placeholder="Ingrese el nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
                <Input
                  label="Apellido"
                  placeholder="Ingrese el apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                />
                <Input
                  label="Cédula"
                  placeholder="Ingrese la cédula"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  required
                />
                <Input
                  label="Celular"
                  placeholder="Ingrese el celular"
                  value={formData.celular}
                  onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                  required
                />
                <Input
                  label="Correo"
                  type="email"
                  placeholder="Ingrese el correo"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  required
                />
                <Input
                  label="Parentesco"
                  placeholder="Ej: Padre, Madre, Hermano"
                  value={formData.parentesco}
                  onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                  required
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onFormClose}>
                Cancelar
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? 'Actualizar' : 'Agregar'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}