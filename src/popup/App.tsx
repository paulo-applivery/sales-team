import { useEffect } from 'react';
import { useStore } from './store';
import TabNavigation from './components/TabNavigation';
import ColdEmail from './tabs/ColdEmail';
import LinkedIn from './tabs/LinkedIn';
import PromptFree from './tabs/PromptFree';
import Settings from './tabs/Settings';

function App() {
  const { activeTab, loadSettings, captureScreenContext } = useStore();

  useEffect(() => {
    // Initialize app
    loadSettings();
    captureScreenContext();
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'email':
        return <ColdEmail />;
      case 'linkedin':
        return <LinkedIn />;
      case 'free':
        return <PromptFree />;
      case 'settings':
        return <Settings />;
      default:
        return <ColdEmail />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-secondary-200">
        <h1 className="text-lg font-semibold text-secondary-900">
          Sales Extension
        </h1>
      </div>

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {renderTab()}
      </div>
    </div>
  );
}

export default App;
