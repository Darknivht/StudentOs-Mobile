package expo.modules.focusmode

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent
import android.view.WindowManager
import android.graphics.PixelFormat
import android.view.View
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Button
import android.content.Context
import android.app.ActivityManager

class FocusModeAccessibilityService : AccessibilityService() {

  private var blockedPackages: Set<String> = emptySet()
  private var isSessionActive = false
  private var overlayView: View? = null
  private var handler: Handler? = null
  private var countdownRunnable: Runnable? = null
  private var remainingSeconds: Int = 0

  override fun onServiceConnected() {
    super.onServiceConnected()
    val info = serviceInfo
    info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
    info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
    info.flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
    serviceInfo = info
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      "START_FOCUS" -> {
        val apps = intent.getStringArrayListExtra("blocked_apps") ?: emptyList()
        val duration = intent.getIntExtra("duration_minutes", 25)
        startFocus(apps.toSet(), duration)
      }
      "STOP_FOCUS" -> stopFocus()
    }
    return START_STICKY
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent) {
    if (!isSessionActive || blockedPackages.isEmpty()) return

    if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
      val packageName = event.packageName?.toString() ?: return
      if (blockedPackages.contains(packageName)) {
        showOverlay()
      }
    }
  }

  override fun onInterrupt() {}

  private fun startFocus(packages: Set<String>, durationMinutes: Int) {
    blockedPackages = packages
    isSessionActive = true
    remainingSeconds = durationMinutes * 60
    FocusModeModule.currentBlockedPackages = packages
    FocusModeModule.isActive = true

    handler = Handler(Looper.getMainLooper())
    countdownRunnable = object : Runnable {
      override fun run() {
        remainingSeconds--
        if (remainingSeconds <= 0) {
          stopFocus()
          return
        }
        handler?.postDelayed(this, 1000)
      }
    }
    handler?.postDelayed(countdownRunnable!!, 1000)
  }

  private fun stopFocus() {
    isSessionActive = false
    blockedPackages = emptySet()
    FocusModeModule.currentBlockedPackages = emptySet()
    FocusModeModule.isActive = false
    handler?.removeCallbacksAndMessages(null)
    removeOverlay()
  }

  private fun showOverlay() {
    if (overlayView != null) return

    val wm = getSystemService(Context.WINDOW_SERVICE) as WindowManager
    val params = WindowManager.LayoutParams(
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
      PixelFormat.TRANSLUCENT
    )
    params.gravity = Gravity.CENTER

    val layout = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setBackgroundColor(0xFF2D1B69.toInt())
      gravity = Gravity.CENTER
    }

    val titleText = TextView(this).apply {
      text = "FOCUS MODE ACTIVE"
      setTextColor(0xFFFFFFFF.toInt())
      textSize = 24f
    }

    val quoteText = TextView(this).apply {
      text = getQuote()
      setTextColor(0xFFAAAAAA.toInt())
      textSize = 14f
      gravity = Gravity.CENTER
    }

    val timerText = TextView(this).apply {
      text = formatTime(remainingSeconds)
      setTextColor(0xFFFFFFFF.toInt())
      textSize = 48f
    }

    val exitButton = Button(this).apply {
      text = "Emergency Exit (Requires PIN)"
      setBackgroundColor(0xFFFF4444.toInt())
      setTextColor(0xFFFFFFFF.toInt())
      setOnClickListener {
        // TODO: show PIN dialog
      }
    }

    layout.apply {
      addView(titleText)
      addView(quoteText)
      addView(timerText)
      addView(exitButton)
    }

    overlayView = layout
    wm.addView(overlayView, params)

    // Auto-dismiss overlay when app changes
    handler?.postDelayed({ removeOverlay() }, 3000)
  }

  private fun removeOverlay() {
    if (overlayView != null) {
      val wm = getSystemService(Context.WINDOW_SERVICE) as WindowManager
      wm.removeView(overlayView)
      overlayView = null
    }
  }

  private fun formatTime(seconds: Int): String {
    val min = seconds / 60
    val sec = seconds % 60
    return String.format("%02d:%02d", min, sec)
  }

  private fun getQuote(): String {
    val quotes = listOf(
      """Discipline is the bridge between goals and accomplishment.""",
      """The future belongs to those who prepare for it today.""",
      """Stay focused, stay hungry.""",
      """One step at a time is all it takes.""",
      """Your only limit is your mind."""
    )
    return quotes.random()
  }
}