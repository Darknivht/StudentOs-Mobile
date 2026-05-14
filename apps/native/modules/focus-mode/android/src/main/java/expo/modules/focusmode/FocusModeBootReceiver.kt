package expo.modules.focusmode

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class FocusModeBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
      val prefName = "studentos_focus_mode"
      val prefs = context.getSharedPreferences(prefName, Context.MODE_PRIVATE)
      val wasActive = prefs.getBoolean("was_active", false)

      if (wasActive) {
        val startIntent = Intent(context, FocusModeAccessibilityService::class.java).apply {
          action = "START_FOCUS"
          val savedPackages = prefs.getStringSet("blocked_apps", emptySet())
          putStringArrayListExtra("blocked_apps", ArrayList(savedPackages ?: emptySet()))
          putExtra("duration_minutes", prefs.getInt("duration_minutes", 25))
        }
        context.startService(startIntent)
      }
    }
  }
}