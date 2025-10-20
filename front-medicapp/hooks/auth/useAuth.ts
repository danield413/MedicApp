'use client';

import { useState } from 'react'; // 1. Importamos useState
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store";
import { ApiError } from "@/lib"; // Puedes usar esto en tu catch si lo deseas
import { LoginPayload } from "@/schema";

export const useAuth = () => {
  const router = useRouter();
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const [isLoading, setIsLoading] = useState(false); // Estado de carga local

  // La URL base de tu API (Asegúrate de que el puerto 3001 es correcto)

  /**
   * Maneja el inicio de sesión del usuario
   * @param data Los datos del formulario (cedula y contrasena)
   */
  const handleLogin = async (data: LoginPayload) => {
    
    // Verificamos si ya está cargando
    if (isLoading) return;

    setIsLoading(true); // Iniciamos la carga
    
    try {
      // Usamos 3001, como en el backend que configuramos
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // <-- Obligatorio para las cookies
      });

      // Manejo de errores de la API
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(errorData.error || 'Cédula o contraseña incorrectas');
      }

      // Si el login es exitoso
      const usuario = await response.json();

      // Guardamos el usuario en el store de Zustand
      setAuthData(usuario);
      
      toast.success(`¡Bienvenido, ${usuario.nombre}!`);
      
      // Redirigimos al dashboard
      router.push('/dashboard');

    } catch (error: any) {
      // Manejo de errores de fetch o de la API
      console.error("Error en handleLogin:", error);
      toast.error(error.message || 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false); // Terminamos la carga (incluso si falló)
    }
  };

  /**
   * Maneja el cierre de sesión del usuario
   */
  const handleLogout = async () => {
    // Evita múltiples clicks si ya está cerrando sesión
    if (isLoading) return;

    setIsLoading(true); // Iniciamos estado de carga (opcional, por si toma tiempo)

    try {
      // Llamamos al endpoint POST /logout del backend
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Necesario para que el backend borre la cookie correcta
      });

      toast.success('Sesión cerrada exitosamente');

    } catch (error: any) {
      console.error("Error en handleLogout:", error);
      toast.error('Error al cerrar sesión');
    } finally {
      // Independientemente del resultado, limpiamos el estado del frontend
      setAuthData(null); // Borramos el usuario del store de Zustand
      router.push('/'); // Redirigimos al login (ruta raíz)
      setIsLoading(false); // Terminamos la carga
    }
  };


  return {
    handleLogin,
    handleLogout, // <-- Exportamos la nueva función
    isLoading, // Devolvemos el estado de carga
  };
};