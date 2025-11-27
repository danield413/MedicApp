'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Spinner, useDisclosure, Chip } from '@heroui/react';
import { useAuth } from '@/hooks/auth/useAuth';
import { PencilIcon } from '@/components/icons/PencilIcon';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getResumenMedico } from '@/services/userService';
import type { Familiar } from '../../../services/familiaresService';
import type { Antecedente, TipoAntecedente } from '../../../services/antecedentesService';

// Importar los modales
import InfoBasicaModal from './components/InfoBasicaModal';
import ResumenMedicoModal from './components/ResumenMedicoModal';
import FamiliaresModal from './components/FamiliaresModal';
import AntecedentesModal from './components/AntecedentesModal';

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

const tiposAntecedente: Record<TipoAntecedente, string> = {
  personal: 'Personal',
  familiar: 'Familiar',
  quirurgico: 'Quirúrgico',
  alergico: 'Alérgico',
  toxico: 'Tóxico',
};

export default function DashboardHomePage() {
  const { userId, token, isLoading: isLoadingUser } = useAuth();
  const queryClient = useQueryClient();

  // -----------------------------------------------------------------------
  // 1. Query: Datos del Usuario
  // -----------------------------------------------------------------------
  const { data: userData, isLoading: isLoadingUserData, error: userError } = useQuery({
    queryKey: ['userData', userId],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario/perfil/info-basica/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error usuario');
      return response.json();
    },
    enabled: !!userId,
  });

  // -----------------------------------------------------------------------
  // 2. Query: Resumen Médico
  // -----------------------------------------------------------------------
  const { data: resumen, isLoading: isLoadingResumen } = useQuery({
    queryKey: ['resumenMedico', userId],
    queryFn: getResumenMedico,
    enabled: !!userId,
  });

  // -----------------------------------------------------------------------
  // 3. Query: Familiares (SIEMPRE SE EJECUTA)
  // -----------------------------------------------------------------------
  const { data: familiaresData, isLoading: isLoadingFamiliares } = useQuery({
    queryKey: ['familiares', userId],
    queryFn: async () => {
      if (!userId) return []; // Retorna array vacío si no hay userId
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/familiares/${userId}`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }), // Agrega token si existe
        },
      });
      if (!response.ok) {
        console.error('Error al obtener familiares:', response.status);
        return []; // Retorna array vacío en caso de error
      }
      const json = await response.json();
      console.log("familiares fetch", json);
      return json.data || [];
    },
    // enabled: true, // Por defecto es true, no hace falta especificarlo
    refetchOnWindowFocus: true, // Se actualiza cuando vuelves a la ventana
    refetchOnMount: true, // Se actualiza al montar el componente
    staleTime: 0, // Los datos se consideran obsoletos inmediatamente
    initialData: [],
  });

  // -----------------------------------------------------------------------
  // 4. Query: Antecedentes (SIEMPRE SE EJECUTA)
  // -----------------------------------------------------------------------
  const { data: antecedentesData, isLoading: isLoadingAntecedentes } = useQuery({
    queryKey: ['antecedentes', userId],
    queryFn: async () => {
      if (!userId) return []; // Retorna array vacío si no hay userId
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/antecedentes/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }), // Agrega token si existe
        },
      });
      if (!response.ok) {
        console.error('Error al obtener antecedentes:', response.status);
        return []; // Retorna array vacío en caso de error
      }
      const json = await response.json();
      console.log("antecedentes fetch", json);
      return json.data || [];
    },
    // enabled: true, // Por defecto es true
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    initialData: [],
  });

  // Variables derivadas para facilitar el uso en el render
  const familiares: Familiar[] = familiaresData || [];
  const antecedentes: Antecedente[] = antecedentesData || [];

  // Hooks para los modales
  const { isOpen: isInfoOpen, onOpen: onInfoOpen, onClose: onInfoClose } = useDisclosure();
  const { isOpen: isResumenOpen, onOpen: onResumenOpen, onClose: onResumenClose } = useDisclosure();
  const { isOpen: isFamiliaresOpen, onOpen: onFamiliaresOpen, onClose: onFamiliaresClose } = useDisclosure();
  const { isOpen: isAntecedentesOpen, onOpen: onAntecedentesOpen, onClose: onAntecedentesClose } = useDisclosure();

  // -----------------------------------------------------------------------
  // Manejadores de cierre (Invalidan queries para refrescar datos automáticamente)
  // -----------------------------------------------------------------------
  const handleInfoClose = () => {
    queryClient.invalidateQueries({ queryKey: ['userData', userId] });
    onInfoClose();
  };

  const handleResumenClose = () => {
    queryClient.invalidateQueries({ queryKey: ['resumenMedico', userId] });
    onResumenClose();
  };

  const handleFamiliaresClose = () => {
    queryClient.invalidateQueries({ queryKey: ['familiares', userId] });
    onFamiliaresClose();
  };

  const handleAntecedentesClose = () => {
    queryClient.invalidateQueries({ queryKey: ['antecedentes', userId] });
    onAntecedentesClose();
  };

  if (isLoadingUser || isLoadingUserData || isLoadingResumen) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner label="Cargando información..." />
      </div>
    );
  }

  if (!userId) return <p>No se pudo cargar la información del usuario.</p>;
  if (userError) return <p>Error al cargar la información del usuario.</p>;

  const user = userData || {};

  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return 'No especificado';
    try {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' 
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

        {/* Tarjeta de Familiares */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Familiares</h2>
            <Button color="primary" variant="flat" size="sm" onPress={onFamiliaresOpen} startContent={<PencilIcon />}>
              Gestionar
            </Button>
          </CardHeader>
          <CardBody>
            {isLoadingFamiliares ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" label="Cargando familiares..." />
              </div>
            ) : familiares.length === 0 ? (
              <p className="text-default-600">
                No tiene familiares registrados. Haga clic en "Gestionar" para agregar.
              </p>
            ) : (
              <div className="space-y-3">
                {familiares.slice(0, 3).map((familiar: Familiar) => (
                  <div key={familiar._id} className="border-b border-default-200 pb-2 last:border-b-0">
                    <p className="font-semibold">{familiar.nombre} {familiar.apellido}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-default-600 mt-1">
                      <span><strong>Parentesco:</strong> {familiar.parentesco}</span>
                      <span><strong>Celular:</strong> {familiar.celular}</span>
                      <span className="col-span-2"><strong>Correo:</strong> {familiar.correo}</span>
                    </div>
                  </div>
                ))}
                {familiares.length > 3 && (
                  <p className="text-sm text-default-500 italic">
                    Y {familiares.length - 3} más...
                  </p>
                )}
              </div>
            )}
          </CardBody>
          <CardFooter>
            <p className="text-xs text-default-500">
              Total de familiares: {familiares.length}
            </p>
          </CardFooter>
        </Card>

        {/* Tarjeta de Antecedentes */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Antecedentes Médicos</h2>
            <Button color="primary" variant="flat" size="sm" onPress={onAntecedentesOpen} startContent={<PencilIcon />}>
              Gestionar
            </Button>
          </CardHeader>
          <CardBody>
            {isLoadingAntecedentes ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" label="Cargando antecedentes..." />
              </div>
            ) : antecedentes.length === 0 ? (
              <p className="text-default-600">
                No tiene antecedentes registrados. Haga clic en "Gestionar" para agregar.
              </p>
            ) : (
              <div className="space-y-3">
                {antecedentes.slice(0, 3).map((antecedente: Antecedente) => (
                  <div key={antecedente._id} className="border-b border-default-200 pb-2 last:border-b-0">
                    <div className="flex items-center justify-between mb-1">
                      <Chip 
                        color={getTipoColor(antecedente.tipo)} 
                        size="sm" 
                        variant="flat"
                      >
                        {tiposAntecedente[antecedente.tipo]}
                      </Chip>
                      {antecedente.activo && (
                        <Chip color="success" size="sm" variant="dot">
                          Activo
                        </Chip>
                      )}
                    </div>
                    <p className="text-sm text-default-700 line-clamp-2">
                      {antecedente.descripcion}
                    </p>
                    {antecedente.fechaDiagnostico && (
                      <p className="text-xs text-default-500 mt-1">
                        Diagnóstico: {formatDate(antecedente.fechaDiagnostico)}
                      </p>
                    )}
                  </div>
                ))}
                {antecedentes.length > 3 && (
                  <p className="text-sm text-default-500 italic">
                    Y {antecedentes.length - 3} más...
                  </p>
                )}
              </div>
            )}
          </CardBody>
          <CardFooter>
            <p className="text-xs text-default-500">
              Total de antecedentes: {antecedentes.length}
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Modales */}
      <InfoBasicaModal isOpen={isInfoOpen} onClose={handleInfoClose} userData={user} />
      <ResumenMedicoModal isOpen={isResumenOpen} onClose={handleResumenClose} />
      <FamiliaresModal isOpen={isFamiliaresOpen} onClose={handleFamiliaresClose} />
      <AntecedentesModal isOpen={isAntecedentesOpen} onClose={handleAntecedentesClose} />
    </div>
  );
}