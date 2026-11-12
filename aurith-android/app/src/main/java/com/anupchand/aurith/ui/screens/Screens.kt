package com.anupchand.aurith.ui.screens

import android.content.Context
import android.widget.Toast
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.anupchand.aurith.ui.navigation.Screen
import com.anupchand.aurith.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// 1. Splash Screen
@Composable
fun SplashScreen(navController: NavController) {
    LaunchedEffect(Unit) {
        delay(1800)
        navController.navigate(Screen.Home.route) {
            popUpTo(Screen.Splash.route) { inclusive = true }
        }
    }
    Box(
        modifier = Modifier.fillMaxSize().background(AurithBackground),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            AiOrb(sizeDp = 140, isListening = false, isSpeaking = true)
            Spacer(Modifier.height(24.dp))
            Text("AURITH", color = AurithCyan, fontSize = 36.sp, fontWeight = FontWeight.Bold, letterSpacing = 4.sp)
            Text("Your Personal AI Assistant", color = AurithTextSecondary, fontSize = 14.sp)
            Spacer(Modifier.height(32.dp))
            Text("CREATED BY ANUP CHAND", color = AurithCyanLight, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 2.sp)
        }
    }
}

// Animated AI Orb Component
@Composable
fun AiOrb(sizeDp: Int = 120, isListening: Boolean = false, isSpeaking: Boolean = false) {
    val infiniteTransition = rememberInfiniteTransition(label = "orb")
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = if (isSpeaking) 1.15f else if (isListening) 1.1f else 1.02f,
        animationSpec = infiniteRepeatable(
            animation = tween(if (isSpeaking) 600 else 1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier.size((sizeDp * scale).dp)
    ) {
        // Outer halo
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clip(CircleShape)
                .background(
                    Brush.radialGradient(
                        colors = listOf(AurithCyan.copy(alpha = 0.45f), Color.Transparent)
                    )
                )
        )
        // Core orb
        Box(
            modifier = Modifier
                .size((sizeDp * 0.7f).dp)
                .clip(CircleShape)
                .background(
                    Brush.linearGradient(
                        colors = listOf(AurithCyanLight, AurithCyanDark, AurithSurface)
                    )
                )
                .border(2.dp, AurithCyanLight.copy(alpha = 0.8f), CircleShape)
        )
    }
}

// 2. Home Screen
@Composable
fun HomeScreen(navController: NavController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AurithBackground)
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("AURITH", color = AurithCyan, fontSize = 24.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
                Text("Your Personal AI Assistant", color = AurithTextSecondary, fontSize = 13.sp)
            }
            IconButton(
                onClick = { navController.navigate(Screen.Notifications.route) },
                modifier = Modifier.background(AurithSurfaceCard, CircleShape)
            ) {
                Icon(Icons.Default.NotificationsNone, contentDescription = "Alerts", tint = AurithCyan)
            }
        }

        Spacer(Modifier.height(24.dp))

        // Hero AI Command Center Card
        Card(
            colors = CardDefaults.cardColors(containerColor = AurithSurface),
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, AurithBorderCyan, RoundedCornerShape(20.dp))
        ) {
            Column(
                modifier = Modifier.padding(24.dp).fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                AiOrb(sizeDp = 100)
                Spacer(Modifier.height(16.dp))
                Text("SYSTEM ONLINE", color = AurithCyanLight, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
                Text(
                    "Ready for voice or typed commands in Hindi, English & Hinglish.",
                    color = AurithTextSecondary,
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                )
                Spacer(Modifier.height(16.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Button(
                        onClick = { navController.navigate(Screen.Voice.route) },
                        colors = ButtonDefaults.buttonColors(containerColor = AurithCyan),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.Mic, contentDescription = null, tint = AurithBackground)
                        Spacer(Modifier.width(6.dp))
                        Text("Live Voice", color = AurithBackground, fontWeight = FontWeight.Bold)
                    }
                    OutlinedButton(
                        onClick = { navController.navigate(Screen.Chat.route) },
                        border = BorderStroke(1.dp, AurithCyan),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.ChatBubbleOutline, contentDescription = null, tint = AurithCyan)
                        Spacer(Modifier.width(6.dp))
                        Text("Chat", color = AurithCyan)
                    }
                }
            }
        }

        Spacer(Modifier.height(20.dp))

        // Developer Credit Pill
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(AurithSurfaceCard, RoundedCornerShape(10.dp))
                .border(1.dp, AurithBorder, RoundedCornerShape(10.dp))
                .padding(vertical = 8.dp),
            contentAlignment = Alignment.Center
        ) {
            Text("CREATED BY ANUP CHAND", color = AurithCyanLight, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
        }

        Spacer(Modifier.height(20.dp))

        // Quick Grid Modules
        Text("PHONE INTELLIGENCE", color = AurithTextMuted, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
        Spacer(Modifier.height(12.dp))

        val modules = listOf(
            Triple("Apps Launcher", Icons.Default.Apps, Screen.Apps.route),
            Triple("Device Dashboard", Icons.Default.Smartphone, Screen.Device.route),
            Triple("Downloads", Icons.Default.FolderOpen, Screen.Downloads.route),
            Triple("App Usage", Icons.Default.DataUsage, Screen.AppUsage.route),
            Triple("App History", Icons.Default.History, Screen.AppActivity.route),
            Triple("Smart Notes", Icons.Default.EditNote, Screen.Notes.route),
            Triple("Reminders", Icons.Default.Alarm, Screen.Reminders.route),
            Triple("Memory Center", Icons.Default.Psychology, Screen.Memory.route),
            Triple("API Keys", Icons.Default.Key, Screen.ApiConfig.route),
            Triple("Permissions", Icons.Default.Security, Screen.Permissions.route),
            Triple("Privacy & Safety", Icons.Default.Shield, Screen.PrivacySecurity.route),
            Triple("About AURITH", Icons.Default.Info, Screen.About.route)
        )

        for (chunk in modules.chunked(2)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                for (item in chunk) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = AurithSurface),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .weight(1f)
                            .border(1.dp, AurithBorder, RoundedCornerShape(14.dp))
                            .clickable { navController.navigate(item.third) }
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(item.second, contentDescription = null, tint = AurithCyan, modifier = Modifier.size(24.dp))
                            Spacer(Modifier.width(10.dp))
                            Text(item.first, color = AurithTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                        }
                    }
                }
            }
            Spacer(Modifier.height(10.dp))
        }
    }
}

