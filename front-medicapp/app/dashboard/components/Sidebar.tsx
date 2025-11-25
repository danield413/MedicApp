'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUiStore } from '../../../store/uiStore'; // Adjust path if needed
import { useAuthStore } from '@/store';
import { useAuth } from '@/hooks/auth/useAuth'; // Adjust path if needed
import { 
  InfoIcon, 
  CalendarIcon, 
  BellIcon, 
  PillIcon, 
  BoxIcon,
  HistoryIcon,
  FileTextIcon, 
  LogoutIcon
} from '../components/MenuIcons'; 

// Define menu items
const menuItems = [
  { href: '/dashboard', label: 'Mi Información', icon: <InfoIcon className="w-5 h-5" /> },
  { href: '/dashboard/recordatorios-citas', label: 'Recordatorios Citas', icon: <CalendarIcon className="w-5 h-5" /> },
  // { href: '/dashboard/recordatorios-medicamentos', label: 'Recordatorios Medicamentos', icon: <BellIcon className="w-5 h-5" /> },
  // { href: '/dashboard/medicamentos', label: 'Medicamentos', icon: <PillIcon className="w-5 h-5" /> },
  { href: '/dashboard/dosis', label: 'Dosis', icon: <PillIcon className="w-5 h-5" /> },
  { href: '/dashboard/formulas', label: 'Fórmulas Médicas', icon: <FileTextIcon className="w-5 h-5" /> }, // <-- Nueva ruta
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: <BoxIcon className="w-5 h-5" /> },
  { href: '/dashboard/historial-consumo', label: 'Historial Consumo', icon: <HistoryIcon className="w-5 h-5" /> },
  {
    name: 'Reporte Consumo',
    href: '/dashboard/reporte-consumo',
    icon: <BellIcon className="w-5 h-5" />,
    label: 'Reporte Consumo', 
    current: false, 
  },
  {
    name: 'Recordatorios Medicamentos',
    href: '/dashboard/recordatorios-medicamentos',
    icon: <BellIcon className="w-5 h-5" />,
    label: 'Recordatorios Medicamentos', 
    current: false, 
  }
];

export const SideBar = () => {
  const { isSidebarOpen } = useUiStore();
  const pathname = usePathname();
  const { handleLogout } = useAuth(); // Get logout function from hook
  const authState = useAuthStore();
  // Nombre a mostrar (soporta tanto "name" como "nombre" por compatibilidad)
  const displayName = authState.name || (authState as unknown as { nombre?: string }).nombre || 'Usuario';
  const subText = (authState as unknown as { cedula?: string }).cedula || '';
  const userInitial = displayName?.[0]?.toUpperCase() || 'U';

  return (
    <aside className="sidebar flex h-screen flex-col overflow-y-auto bg-white dark:bg-gray-900 shadow-lg">
      
      {/* 1. Sidebar Header + User info */}
      <div className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        {/* App title */}
        <div className="flex items-center p-4 h-14">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {isSidebarOpen ? 'MedicApp' : 'MA'}
          </span>
        </div>
        {/* User section */}
        <div className={`flex items-center gap-3 px-4 pb-4 ${isSidebarOpen ? '' : 'justify-center'}`} title={!isSidebarOpen ? displayName : undefined}>
          <div className="flex items-center justify-center rounded-full bg-zinc-800 text-white w-9 h-9 text-sm font-bold uppercase flex-shrink-0">
            {userInitial}
          </div>
          <div className={`${isSidebarOpen ? 'flex flex-col' : 'hidden'} min-w-0`}>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {displayName}
            </span>
            {subText ? (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{subText}</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* 2. Sidebar Menu */}
      <nav className="flex-grow pt-4 overflow-y-auto">
        <ul>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href} className="my-1">
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded-md py-3 text-gray-600 dark:text-gray-300
                    hover:bg-gray-100 hover:text-black dark:hover:bg-gray-700 dark:hover:text-white
                    transition-all duration-200
                    ${isSidebarOpen ? 'mx-4 px-3' : 'justify-center mx-2'}
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-gray-800 font-semibold text-blue-600 dark:text-blue-300' 
                      : ''}
                  `}
                  title={isSidebarOpen ? undefined : item.label} // Tooltip when collapsed
                >
                  {item.icon}
                  <span 
                    className={`
                      text-sm whitespace-nowrap
                      transition-opacity duration-200
                      ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 w-0 hidden'}
                    `}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 3. Sidebar Footer with Logout Button */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700 mt-auto flex-shrink-0">
        <button
          onClick={handleLogout} // Call logout function on click
          className={`
            flex w-full items-center gap-3 rounded-md py-3 text-red-600 dark:text-red-400
            hover:bg-red-50 hover:text-red-700 dark:hover:bg-gray-700 dark:hover:text-red-300
            transition-all duration-200
            ${isSidebarOpen ? 'px-3' : 'justify-center'}
          `}
          title={isSidebarOpen ? undefined : "Cerrar Sesión"}
        >
          <LogoutIcon className="w-5 h-5 flex-shrink-0" />
          <span 
            className={`
              text-sm font-medium whitespace-nowrap
              transition-opacity duration-200
              ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 w-0 hidden'}
            `}
          >
            Cerrar Sesión
          </span>
        </button>
        
        {/* Optional Copyright */}
        <span 
          className={`
            block text-center mt-4 text-xs text-gray-400 transition-opacity duration-200
            ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 w-0 hidden'}
          `}
        >
          © 2025 MedicApp
        </span>
      </div>
    </aside>
  );
};