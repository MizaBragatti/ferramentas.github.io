'use client';

import { AppProvider } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import PageEditor from '@/components/PageEditor';

export default function Home() {
  return (
    <AppProvider>
      <div className="h-screen flex overflow-hidden bg-gray-100">
        <Sidebar />
        <PageEditor />
      </div>
    </AppProvider>
  );
}
