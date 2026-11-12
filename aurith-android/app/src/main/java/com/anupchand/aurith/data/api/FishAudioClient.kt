package com.anupchand.aurith.data.api

import android.content.Context
import android.media.MediaPlayer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.TimeUnit

/**
 * Fish Audio TTS Client for AURITH
 * Strictly uses exact model: s2.1-pro-free
 * Developer: Anup Chand
 */
class FishAudioClient(private val context: Context) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()

    private var mediaPlayer: MediaPlayer? = null
    var isPlayingAudio: Boolean = false
        private set

    companion object {
        const val EXACT_MODEL = "s2.1-pro-free"
        const val ENDPOINT = "https://api.fish.audio/v1/tts"
    }

    suspend fun synthesizeSpeech(apiKey: String, text: String, onStart: () -> Unit = {}, onComplete: () -> Unit = {}): Pair<Boolean, String> = withContext(Dispatchers.IO) {
        if (apiKey.isBlank()) {
            return@withContext Pair(false, "Fish Audio API Key not set. Configure in Settings.")
        }

        try {
            stopAudio()

            val payload = JSONObject().apply {
                put("text", text)
                put("format", "mp3")
            }

            val request = Request.Builder()
                .url(ENDPOINT)
                .addHeader("Authorization", "Bearer $apiKey")
                .addHeader("Content-Type", "application/json")
                .addHeader("model", EXACT_MODEL)
                .post(payload.toString().toRequestBody("application/json".toMediaType()))
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                val errBody = response.body?.string() ?: ""
                return@withContext Pair(false, "Fish Audio HTTP ${response.code}: $errBody")
            }

            val bytes = response.body?.bytes()
            if (bytes == null || bytes.isEmpty()) {
                return@withContext Pair(false, "Fish Audio returned empty audio stream.")
            }

            // Save temporarily and play
            val tempFile = File(context.cacheDir, "aurith_tts_temp.mp3")
            FileOutputStream(tempFile).use { it.write(bytes) }

            withContext(Dispatchers.Main) {
                mediaPlayer = MediaPlayer().apply {
                    setDataSource(tempFile.absolutePath)
                    prepare()
                    start()
                    isPlayingAudio = true
                    onStart()

                    setOnCompletionListener {
                        isPlayingAudio = false
                        it.release()
                        mediaPlayer = null
                        onComplete()
                    }
                    setOnErrorListener { mp, _, _ ->
                        isPlayingAudio = false
                        mp.release()
                        mediaPlayer = null
                        onComplete()
                        true
                    }
                }
            }

            Pair(true, "Speech played successfully")
        } catch (e: Exception) {
            Pair(false, "Fish Audio playback failed: ${e.localizedMessage}")
        }
    }

    fun stopAudio() {
        try {
            mediaPlayer?.let {
                if (it.isPlaying) {
                    it.stop()
                }
                it.release()
            }
        } catch (e: Exception) {
            // ignore cleanup errors
        } finally {
            mediaPlayer = null
            isPlayingAudio = false
        }
    }

    fun pauseAudio() {
        try {
            if (mediaPlayer?.isPlaying == true) {
                mediaPlayer?.pause()
                isPlayingAudio = false
            }
        } catch (e: Exception) {
            // ignore
        }
    }

    fun resumeAudio() {
        try {
            if (mediaPlayer != null && !mediaPlayer!!.isPlaying) {
                mediaPlayer?.start()
                isPlayingAudio = true
            }
        } catch (e: Exception) {
            // ignore
        }
    }

    suspend fun testConnection(apiKey: String): Pair<Boolean, String> = withContext(Dispatchers.IO) {
        val payload = JSONObject().apply {
            put("text", "AURITH test ping.")
            put("format", "mp3")
        }

        try {
            val request = Request.Builder()
                .url(ENDPOINT)
                .addHeader("Authorization", "Bearer $apiKey")
                .addHeader("Content-Type", "application/json")
                .addHeader("model", EXACT_MODEL)
                .post(payload.toString().toRequestBody("application/json".toMediaType()))
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                Pair(true, "Fish Audio ($EXACT_MODEL) connection verified!")
            } else {
                Pair(false, "Fish Audio HTTP ${response.code}: ${response.body?.string()}")
            }
        } catch (e: Exception) {
            Pair(false, "Connection error: ${e.localizedMessage}")
        }
    }
}
