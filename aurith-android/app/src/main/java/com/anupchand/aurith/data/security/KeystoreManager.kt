package com.anupchand.aurith.data.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Android Keystore-backed encryption for API keys
 * Never logs keys, never stores in plaintext.
 * Developer: Anup Chand
 */
class KeystoreManager(context: Context) {

    private val sharedPreferences: SharedPreferences

    init {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        sharedPreferences = EncryptedSharedPreferences.create(
            context,
            SECURE_PREFS_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun getOpenRouterApiKey(): String? {
        return sharedPreferences.getString(KEY_OPENROUTER, null)
    }

    fun setOpenRouterApiKey(key: String) {
        sharedPreferences.edit().putString(KEY_OPENROUTER, key.trim()).apply()
    }

    fun getFishAudioApiKey(): String? {
        return sharedPreferences.getString(KEY_FISH_AUDIO, null)
    }

    fun setFishAudioApiKey(key: String) {
        sharedPreferences.edit().putString(KEY_FISH_AUDIO, key.trim()).apply()
    }

    fun clearKeys() {
        sharedPreferences.edit()
            .remove(KEY_OPENROUTER)
            .remove(KEY_FISH_AUDIO)
            .apply()
    }

    fun getMaskedKey(key: String?): String {
        if (key.isNullOrBlank()) return "Not configured"
        if (key.length <= 8) return "••••••••"
        return "${key.take(4)}••••••••${key.takeLast(4)}"
    }

    companion object {
        private const val SECURE_PREFS_NAME = "aurith_secure_vault"
        private const val KEY_OPENROUTER = "enc_openrouter_api_key"
        private const val KEY_FISH_AUDIO = "enc_fish_audio_api_key"
    }
}
