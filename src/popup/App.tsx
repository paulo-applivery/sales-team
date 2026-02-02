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
    <div id="main-container">
      {/* Header */}
      <div className="header">
        <div className="header-brand">
          <h1>Sales Extension</h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Tab Content */}
      <div className="tabs">
        {renderTab()}
      </div>
    </div>
  );
}

export default App;
