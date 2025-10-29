// src/app/domiciliario/login/page.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@heroui/react';
import { useAuth } from '@/hooks/auth/useAuth'; // Ajusta la ruta
import { loginSchema, LoginPayload } from '@/schema/authSchema'; // Reutilizamos el schema de login
import Link from 'next/link';

// Usamos el AuthForm genérico o creamos uno específico
// Por simplicidad, usamos react-hook-form directamente aquí.
export default function DomiciliarioLoginPage() {
  const { handleDomiciliarioLogin, isLoading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: { cedula: "7777777777", contrasena: "domipass123" } // Datos del seed
  });

  const onSubmit: SubmitHandler<LoginPayload> = (data) => {
    handleDomiciliarioLogin(data);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center dark:text-white">Acceso Domiciliarios</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Inicia sesión para ver solicitudes.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            {...register('cedula')}
            label="Cédula"
            labelPlacement="outside"
            placeholder="Ingresa tu cédula"
            isInvalid={!!errors.cedula}
            errorMessage={errors.cedula?.message}
          />
          <Input
            {...register('contrasena')}
            label="Contraseña"
            type="password"
            labelPlacement="outside"
            placeholder="Ingresa tu contraseña"
            isInvalid={!!errors.contrasena}
            errorMessage={errors.contrasena?.message}
          />
          <Button type="submit" color="primary" fullWidth loading={isLoading} disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </Button>
          <div className="text-center mt-4">
             <Link href="/" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                Ir al login de Usuario
             </Link>
          </div>
        </form>
      </div>
    </main>
  );
}