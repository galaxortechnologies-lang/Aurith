package com.anupchand.aurith.data.device

import android.app.ActivityManager
import android.app.AlarmManager
import android.app.PendingIntent
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.BatteryManager
import android.os.Build
import android.os.Environment
import android.os.StatFs
import android.provider.AlarmClock
import android.provider.MediaStore
import android.provider.Settings
import com.anupchand.aurith.data.db.AppDatabase
import com.anupchand.aurith.data.db.NoteEntity
import com.anupchand.aurith.data.db.ReminderEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

/**
 * Native Android Allowlisted Action Manager
 * Validates, authorizes and executes device commands safely.
 * Developer: Anup Chand
 */
class DeviceActionManager(private val context: Context) {

    private val database = AppDatabase.getInstance(context)

    suspend fun executeAction(toolName: String, args: JSONObject): ToolExecutionResult = withContext(Dispatchers.IO) {
        try {
            when (toolName) {
                // APP CONTROL
                "open_app" -> openApp(args.optString("package_name"), args.optString("app_name"))
                "list_available_apps" -> listAvailableApps()
                "search_app" -> searchApp(args.optString("query"))
                "open_camera" -> openCamera()
                "open_browser" -> openBrowser(args.optString("url", "https://google.com"))
                "open_downloads" -> openDownloads()
                "open_phone_settings" -> openSystemSettings(Settings.ACTION_SETTINGS)
                "open_wifi_settings_page" -> openSystemSettings(Settings.ACTION_WIFI_SETTINGS)
                "open_bluetooth_settings_page" -> openSystemSettings(Settings.ACTION_BLUETOOTH_SETTINGS)
                "open_display_settings_page" -> openSystemSettings(Settings.ACTION_DISPLAY_SETTINGS)
                "open_sound_settings_page" -> openSystemSettings(Settings.ACTION_SOUND_SETTINGS)

                // DEVICE INFORMATION
                "get_battery_info" -> getBatteryInfo()
                "get_charging_status" -> getChargingStatus()
                "get_storage_info" -> getStorageInfo()
                "get_ram_info" -> getRamInfo()
                "get_android_version" -> getAndroidVersion()
                "get_device_information" -> getDeviceInformation()
                "get_network_status" -> getNetworkStatus()
                "get_current_time" -> getCurrentTime()
                "get_current_date" -> getCurrentDate()
                "get_available_sensors" -> getAvailableSensors()

                // APP USAGE
                "get_app_usage_summary", "get_app_usage_for_today" -> getAppUsageToday()
                "get_top_used_apps" -> getTopUsedApps(args.optInt("limit", 5))
                "get_app_usage_for_selected_period" -> getAppUsagePeriod(args.optInt("days", 7))

                // FILES
                "list_accessible_downloads" -> listAccessibleDownloads()
                "search_accessible_files" -> searchAccessibleFiles(args.optString("query"))
                "get_file_information" -> getFileInformation(args.optString("file_path"))
                "open_file" -> openFile(args.optString("file_path"))
                "delete_user_selected_file" -> deleteFile(args.optString("file_path"))

                // NOTES & REMINDERS
                "create_note" -> createNote(args.optString("title"), args.optString("content"))
                "read_saved_notes" -> readSavedNotes()
                "update_note" -> updateNote(args.optLong("note_id"), args.optString("title"), args.optString("content"))
                "delete_note" -> deleteNote(args.optLong("note_id"))
                "create_reminder" -> createReminder(args.optString("title"), args.optLong("trigger_time"))
                "set_alarm" -> setAlarm(args.optInt("hour"), args.optInt("minute"), args.optString("message", "AURITH Alarm"))

                else -> ToolExecutionResult(false, "Unknown or unpermitted action: $toolName")
            }
        } catch (e: Exception) {
            ToolExecutionResult(false, "Action failed: ${e.localizedMessage}")
        }
    }

    // --- Implementation Details ---

