import React from 'react';

import SidebarLayout from '../components/layout/SidebarLayout.jsx';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import HeaderLayout from '@/components/layout/HeaderLayout.jsx';


// ==========================================================
// COMPONENT TRANG CHÍNH
// ==========================================================
export default function DashboardPage() {
  return (
    <SidebarProvider>
      <SidebarLayout />
      <SidebarInset>
        <HeaderLayout />
        <main className="p-6">
          
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}