import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  TruckIcon, 
  Users, 
  Building2, 
  BarChart3, 
  Settings,
  ChevronLeft,
  Store
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ViewMode } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const menuItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} /> },
  { id: 'products', label: 'المنتجات', icon: <Package size={20} /> },
  { id: 'categories', label: 'التصنيفات', icon: <Tags size={20} /> },
  { id: 'sales', label: 'المبيعات', icon: <ShoppingCart size={20} /> },
  { id: 'purchases', label: 'المشتريات', icon: <TruckIcon size={20} /> },
  { id: 'customers', label: 'العملاء', icon: <Users size={20} /> },
  { id: 'suppliers', label: 'الموردين', icon: <Building2 size={20} /> },
  { id: 'reports', label: 'التقارير', icon: <BarChart3 size={20} /> },
  { id: 'settings', label: 'الإعدادات', icon: <Settings size={20} /> },
];

export const Sidebar = () => {
  const { currentView, setCurrentView, settings } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed right-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-40",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 flex items-center justify-between border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}>
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Store className="text-primary-foreground" size={22} />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg text-sidebar-foreground animate-fade-in">
              {settings.storeName}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60",
            isCollapsed && "absolute -left-3 top-8 bg-sidebar border border-sidebar-border"
          )}
        >
          <ChevronLeft 
            size={18} 
            className={cn("transition-transform duration-300", isCollapsed && "rotate-180")} 
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={cn(
              "sidebar-item w-full",
              currentView === item.id && "active",
              isCollapsed && "justify-center px-3"
            )}
          >
            {item.icon}
            {!isCollapsed && <span className="animate-fade-in">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn("p-4 border-t border-sidebar-border", isCollapsed && "text-center")}>
        <p className="text-xs text-sidebar-foreground/50">
          {!isCollapsed ? 'نظام إدارة المتجر v1.0' : 'v1.0'}
        </p>
      </div>
    </aside>
  );
};