    private fun openApp(packageName: String?, appName: String?): ToolExecutionResult {
        val pm = context.packageManager
        var targetPackage = if (!packageName.isNullOrBlank()) packageName else null

        if (targetPackage == null && !appName.isNullOrBlank()) {
            // Common well-known package mapping for fast voice resolution
            val knownPackages = mapOf(
                "whatsapp" to "com.whatsapp",
                "youtube" to "com.google.android.youtube",
                "camera" to "com.android.camera",
                "chrome" to "com.android.chrome",
                "browser" to "com.android.chrome",
                "settings" to "com.android.settings",
                "clock" to "com.google.android.deskclock",
                "alarm" to "com.google.android.deskclock",
                "calculator" to "com.google.android.calculator",
                "maps" to "com.google.android.apps.maps",
                "instagram" to "com.instagram.android",
                "spotify" to "com.spotify.music",
                "gmail" to "com.google.android.gm",
                "telegram" to "org.telegram.messenger",
                "photos" to "com.google.android.apps.photos",
                "gallery" to "com.google.android.apps.photos",
                "files" to "com.google.android.documentsui",
                "messages" to "com.google.android.apps.messaging",
                "phone" to "com.google.android.dialer"
            )

            val queryLower = appName.trim().lowercase()
            for ((key, pkg) in knownPackages) {
                if (queryLower.contains(key)) {
                    if (isPackageInstalled(pm, pkg)) {
                        targetPackage = pkg
                        break
                    }
                }
            }

            // Fallback: Query all launchable intent activities
            if (targetPackage == null) {
                val launcherIntent = Intent(Intent.ACTION_MAIN, null).apply { addCategory(Intent.CATEGORY_LAUNCHER) }
                val launchables = pm.queryIntentActivities(launcherIntent, 0)
                val matched = launchables.firstOrNull {
                    val label = it.loadLabel(pm).toString()
                    label.equals(appName, ignoreCase = true) || label.contains(appName, ignoreCase = true)
                }
                targetPackage = matched?.activityInfo?.packageName
            }
        }

        if (targetPackage == null) {
            return ToolExecutionResult(false, "App '$appName' ($packageName) not found or not launchable on device.")
        }

        val launchIntent = pm.getLaunchIntentForPackage(targetPackage)
            ?: return ToolExecutionResult(false, "Cannot launch '$targetPackage'. Launch intent is not exposed.")

        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(launchIntent)
        return ToolExecutionResult(true, "Successfully launched $targetPackage")
    }

    private fun isPackageInstalled(pm: PackageManager, packageName: String): Boolean {
        return try {
            pm.getPackageInfo(packageName, 0)
            true
        } catch (e: Exception) {
            false
        }
    }

    private fun listAvailableApps(): ToolExecutionResult {
        val pm = context.packageManager
        val intent = Intent(Intent.ACTION_MAIN, null).apply { addCategory(Intent.CATEGORY_LAUNCHER) }
        val resolveInfos = pm.queryIntentActivities(intent, 0)
        val array = JSONArray()
        for (info in resolveInfos.take(30)) {
            val appObj = JSONObject().apply {
                put("name", info.loadLabel(pm).toString())
                put("packageName", info.activityInfo.packageName)
            }
            array.put(appObj)
        }
        return ToolExecutionResult(true, "Found ${resolveInfos.size} launchable apps.", array.toString())
    }

    private fun searchApp(query: String): ToolExecutionResult {
        val pm = context.packageManager
        val intent = Intent(Intent.ACTION_MAIN, null).apply { addCategory(Intent.CATEGORY_LAUNCHER) }
        val resolveInfos = pm.queryIntentActivities(intent, 0)
        val matched = resolveInfos.filter {
            val name = it.loadLabel(pm).toString()
            name.contains(query, ignoreCase = true) || it.activityInfo.packageName.contains(query, ignoreCase = true)
        }
        val array = JSONArray()
        matched.forEach {
            array.put(JSONObject().apply {
                put("name", it.loadLabel(pm).toString())
                put("packageName", it.activityInfo.packageName)
            })
        }
        return ToolExecutionResult(true, "Found ${matched.size} apps matching '$query'", array.toString())
    }

    private fun openCamera(): ToolExecutionResult {
        val intent = Intent(MediaStore.INTENT_ACTION_STILL_IMAGE_CAMERA).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
        return ToolExecutionResult(true, "Opened native camera")
    }

    private fun openBrowser(url: String): ToolExecutionResult {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
        return ToolExecutionResult(true, "Opened browser to $url")
    }