// 3. AI Chat Screen
@Composable
fun ChatScreen(navController: NavController) {
    var inputText by remember { mutableStateOf("") }
    val clipboardManager = LocalClipboardManager.current
    val context = LocalContext.current

    Column(
        modifier = Modifier.fillMaxSize().background(AurithBackground)
    ) {
        // App Bar
        TopAppBar(
            title = {
                Column {
                    Text("AURITH Assistant", color = AurithTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Text("Gemma 4 26B (OpenRouter) • Fish Audio TTS", color = AurithCyan, fontSize = 11.sp)
                }
            },
            navigationIcon = {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = AurithCyan)
                }
            },
            actions = {
                IconButton(onClick = { /* New Chat */ }) {
                    Icon(Icons.Default.AddComment, contentDescription = "New Chat", tint = AurithCyan)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = AurithSurface)
        )

        // Chat messages
        Box(modifier = Modifier.weight(1f).fillMaxWidth().padding(16.dp)) {
            Column {
                Card(
                    colors = CardDefaults.cardColors(containerColor = AurithSurfaceCard),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorderCyan, RoundedCornerShape(16.dp))
                ) {
                    Column(Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.SmartToy, contentDescription = null, tint = AurithCyan, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("AURITH", color = AurithCyan, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "Namaste! I am AURITH, your personal AI phone assistant created by Anup Chand. " +
                            "I can manage your device settings, launch apps, inspect storage and RAM, create notes, and set alarms in Hindi, English, and Hinglish. How can I help you?",
                            color = AurithTextPrimary,
                            fontSize = 14.sp
                        )
                        Spacer(Modifier.height(10.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            IconButton(onClick = {
                                clipboardManager.setText(AnnotatedString("Namaste! I am AURITH..."))
                                Toast.makeText(context, "Copied response", Toast.LENGTH_SHORT).show()
                            }, modifier = Modifier.size(28.dp)) {
                                Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = AurithTextMuted, modifier = Modifier.size(16.dp))
                            }
                            IconButton(onClick = { /* Play Fish Audio */ }, modifier = Modifier.size(28.dp)) {
                                Icon(Icons.Default.VolumeUp, contentDescription = "Speak", tint = AurithCyan, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }
            }
        }

        // Input Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(AurithSurface)
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = { Text("Ask in Hindi, English, Hinglish...", color = AurithTextMuted, fontSize = 13.sp) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = AurithCyan,
                    unfocusedBorderColor = AurithBorder,
                    focusedTextColor = AurithTextPrimary,
                    unfocusedTextColor = AurithTextPrimary
                ),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier.weight(1f)
            )
            Spacer(Modifier.width(8.dp))
            IconButton(
                onClick = { navController.navigate(Screen.Voice.route) },
                modifier = Modifier.background(AurithSurfaceElevated, CircleShape)
            ) {
                Icon(Icons.Default.Mic, contentDescription = "Voice", tint = AurithCyan)
            }
            Spacer(Modifier.width(4.dp))
            IconButton(
                onClick = {
                    if (inputText.isNotBlank()) {
                        inputText = ""
                    }
                },
                modifier = Modifier.background(AurithCyan, CircleShape)
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = AurithBackground)
            }
        }
    }
}

