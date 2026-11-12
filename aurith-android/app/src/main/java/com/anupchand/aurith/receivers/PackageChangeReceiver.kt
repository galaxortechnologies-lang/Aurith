package com.anupchand.aurith.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.anupchand.aurith.data.db.AppActivityEntity
import com.anupchand.aurith.data.db.AppDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Monitors package changes (install/uninstall/update) observed after AURITH starts.
 * Developer: Anup Chand
 */
class PackageChangeReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val packageName = intent.data?.schemeSpecificPart ?: return
        val action = intent.action ?: return

        val eventType = when (action) {
            Intent.ACTION_PACKAGE_ADDED -> "INSTALLED"
            Intent.ACTION_PACKAGE_REMOVED -> "REMOVED"
            Intent.ACTION_PACKAGE_REPLACED -> "UPDATED"
            else -> return
        }

        val pm = context.packageManager
        val appName = try {
            val appInfo = pm.getApplicationInfo(packageName, 0)
            pm.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            packageName
        }

        CoroutineScope(Dispatchers.IO).launch {
            val db = AppDatabase.getInstance(context)
            db.aurithDao().insertAppActivity(
                AppActivityEntity(
                    packageName = packageName,
                    appName = appName,
                    eventType = eventType,
                    timestamp = System.currentTimeMillis()
                )
            )
        }
    }
}
