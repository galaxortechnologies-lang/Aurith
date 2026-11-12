package com.anupchand.aurith

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.*
import com.anupchand.aurith.ui.navigation.Screen
import com.anupchand.aurith.ui.screens.*
import com.anupchand.aurith.ui.theme.*

/**
 * Single Activity Jetpack Compose Architecture
 * Developer: Anup Chand
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AurithTheme {
                MainScreenContent()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreenContent() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Home.route

    val showBottomBar = currentRoute in listOf(
        Screen.Home.route,
        Screen.Chat.route,
        Screen.Apps.route,
        Screen.Device.route,
        Screen.Settings.route
    )

    Scaffold(
        containerColor = AurithBackground,
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = AurithSurface,
                    tonalElevation = 8.dp
                ) {
                    val items = listOf(
                        Triple(Screen.Home, "Home", Icons.Default.Home),
                        Triple(Screen.Chat, "Chat", Icons.Default.ChatBubbleOutline),
                        Triple(Screen.Apps, "Apps", Icons.Default.Apps),
                        Triple(Screen.Device, "Device", Icons.Default.Smartphone),
                        Triple(Screen.Settings, "Settings", Icons.Default.Settings)
                    )

                    items.forEach { (screen, label, icon) ->
                        val selected = currentRoute == screen.route
                        NavigationBarItem(
                            icon = { Icon(icon, contentDescription = label) },
                            label = { Text(label) },
                            selected = selected,
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = AurithBackground,
                                selectedTextColor = AurithCyan,
                                indicatorColor = AurithCyan,
                                unselectedIconColor = AurithTextMuted,
                                unselectedTextColor = AurithTextMuted
                            ),
                            onClick = {
                                if (currentRoute != screen.route) {
                                    navController.navigate(screen.route) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            composable(Screen.Splash.route) { SplashScreen(navController) }
            composable(Screen.Home.route) { HomeScreen(navController) }
            composable(Screen.Chat.route) { ChatScreen(navController) }
            composable(Screen.Voice.route) { LiveVoiceScreen(navController) }
            composable(Screen.Apps.route) { AppsScreen(navController) }
            composable(Screen.Device.route) { DeviceScreen(navController) }
            composable(Screen.Downloads.route) { DownloadsScreen(navController) }
            composable(Screen.AppActivity.route) { AppActivityScreen(navController) }
            composable(Screen.AppUsage.route) { AppUsageScreen(navController) }
            composable(Screen.Notifications.route) { NotificationCenterScreen(navController) }
            composable(Screen.Notes.route) { NotesScreen(navController) }
            composable(Screen.Reminders.route) { RemindersScreen(navController) }
            composable(Screen.Memory.route) { MemoryScreen(navController) }
            composable(Screen.ApiConfig.route) { ApiConfigScreen(navController) }
            composable(Screen.Permissions.route) { PermissionsScreen(navController) }
            composable(Screen.PrivacySecurity.route) { PrivacySecurityScreen(navController) }
            composable(Screen.Settings.route) { SettingsScreen(navController) }
            composable(Screen.About.route) { AboutScreen(navController) }
        }
    }
}