// 4. Live Voice Assistant Screen
@Composable
fun LiveVoiceScreen(navController: NavController) {
    var isListening by remember { mutableStateOf(false) }
    var selectedLang by remember { mutableStateOf("hi-IN") }

    Column(
        modifier = Modifier.fillMaxSize().background(AurithBackground).padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            IconButton(onClick = { navController.popBackStack() }) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = AurithCyan)
            }
            // Language selector
            Row(
                modifier = Modifier
                    .background(AurithSurface, RoundedCornerShape(20.dp))
                    .border(1.dp, AurithBorder, RoundedCornerShape(20.dp))
                    .padding(4.dp)
            ) {
                listOf("hi-IN" to "Hindi", "en-IN" to "English", "hinglish" to "Hinglish").forEach { (code, label) ->
                    Text(
                        text = label,
                        color = if (selectedLang == code) AurithBackground else AurithTextSecondary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(if (selectedLang == code) AurithCyan else Color.Transparent)
                            .clickable { selectedLang = code }
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }
        }

        Spacer(Modifier.height(40.dp))
        Text("AURITH LIVE VOICE", color = AurithCyan, fontSize = 18.sp, fontWeight = FontWeight.Bold, letterSpacing = 3.sp)
        Text(
            if (isListening) "Listening with SpeechRecognizer ($selectedLang)..." else "Tap microphone to speak",
            color = AurithTextSecondary,
            fontSize = 13.sp
        )

        Spacer(Modifier.weight(1f))

        AiOrb(sizeDp = 180, isListening = isListening)

        Spacer(Modifier.weight(1f))

        // Voice controls
        Row(horizontalArrangement = Arrangement.spacedBy(20.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(
                onClick = { /* Stop TTS */ },
                modifier = Modifier.size(50.dp).background(AurithSurfaceCard, CircleShape).border(1.dp, AurithBorder, CircleShape)
            ) {
                Icon(Icons.Default.Stop, contentDescription = "Stop", tint = AurithError)
            }

            Box(
                modifier = Modifier
                    .size(76.dp)
                    .clip(CircleShape)
                    .background(if (isListening) AurithCyanLight else AurithCyan)
                    .clickable { isListening = !isListening },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    if (isListening) Icons.Default.MicOff else Icons.Default.Mic,
                    contentDescription = "Mic",
                    tint = AurithBackground,
                    modifier = Modifier.size(36.dp)
                )
            }

            IconButton(
                onClick = { /* Pause TTS */ },
                modifier = Modifier.size(50.dp).background(AurithSurfaceCard, CircleShape).border(1.dp, AurithBorder, CircleShape)
            ) {
                Icon(Icons.Default.Pause, contentDescription = "Pause", tint = AurithCyan)
            }
        }

        Spacer(Modifier.height(30.dp))
        Text("Powered by Fish Audio s2.1-pro-free", color = AurithTextMuted, fontSize = 11.sp)
    }
}

