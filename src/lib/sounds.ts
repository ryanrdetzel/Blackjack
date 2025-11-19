// Sound effects system for Blackjack game

export type SoundEffect =
  | 'card_deal'
  | 'card_flip'
  | 'chip_bet'
  | 'chip_win'
  | 'win'
  | 'lose'
  | 'push'
  | 'blackjack'
  | 'button_click'
  | 'achievement';

interface SoundConfig {
  enabled: boolean;
  volume: number; // 0-1
}

/**
 * Sound manager class
 */
class SoundManager {
  private sounds: Map<SoundEffect, HTMLAudioElement> = new Map();
  private config: SoundConfig;

  constructor() {
    this.config = this.loadConfig();
    this.initializeSounds();
  }

  /**
   * Initialize sound effects using Web Audio API with generated tones
   * This creates simple beep sounds without requiring audio files
   */
  private initializeSounds(): void {
    // Sounds are generated on-demand using Web Audio API
    // No pre-loading needed
  }

  /**
   * Load sound configuration from localStorage
   */
  private loadConfig(): SoundConfig {
    const saved = localStorage.getItem('blackjack_sound_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Invalid config
      }
    }
    return { enabled: true, volume: 0.5 };
  }

  /**
   * Save sound configuration
   */
  private saveConfig(): void {
    localStorage.setItem('blackjack_sound_config', JSON.stringify(this.config));
  }

  /**
   * Generate and play a tone using Web Audio API
   */
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.config.enabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      gainNode.gain.value = this.config.volume * 0.3; // Scale down volume
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      // Audio not supported or error occurred
      console.warn('Failed to play sound:', error);
    }
  }

  /**
   * Play a sound effect
   */
  public play(effect: SoundEffect): void {
    if (!this.config.enabled) return;

    switch (effect) {
      case 'card_deal':
        this.playTone(300, 0.1, 'square');
        break;
      case 'card_flip':
        this.playTone(400, 0.1, 'square');
        break;
      case 'chip_bet':
        this.playTone(440, 0.15, 'sine');
        setTimeout(() => this.playTone(550, 0.1, 'sine'), 50);
        break;
      case 'chip_win':
        this.playTone(550, 0.1, 'sine');
        setTimeout(() => this.playTone(660, 0.1, 'sine'), 80);
        setTimeout(() => this.playTone(770, 0.15, 'sine'), 160);
        break;
      case 'win':
        this.playTone(523, 0.15, 'sine'); // C
        setTimeout(() => this.playTone(659, 0.15, 'sine'), 150); // E
        setTimeout(() => this.playTone(784, 0.2, 'sine'), 300); // G
        break;
      case 'lose':
        this.playTone(400, 0.15, 'sine');
        setTimeout(() => this.playTone(350, 0.15, 'sine'), 150);
        setTimeout(() => this.playTone(300, 0.2, 'sine'), 300);
        break;
      case 'push':
        this.playTone(440, 0.2, 'sine');
        break;
      case 'blackjack':
        this.playTone(523, 0.1, 'sine'); // C
        setTimeout(() => this.playTone(659, 0.1, 'sine'), 100); // E
        setTimeout(() => this.playTone(784, 0.1, 'sine'), 200); // G
        setTimeout(() => this.playTone(1047, 0.25, 'sine'), 300); // C (high)
        break;
      case 'button_click':
        this.playTone(600, 0.05, 'square');
        break;
      case 'achievement':
        this.playTone(523, 0.1, 'sine');
        setTimeout(() => this.playTone(659, 0.1, 'sine'), 100);
        setTimeout(() => this.playTone(784, 0.1, 'sine'), 200);
        setTimeout(() => this.playTone(1047, 0.15, 'sine'), 300);
        setTimeout(() => this.playTone(1319, 0.2, 'sine'), 450);
        break;
    }
  }

  /**
   * Enable/disable sounds
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();
  }

  /**
   * Set volume (0-1)
   */
  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
    this.saveConfig();
  }

  /**
   * Get current config
   */
  public getConfig(): SoundConfig {
    return { ...this.config };
  }

  /**
   * Toggle sounds on/off
   */
  public toggle(): boolean {
    this.config.enabled = !this.config.enabled;
    this.saveConfig();
    return this.config.enabled;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
