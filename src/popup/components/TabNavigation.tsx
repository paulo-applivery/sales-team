import { useStore } from '../store';
import { TABS } from '@shared/constants';

export default function TabNavigation() {
  const { activeTab, setActiveTab } = useStore();

  return (
    <div className="tabs">
      <div className="tabs-list">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`tabs-trigger ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
