package com.anupchand.aurith.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Splash : Screen("splash", "AURITH")
    object Home : Screen("home", "AURITH Command Center")
    object Chat : Screen("chat", "AI Assistant")
    object Voice : Screen("voice", "Live Voice Assistant")
    object Apps : Screen("apps", "App Launcher")
    object Device : Screen("device", "Device Dashboard")
    object Downloads : Screen("downloads", "Downloads Manager")
    object AppActivity : Screen("app_activity", "App Activity History")
    object AppUsage : Screen("app_usage", "App Usage Intelligence")
    object Notifications : Screen("notifications", "Notification Center")
    object Notes : Screen("notes", "Smart Notes")
    object Reminders : Screen("reminders", "Reminders & Alarms")
    object Memory : Screen("memory", "Memory Center")
    object ApiConfig : Screen("api_config", "API Configuration")
    object Permissions : Screen("permissions", "Permissions Center")
    object PrivacySecurity : Screen("privacy_security", "Privacy & Safety")
    object Settings : Screen("settings", "Settings")
    object About : Screen("about", "About AURITH")

    companion object {
        val bottomNavItems = listOf(Home, Chat, Apps, Device, Settings)
    }
}
