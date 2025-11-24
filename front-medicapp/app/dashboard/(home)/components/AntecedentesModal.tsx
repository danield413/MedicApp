'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Chip,
  useDisclosure,
} from '@heroui/react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAntecedentesByUsuario,
  createAntecedente,
  updateAntecedente,
  deleteAntecedente,
  type Antecedente,
  type TipoAntecedente,
} from '../../../../services/antecedentesService';
import { PencilIcon } from '@/components/icons/PencilIcon';
import { TrashIcon } from '@/components/icons/TrashIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import toast from 'react-hot-toast';

interface AntecedentesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tiposAntecedente = [
  { key: 'personal', label: 'Personal' },
  { key: 'familiar', label: 'Familiar' },
  { key: 'quirurgico', label: 'Quirúrgico' },
  { key: 'alergico', label: 'Alérgico' },
  { key: 'toxico', label: 'Tóxico' },
];

const getTipoColor = (tipo: TipoAntecedente) => {
  const colors: Record<TipoAntecedente, "primary" | "secondary" | "success" | "warning" | "danger"> = {
    personal: 'primary',
    familiar: 'secondary',
    quirurgico: 'warning',
    alergico: 'danger',
    toxico: 'danger',
  };
  return colors[tipo] || 'default';
};

export default function AntecedentesModal({ isOpen, onClose }: AntecedentesModalProps) {
  const { userId, token } = useAuth();
  const queryClient = useQueryClient();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();

  const [formData, setFormData] = useState<Partial<Antecedente>>({
    descripcion: '',
    tipo: 'personal',
    fechaDiagnostico: null,
    activo: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Query para obtener antecedentes
  const { data: antecedentes = [], isLoading } = useQuery({
    queryKey: ['antecedentes', userId],
    queryFn: () => getAntecedentesByUsuario(userId!, token!),
    enabled: !!userId && !!token && isOpen,
  });

  // Mutación para crear antecedente
  const createMutation = useMutation({
    mutationFn: (data: Omit<Antecedente, '_id' | 'usuario' | 'createdAt' | 'updatedAt'>) =>
      createAntecedente(userId!, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antecedentes', userId] });
      toast.success('Antecedente agregado exitosamente');
      resetForm();
      onFormClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al agregar antecedente');
    },
  });

  // Mutación para actualizar antecedente
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Antecedente> }) =>
      updateAntecedente(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antecedentes', userId] });
      toast.success('Antecedente actualizado exitosamente');
      resetForm();
      onFormClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar antecedente');
    },
  });

  // Mutación para eliminar antecedente
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAntecedente(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antecedentes', userId] });
      toast.success('Antecedente eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar antecedente');
    },
  });

  const resetForm = () => {
    setFormData({
      descripcion: '',
      tipo: 'personal',
      fechaDiagnostico: null,
      activo: true,
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData as Omit<Antecedente, '_id' | 'usuario' | 'createdAt' | 'updatedAt'>);
    }
  };

  const handleEdit = (antecedente: Antecedente) => {
    setFormData({
      descripcion: antecedente.descripcion,
      tipo: antecedente.tipo,
      fechaDiagnostico: antecedente.fechaDiagnostico 
        ? new Date(antecedente.fechaDiagnostico).toISOString().split('T')[0]
        : null,
      activo: antecedente.activo,
    });
    setEditingId(antecedente._id!);
    onFormOpen();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este antecedente?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    resetForm();
    onFormOpen();
  };

  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return 'No especificado';
    try {
      return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold">Antecedentes Médicos</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Button color="primary" onPress={handleAddNew} startContent={<PlusIcon />}>
                Agregar Antecedente
              </Button>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner label="Cargando antecedentes..." />
                </div>
              ) : antecedentes.length === 0 ? (
                <p className="text-center text-default-500 py-8">No hay antecedentes registrados</p>
              ) : (
                <Table aria-label="Tabla de antecedentes">
                  <TableHeader>
                    <TableColumn>TIPO</TableColumn>
                    <TableColumn>DESCRIPCIÓN</TableColumn>
                    <TableColumn>FECHA DIAGNÓSTICO</TableColumn>
                    <TableColumn>ESTADO</TableColumn>
                    <TableColumn>ACCIONES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {antecedentes.map((antecedente) => (
                      <TableRow key={antecedente._id}>
                        <TableCell>
                          <Chip color={getTipoColor(antecedente.tipo)} size="sm" variant="flat">
                            {tiposAntecedente.find((t) => t.key === antecedente.tipo)?.label}
                          </Chip>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{antecedente.descripcion}</TableCell>
                        <TableCell>{formatDate(antecedente.fechaDiagnostico)}</TableCell>
                        <TableCell>
                          <Chip color={antecedente.activo ? 'success' : 'default'} size="sm" variant="flat">
                            {antecedente.activo ? 'Activo' : 'Inactivo'}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              color="warning"
                              isIconOnly
                              onPress={() => handleEdit(antecedente)}
                            >
                              <PencilIcon />
                            </Button>
                            <Button
                              size="sm"
                              variant="flat"
                              color="danger"
                              isIconOnly
                              onPress={() => handleDelete(antecedente._id!)}
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
                {editingId ? 'Editar Antecedente' : 'Agregar Antecedente'}
              </h3>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Select
                  label="Tipo de Antecedente"
                  placeholder="Seleccione el tipo"
                  selectedKeys={formData.tipo ? [formData.tipo] : []}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoAntecedente })}
                  required
                >
                  {tiposAntecedente.map((tipo) => (
                    <SelectItem key={tipo.key} value={tipo.key}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </Select>

                <Textarea
                  label="Descripción"
                  placeholder="Describa el antecedente médico"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  minRows={3}
                  required
                />

                <Input
                  label="Fecha de Diagnóstico"
                  type="date"
                  value={formData.fechaDiagnostico as string || ''}
                  onChange={(e) => setFormData({ ...formData, fechaDiagnostico: e.target.value || null })}
                />

                <Select
                  label="Estado"
                  placeholder="Seleccione el estado"
                  selectedKeys={formData.activo ? ['true'] : ['false']}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                  required
                >
                  <SelectItem key="true" value="true">
                    Activo
                  </SelectItem>
                  <SelectItem key="false" value="false">
                    Inactivo
                  </SelectItem>
                </Select>
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