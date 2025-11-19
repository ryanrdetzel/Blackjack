// State encoding/decoding for URL sharing and QR codes

import { GameConfig } from './types';

export interface ShareableState {
  balance: number;
  config: GameConfig;
  configName?: string;
  timestamp?: number;
}

/**
 * Encode state to base64 URL-safe string
 */
export function encodeState(state: ShareableState): string {
  try {
    const json = JSON.stringify(state);
    // Convert to base64 and make URL-safe
    const base64 = btoa(json);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    console.error('Failed to encode state:', error);
    return '';
  }
}

/**
 * Decode state from base64 URL-safe string
 */
export function decodeState(encoded: string): ShareableState | null {
  try {
    // Restore base64 from URL-safe format
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    const json = atob(base64);
    const state = JSON.parse(json);

    // Validate state structure
    if (!state || typeof state.balance !== 'number' || !state.config) {
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to decode state:', error);
    return null;
  }
}

/**
 * Create shareable URL with encoded state
 */
export function createShareUrl(state: ShareableState): string {
  const encoded = encodeState(state);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?state=${encoded}`;
}

/**
 * Get state from current URL
 */
export function getStateFromUrl(): ShareableState | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('state');
  if (!encoded) {
    return null;
  }
  return decodeState(encoded);
}

/**
 * Update URL with state (without reload)
 */
export function updateUrlWithState(state: ShareableState): void {
  const encoded = encodeState(state);
  const url = new URL(window.location.href);
  url.searchParams.set('state', encoded);
  window.history.replaceState({}, '', url.toString());
}

/**
 * Clear state from URL
 */
export function clearStateFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('state');
  window.history.replaceState({}, '', url.toString());
}

/**
 * Generate QR code data URL
 * Uses a simple QR code generation approach
 */
export async function generateQRCode(text: string): Promise<string> {
  // For a lightweight implementation, we'll use a free QR code API
  // Alternative: Install qrcode library for offline generation
  const encodedText = encodeURIComponent(text);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedText}`;

  try {
    // Fetch the QR code image
    const response = await fetch(qrApiUrl);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    // Fallback: return API URL directly
    return qrApiUrl;
  }
}

/**
 * Export complete game state as JSON
 */
export function exportGameState(state: any): string {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    balance: state.balance,
    config: state.config,
    settings: state.settings,
    statistics: state.statistics,
    learningMode: {
      mistakes: state.learningMode.mistakes,
      correctDecisions: state.learningMode.correctDecisions,
      totalDecisions: state.learningMode.totalDecisions,
    },
    speedTraining: {
      sessionHistory: state.speedTraining.sessionHistory,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import game state from JSON
 */
export function importGameState(jsonString: string): any {
  try {
    const data = JSON.parse(jsonString);

    // Validate version
    if (!data.version || data.version !== '1.0') {
      throw new Error('Unsupported export version');
    }

    // Validate required fields
    if (typeof data.balance !== 'number' || !data.config) {
      throw new Error('Invalid export data: missing required fields');
    }

    return data;
  } catch (error) {
    console.error('Failed to import game state:', error);
    throw error;
  }
}

/**
 * Download data as file
 */
export function downloadAsFile(content: string, filename: string, type: string = 'application/json'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read file content
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