    private fun openDownloads(): ToolExecutionResult {
        val intent = Intent(android.app.DownloadManager.ACTION_VIEW_DOWNLOADS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
        return ToolExecutionResult(true, "Opened native downloads manager")
    }

    private fun openSystemSettings(action: String): ToolExecutionResult {
        val intent = Intent(action).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
        return ToolExecutionResult(true, "Opened system settings: $action")
    }

    private fun getBatteryInfo(): ToolExecutionResult {
        val bm = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val level = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        val isCharging = bm.isCharging

        val intentFilter = android.content.IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        val batteryStatus = context.registerReceiver(null, intentFilter)
        val tempTenths = batteryStatus?.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 314) ?: 314
        val tempCelsius = tempTenths / 10.0
        val healthInt = batteryStatus?.getIntExtra(BatteryManager.EXTRA_HEALTH, BatteryManager.BATTERY_HEALTH_GOOD) ?: BatteryManager.BATTERY_HEALTH_GOOD
        val healthString = when (healthInt) {
            BatteryManager.BATTERY_HEALTH_GOOD -> "Good"
            BatteryManager.BATTERY_HEALTH_OVERHEAT -> "Overheat"
            BatteryManager.BATTERY_HEALTH_DEAD -> "Dead"
            BatteryManager.BATTERY_HEALTH_OVER_VOLTAGE -> "Over Voltage"
            else -> "Normal"
        }
        val voltageMv = batteryStatus?.getIntExtra(BatteryManager.EXTRA_VOLTAGE, 0) ?: 0

        val result = JSONObject().apply {
            put("battery_percentage", level)
            put("is_charging", isCharging)
            put("temperature_celsius", tempCelsius)
            put("health", healthString)
            put("voltage_mv", voltageMv)
        }
        return ToolExecutionResult(true, "Battery is at $level% (Charging: $isCharging, Temp: ${tempCelsius}°C)", result.toString())
    }

    private fun getChargingStatus(): ToolExecutionResult {
        val bm = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val isCharging = bm.isCharging
        return ToolExecutionResult(true, if (isCharging) "Device is currently charging" else "Device is discharging")
    }

    private fun getStorageInfo(): ToolExecutionResult {
        val path = Environment.getDataDirectory()
        val stat = StatFs(path.path)
        val blockSize = stat.blockSizeLong
        val totalBlocks = stat.blockCountLong
        val availableBlocks = stat.availableBlocksLong

        val totalBytes = totalBlocks * blockSize
        val availableBytes = availableBlocks * blockSize
        val usedBytes = totalBytes - availableBytes

        val json = JSONObject().apply {
            put("total_gb", String.format(Locale.US, "%.1f GB", totalBytes / (1024.0 * 1024 * 1024)))
            put("available_gb", String.format(Locale.US, "%.1f GB", availableBytes / (1024.0 * 1024 * 1024)))
            put("used_gb", String.format(Locale.US, "%.1f GB", usedBytes / (1024.0 * 1024 * 1024)))
            put("percent_free", (availableBytes.toDouble() / totalBytes * 100).toInt())
        }
        return ToolExecutionResult(true, "Storage stats retrieved", json.toString())
    }

    private fun getRamInfo(): ToolExecutionResult {
        val actManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        actManager.getMemoryInfo(memInfo)

        val totalGb = memInfo.totalMem / (1024.0 * 1024 * 1024)
        val availGb = memInfo.availMem / (1024.0 * 1024 * 1024)
        val json = JSONObject().apply {
            put("total_ram_gb", String.format(Locale.US, "%.1f GB", totalGb))
            put("available_ram_gb", String.format(Locale.US, "%.1f GB", availGb))
            put("low_memory", memInfo.lowMemory)
        }
        return ToolExecutionResult(true, "RAM information retrieved", json.toString())
    }

    private fun getAndroidVersion(): ToolExecutionResult {
        val json = JSONObject().apply {
            put("os", "Android")
            put("release", Build.VERSION.RELEASE)
            put("sdk_int", Build.VERSION.SDK_INT)
            put("security_patch", Build.VERSION.SECURITY_PATCH)
        }
        return ToolExecutionResult(true, "Android version: ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})", json.toString())
    }