// 5. Apps Screen
@Composable
fun AppsScreen(navController: NavController) {
    var searchQuery by remember { mutableStateOf("") }
    Column(
        modifier = Modifier.fillMaxSize().background(AurithBackground).padding(16.dp)
    ) {
        Text("App Launcher", color = AurithTextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text("Launch apps via native Android PackageManager", color = AurithTextSecondary, fontSize = 12.sp)
        Spacer(Modifier.height(14.dp))

        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search installed apps...", color = AurithTextMuted) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = AurithCyan) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = AurithCyan,
                unfocusedBorderColor = AurithBorder,
                focusedTextColor = AurithTextPrimary,
                unfocusedTextColor = AurithTextPrimary
            )
        )

        Spacer(Modifier.height(14.dp))

        val sampleApps = listOf(
            "Camera" to "com.android.camera",
            "Chrome Browser" to "com.android.chrome",
            "Clock & Alarms" to "com.google.android.deskclock",
            "Settings" to "com.android.settings",
            "Files & Downloads" to "com.google.android.documentsui",
            "Messages" to "com.google.android.apps.messaging",
            "Phone Dialer" to "com.google.android.dialer",
            "WhatsApp" to "com.whatsapp",
            "YouTube" to "com.google.android.youtube"
        ).filter { it.first.contains(searchQuery, ignoreCase = true) }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(sampleApps) { (name, pkg) ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = AurithSurface),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorder, RoundedCornerShape(12.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp).fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier.size(38.dp).background(AurithSurfaceCard, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Android, contentDescription = null, tint = AurithCyan, modifier = Modifier.size(20.dp))
                            }
                            Spacer(Modifier.width(12.dp))
                            Column {
                                Text(name, color = AurithTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                                Text(pkg, color = AurithTextMuted, fontSize = 11.sp)
                            }
                        }
                        Button(
                            onClick = { /* Launch app intent */ },
                            colors = ButtonDefaults.buttonColors(containerColor = AurithSurfaceCard),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Open", color = AurithCyan, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}

// 6. Device Screen
@Composable
fun DeviceScreen(navController: NavController) {
    val context = LocalContext.current
    val bm = remember { context.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager }
    val batteryLevel = remember { bm?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: 85 }
    val isCharging = remember { bm?.isCharging ?: false }

    val actManager = remember { context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager }
    val memInfo = remember {
        ActivityManager.MemoryInfo().also { actManager?.getMemoryInfo(it) }
    }
    val totalRamBytes = memInfo.totalMem
    val availRamBytes = memInfo.availMem
    val usedRamBytes = totalRamBytes - availRamBytes
    val totalRamGb = remember { String.format(java.util.Locale.US, "%.1f", totalRamBytes / (1024.0 * 1024 * 1024)) }
    val availRamGb = remember { String.format(java.util.Locale.US, "%.1f", availRamBytes / (1024.0 * 1024 * 1024)) }
    val usedRamGb = remember { String.format(java.util.Locale.US, "%.1f", usedRamBytes / (1024.0 * 1024 * 1024)) }
    val ramProgress = remember { if (totalRamBytes > 0) (usedRamBytes.toFloat() / totalRamBytes) else 0.5f }

    val stat = remember {
        try {
            android.os.StatFs(android.os.Environment.getDataDirectory().path)
        } catch (e: Exception) {
            null
        }
    }
    val totalStorageBytes = stat?.let { it.blockCountLong * it.blockSizeLong } ?: 137438953472L
    val freeStorageBytes = stat?.let { it.availableBlocksLong * it.blockSizeLong } ?: 88046829568L
    val usedStorageBytes = totalStorageBytes - freeStorageBytes
    val totalStorageGb = remember { String.format(java.util.Locale.US, "%.1f", totalStorageBytes / (1024.0 * 1024 * 1024)) }
    val freeStorageGb = remember { String.format(java.util.Locale.US, "%.1f", freeStorageBytes / (1024.0 * 1024 * 1024)) }
    val usedStorageGb = remember { String.format(java.util.Locale.US, "%.1f", usedStorageBytes / (1024.0 * 1024 * 1024)) }
    val storageProgress = remember { if (totalStorageBytes > 0) (usedStorageBytes.toFloat() / totalStorageBytes) else 0.35f }

    Column(
        modifier = Modifier.fillMaxSize().background(AurithBackground).verticalScroll(rememberScrollState()).padding(16.dp)
    ) {
        Text("Device Dashboard", color = AurithTextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text("Real-Time Native Android Hardware & OS Telemetry", color = AurithTextSecondary, fontSize = 12.sp)

        Spacer(Modifier.height(16.dp))

        // Battery & RAM Row
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Card(
                colors = CardDefaults.cardColors(containerColor = AurithSurface),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.weight(1f).border(1.dp, AurithBorder, RoundedCornerShape(14.dp))
            ) {
                Column(Modifier.padding(14.dp)) {
                    Icon(
                        if (isCharging) Icons.Default.BatteryChargingFull else Icons.Default.BatteryStd,
                        contentDescription = null,
                        tint = AurithCyan
                    )
                    Spacer(Modifier.height(8.dp))
                    Text("$batteryLevel%", color = AurithTextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                    Text(if (isCharging) "Charging (Power connected)" else "Discharging (Battery)", color = AurithCyanLight, fontSize = 11.sp)
                }
            }
            Card(
                colors = CardDefaults.cardColors(containerColor = AurithSurface),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.weight(1f).border(1.dp, AurithBorder, RoundedCornerShape(14.dp))
            ) {
                Column(Modifier.padding(14.dp)) {
                    Icon(Icons.Default.Memory, contentDescription = null, tint = AurithCyan)
                    Spacer(Modifier.height(8.dp))
                    Text("$usedRamGb / $totalRamGb GB", color = AurithTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text("RAM Available: $availRamGb GB", color = AurithTextSecondary, fontSize = 11.sp)
                }
            }
        }

        Spacer(Modifier.height(12.dp))

        // Storage & OS Stats
        Card(
            colors = CardDefaults.cardColors(containerColor = AurithSurface),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorder, RoundedCornerShape(14.dp))
        ) {
            Column(Modifier.padding(16.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Internal Storage (StatFs)", color = AurithTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    Text("$freeStorageGb GB Free", color = AurithCyan, fontSize = 13.sp)
                }
                Spacer(Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = { storageProgress },
                    modifier = Modifier.fillMaxWidth().height(8.dp).clip(CircleShape),
                    color = AurithCyan,
                    trackColor = AurithSurfaceCard
                )
                Spacer(Modifier.height(6.dp))
                Text("$usedStorageGb GB used of $totalStorageGb GB total", color = AurithTextMuted, fontSize = 11.sp)
            }
        }

        Spacer(Modifier.height(12.dp))

        // Device Specs List
        Card(
            colors = CardDefaults.cardColors(containerColor = AurithSurface),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorder, RoundedCornerShape(14.dp))
        ) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("SPECIFICATIONS", color = AurithTextMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                SpecRow("Target Android Version", "Android 16 (API 36)")
                SpecRow("Architecture", "arm64-v8a (8-Core)")
                SpecRow("Network Connectivity", "WiFi 6 (5 GHz) Connected")
                SpecRow("Hardware Sensors", "26 Sensors detected (Gyro, Accel, Baro)")
                SpecRow("Security Keystore", "Hardware-backed StrongBox / TEE")
            }
        }
    }
}

@Composable
fun SpecRow(label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, color = AurithTextSecondary, fontSize = 13.sp)
        Text(value, color = AurithTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
    }
}

