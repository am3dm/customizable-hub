import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="mr-64 transition-all duration-300">
        <Header />
        <main className="p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