    private fun getDeviceInformation(): ToolExecutionResult {
        val json = JSONObject().apply {
            put("manufacturer", Build.MANUFACTURER.replaceFirstChar { it.uppercase() })
            put("model", Build.MODEL)
            put("device", Build.DEVICE)
            put("hardware", Build.HARDWARE)
            put("board", Build.BOARD)
        }
        return ToolExecutionResult(true, "Device: ${Build.MANUFACTURER} ${Build.MODEL}", json.toString())
    }

    private fun getNetworkStatus(): ToolExecutionResult {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val activeNet = cm.activeNetwork
        val caps = cm.getNetworkCapabilities(activeNet)
        val isWifi = caps?.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) == true
        val isCellular = caps?.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) == true
        val isConnected = caps?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true

        val json = JSONObject().apply {
            put("is_connected", isConnected)
            put("type", if (isWifi) "WiFi" else if (isCellular) "Cellular (5G/4G)" else "None")
        }
        return ToolExecutionResult(true, "Network is connected: $isConnected (${if (isWifi) "WiFi" else "Mobile Data"})", json.toString())
    }

    private fun getCurrentTime(): ToolExecutionResult {
        val time = SimpleDateFormat("hh:mm:ss a z", Locale.getDefault()).format(Date())
        return ToolExecutionResult(true, "Current local time: $time")
    }

    private fun getCurrentDate(): ToolExecutionResult {
        val date = SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.getDefault()).format(Date())
        return ToolExecutionResult(true, "Current date: $date")
    }

    private fun getAvailableSensors(): ToolExecutionResult {
        val sm = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val sensorList = sm.getSensorList(Sensor.TYPE_ALL)
        val array = JSONArray()
        sensorList.take(20).forEach {
            array.put(JSONObject().apply {
                put("name", it.name)
                put("type", it.stringType)
                put("vendor", it.vendor)
            })
        }
        return ToolExecutionResult(true, "Retrieved ${sensorList.size} hardware sensors", array.toString())
    }

    // App Usage
    private fun getAppUsageToday(): ToolExecutionResult {
        val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            ?: return ToolExecutionResult(false, "UsageStatsManager unavailable")
        val cal = Calendar.getInstance()
        val endTime = cal.timeInMillis
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        val startTime = cal.timeInMillis

        val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime)
        if (stats.isNullOrEmpty()) {
            return ToolExecutionResult(false, "Usage Access permission has not been granted in Android Settings.")
        }

        val sorted = stats.filter { it.totalTimeInForeground > 60_000 }.sortedByDescending { it.totalTimeInForeground }
        val array = JSONArray()
        val pm = context.packageManager
        sorted.take(8).forEach { stat ->
            val appLabel = try {
                val appInfo = pm.getApplicationInfo(stat.packageName, 0)
                pm.getApplicationLabel(appInfo).toString()
            } catch (e: Exception) {
                stat.packageName
            }
            array.put(JSONObject().apply {
                put("app_name", appLabel)
                put("package", stat.packageName)
                put("minutes", stat.totalTimeInForeground / (1000 * 60))
            })
        }
        return ToolExecutionResult(true, "Retrieved today's app usage stats", array.toString())
    }

    private fun getTopUsedApps(limit: Int): ToolExecutionResult {
        return getAppUsageToday()
    }

    private fun getAppUsagePeriod(days: Int): ToolExecutionResult {
        val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            ?: return ToolExecutionResult(false, "UsageStatsManager unavailable")
        val endTime = System.currentTimeMillis()
        val startTime = endTime - (days.toLong() * 24 * 60 * 60 * 1000)
        val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_WEEKLY, startTime, endTime)
        if (stats.isNullOrEmpty()) {
            return ToolExecutionResult(false, "Usage Access required in Android Settings.")
        }
        return ToolExecutionResult(true, "Retrieved $days-day usage stats.")
    }

    // Files
    private fun listAccessibleDownloads(): ToolExecutionResult {
        val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        val files = downloadsDir.listFiles() ?: emptyArray()
        val array = JSONArray()
        files.take(25).forEach { f ->
            array.put(JSONObject().apply {
                put("name", f.name)
                put("size_kb", f.length() / 1024)
                put("last_modified", SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date(f.lastModified())))
            })
        }
        return ToolExecutionResult(true, "Found ${files.size} downloaded files.", array.toString())
    }

    private fun searchAccessibleFiles(query: String): ToolExecutionResult {
        val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        val matched = downloadsDir.listFiles()?.filter { it.name.contains(query, ignoreCase = true) } ?: emptyList()
        val array = JSONArray()
        matched.forEach { f ->
            array.put(JSONObject().apply {
                put("name", f.name)
                put("path", f.absolutePath)
                put("size_bytes", f.length())
            })
        }
        return ToolExecutionResult(true, "Found ${matched.size} matching files for '$query'", array.toString())
    }

    private fun getFileInformation(filePath: String): ToolExecutionResult {
        val file = File(filePath)
        if (!file.exists()) return ToolExecutionResult(false, "File does not exist: $filePath")
        val json = JSONObject().apply {
            put("name", file.name)
            put("size_bytes", file.length())
            put("is_file", file.isFile)
            put("can_read", file.canRead())
            put("modified", file.lastModified())
        }
        return ToolExecutionResult(true, "File details for ${file.name}", json.toString())
    }

    private fun openFile(filePath: String): ToolExecutionResult {
        val file = File(filePath)
        if (!file.exists()) return ToolExecutionResult(false, "File not found: $filePath")
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(Uri.fromFile(file), "*/*")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(intent)
        return ToolExecutionResult(true, "Opened file: ${file.name}")
    }

    private fun deleteFile(filePath: String): ToolExecutionResult {
        val file = File(filePath)
        if (!file.exists()) return ToolExecutionResult(false, "File does not exist")
        val deleted = file.delete()
        return if (deleted) {
            ToolExecutionResult(true, "Successfully deleted file: ${file.name}")
        } else {
            ToolExecutionResult(false, "Unable to delete file. Storage permissions may restrict deletion.")
        }
    }

    // Notes
    private suspend fun createNote(title: String, content: String): ToolExecutionResult {
        val note = NoteEntity(title = title.ifBlank { "Untitled Note" }, content = content)
        val id = database.aurithDao().insertNote(note)
        return ToolExecutionResult(true, "Note saved with ID #$id: '$title'")
    }

    private suspend fun readSavedNotes(): ToolExecutionResult {
        val notes = database.aurithDao().getAllNotes().first()
        val array = JSONArray()
        notes.forEach { n ->
            array.put(JSONObject().apply {
                put("id", n.id)
                put("title", n.title)
                put("content", n.content)
            })
        }
        return ToolExecutionResult(true, "Retrieved ${notes.size} saved notes", array.toString())
    }

    private suspend fun updateNote(id: Long, title: String, content: String): ToolExecutionResult {
        database.aurithDao().updateNote(NoteEntity(id = id, title = title, content = content))
        return ToolExecutionResult(true, "Updated note #$id")
    }

    private suspend fun deleteNote(id: Long): ToolExecutionResult {
        database.aurithDao().deleteNote(NoteEntity(id = id, title = "", content = ""))
        return ToolExecutionResult(true, "Deleted note #$id")
    }

    private suspend fun createReminder(title: String, triggerTime: Long): ToolExecutionResult {
        val time = if (triggerTime <= System.currentTimeMillis()) System.currentTimeMillis() + 3600_000 else triggerTime
        val id = database.aurithDao().insertReminder(ReminderEntity(title = title, triggerTime = time))
        return ToolExecutionResult(true, "Created reminder '$title' for ID #$id")
    }

    private fun setAlarm(hour: Int, minute: Int, message: String): ToolExecutionResult {
        val intent = Intent(AlarmClock.ACTION_SET_ALARM).apply {
            putExtra(AlarmClock.EXTRA_HOUR, hour)
            putExtra(AlarmClock.EXTRA_MINUTES, minute)
            putExtra(AlarmClock.EXTRA_MESSAGE, message)
            putExtra(AlarmClock.EXTRA_SKIP_UI, false)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
        return ToolExecutionResult(true, "Triggered native clock alarm for $hour:$minute with message: '$message'")
    }
}

data class ToolExecutionResult(
    val success: Boolean,
    val message: String,
    val payloadJson: String? = null
)
