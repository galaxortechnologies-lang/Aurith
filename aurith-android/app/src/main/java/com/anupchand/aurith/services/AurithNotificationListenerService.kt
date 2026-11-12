package com.anupchand.aurith.services

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

/**
 * Optional Notification Center Listener
 * Reads active notifications safely without collecting sensitive credentials.
 * Developer: Anup Chand
 */
class AurithNotificationListenerService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        sbn ?: return

        val extras = sbn.notification?.extras ?: return
        val title = extras.getString("android.title") ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""
        val packageName = sbn.packageName ?: ""

        // Exclude system sensitive alerts
        if (packageName == "com.anupchand.aurith" || title.isBlank()) return

        // In-memory or database log of incoming notifications
        activeNotificationCache.add(
            NotificationItem(
                id = sbn.id,
                packageName = packageName,
                title = title,
                text = text,
                postTime = sbn.postTime
            )
        )
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        super.onNotificationRemoved(sbn)
        sbn ?: return
        activeNotificationCache.removeAll { it.id == sbn.id && it.packageName == sbn.packageName }
    }

    companion object {
        val activeNotificationCache = mutableListOf<NotificationItem>()

        fun clearCache() {
            activeNotificationCache.clear()
        }
    }
}

data class NotificationItem(
    val id: Int,
    val packageName: String,
    val title: String,
    val text: String,
    val postTime: Long
)
