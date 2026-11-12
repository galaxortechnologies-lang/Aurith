package com.anupchand.aurith

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.anupchand.aurith.data.db.AppDatabase
import com.anupchand.aurith.data.security.KeystoreManager

/**
 * AURITH Application Entry Point
 * Developer: Anup Chand
 * Package: com.anupchand.aurith
 */
class AurithApplication : Application() {

    lateinit var database: AppDatabase
        private set

    lateinit var keystoreManager: KeystoreManager
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        // Initialize Android Keystore backed secure storage
        keystoreManager = KeystoreManager(this)

        // Initialize Room Local Database
        database = AppDatabase.getInstance(this)

        // Setup notification channel
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID_AURITH,
                "AURITH Assistant Notifications",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "System notifications, reminders and action alerts from AURITH"
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager?.createNotificationChannel(channel)
        }
    }

    companion object {
        const val CHANNEL_ID_AURITH = "aurith_alerts"
        lateinit var instance: AurithApplication
            private set
    }
}
