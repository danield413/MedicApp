'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@heroui/react';
import { useAuth } from '../../../hooks/auth/useAuth';
import { loginSchema, LoginPayload } from '@/schema';
import { EyeIcon, EyeSlashIcon } from '@/components/icons';
import Link from 'next/link';
import { z } from 'zod';
import { forgotPassword } from '@/services/authService';
import { toast } from 'sonner'; // Asegúrate de tener instalado sonner o usa alert()

// Schema para validar solo el celular
const forgotSchema = z.object({
  celular: z.string()
    .min(10, 'El número debe tener al menos 10 dígitos') // Ajusta según tu país
    .regex(/^[0-9]+$/, 'Solo se permiten números')
});

type ForgotPayload = z.infer<typeof forgotSchema>;

export const AuthForm = () => {
  const [isVisible, setIsVisible] = useState(false);
  // Estado para controlar si mostramos el formulario de login o el de recuperación
  const [isResetMode, setIsResetMode] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const { handleLogin } = useAuth();

  // Hook para formulario de Login (existente)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
  });

  // Hook para formulario de Recuperación (nuevo)
  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot },
    reset: resetForgotForm
  } = useForm<ForgotPayload>({
    resolver: zodResolver(forgotSchema),
  });

  const toggleVisibility = () => setIsVisible(!isVisible);

  // Manejador para enviar el SMS
  const onResetSubmit = async (data: ForgotPayload) => {
    setLoadingReset(true);
    try {
      const response = await forgotPassword(data.celular);
      console.log('Respuesta del servidor:', response.data);
      // Mostrar mensaje de éxito (el backend devuelve msg)
      toast.success(response.data.msg || 'Contraseña enviada por SMS'); 
      
      // Volver al login
      setIsResetMode(false);
      resetForgotForm();
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al enviar la solicitud';
      toast.error(msg);
    } finally {
      setLoadingReset(false);
    }
  };

  // --- VISTA: RECUPERAR CONTRASEÑA (SMS) ---
  if (isResetMode) {
    return (
      <div className="space-y-6 mt-8 animated fadeIn">
        <div className="text-center mb-4">
          <h3 className="font-bold text-xl text-zinc-700">Recuperar acceso</h3>
          <p className="text-sm text-gray-500">
            Ingresa tu número de celular registrado. Te enviaremos una nueva contraseña temporal por SMS.
          </p>
        </div>

        <form onSubmit={handleSubmitForgot(onResetSubmit)} className="space-y-4">
          <Input
            {...registerForgot('celular')}
            label="Número de Celular"
            labelPlacement="outside"
            type="tel"
            variant="bordered"
            radius="sm"
            placeholder="Ej: 3001234567"
            isInvalid={!!errorsForgot.celular}
            errorMessage={errorsForgot.celular?.message}
          />

          <Button
            type="submit"
            className="w-full bg-zinc-900 text-white"
            radius="sm"
            isLoading={loadingReset}
            isDisabled={loadingReset}
          >
            Enviar SMS
          </Button>

          <Button
            variant="light"
            className="w-full text-zinc-600"
            size="sm"
            onPress={() => setIsResetMode(false)}
          >
            Cancelar y volver
          </Button>
        </form>
      </div>
    );
  }

  // --- VISTA: LOGIN NORMAL ---
  return (
    <>
      <form
        className="space-y-6 mt-8"
        onSubmit={handleSubmit((data) => handleLogin(data))}
      >
        {/* Input Cédula */}
        <Input
          {...register('cedula')}
          label="Cédula"
          labelPlacement="outside"
          type="text"
          variant="bordered"
          radius="sm"
          placeholder="Ingresa tu número de cédula"
          isInvalid={!!errors.cedula}
          errorMessage={errors.cedula?.message}
        />

        {/* Input Contraseña */}
        <div className="flex flex-col gap-y-2">
          <Input
            {...register('contrasena')}
            label="Contraseña"
            labelPlacement="outside"
            type={isVisible ? 'text' : 'password'}
            variant="bordered"
            radius="sm"
            placeholder="Ingresa tu contraseña"
            isInvalid={!!errors.contrasena}
            errorMessage={errors.contrasena?.message}
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
          
          {/* Link Olvidaste contraseña */}
          <div className="flex items-center justify-end text-sm">
            <button 
              type="button"
              onClick={() => setIsResetMode(true)} // Activa el modo reset
              className="font-semibold text-teal-700 hover:text-teal-600 outline-none bg-transparent border-none cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-zinc-900 text-white"
          radius="sm"
        >
          Iniciar sesión
        </Button>

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