'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store";
import { ApiError } from "@/lib";
import { LoginPayload, RegisterPayload } from "@/schema";

export const useAuth = () => {
  const router = useRouter();
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const userId = useAuthStore((state) => state.uid); // Obtener el userId del store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: LoginPayload) => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(errorData.error || 'Cédula o contraseña incorrectas');
      }

      const usuario = await response.json();
      console.log('Usuario recibido en handleLogin:', usuario);
      setAuthData(usuario);
      toast.success(`¡Bienvenido, ${usuario.nombre}!`);
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Error en handleLogin:", error);
      toast.error(error.message || 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterPayload) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include", 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(errorData.error || 'No se pudo completar el registro');
      }

      const usuario = await response.json();
      setAuthData(usuario);
      toast.success(`¡Registro exitoso, ${usuario.nombre}!`);
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Error en handleRegister:", error);
      toast.error(error.message || 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      toast.success('Sesión cerrada exitosamente');

    } catch (error: any) {
      console.error("Error en handleLogout:", error);
      toast.error('Error al cerrar sesión');
    } finally {
      setAuthData(null);
      router.push('/');
      setIsLoading(false);
    }
  };

  const handleDomiciliarioLogin = async (data: LoginPayload) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/domiciliario/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(errorData.error || 'Cédula o contraseña incorrectas');
      }

      const usuario = await response.json();
      setAuthData(usuario);
      toast.success(`¡Bienvenido, ${usuario.nombre}!`);
      router.push('/domiciliario/dashboard');
    } catch (error: any) {
      console.error("Error en login Domiciliario:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para revalidar el usuario (útil para refrescar después de actualizaciones)
  const mutate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const userData = await response.json();
        setAuthData(userData);
      }
    } catch (error) {
      console.error("Error al revalidar usuario:", error);
    }
  };

  return {
    handleLogin,
    handleLogout,
    isLoading,
    handleRegister,
    handleDomiciliarioLogin,
    userId, // Exponer el userId para hacer consultas
    isAuthenticated, // Exponer el estado de autenticación
    mutate, // Exponer función para revalidar
  };
};