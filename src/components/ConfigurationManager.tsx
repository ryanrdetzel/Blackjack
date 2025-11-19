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
import { Modal, Button } from './ui';
import ConfigItem from './configurations/ConfigItem';
import ConfigSaveForm from './configurations/ConfigSaveForm';
import CurrentConfigInfo from './configurations/CurrentConfigInfo';

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
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshConfigs = () => {
    setConfigs(getAllConfigurations());
  };

  const handleLoad = (config: GameConfig) => {
    onLoadConfig(config);
    onClose();
  };

  const handleSave = (name: string) => {
    const finalName = generateUniqueName(name);
    saveConfiguration(finalName, { ...currentConfig, name: finalName });
    refreshConfigs();
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuration Manager"
      maxWidth="4xl"
      footer={
        <Button onClick={onClose} variant="secondary" fullWidth>
          Close
        </Button>
      }
    >
      {/* Current Configuration Info */}
      <CurrentConfigInfo config={currentConfig} />

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 my-6">
        <Button
          onClick={() => setShowSaveForm(!showSaveForm)}
          variant="success"
        >
          💾 Save Current Configuration
        </Button>
        <Button
          onClick={handleImportClick}
          variant="primary"
        >
          📥 Import from JSON
        </Button>
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
        <div className="mb-6">
          <ConfigSaveForm
            onSave={handleSave}
            onCancel={() => setShowSaveForm(false)}
          />
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
        <div>
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
    </Modal>
  );
}
