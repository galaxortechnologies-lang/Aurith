package com.anupchand.aurith.data.api

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * OpenRouter Client for AURITH
 * Strictly uses exact model: google/gemma-4-26b-a4b-it:free
 * Developer: Anup Chand
 */
class OpenRouterClient {

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()

    companion object {
        const val EXACT_MODEL_ID = "google/gemma-4-26b-a4b-it:free"
        const val ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
    }

    suspend fun sendChatCompletion(
        apiKey: String,
        messages: List<Map<String, String>>,
        tools: List<JSONObject>? = null
    ): OpenRouterResponse = withContext(Dispatchers.IO) {
        if (apiKey.isBlank()) {
            return@withContext OpenRouterResponse.Error("OpenRouter API Key not set. Please configure it in API Settings.")
        }

        try {
            val messagesArray = JSONArray()
            for (m in messages) {
                messagesArray.put(JSONObject().apply {
                    put("role", m["role"])
                    put("content", m["content"])
                })
            }

            val payload = JSONObject().apply {
                put("model", EXACT_MODEL_ID)
                put("messages", messagesArray)
                put("temperature", 0.7)
                if (!tools.isNullOrEmpty()) {
                    val toolsArray = JSONArray()
                    tools.forEach { toolsArray.put(it) }
                    put("tools", toolsArray)
                    put("tool_choice", "auto")
                }
            }

            val request = Request.Builder()
                .url(ENDPOINT)
                .addHeader("Authorization", "Bearer $apiKey")
                .addHeader("Content-Type", "application/json")
                .addHeader("HTTP-Referer", "https://aurith.anupchand.com")
                .addHeader("X-Title", "AURITH Personal AI Assistant")
                .post(payload.toString().toRequestBody("application/json".toMediaType()))
                .build()

            val response = client.newCall(request).execute()
            val bodyString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                val errorMsg = try {
                    JSONObject(bodyString).optJSONObject("error")?.optString("message") ?: "HTTP ${response.code}"
                } catch (e: Exception) {
                    "HTTP ${response.code}: $bodyString"
                }
                return@withContext OpenRouterResponse.Error("OpenRouter Error (${response.code}): $errorMsg")
            }

            val json = JSONObject(bodyString)
            val choices = json.optJSONArray("choices")
            if (choices == null || choices.length() == 0) {
                return@withContext OpenRouterResponse.Error("No response choices returned by OpenRouter.")
            }

            val messageObj = choices.getJSONObject(0).optJSONObject("message")
            val content = messageObj?.optString("content") ?: ""
            val toolCalls = messageObj?.optJSONArray("tool_calls")

            return@withContext OpenRouterResponse.Success(
                content = content,
                toolCalls = toolCalls
            )
        } catch (e: Exception) {
            return@withContext OpenRouterResponse.Error("Network error: ${e.localizedMessage}")
        }
    }

    suspend fun testConnection(apiKey: String): Pair<Boolean, String> = withContext(Dispatchers.IO) {
        val testMessages = listOf(
            mapOf("role" to "user", "content" to "Ping")
        )
        when (val res = sendChatCompletion(apiKey, testMessages)) {
            is OpenRouterResponse.Success -> Pair(true, "Successfully connected to OpenRouter ($EXACT_MODEL_ID)!")
            is OpenRouterResponse.Error -> Pair(false, res.message)
        }
    }
}

sealed class OpenRouterResponse {
    data class Success(val content: String, val toolCalls: JSONArray?) : OpenRouterResponse()
    data class Error(val message: String) : OpenRouterResponse()
}
