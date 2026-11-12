/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class WakeWordService {
  private recognition: any = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private onWakeWordDetected: (() => void) | null = null;
  private restartTimeout: any = null;

  public start(onDetect: () => void) {
    if (this.isRunning) return;
    this.onWakeWordDetected = onDetect;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      this.recognition = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        if (this.isPaused) return;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = (event.results[i][0].transcript || '').toLowerCase();
          if (
            transcript.includes('aurith') ||
            transcript.includes('aw-rith') ||
            transcript.includes('awrith') ||
            transcript.includes('orith') ||
            transcript.includes('hey aurith') ||
            transcript.includes('hey orith')
          ) {
            console.log('Wake word detected ("aw-rith")!');
            if (this.onWakeWordDetected) {
              this.onWakeWordDetected();
            }
            break;
          }
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'aborted') {
          this.scheduleRestart();
        }
      };

      recognition.onend = () => {
        if (this.isRunning && !this.isPaused) {
          this.scheduleRestart();
        }
      };

      recognition.start();
      this.isRunning = true;
    } catch {
      // ignore
    }
  }

  public pauseForManualVoice() {
    this.isPaused = true;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
    }
  }

  public resumeAfterManualVoice() {
    this.isPaused = false;
    if (this.isRunning) {
      this.scheduleRestart();
    }
  }

  private scheduleRestart() {
    if (this.isPaused || !this.isRunning) return;
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    this.restartTimeout = setTimeout(() => {
      if (this.isRunning && !this.isPaused && this.recognition && this.onWakeWordDetected) {
        try {
          this.recognition.start();
        } catch {
          // ignore
        }
      }
    }, 2000);
  }

  public stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
  }
}

export const wakeWordService = new WakeWordService();