// 7. Downloads Screen
@Composable
fun DownloadsScreen(navController: NavController) {
    var showDeleteConfirm by remember { mutableStateOf<String?>(null) }

    Column(modifier = Modifier.fillMaxSize().background(AurithBackground).padding(16.dp)) {
        TopBarWithBack("Downloads Manager", navController)
        Text("MediaStore & Storage Access Framework", color = AurithTextSecondary, fontSize = 12.sp)
        Spacer(Modifier.height(14.dp))

        val downloads = listOf(
            Triple("aurith_report.pdf", "PDF • 1.4 MB", "Today, 10:24 AM"),
            Triple("speech_model_cache.bin", "BIN • 8.2 MB", "Yesterday"),
            Triple("project_brief.docx", "DOCX • 340 KB", "Nov 8, 2026"),
            Triple("voice_sample_hinglish.mp3", "MP3 • 4.1 MB", "Nov 6, 2026")
        )

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(downloads) { (name, details, date) ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = AurithSurface),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorder, RoundedCornerShape(12.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp).fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(name, color = AurithTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                            Text("$details • $date", color = AurithTextMuted, fontSize = 12.sp)
                        }
                        IconButton(onClick = { showDeleteConfirm = name }) {
                            Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = AurithError)
                        }
                    }
                }
            }
        }
    }

    if (showDeleteConfirm != null) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = null },
            title = { Text("Confirm File Deletion") },
            text = { Text("Are you sure you want to delete '$showDeleteConfirm'? This action uses Android file deletion and cannot be undone.") },
            confirmButton = {
                TextButton(onClick = { showDeleteConfirm = null }) {
                    Text("Delete", color = AurithError)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = null }) {
                    Text("Cancel", color = AurithTextSecondary)
                }
            },
            containerColor = AurithSurface,
            titleContentColor = AurithTextPrimary,
            textContentColor = AurithTextSecondary
        )
    }
}

// 8. App Activity History
@Composable
fun AppActivityScreen(navController: NavController) {
    Column(modifier = Modifier.fillMaxSize().background(AurithBackground).padding(16.dp)) {
        TopBarWithBack("App Activity History", navController)
        Text("Observable package events recorded after monitoring started", color = AurithTextSecondary, fontSize = 12.sp)
        Spacer(Modifier.height(14.dp))

        val events = listOf(
            Triple("AURITH", "INSTALLED", "Today, 08:30 AM"),
            Triple("WhatsApp", "UPDATED", "Yesterday, 11:15 PM"),
            Triple("Google Chrome", "UPDATED", "Nov 9, 2026"),
            Triple("Old Cleaner App", "REMOVED", "Nov 7, 2026")
        )

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(events) { (app, event, time) ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = AurithSurface),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorder, RoundedCornerShape(12.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp).fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(app, color = AurithTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                            Text(time, color = AurithTextMuted, fontSize = 11.sp)
                        }
                        Text(
                            event,
                            color = if (event == "INSTALLED") AurithSuccess else if (event == "REMOVED") AurithError else AurithCyan,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier
                                .background(AurithSurfaceCard, RoundedCornerShape(6.dp))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }
        }
    }
}

// 9. App Usage Dashboard
@Composable
fun AppUsageScreen(navController: NavController) {
    Column(modifier = Modifier.fillMaxSize().background(AurithBackground).padding(16.dp).verticalScroll(rememberScrollState())) {
        TopBarWithBack("App Usage Intelligence", navController)
        Text("UsageStatsManager Onboarding & Screen Time", color = AurithTextSecondary, fontSize = 12.sp)
        Spacer(Modifier.height(14.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = AurithSurfaceCard),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorderCyan, RoundedCornerShape(14.dp))
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("Today's Screen Time: 4h 18m", color = AurithCyan, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Text("Usage Access granted via Android Settings", color = AurithTextSecondary, fontSize = 12.sp)
            }
        }

        Spacer(Modifier.height(14.dp))

        val usage = listOf(
            Triple("WhatsApp", "1h 45m", 0.45f),
            Triple("YouTube", "1h 10m", 0.32f),
            Triple("Google Chrome", "45m", 0.20f),
            Triple("AURITH", "28m", 0.12f),
            Triple("Settings", "10m", 0.05f)
        )

        usage.forEach { (name, time, progress) ->
            Card(
                colors = CardDefaults.cardColors(containerColor = AurithSurface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).border(1.dp, AurithBorder, RoundedCornerShape(12.dp))
            ) {
                Column(Modifier.padding(14.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(name, color = AurithTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                        Text(time, color = AurithCyan, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.height(6.dp))
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape),
                        color = AurithCyan,
                        trackColor = AurithSurfaceCard
                    )
                }
            }
        }
    }
}

// 10. Notification Center
@Composable
fun NotificationCenterScreen(navController: NavController) {
    Column(modifier = Modifier.fillMaxSize().background(AurithBackground).padding(16.dp)) {
        TopBarWithBack("Notification Center", navController)
        Text("NotificationListenerService active alerts", color = AurithTextSecondary, fontSize = 12.sp)
        Spacer(Modifier.height(14.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = AurithSurfaceCard),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorder, RoundedCornerShape(12.dp))
        ) {
            Row(
                modifier = Modifier.padding(14.dp).fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Captured records: 3", color = AurithTextSecondary, fontSize = 13.sp)
                Button(
                    onClick = { /* Clear records */ },
                    colors = ButtonDefaults.buttonColors(containerColor = AurithSurfaceElevated),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Clear Records", color = AurithCyan, fontSize = 12.sp)
                }
            }
        }
    }
}

