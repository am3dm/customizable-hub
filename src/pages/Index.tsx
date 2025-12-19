import { MainLayout } from '@/components/layout/MainLayout';
import { Dashboard } from '@/components/views/Dashboard';
import { Products } from '@/components/views/Products';
import { Categories } from '@/components/views/Categories';
import { Sales } from '@/components/views/Sales';
import { Purchases } from '@/components/views/Purchases';
import { Customers } from '@/components/views/Customers';
import { Suppliers } from '@/components/views/Suppliers';
import { Reports } from '@/components/views/Reports';
import { Settings } from '@/components/views/Settings';
import { useStore } from '@/store/useStore';

const Index = () => {
  const { currentView } = useStore();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'categories':
        return <Categories />;
      case 'sales':
        return <Sales />;
      case 'purchases':
        return <Purchases />;
      case 'customers':
        return <Customers />;
      case 'suppliers':
        return <Suppliers />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout>
      {renderView()}
    </MainLayout>
  );
};

export default Index;
