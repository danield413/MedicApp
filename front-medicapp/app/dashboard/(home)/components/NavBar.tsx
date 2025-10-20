'use client';

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { MenuIcon } from '@/components/icons';
import { useAuthStore, useUiStore } from '@/store';
import { useLogout } from '@/hooks';
import { Breadcrumbs } from './Breadcrumbs';

export const NavBar = () => {
  const { name } = useAuthStore();
  const { toggleSidebar } = useUiStore();
  const { handleLogout } = useLogout();

  // Obtener la inicial del nombre para el avatar
  const userInitial = name?.[ 0 ]?.toUpperCase() || 'U';

  return (
    <header className="header flex items-center justify-between px-2 py-2 lg:px-5 bg-white border-b">
      <div className="flex items-center gap-2">
        <button
          className="text-zinc-700 hover:bg-gray-100 p-2 rounded-md"
          onClick={toggleSidebar}
        >
          <MenuIcon className="size-6" />
        </button>
        <div className="hidden sm:block ml-4">
          <Breadcrumbs />
        </div>
      </div>
      <div className="flex items-center">
        <Dropdown radius="sm">
          <DropdownTrigger>
            <button className="flex items-center justify-center rounded-full bg-zinc-800 text-white size-8 text-sm font-bold uppercase">
              {userInitial}
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions">
            <DropdownItem key="profile" className="opacity-50">
              Mi Perfil
            </DropdownItem>
            <DropdownItem
              key="logout"
              className="text-danger"
              color="danger"
              onClick={handleLogout}
            >
              Cerrar sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
};