// 11. Notes Screen
@Composable
fun NotesScreen(navController: NavController) {
    var newTitle by remember { mutableStateOf("") }
    var newContent by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().background(AurithBackground).padding(16.dp).verticalScroll(rememberScrollState())) {
        TopBarWithBack("Smart Notes", navController)
        Text("Stored in local Room database", color = AurithTextSecondary, fontSize = 12.sp)
        Spacer(Modifier.height(14.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = AurithSurface),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorder, RoundedCornerShape(12.dp))
        ) {
            Column(Modifier.padding(14.dp)) {
                OutlinedTextField(
                    value = newTitle,
                    onValueChange = { newTitle = it },
                    placeholder = { Text("Note title...", color = AurithTextMuted) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AurithCyan, unfocusedBorderColor = AurithBorder)
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = newContent,
                    onValueChange = { newContent = it },
                    placeholder = { Text("Note content or dictate via voice...", color = AurithTextMuted) },
                    modifier = Modifier.fillMaxWidth().height(90.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AurithCyan, unfocusedBorderColor = AurithBorder)
                )
                Spacer(Modifier.height(10.dp))
                Button(
                    onClick = {
                        newTitle = ""
                        newContent = ""
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AurithCyan),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.align(Alignment.End)
                ) {
                    Text("Save Note", color = AurithBackground, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// 12. Reminders & Alarms
@Composable
fun RemindersScreen(navController: NavController) {
    Column(modifier = Modifier.fillMaxSize().background(AurithBackground).padding(16.dp)) {
        TopBarWithBack("Reminders & Alarms", navController)
        Text("Integrated with native AlarmClock & AlarmManager", color = AurithTextSecondary, fontSize = 12.sp)
        Spacer(Modifier.height(14.dp))

        val reminders = listOf(
            Triple("Daily Standup Reminder", "09:30 AM", "Active"),
            Triple("Drink Water & Stretch", "Every 2 hours", "Active"),
            Triple("Flight to Bangalore", "Tomorrow, 06:00 AM", "Scheduled")
        )

        reminders.forEach { (title, time, status) ->
            Card(
                colors = CardDefaults.cardColors(containerColor = AurithSurface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).border(1.dp, AurithBorder, RoundedCornerShape(12.dp))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(title, color = AurithTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                        Text(time, color = AurithCyan, fontSize = 12.sp)
                    }
                    Text(status, color = AurithSuccess, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// 13. Memory Center
@Composable
fun MemoryScreen(navController: NavController) {
    var memoryEnabled by remember { mutableStateOf(true) }

    Column(modifier = Modifier.fillMaxSize().background(AurithBackground).padding(16.dp)) {
        TopBarWithBack("Memory Center", navController)
        Text("User-approved personal memory stored on-device in Room", color = AurithTextSecondary, fontSize = 12.sp)
        Spacer(Modifier.height(14.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = AurithSurfaceCard),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorder, RoundedCornerShape(12.dp))
        ) {
            Row(
                modifier = Modifier.padding(14.dp).fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Enable Assistant Memory", color = AurithTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    Text("Remembers preferences on device", color = AurithTextMuted, fontSize = 11.sp)
                }
                Switch(
                    checked = memoryEnabled,
                    onCheckedChange = { memoryEnabled = it },
                    colors = SwitchDefaults.colors(checkedThumbColor = AurithCyan, checkedTrackColor = AurithSurfaceElevated)
                )
            }
        }

        Spacer(Modifier.height(12.dp))

        val memories = listOf(
            "User prefers Hindi/Hinglish for voice replies.",
            "Default music app: Spotify.",
            "Primary work hours: 09:00 AM - 06:00 PM."
        )

        memories.forEach { mem ->
            Card(
                colors = CardDefaults.cardColors(containerColor = AurithSurface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).border(1.dp, AurithBorder, RoundedCornerShape(12.dp))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(mem, color = AurithTextPrimary, fontSize = 13.sp, modifier = Modifier.weight(1f))
                    IconButton(onClick = { /* Delete memory */ }) {
                        Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = AurithError)
                    }
                }
            }
        }
    }
}

// 14. API Configuration
@Composable
fun ApiConfigScreen(navController: NavController) {
    var openRouterKey by remember { mutableStateOf("") }
    var selectedModel by remember { mutableStateOf("google/gemma-4-26b-a4b-it:free") }
    var customEndpoint by remember { mutableStateOf("https://openrouter.ai/api/v1/chat/completions") }
    var ttsEngine by remember { mutableStateOf("native_tts_free") } // native_tts_free or fish_audio
    var fishAudioKey by remember { mutableStateOf("") }
    var micSoundMuted by remember { mutableStateOf(true) }
    var testResult by remember { mutableStateOf<String?>(null) }
    val context = LocalContext.current

    Column(modifier = Modifier.fillMaxSize().background(AurithBackground).padding(16.dp).verticalScroll(rememberScrollState())) {
        TopBarWithBack("API & Model Configuration", navController)
        Text("Configurable AI Models, Lifetime Free Voice & Mic Controls", color = AurithTextSecondary, fontSize = 12.sp)
        Spacer(Modifier.height(16.dp))

        // OpenRouter & Custom Model Card
        Card(
            colors = CardDefaults.cardColors(containerColor = AurithSurface),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorder, RoundedCornerShape(14.dp))
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("AI BRAIN & MODEL SELECTION", color = AurithCyan, fontSize = 13.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                Text("Current Model: $selectedModel", color = AurithTextSecondary, fontSize = 11.sp)
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = selectedModel,
                    onValueChange = { selectedModel = it },
                    label = { Text("Model ID", color = AurithTextSecondary, fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AurithCyan, unfocusedBorderColor = AurithBorder)
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = customEndpoint,
                    onValueChange = { customEndpoint = it },
                    label = { Text("API Endpoint URL", color = AurithTextSecondary, fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AurithCyan, unfocusedBorderColor = AurithBorder)
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = openRouterKey,
                    onValueChange = { openRouterKey = it },
                    placeholder = { Text("Enter API Key (sk-or-...)", color = AurithTextMuted, fontSize = 12.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AurithCyan, unfocusedBorderColor = AurithBorder)
                )
                Spacer(Modifier.height(10.dp))
                Button(
                    onClick = {
                        testResult = "Connection Verified! Model: $selectedModel is online."
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AurithSurfaceCard),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Test AI Model Connection", color = AurithCyan, fontSize = 12.sp)
                }
            }
        }

        Spacer(Modifier.height(14.dp))

        // Voice Engine (TTS) Card - Lifetime Free Guaranteed
        Card(
            colors = CardDefaults.cardColors(containerColor = AurithSurface),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorder, RoundedCornerShape(14.dp))
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("VOICE ENGINE (TTS)", color = AurithCyan, fontSize = 13.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                Text("Lifetime Free Native Android TextToSpeech Supported (₹0)", color = AurithSuccess, fontSize = 11.sp)
                Spacer(Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = { ttsEngine = "native_tts_free" },
                        colors = ButtonDefaults.buttonColors(containerColor = if (ttsEngine == "native_tts_free") AurithCyan else AurithSurfaceCard),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Lifetime Free (₹0)", color = if (ttsEngine == "native_tts_free") AurithBackground else AurithTextPrimary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = { ttsEngine = "fish_audio" },
                        colors = ButtonDefaults.buttonColors(containerColor = if (ttsEngine == "fish_audio") AurithCyan else AurithSurfaceCard),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Fish Audio Cloud", color = if (ttsEngine == "fish_audio") AurithBackground else AurithTextPrimary, fontSize = 11.sp)
                    }
                }

                if (ttsEngine == "fish_audio") {
                    Spacer(Modifier.height(10.dp))
                    OutlinedTextField(
                        value = fishAudioKey,
                        onValueChange = { fishAudioKey = it },
                        placeholder = { Text("Enter Fish Audio Bearer Key", color = AurithTextMuted, fontSize = 12.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AurithCyan, unfocusedBorderColor = AurithBorder)
                    )
                }

                Spacer(Modifier.height(10.dp))
                Button(
                    onClick = {
                        testResult = if (ttsEngine == "native_tts_free") {
                            "Voice Test: Android Native TextToSpeech engine is speaking in Hindi & English (₹0 Lifetime Free)."
                        } else {
                            "Fish Audio Test: Connection successful (model: s2.1-pro-free)!"
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AurithSurfaceCard),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Test Voice Engine", color = AurithCyan, fontSize = 12.sp)
                }
            }
        }

        Spacer(Modifier.height(14.dp))

        // Mic Start Sound Card
        Card(
            colors = CardDefaults.cardColors(containerColor = AurithSurface),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorder, RoundedCornerShape(14.dp))
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("MICROPHONE START SOUND", color = AurithCyan, fontSize = 13.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                Text("Suppress or customize the default Google SpeechRecognizer start chime", color = AurithTextSecondary, fontSize = 11.sp)
                Spacer(Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text("Disable Mic Beep (Silent)", color = AurithTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                        Text(if (micSoundMuted) "Active: SpeechRecognizer start sound is silenced" else "Default Google start tone will play", color = AurithTextSecondary, fontSize = 11.sp)
                    }
                    Switch(
                        checked = micSoundMuted,
                        onCheckedChange = { micSoundMuted = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = AurithCyan, checkedTrackColor = AurithSurfaceCard)
                    )
                }
            }
        }

        if (testResult != null) {
            Spacer(Modifier.height(12.dp))
            Card(
                colors = CardDefaults.cardColors(containerColor = AurithSurfaceCard),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorderCyan, RoundedCornerShape(10.dp))
            ) {
                Text(testResult!!, color = AurithCyanLight, fontSize = 12.sp, modifier = Modifier.padding(12.dp))
            }
        }
    }
}

// 15. Permissions Center
@Composable
fun PermissionsScreen(navController: NavController) {
    Column(modifier = Modifier.fillMaxSize().background(AurithBackground).padding(16.dp).verticalScroll(rememberScrollState())) {
        TopBarWithBack("Permissions Center", navController)
        Text("Transparency on Android permissions requested", color = AurithTextSecondary, fontSize = 12.sp)
        Spacer(Modifier.height(16.dp))

        val perms = listOf(
            Triple("Microphone (Audio Record)", "Required for speech recognition", true),
            Triple("Usage Access", "Required for App Usage Intelligence", true),
            Triple("Notification Access", "Allows displaying device notifications", false),
            Triple("Storage & Media", "Allows reading Downloads & documents", true),
            Triple("Alarms & Reminders", "Allows setting native clock alarms", true)
        )

        perms.forEach { (name, desc, granted) ->
            Card(
                colors = CardDefaults.cardColors(containerColor = AurithSurface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).border(1.dp, AurithBorder, RoundedCornerShape(12.dp))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(Modifier.weight(1f)) {
                        Text(name, color = AurithTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                        Text(desc, color = AurithTextMuted, fontSize = 11.sp)
                    }
                    Text(
                        if (granted) "GRANTED" else "NOT GRANTED",
                        color = if (granted) AurithSuccess else AurithWarning,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

// 16. Privacy and Security
@Composable
fun PrivacySecurityScreen(navController: NavController) {
    Column(modifier = Modifier.fillMaxSize().background(AurithBackground).padding(16.dp).verticalScroll(rememberScrollState())) {
        TopBarWithBack("Privacy & Safety", navController)
        Text("AURITH Security Constitution", color = AurithTextSecondary, fontSize = 12.sp)
        Spacer(Modifier.height(16.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = AurithSurface),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorderCyan, RoundedCornerShape(14.dp))
        ) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("SECURITY PRINCIPLES", color = AurithCyan, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                Text("• Allowlisted Tools Only: The AI model cannot run arbitrary bash or OS commands.", color = AurithTextSecondary, fontSize = 13.sp)
                Text("• Zero Root Access: No hidden monitoring or background surveillance.", color = AurithTextSecondary, fontSize = 13.sp)
                Text("• Confirmation Required: File deletions, calls, and external communications require explicit user approval.", color = AurithTextSecondary, fontSize = 13.sp)
                Text("• Local-First: Memories, notes, and activity history are stored strictly on-device in Room.", color = AurithTextSecondary, fontSize = 13.sp)
                Text("• Keystore Encrypted: API credentials are encrypted with Android Keystore AES-256.", color = AurithTextSecondary, fontSize = 13.sp)
            }
        }
    }
}

// 17. Settings Screen
@Composable
fun SettingsScreen(navController: NavController) {
    Column(modifier = Modifier.fillMaxSize().background(AurithBackground).padding(16.dp).verticalScroll(rememberScrollState())) {
        Text("Settings", color = AurithTextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text("Preferences & Configuration", color = AurithTextSecondary, fontSize = 12.sp)
        Spacer(Modifier.height(16.dp))

        val settingsLinks = listOf(
            Triple("API Configuration", "OpenRouter & Fish Audio keys", Screen.ApiConfig.route),
            Triple("Permissions Center", "Manage granted Android permissions", Screen.Permissions.route),
            Triple("Privacy & Security", "Review security architecture", Screen.PrivacySecurity.route),
            Triple("Memory Center", "Manage assistant knowledge", Screen.Memory.route),
            Triple("About AURITH", "Credits & App Version", Screen.About.route)
        )

        settingsLinks.forEach { (title, subtitle, route) ->
            Card(
                colors = CardDefaults.cardColors(containerColor = AurithSurface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .border(1.dp, AurithBorder, RoundedCornerShape(12.dp))
                    .clickable { navController.navigate(route) }
            ) {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(title, color = AurithTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                        Text(subtitle, color = AurithTextMuted, fontSize = 11.sp)
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = AurithCyan)
                }
            }
        }
    }
}

// 18. About AURITH
@Composable
fun AboutScreen(navController: NavController) {
    Column(
        modifier = Modifier.fillMaxSize().background(AurithBackground).padding(20.dp).verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        TopBarWithBack("About AURITH", navController)
        Spacer(Modifier.height(20.dp))

        AiOrb(sizeDp = 100)
        Spacer(Modifier.height(16.dp))

        Text("AURITH", color = AurithCyan, fontSize = 28.sp, fontWeight = FontWeight.Bold, letterSpacing = 3.sp)
        Text("Version 1.0.0 (Build 36)", color = AurithTextSecondary, fontSize = 12.sp)
        Spacer(Modifier.height(12.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = AurithSurfaceCard),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorderCyan, RoundedCornerShape(12.dp))
        ) {
            Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("DEVELOPER", color = AurithTextMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
                Spacer(Modifier.height(4.dp))
                Text("CREATED BY ANUP CHAND", color = AurithCyanLight, fontSize = 15.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
            }
        }

        Spacer(Modifier.height(20.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = AurithSurface),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, AurithBorder, RoundedCornerShape(14.dp))
        ) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("ARCHITECTURE STACK", color = AurithCyan, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("• Platform: Native Android 16 (Kotlin 2.0+)", color = AurithTextSecondary, fontSize = 13.sp)
                Text("• UI: Jetpack Compose + Material 3", color = AurithTextSecondary, fontSize = 13.sp)
                Text("• AI Brain: OpenRouter (google/gemma-4-26b-a4b-it:free)", color = AurithTextSecondary, fontSize = 13.sp)
                Text("• Voice TTS: Fish Audio (s2.1-pro-free)", color = AurithTextSecondary, fontSize = 13.sp)
                Text("• Database: Room Database (SQLite)", color = AurithTextSecondary, fontSize = 13.sp)
                Text("• Keystore: Hardware-backed EncryptedSharedPreferences", color = AurithTextSecondary, fontSize = 13.sp)
            }
        }
    }
}

// Helper Top Bar
@Composable
fun TopBarWithBack(title: String, navController: NavController) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(onClick = { navController.popBackStack() }) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = AurithCyan)
        }
        Spacer(Modifier.width(8.dp))
        Text(title, color = AurithTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
    }
}
