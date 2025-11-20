// front-medicapp/app/dashboard/(home)/page.tsx
'use client';

import { Card, CardHeader, CardBody, CardFooter, Button, Spinner, useDisclosure } from '@heroui/react';
import { useAuth } from '@/hooks/auth/useAuth';
import { PencilIcon } from '@/components/icons/PencilIcon';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getResumenMedico } from '@/services/userService';

// Importar los modales
import InfoBasicaModal from './components/InfoBasicaModal';
import ResumenMedicoModal from './components/ResumenMedicoModal';

export default function DashboardHomePage() {
  const { userId, isLoading: isLoadingUser } = useAuth();
  const queryClient = useQueryClient();

  console.log('Usuario en DashboardHomePage:', userId);

  // Query para obtener los datos del usuario
  const { data: userData, isLoading: isLoadingUserData, error: userError } = useQuery({
    queryKey: ['userData', userId],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario/perfil/info-basica/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener los datos del usuario');
      }
      
      return response.json();
    },
    enabled: !!userId, // Solo ejecutar si hay userId
  });

  // Query para el resumen médico
  const { data: resumen, isLoading: isLoadingResumen } = useQuery({
    queryKey: ['resumenMedico'],
    queryFn: getResumenMedico,
    enabled: !!userId,
  });

  // Hooks para los modales
  const { isOpen: isInfoOpen, onOpen: onInfoOpen, onClose: onInfoClose } = useDisclosure();
  const { isOpen: isResumenOpen, onOpen: onResumenOpen, onClose: onResumenClose } = useDisclosure();

  // Función para cerrar modal y refrescar datos
  const handleInfoClose = () => {
    queryClient.invalidateQueries({ queryKey: ['userData', userId] });
    onInfoClose();
  };

  const handleResumenClose = () => {
    queryClient.invalidateQueries({ queryKey: ['resumenMedico'] });
    onResumenClose();
  };

  if (isLoadingUser || isLoadingUserData || isLoadingResumen) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner label="Cargando información..." />
      </div>
    );
  }

  if (!userId) {
    return <p>No se pudo cargar la información del usuario.</p>;
  }

  if (userError) {
    return <p>Error al cargar la información del usuario.</p>;
  }

  const user = userData || {};
  console.log('Datos del usuario:', user);

  // Función para formatear fecha (si existe)
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificado';
    try {
        // Usar timeZone UTC para evitar problemas de desfase de un día
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC' 
        });
    } catch (error) {
        return 'Fecha inválida';
    }
  };

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Columna de Bienvenida */}
      <Card className="md:col-span-1 h-fit">
        <CardHeader>
          <h2 className="text-xl font-bold">¡Bienvenido!</h2>
        </CardHeader>
        <CardBody>
          <p className="text-lg font-semibold">{user.nombre} {user.apellidos}</p>
          <p className="text-sm text-default-600">C.C. {user.cedula}</p>
        </CardBody>
      </Card>

      {/* Columna Principal (Info y Resumen) */}
      <div className="md:col-span-2 space-y-6">
        
        {/* Tarjeta de Información Básica */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Información Básica</h2>
            <Button color="primary" variant="flat" size="sm" onPress={onInfoOpen} startContent={<PencilIcon />}>
              Editar
            </Button>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              <div><strong>Nombre:</strong> {user.nombre} {user.apellidos}</div>
              <div><strong>Cédula:</strong> {user.cedula}</div>
              <div><strong>Celular:</strong> {user.celular || 'No especificado'}</div>
              <div><strong>Fecha de Nacimiento:</strong> {formatDate(user.fechaNacimiento)}</div>
              <div><strong>Ciudad de Nacimiento:</strong> {user.ciudadNacimiento || 'No especificado'}</div>
              <div><strong>Ciudad de Residencia:</strong> {user.ciudadResidencia || 'No especificado'}</div>
              <div><strong>Dirección:</strong> {user.direccion || 'No especificado'}</div>
              <div><strong>Tipo de Sangre:</strong> {user.tipoSangre || 'No especificado'}</div>
            </div>
          </CardBody>
        </Card>

        {/* Tarjeta de Resumen Médico */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Resumen Médico</h2>
            <Button color="primary" variant="flat" size="sm" onPress={onResumenOpen} startContent={<PencilIcon />}>
              Editar
            </Button>
          </CardHeader>
          <CardBody>
            <p className="text-default-700 whitespace-pre-wrap">
              {resumen?.descripcion ? resumen.descripcion : 'No ha ingresado un resumen médico.'}
            </p>
          </CardBody>
          {resumen?.fechaActualizacion && (
            <CardFooter>
               <p className="text-xs text-default-500">Última actualización: {formatDate(resumen.fechaActualizacion)}</p>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Modales (se renderizan aquí pero están ocultos hasta que se activan) */}
      <InfoBasicaModal isOpen={isInfoOpen} onClose={handleInfoClose} userData={user} />
      <ResumenMedicoModal isOpen={isResumenOpen} onClose={handleResumenClose} />
    </div>
  );
}