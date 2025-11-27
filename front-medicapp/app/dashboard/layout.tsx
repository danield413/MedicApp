'use client';

import { FC } from 'react';
import { useUiStore } from '../../store/uiStore'; // Ajusta la ruta
import { SideBar } from './components/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Este es tu layout, ahora funcional
const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const { isSidebarOpen } = useUiStore();

  return (
    <div
      className={`min-h-screen bg-gray-100 dark:bg-gray-900 ${
        isSidebarOpen ? 'grid-container' : 'grid-container-collapse'
      }`}
    >
      <SideBar />
      <main className="main py-5 px-2 lg:px-5 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;