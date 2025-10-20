'use client';

import { FC } from 'react';
import { useUiStore } from '@/store';
import { NavBar } from './components/NavBar';
import { SideBar } from './components/SideBar';
import { Footer } from './components/Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const { isSidebarOpen } = useUiStore();

  return (
    <div
   
    >
      {children}
    </div>
  );
};

export default DashboardLayout;
