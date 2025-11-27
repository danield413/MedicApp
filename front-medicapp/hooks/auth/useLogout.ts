// hooks/auth/useLogout.ts

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { logout } from '@/services';
import { useAuthStore } from '@/store';
import { ApiError } from '@/lib';

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuthData = useAuthStore(state => state.clearAuthData);

  const { mutate: handleLogout, isPending: isLoggingOut } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuthData();
      // Limpia el caché de React Query para asegurar que no queden datos de la sesión anterior.
      queryClient.clear();
      router.push('/login');
      toast.success('Has cerrado sesión exitosamente.');
    },
    onError: error => {
      const apiError = error as ApiError;
      toast.error(apiError.body.message || 'Error al cerrar sesión.');
    },
  });

  return {
    handleLogout,
    isLoggingOut,
  };
};
