package com.anupchand.aurith.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = AurithCyan,
    onPrimary = AurithBackground,
    primaryContainer = AurithSurfaceElevated,
    onPrimaryContainer = AurithCyanLight,
    secondary = AurithCyanLight,
    onSecondary = AurithBackground,
    background = AurithBackground,
    onBackground = AurithTextPrimary,
    surface = AurithSurface,
    onSurface = AurithTextPrimary,
    surfaceVariant = AurithSurfaceCard,
    onSurfaceVariant = AurithTextSecondary,
    outline = AurithBorder,
    error = AurithError
)

@Composable
fun AurithTheme(content: @Composable () -> Unit) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = AurithBackground.toArgb()
            window.navigationBarColor = AurithBackground.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = false
        }
    }

    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
