/**
 * Configuration Manager - Milestone 3
 * Handles saving, loading, and managing game configurations
 */

import { GameConfig, PRESET_CONFIGS, DEFAULT_CONFIG } from './types';
import { STORAGE_KEY_SAVED_CONFIGS, STORAGE_KEY_ACTIVE_CONFIG } from './constants';

/**
 * Get all saved custom configurations from localStorage
 */
export function getSavedConfigurations(): Record<string, GameConfig> {
  const saved = localStorage.getItem(STORAGE_KEY_SAVED_CONFIGS);
  return saved ? JSON.parse(saved) : {};
}

/**
 * Save a custom configuration to localStorage
 */
export function saveConfiguration(name: string, config: GameConfig): void {
  const saved = getSavedConfigurations();
  saved[name] = { ...config, name };
  localStorage.setItem(STORAGE_KEY_SAVED_CONFIGS, JSON.stringify(saved));
}

/**
 * Delete a custom configuration from localStorage
 */
export function deleteConfiguration(name: string): void {
  const saved = getSavedConfigurations();
  delete saved[name];
  localStorage.setItem(STORAGE_KEY_SAVED_CONFIGS, JSON.stringify(saved));
}

/**
 * Get all available configurations (presets + custom)
 */
export function getAllConfigurations(): Record<string, GameConfig> {
  const saved = getSavedConfigurations();
  return { ...PRESET_CONFIGS, ...saved };
}

/**
 * Load a configuration by name (from presets or saved)
 */
export function loadConfiguration(name: string): GameConfig | null {
  const allConfigs = getAllConfigurations();
  return allConfigs[name] || null;
}

/**
 * Set the active configuration name
 */
export function setActiveConfigName(name: string): void {
  localStorage.setItem(STORAGE_KEY_ACTIVE_CONFIG, name);
}

/**
 * Get the active configuration name
 */
export function getActiveConfigName(): string | null {
  return localStorage.getItem(STORAGE_KEY_ACTIVE_CONFIG);
}

/**
 * Export configuration as JSON file
 */
export function exportConfiguration(config: GameConfig): void {
  const dataStr = JSON.stringify(config, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${config.name.toLowerCase().replace(/\s+/g, '-')}-config.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import configuration from JSON string
 */
export function importConfiguration(jsonStr: string): GameConfig {
  const config = JSON.parse(jsonStr);

  // Validate required fields
  const requiredFields: (keyof GameConfig)[] = [
    'name', 'deckCount', 'dealerHitsSoft17', 'blackjackPayout',
    'minBet', 'maxBet', 'startingBalance', 'doubleAfterSplit',
    'resplitAcesAllowed', 'maxSplits', 'surrenderAllowed', 'insuranceAllowed'
  ];

  for (const field of requiredFields) {
    if (config[field] === undefined) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate types
  if (typeof config.name !== 'string') throw new Error('Invalid name');
  if (typeof config.deckCount !== 'number') throw new Error('Invalid deckCount');
  if (typeof config.dealerHitsSoft17 !== 'boolean') throw new Error('Invalid dealerHitsSoft17');
  if (!Array.isArray(config.blackjackPayout) || config.blackjackPayout.length !== 2) {
    throw new Error('Invalid blackjackPayout');
  }

  return config as GameConfig;
}

/**
 * Generate a unique configuration name if name already exists
 */
export function generateUniqueName(baseName: string): string {
  const allConfigs = getAllConfigurations();
  let name = baseName;
  let counter = 1;

  while (allConfigs[name]) {
    name = `${baseName} (${counter})`;
    counter++;
  }

  return name;
}

/**
 * Check if a configuration name is a preset (read-only)
 */
export function isPresetConfig(name: string): boolean {
  return name in PRESET_CONFIGS;
}

/**
 * Duplicate a configuration with a new name
 */
export function duplicateConfiguration(config: GameConfig, newName?: string): GameConfig {
  const name = newName || generateUniqueName(`${config.name} Copy`);
  return { ...config, name };
}
