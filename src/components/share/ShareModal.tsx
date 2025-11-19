import React, { useState, useEffect } from 'react';
import {
  createShareUrl,
  generateQRCode,
  exportGameState,
  importGameState,
  downloadAsFile,
  readFileAsText,
  copyToClipboard,
} from '../../lib/stateEncoding';
import { GameState } from '../../lib/gameState';
import { Modal, Button, Tabs, type Tab } from '../ui';
import { formatCurrency } from '../../lib/uiUtils';

interface ShareModalProps {
  state: GameState;
  onClose: () => void;
  onImport: (data: any) => void;
}

export function ShareModal({ state, onClose, onImport }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<'share' | 'export' | 'import'>('share');
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    // Generate share URL
    const url = createShareUrl({
      balance: state.balance,
      config: state.config,
      configName: state.config.name,
      timestamp: Date.now(),
    });
    setShareUrl(url);

    // Generate QR code
    generateQRCode(url).then(setQrCodeUrl).catch(console.error);
  }, [state.balance, state.config]);

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportJSON = () => {
    const json = exportGameState(state);
    const filename = `blackjack-save-${new Date().toISOString().split('T')[0]}.json`;
    downloadAsFile(json, filename, 'application/json');
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const data = importGameState(content);
      onImport(data);
      setImportError('');
      onClose();
    } catch (error: any) {
      setImportError(error.message || 'Failed to import file');
    }
  };

  const tabs: Tab[] = [
    { id: 'share', label: 'Share Link' },
    { id: 'export', label: 'Export Data' },
    { id: 'import', label: 'Import Data' },
  ];

  return (
    <Modal isOpen={true} onClose={onClose} title="Share & Export" size="medium">
      <div className="space-y-6">
        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as typeof activeTab)} />

        {/* Content */}
        <div className="min-h-[300px]">
          {activeTab === 'share' && (
            <SharePanel
              shareUrl={shareUrl}
              qrCodeUrl={qrCodeUrl}
              copied={copied}
              balance={state.balance}
              configName={state.config.name}
              onCopy={handleCopyUrl}
            />
          )}

          {activeTab === 'export' && (
            <ExportPanel onExport={handleExportJSON} />
          )}

          {activeTab === 'import' && (
            <ImportPanel
              importError={importError}
              onImport={handleImportFile}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
      </div>
    </Modal>
  );
}

interface SharePanelProps {
  shareUrl: string;
  qrCodeUrl: string;
  copied: boolean;
  balance: number;
  configName: string;
  onCopy: () => void;
}

const SharePanel = React.memo(({
  shareUrl,
  qrCodeUrl,
  copied,
  balance,
  configName,
  onCopy,
}: SharePanelProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Share URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-sm"
          />
          <Button onClick={onCopy} variant="primary">
            {copied ? '✓ Copied' : 'Copy'}
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Share this URL to let others load your current balance and configuration.
        </p>
      </div>

      {qrCodeUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            QR Code
          </label>
          <div className="flex justify-center p-4 bg-white rounded border border-gray-300">
            <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Scan this QR code with your phone to transfer your game state.
          </p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          What's included?
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Current balance: {formatCurrency(balance)}</li>
          <li>• Configuration: {configName}</li>
          <li>• All game rules and settings</li>
        </ul>
      </div>
    </div>
  );
});

SharePanel.displayName = 'SharePanel';

interface ExportPanelProps {
  onExport: () => void;
}

const ExportPanel = React.memo(({ onExport }: ExportPanelProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Export Complete Game Data
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Export all your game data including balance, statistics, learning progress, and configurations to a JSON file.
        </p>
        <Button onClick={onExport} variant="success" fullWidth>
          📥 Download JSON File
        </Button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded p-4">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          What's included in the export?
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Current balance and configuration</li>
          <li>• All statistics (session and all-time)</li>
          <li>• Hand history</li>
          <li>• Learning mode progress and mistakes</li>
          <li>• Speed training session history</li>
          <li>• Game settings and preferences</li>
        </ul>
      </div>
    </div>
  );
});

ExportPanel.displayName = 'ExportPanel';

interface ImportPanelProps {
  importError: string;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImportPanel = React.memo(({ importError, onImport }: ImportPanelProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Import Game Data
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Load a previously exported game state from a JSON file.
        </p>
        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={onImport}
            className="block w-full text-sm text-gray-900 dark:text-gray-100 bg-blue-500 hover:bg-blue-600 rounded cursor-pointer file:hidden transition-colors"
            style={{ padding: '0.75rem 1rem' }}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white font-semibold">
            📂 Choose File
          </div>
        </div>
      </div>

      {importError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Error:</strong> {importError}
          </p>
        </div>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-4">
        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          ⚠️ Warning
        </h4>
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Importing will replace your current game data. Make sure to export your current state first if you want to keep it.
        </p>
      </div>
    </div>
  );
});

ImportPanel.displayName = 'ImportPanel';
