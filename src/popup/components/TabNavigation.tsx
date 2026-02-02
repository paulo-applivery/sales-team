import { useStore } from '../store';
import { TABS } from '@shared/constants';

export default function TabNavigation() {
  const { activeTab, setActiveTab } = useStore();

  return (
    <div className="flex border-b border-secondary-200 bg-white">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`
            flex-1 px-3 py-3 text-sm font-medium transition-colors duration-200
            border-b-2 flex items-center justify-center gap-2
            ${
              activeTab === tab.id
                ? 'text-primary-600 border-primary-600 bg-primary-50'
                : 'text-secondary-600 border-transparent hover:text-primary-600 hover:bg-secondary-50'
            }
          `}
        >
          <span>{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
