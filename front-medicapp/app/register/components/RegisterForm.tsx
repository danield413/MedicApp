'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@heroui/react';
import { useAuth } from '@/hooks/auth/useAuth'; // Ajusta la ruta si es necesario
import { registerSchema, RegisterPayload } from '@/schema/registerSchema'; // Ajusta la ruta
import { EyeIcon, EyeSlashIcon } from '@/components/icons'; // Ajusta la ruta
import Link from 'next/link';

export const RegisterForm = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const { handleRegister, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayload>({
    resolver: zodResolver(registerSchema),
  });

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleVisibilityConfirm = () => setIsVisibleConfirm(!isVisibleConfirm);

  // El handleSubmit de react-hook-form llama a handleRegister
  const onSubmit: SubmitHandler<RegisterPayload> = (data) => {
    handleRegister(data);
  };

  return (
    <form className="space-y-4 mt-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Nombre y Apellidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
        <Input
          {...register('nombre')}
          label="Nombre *"
          labelPlacement="outside"
          placeholder="Ingresa tu nombre"
          isInvalid={!!errors.nombre}
          errorMessage={errors.nombre?.message}
          radius="sm"
        />
        <Input
          {...register('apellidos')}
          label="Apellidos *"
          labelPlacement="outside"
          placeholder="Ingresa tus apellidos"
          isInvalid={!!errors.apellidos}
          errorMessage={errors.apellidos?.message}
          radius="sm"
          className="mb-10"
        />
      </div>

      {/* Cédula */}
      <Input
        {...register('cedula')}
        label="Cédula *"
        labelPlacement="outside"
        type="text"
        placeholder="Ingresa tu número de cédula"
        isInvalid={!!errors.cedula}
        errorMessage={errors.cedula?.message}
        radius="sm"
        className="mb-10"
      />

      {/* Celular */}
      <Input
        {...register('celular')}
        label="Celular *"
        labelPlacement="outside"
        type="tel" // Usar 'tel' para inputs de teléfono
        placeholder="Ingresa tu número de celular"
        isInvalid={!!errors.celular}
        errorMessage={errors.celular?.message}
        radius="sm"
        className="mb-10"
      />

      {/* Contraseña */}
      <Input
        {...register('contrasena')}
        label="Contraseña *"
        labelPlacement="outside"
        type={isVisible ? 'text' : 'password'}
        placeholder="Crea una contraseña (mín. 6 caracteres)"
        isInvalid={!!errors.contrasena}
        errorMessage={errors.contrasena?.message}
        radius="sm"
        className="mb-10"
        endContent={
          <button type="button" onClick={toggleVisibility} className="focus:outline-none">
            {isVisible ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
          </button>
        }
      />

      {/* Confirmar Contraseña */}
      <Input
        {...register('confirmarContrasena')}
        label="Confirmar Contraseña *"
        labelPlacement="outside"
        type={isVisibleConfirm ? 'text' : 'password'}
        placeholder="Vuelve a escribir la contraseña"
        isInvalid={!!errors.confirmarContrasena}
        errorMessage={errors.confirmarContrasena?.message}
        radius="sm"
        endContent={
          <button type="button" onClick={toggleVisibilityConfirm} className="focus:outline-none">
            {isVisibleConfirm ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
          </button>
        }
      />

      {/* Botón de Registro */}
      <Button
        type="submit"
        className="w-full bg-zinc-900 text-white mt-6" // Added mt-6 for spacing
        radius="sm"
        loading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>

      <Link href="/login" className="block text-center mt-4 text-sm text-gray-600 hover:text-teal-700">
        ¿Ya tienes una cuenta? Inicia sesión
      </Link>
    </form>
  );
};