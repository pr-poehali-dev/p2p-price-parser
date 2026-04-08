import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Exchanges from '@/pages/Exchanges';
import Analytics from '@/pages/Analytics';
import Compare from '@/pages/Compare';
import Settings from '@/pages/Settings';

export default function Index() {
  return (
    <Layout>
      {(page, setPage) => {
        switch (page) {
          case 'dashboard': return <Dashboard />;
          case 'exchanges': return <Exchanges />;
          case 'analytics': return <Analytics />;
          case 'compare': return <Compare />;
          case 'settings': return <Settings />;
          default: return <Dashboard />;
        }
      }}
    </Layout>
  );
}
