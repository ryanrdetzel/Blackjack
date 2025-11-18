/**
 * Configuration Manager - Milestone 3
 * Modal for managing game configurations (save, load, delete, export, import)
 */

import { useState, useRef } from 'react';
import { GameConfig } from '../lib/types';
import {
  getAllConfigurations,
  saveConfiguration,
  deleteConfiguration,
  exportConfiguration,
  importConfiguration,
  isPresetConfig,
  duplicateConfiguration,
  generateUniqueName,
} from '../lib/configManager';

interface ConfigurationManagerProps {
  currentConfig: GameConfig;
  onLoadConfig: (config: GameConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigurationManager({
  currentConfig,
  onLoadConfig,
  isOpen,
  onClose,
}: ConfigurationManagerProps) {
  const [configs, setConfigs] = useState<Record<string, GameConfig>>(getAllConfigurations());
  const [saveName, setSaveName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const refreshConfigs = () => {
    setConfigs(getAllConfigurations());
  };

  const handleLoad = (config: GameConfig) => {
    onLoadConfig(config);
    onClose();
  };

  const handleSave = () => {
    if (!saveName.trim()) {
      alert('Please enter a configuration name');
      return;
    }

    const finalName = generateUniqueName(saveName.trim());
    saveConfiguration(finalName, { ...currentConfig, name: finalName });
    refreshConfigs();
    setSaveName('');
    setShowSaveForm(false);
    alert(`Configuration "${finalName}" saved successfully!`);
  };

  const handleDelete = (name: string) => {
    if (isPresetConfig(name)) {
      alert('Cannot delete preset configurations');
      return;
    }

    if (confirm(`Delete configuration "${name}"?`)) {
      deleteConfiguration(name);
      refreshConfigs();
    }
  };

  const handleExport = (config: GameConfig) => {
    exportConfiguration(config);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonStr = e.target?.result as string;
        const config = importConfiguration(jsonStr);

        // Generate unique name if needed
        const finalName = generateUniqueName(config.name);
        saveConfiguration(finalName, { ...config, name: finalName });
        refreshConfigs();
        setImportError(null);
        alert(`Configuration "${finalName}" imported successfully!`);
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'Invalid configuration file');
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  };

  const handleDuplicate = (config: GameConfig) => {
    const duplicated = duplicateConfiguration(config);
    saveConfiguration(duplicated.name, duplicated);
    refreshConfigs();
    alert(`Configuration duplicated as "${duplicated.name}"`);
  };

  // Separate presets and custom configs
  const presetConfigs = Object.entries(configs).filter(([name]) => isPresetConfig(name));
  const customConfigs = Object.entries(configs).filter(([name]) => !isPresetConfig(name));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-2xl font-bold">Configuration Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Current Configuration Info */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-2">Current Configuration</h3>
          <p className="text-gray-300">{currentConfig.name}</p>
          <div className="text-sm text-gray-400 mt-1">
            {currentConfig.deckCount} decks •
            Blackjack pays {currentConfig.blackjackPayout[0]}:{currentConfig.blackjackPayout[1]} •
            ${currentConfig.minBet}-${currentConfig.maxBet} bets
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors"
          >
            💾 Save Current Configuration
          </button>
          <button
            onClick={handleImportClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors"
          >
            📥 Import from JSON
          </button>
        </div>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          className="hidden"
        />

        {/* Import Error */}
        {importError && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {importError}
          </div>
        )}

        {/* Save Form */}
        {showSaveForm && (
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3">Save Configuration</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter configuration name"
                className="flex-1 px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:outline-none focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              />
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveForm(false);
                  setSaveName('');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Preset Configurations */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">Preset Configurations</h3>
          <div className="space-y-2">
            {presetConfigs.map(([key, config]) => (
              <ConfigItem
                key={key}
                config={config}
                isPreset={true}
                onLoad={handleLoad}
                onDuplicate={handleDuplicate}
                onExport={handleExport}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        {/* Custom Configurations */}
        {customConfigs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Custom Configurations</h3>
            <div className="space-y-2">
              {customConfigs.map(([key, config]) => (
                <ConfigItem
                  key={key}
                  config={config}
                  isPreset={false}
                  onLoad={handleLoad}
                  onDuplicate={handleDuplicate}
                  onExport={handleExport}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Config Item Component
interface ConfigItemProps {
  config: GameConfig;
  isPreset: boolean;
  onLoad: (config: GameConfig) => void;
  onDuplicate: (config: GameConfig) => void;
  onExport: (config: GameConfig) => void;
  onDelete: (name: string) => void;
}

function ConfigItem({ config, isPreset, onLoad, onDuplicate, onExport, onDelete }: ConfigItemProps) {
  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-semibold">{config.name}</h4>
            {isPreset && (
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Preset</span>
            )}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {config.deckCount} deck{config.deckCount > 1 ? 's' : ''} •
            Dealer {config.dealerHitsSoft17 ? 'hits' : 'stands'} soft 17 •
            BJ pays {config.blackjackPayout[0]}:{config.blackjackPayout[1]}
          </div>
          <div className="text-sm text-gray-400">
            Bets: ${config.minBet}-${config.maxBet} •
            {config.surrenderAllowed && ' Surrender'} •
            {config.doubleAfterSplit && ' DAS'} •
            {config.resplitAcesAllowed && ' Resplit Aces'}
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onLoad(config)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors"
            title="Load this configuration"
          >
            Load
          </button>
          <button
            onClick={() => onDuplicate(config)}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm font-semibold rounded transition-colors"
            title="Duplicate this configuration"
          >
            📋
          </button>
          <button
            onClick={() => onExport(config)}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm font-semibold rounded transition-colors"
            title="Export as JSON"
          >
            📤
          </button>
          {!isPreset && (
            <button
              onClick={() => onDelete(config.name)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition-colors"
              title="Delete this configuration"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
