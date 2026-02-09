import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { SCRAPING_MODES } from '@shared/constants';
import { ADMIN_API_URL } from '@shared/constants';
import InputField from '../components/InputField';
import TextArea from '../components/TextArea';
import Button from '../components/Button';

export default function Settings() {
  const {
    settings,
    saveSettings,
    formData,
    setFormData,
    user,
    isAuthenticated,
    authLoading,
    login,
    logout,
    adminSettings,
  } = useStore();

  const [localSettings, setLocalSettings] = useState(settings || {
    scrapingMode: 'full' as const,
    theme: 'light' as const,
    autoSave: true,
    angles: [],
    principles: '',
    emailMaxLength: 200,
    linkedinMaxLength: 300,
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [expandedSection, setExpandedSection] = useState<string | null>('account');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    setSaveStatus('saving');

    try {
      await saveSettings(localSettings);

      // Also save defaults
      await chrome.storage.local.set({ sales_ext_defaults: formData });

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleExportSettings = () => {
    const exportData = {
      settings: localSettings,
      defaults: formData,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-extension-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tabs-content active">
      {/* Account Section */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => toggleSection('account')}
          className="w-full flex items-center justify-between p-4"
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <h2 className="text-lg font-semibold" style={{ margin: 0 }}>
            👤 Account
          </h2>
          <span style={{ fontSize: '1.25rem' }}>{expandedSection === 'account' ? '−' : '+'}</span>
        </button>

        {expandedSection === 'account' && (
          <div style={{ padding: '0 1rem 1rem' }}>
            {isAuthenticated && user ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', backgroundColor: 'hsl(var(--muted) / 0.3)', borderRadius: '0.75rem' }}>
                  {user.avatarUrl && (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{user.name}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7 }}>{user.email}</p>
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    backgroundColor: user.role === 'admin' ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--muted) / 0.5)',
                    color: user.role === 'admin' ? 'hsl(var(--primary))' : 'inherit',
                  }}>
                    {user.role}
                  </span>
                </div>

                {user.role === 'admin' && (
                  <a
                    href={ADMIN_API_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '0.5rem',
                      marginBottom: '0.75rem',
                      fontSize: '0.813rem',
                      color: 'hsl(var(--primary))',
                      textDecoration: 'none',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  >
                    Open Admin Dashboard →
                  </a>
                )}

                {/* Show admin settings info */}
                {adminSettings && (
                  <div style={{ marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: 'hsl(var(--muted) / 0.2)', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: 600, opacity: 0.8 }}>Admin Settings Active</p>
                    <p style={{ margin: 0, opacity: 0.6 }}>
                      {adminSettings.angles.length} angles configured · Principles: {adminSettings.principles ? 'Yes' : 'No'}
                    </p>
                  </div>
                )}

                <Button
                  variant="secondary"
                  onClick={logout}
                  loading={authLoading}
                  style={{ width: '100%' }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem', opacity: 0.7 }}>
                  Sign in with your @applivery.com Google account to use the extension.
                </p>
                <Button
                  onClick={login}
                  loading={authLoading}
                  style={{ width: '100%' }}
                >
                  🔐 Sign in with Google
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Screen Context Configuration */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => toggleSection('context')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
            📄 Screen Context Settings
          </h2>
          <span style={{ fontSize: '1.25rem' }}>{expandedSection === 'context' ? '−' : '+'}</span>
        </button>

        {expandedSection === 'context' && (
          <div style={{ padding: '0 1rem 1rem' }}>
            <label className="label">Scraping Mode</label>
            <select
              value={localSettings.scrapingMode}
              onChange={(e) => setLocalSettings({ ...localSettings, scrapingMode: e.target.value as any })}
              className="input-field"
            >
              {SCRAPING_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label} - {mode.description}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Default Business Information */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => toggleSection('business')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
            🏢 Default Business Information
          </h2>
          <span style={{ fontSize: '1.25rem' }}>{expandedSection === 'business' ? '−' : '+'}</span>
        </button>

        {expandedSection === 'business' && (
          <div style={{ padding: '0 1rem 1rem' }}>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', opacity: 0.7 }}>
              These values will be pre-filled in all tabs
            </p>
            <InputField
              label="Company/Product Name"
              placeholder="Your company name"
              value={formData.companyName}
              onChange={(e) => setFormData({ companyName: e.target.value })}
            />

            <TextArea
              label="Company Overview"
              placeholder="Brief description of your company"
              value={formData.companyOverview}
              onChange={(e) => setFormData({ companyOverview: e.target.value })}
            />

            <TextArea
              label="Value Proposition"
              placeholder="What makes you unique?"
              value={formData.valueProposition}
              onChange={(e) => setFormData({ valueProposition: e.target.value })}
            />

            <TextArea
              label="Customer Pain Points"
              placeholder="Common problems your customers face"
              value={formData.painPoints}
              onChange={(e) => setFormData({ painPoints: e.target.value })}
            />

            <TextArea
              label="Social Proof"
              placeholder="Testimonials, case studies, metrics"
              value={formData.socialProof}
              onChange={(e) => setFormData({ socialProof: e.target.value })}
            />

            <TextArea
              label="Primary Competitors"
              placeholder="List your main competitors"
              value={formData.competitors}
              onChange={(e) => setFormData({ competitors: e.target.value })}
            />

            <TextArea
              label="Product Differentiators"
              placeholder="What sets you apart from competitors?"
              value={formData.differentiators}
              onChange={(e) => setFormData({ differentiators: e.target.value })}
            />

            <TextArea
              label="Call to Action Examples"
              placeholder="Example CTAs for the AI to reference (e.g., 'Worth a 2-minute look at how we handle Zero-Day support?')"
              value={formData.callToAction}
              onChange={(e) => setFormData({ callToAction: e.target.value })}
              rows={3}
              helperText="The AI will use these as inspiration, not copy them verbatim"
            />

            <TextArea
              label="Additional Context"
              placeholder="Any extra context for the AI (tone rules, industry notes, things to avoid...)"
              value={formData.additionalContext}
              onChange={(e) => setFormData({ additionalContext: e.target.value })}
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Additional Features */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => toggleSection('features')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
            ✨ Additional Features
          </h2>
          <span style={{ fontSize: '1.25rem' }}>{expandedSection === 'features' ? '−' : '+'}</span>
        </button>

        {expandedSection === 'features' && (
          <div style={{ padding: '0 1rem 1rem' }}>
            <div className="toggle-container">
              <div className="toggle-info">
                <div className="toggle-title">Auto-save</div>
                <div className="toggle-desc">Automatically save form data</div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localSettings.autoSave}
                  onChange={(e) => setLocalSettings({ ...localSettings, autoSave: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <Button
              variant="secondary"
              onClick={handleExportSettings}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              📥 Export Settings
            </Button>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div style={{ position: 'sticky', bottom: 0, backgroundColor: 'hsl(var(--background))', paddingTop: '1rem', borderTop: '1px solid hsl(var(--border))' }}>
        <Button
          onClick={handleSaveSettings}
          loading={saveStatus === 'saving'}
          style={{ width: '100%' }}
        >
          {saveStatus === 'saved' ? '✓ Saved!' : 'Save Settings'}
        </Button>

        {saveStatus === 'error' && (
          <p style={{ fontSize: '0.875rem', color: 'hsl(45 93% 47%)', marginTop: '0.5rem', textAlign: 'center' }}>
            Failed to save settings. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
