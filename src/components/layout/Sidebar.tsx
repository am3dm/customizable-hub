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
  Store,
  UserCog,
  Wallet,
  LogOut
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ViewMode } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStoreSettings } from '@/hooks/useDatabase';

interface MenuItem { 
  id: ViewMode; 
  label: string; 
  icon: React.ReactNode;
  roles?: ('admin' | 'sales' | 'accountant' | 'warehouse')[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} /> },
  { id: 'products', label: 'المنتجات', icon: <Package size={20} /> },
  { id: 'categories', label: 'التصنيفات', icon: <Tags size={20} /> },
  { id: 'sales', label: 'المبيعات', icon: <ShoppingCart size={20} />, roles: ['admin', 'sales'] },
  { id: 'purchases', label: 'المشتريات', icon: <TruckIcon size={20} />, roles: ['admin', 'warehouse'] },
  { id: 'customers', label: 'العملاء', icon: <Users size={20} />, roles: ['admin', 'sales'] },
  { id: 'suppliers', label: 'الموردين', icon: <Building2 size={20} />, roles: ['admin', 'warehouse'] },
  { id: 'debts', label: 'الديون', icon: <Wallet size={20} />, roles: ['admin', 'sales', 'accountant'] },
  { id: 'reports', label: 'التقارير', icon: <BarChart3 size={20} />, roles: ['admin', 'accountant'] },
  { id: 'users', label: 'المستخدمين', icon: <UserCog size={20} />, roles: ['admin'] },
  { id: 'settings', label: 'الإعدادات', icon: <Settings size={20} />, roles: ['admin'] },
];

export const Sidebar = () => {
  const { currentView, setCurrentView } = useStore();
  const { hasRole, isAdmin, signOut, profile } = useAuth();
  const { data: storeSettings } = useStoreSettings();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const storeName = storeSettings?.store_name || 'المتجر';

  // Filter menu items based on user roles
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true; // No role restriction
    if (isAdmin()) return true; // Admin can see everything
    return item.roles.some(role => hasRole(role));
  });

  const handleLogout = async () => {
    await signOut();
  };

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
              {storeName}
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
        {filteredMenuItems.map((item) => (
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

      {/* User & Logout */}
      <div className={cn("p-4 border-t border-sidebar-border space-y-3", isCollapsed && "text-center")}>
        {!isCollapsed && profile && (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Users size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.full_name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{profile.email}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={cn(
            "sidebar-item w-full text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center px-3"
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>تسجيل الخروج</span>}
        </button>
        
        <p className="text-xs text-sidebar-foreground/50">
          {!isCollapsed ? 'نظام إدارة المتجر v1.0' : 'v1.0'}
        </p>
      </div>
    </aside>
  );
};
