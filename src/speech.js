// Project AINA - Speech & Voice Accessibility Engine
// Supports Urdu (ur-PK) and English (en-PK / en-US) Voice Input & Narration

export class SpeechHandler {
  constructor(onResultCallback, onStateChangeCallback) {
    this.onResult = onResultCallback;
    this.onStateChange = onStateChangeCallback;
    this.recognition = null;
    this.isListening = false;
    this.currentLang = 'ur-PK';

    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLang;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStateChange) this.onStateChange(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onStateChange) this.onStateChange(false);
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.isListening = false;
        if (this.onStateChange) this.onStateChange(false, event.error);
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (this.onResult) {
          this.onResult(transcript, event.results[0].isFinal);
        }
      };
    }
  }

  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  setLanguage(langCode) {
    this.currentLang = langCode === 'ur' ? 'ur-PK' : 'en-US';
    if (this.recognition) {
      this.recognition.lang = this.currentLang;
    }
  }

  start() {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (e) {
        console.warn('Could not start recognition:', e);
      }
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  toggle() {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  // Text to Speech
  speak(text, lang = 'ur') {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const cleanText = text.replace(/[#*_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
    utterance.rate = 0.95;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.startsWith(lang === 'ur' ? 'ur' : 'en'));
    if (match) {
      utterance.voice = match;
    }

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}
