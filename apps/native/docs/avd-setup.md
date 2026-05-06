# 2GB RAM Android AVD Setup

This document describes the low-end Android Virtual Device (AVD) profile used for performance testing.

## Target Specs

| Property | Value |
|----------|-------|
| Device | Pixel 2 |
| RAM | 2048 MB |
| VM Heap | 256 MB |
| API Level | 28 (Android 9) |
| Internal Storage | 2048 MB |
| System Image | `system-images;android-28;default;x86_64` |

## Creation Steps

```bash
# Install required system image
sdkmanager "system-images;android-28;default;x86_64"

# Create AVD
avdmanager create avd \
  -n studentos_lowend \
  -k "system-images;android-28;default;x86_64" \
  -d "pixel_2" \
  --force

# Configure RAM (edit config.ini)
# On Windows: %USERPROFILE%\.android\avd\studentos_lowend.avd\config.ini
# Set:
#   hw.ramSize=2048
#   vm.heapSize=256
#   disk.dataPartition.size=2048
```

## Verification Checklist

- [ ] App launches without OutOfMemoryError
- [ ] Navigation between screens works without ANR
- [ ] Memory usage under 512MB (check via `adb shell dumpsys meminfo <package>`)
- [ ] No frame drops during navigation (target: 30fps minimum on low-end)

## Memory Profiling Commands

```bash
# Start the AVD
emulator -avd studentos_lowend

# Install and launch the app
adb install app-release.apk
adb shell am start -n com.studentos/.MainActivity

# Check memory usage
adb shell dumpsys meminfo com.studentos

# Check CPU usage
adb shell top | grep com.studentos
```
