/**
 * FiscalOverviewPage - Hub page for all fiscal features
 * Replaces admin-advanced.html#fiscal legacy redirect
 */
import { useNavigate } from 'react-router-dom';

interface FiscalMenuItem {
  id: string;
  label: string;
  icon: string;
  description: string;
  route: string;
}

const fiscalMenuItems: FiscalMenuItem[] = [
  {
    id: 'cash-register',
    label: 'Registru de Casă',
    icon: 'fas fa-cash-register',
    description: 'Tranzacții și sold curent',
    route: '/stocks/fiscal/cash-register',
  },
  {
    id: 'documents-create',
    label: 'Documente Fiscale',
    icon: 'fas fa-file-invoice',
    description: 'Creare facturi și chitanțe',
    route: '/stocks/fiscal/documents/create',
  },
  {
    id: 'report-x',
    label: 'Raport X',
    icon: 'fas fa-chart-bar',
    description: 'Raport intermediar de vânzări',
    route: '/stocks/fiscal/reports/x',
  },
  {
    id: 'report-z',
    label: 'Raport Z',
    icon: 'fas fa-chart-line',
    description: 'Raport zilnic de închidere',
    route: '/stocks/fiscal/reports/z',
  },
  {
    id: 'monthly-report',
    label: 'Raport Lunar',
    icon: 'fas fa-calendar-alt',
    description: 'Rapoarte fiscale lunare',
    route: '/stocks/fiscal/reports/monthly',
  },
  {
    id: 'archive',
    label: 'Arhivă Fiscală',
    icon: 'fas fa-archive',
    description: 'Documente fiscale arhivate',
    route: '/stocks/fiscal/archive',
  },
  {
    id: 'anaf-sync',
    label: 'Sincronizare ANAF',
    icon: 'fas fa-sync-alt',
    description: 'Transmitere și sincronizare ANAF',
    route: '/stocks/fiscal/sync',
  },
  {
    id: 'anaf-integration',
    label: 'Integrare ANAF',
    icon: 'fas fa-plug',
    description: 'Configurare și validare CUI ANAF',
    route: '/stocks/fiscal/anaf-integration',
  },
];

export const FiscalOverviewPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            <i className="fas fa-receipt mr-3" />
            Modul Fiscal
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiune documente fiscale, rapoarte și integrare ANAF
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {fiscalMenuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.route)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-indigo-300 group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                    <i className={`${item.icon} text-xl text-indigo-600 group-hover:text-indigo-700 transition-colors`} />
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.label}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
