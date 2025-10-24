'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@heroui/react';
import { useAuth } from '../../../hooks/auth/useAuth';
// highlight-start
// Asegúrate de que los imports apunten a tu nuevo esquema
import { loginSchema, LoginPayload } from '@/schema'; 
// highlight-end
import { EyeIcon, EyeSlashIcon } from '@/components/icons';
import Link from 'next/link';

export const AuthForm = () => {
  const [ isVisible, setIsVisible ] = useState(false);

  const { handleLogin } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
  });

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <>
      <form
        className="space-y-6 mt-8"
        onSubmit={handleSubmit((data) => handleLogin(data))}
      >
        {/* highlight-start */}
        {/* --- CAMBIO: De 'email' a 'cedula' --- */}
        <Input
          {...register('cedula')}
          label="Cédula"
          labelPlacement="outside"
          type="text" // Cambiado de 'email' a 'text'
          variant="bordered"
          radius="sm"
          placeholder="Ingresa tu número de cédula"
          isInvalid={!!errors.cedula}
          errorMessage={errors.cedula?.message}
          value="1234567890"
        />
        {/* highlight-end */}

        <div className="flex flex-col gap-y-2">
          <Input
            // highlight-start
            {...register('contrasena')} // Renombrado de 'password' para consistencia con tu backend
            // highlight-end
            label="Contraseña"
            labelPlacement="outside"
            type={isVisible ? 'text' : 'password'}
            variant="bordered"
            radius="sm"
            placeholder="Ingresa tu contraseña"
            // highlight-start
            isInvalid={!!errors.contrasena}
            errorMessage={errors.contrasena?.message}
            value="password123"
            // highlight-end
            endContent={
              <button
                type="button"
                onClick={toggleVisibility}
                className="focus:outline-none"
              >
                {isVisible ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            }
          />
          <div className="flex items-center justify-end text-sm">
            <a href="#" className="font-semibold text-teal-700 hover:text-teal-600">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-zinc-900 text-white"
          radius="sm"
        >
          Iniciar sesión
        </Button>

         {/* Crear link para ir a registro */}
        <div className="flex items-center justify-center text-sm">
          <span className="text-gray-600">¿No tienes una cuenta?</span>
         <Link href="/register" className="ml-2 font-semibold text-teal-700 hover:text-teal-600">
            Regístrate
          </Link>
        </div>
      </form>
    </>
  );
};