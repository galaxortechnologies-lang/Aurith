# AURITH - Native Android Personal AI Assistant
**Developer:** Anup Chand  
**Package:** `com.anupchand.aurith`  
**Target:** Android 16 (API 36) | Kotlin 2.0+ | Jetpack Compose | Material 3

---

## ⚡ Strict AI Models
- **AI Brain**: OpenRouter (`google/gemma-4-26b-a4b-it:free`)
  - Endpoint: `POST https://openrouter.ai/api/v1/chat/completions`
  - Handles: Hindi, English, Hinglish, reasoning, device tool execution
- **Voice TTS**: Fish Audio (`s2.1-pro-free`)
  - Endpoint: `POST https://api.fish.audio/v1/tts`
  - Audio: Native Android MediaPlayer MP3 playback
- **Speech-to-Text**: Native Android `SpeechRecognizer` (`hi-IN`, `en-IN`)

---

## 🛡️ Security & Keystore
- Android Keystore AES-256 GCM backed `EncryptedSharedPreferences` for API keys.
- Allowlisted `DeviceActionManager`: Zero shell access, explicit user confirmation for sensitive operations (deletion, calls, external comms).
- Local Room Database: Conversations, memories, notes, and activity history remain strictly on the device.

---

## 🚀 Building the Project in Android Studio
1. Open this folder in Android Studio (Ladybug / Iguana or later with Android 16 SDK).
2. Sync Gradle dependencies.
3. Connect your Android device via USB debugging or launch an emulator.
4. Run:
   ```bash
   ./gradlew assembleDebug
   ./gradlew installDebug
   ```
5. On first launch, open **API Configuration** in Settings to enter your OpenRouter and Fish Audio keys.

---
**CREATED BY ANUP CHAND**
