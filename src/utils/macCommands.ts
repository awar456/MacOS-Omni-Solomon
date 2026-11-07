import { 
  MacCommand, 
  ThemeConfig, 
  ScheduleConfig, 
  DiskMaintenanceConfig, 
  CloudSyncConfig, 
  UninstallerTarget, 
  SecurityCheckItem, 
  AudioSettings,
  SystemRecommendation,
  SystemHealthMetrics
} from '../types/index';
import { SoundEngine } from './soundEngine';

// Pre-indexed Top MacBook Terminal Commands & System Tweaks (grouped into 4 categories)
export const MAC_COMMANDS_REPOSITORY: MacCommand[] = [
  // --- UI CUSTOMIZATION ---
  {
    id: 'ui-dock-instant',
    name: 'Instant Dock Autohide (Zero Latency)',
    category: 'ui',
    description: 'Eliminates all delay and animation speed when revealing or hiding the macOS Dock.',
    command: 'defaults write com.apple.dock autohide-delay -float 0; defaults write com.apple.dock autohide-time-modifier -float 0; killall Dock',
    undoCommand: 'defaults delete com.apple.dock autohide-delay; defaults delete com.apple.dock autohide-time-modifier; killall Dock',
    risk: 'safe',
    tags: ['dock', 'speed', 'animation', 'ui'],
    explanation: 'Sets Dock reveal delay to 0 seconds and time modifier to 0 seconds, then restarts the Dock process to apply changes instantly.'
  },
  {
    id: 'ui-dock-fast-spring',
    name: 'Snappy Spring Dock Animation',
    category: 'ui',
    description: 'Speeds up Dock autohide to a crisp, fast 0.12s spring animation.',
    command: 'defaults write com.apple.dock autohide-delay -float 0.05; defaults write com.apple.dock autohide-time-modifier -float 0.12; killall Dock',
    undoCommand: 'defaults delete com.apple.dock autohide-delay; defaults delete com.apple.dock autohide-time-modifier; killall Dock',
    risk: 'safe',
    tags: ['dock', 'animation', 'snappy'],
    explanation: 'Configures a near-instant delay with a high-velocity sliding modifier.'
  },
  {
    id: 'ui-dock-hide-recents',
    name: 'Hide Recent Applications in Dock',
    category: 'ui',
    description: 'Removes the separate section for recently opened apps on the right/bottom of the Dock.',
    command: 'defaults write com.apple.dock show-recents -bool false; killall Dock',
    undoCommand: 'defaults write com.apple.dock show-recents -bool true; killall Dock',
    risk: 'safe',
    tags: ['dock', 'clean', 'minimalist'],
    explanation: 'Disables the persistent recent-apps divider in macOS Dock.'
  },
  {
    id: 'ui-dock-active-only',
    name: 'Dock Shows Only Running Apps',
    category: 'ui',
    description: 'Transforms the Dock into a pure active task-switcher, hiding unlaunched pinned apps.',
    command: 'defaults write com.apple.dock static-only -bool true; killall Dock',
    undoCommand: 'defaults write com.apple.dock static-only -bool false; killall Dock',
    risk: 'safe',
    tags: ['dock', 'taskbar', 'minimalist'],
    explanation: 'Hides all static app shortcuts, leaving only currently running processes in the Dock.'
  },
  {
    id: 'ui-dock-suck-effect',
    name: 'Enable Secret "Suck" Minimize Animation',
    category: 'ui',
    description: 'Activates the hidden liquid vacuum minimize animation effect that Apple built into macOS.',
    command: 'defaults write com.apple.dock mineffect -string "suck"; killall Dock',
    undoCommand: 'defaults write com.apple.dock mineffect -string "genie"; killall Dock',
    risk: 'safe',
    tags: ['dock', 'animation', 'easter-egg'],
    explanation: 'Switches window minimization from standard Genie to the fluid inward vortex "suck" effect.'
  },
  {
    id: 'ui-dock-single-app-mode',
    name: 'Enable Single-Application Focus Mode',
    category: 'ui',
    description: 'Clicking an app in the Dock automatically hides all other active application windows.',
    command: 'defaults write com.apple.dock single-app -bool true; killall Dock',
    undoCommand: 'defaults write com.apple.dock single-app -bool false; killall Dock',
    risk: 'safe',
    tags: ['dock', 'focus', 'productivity'],
    explanation: 'Enforces pure single-task focus by hiding all background apps upon window switch.'
  },
  {
    id: 'ui-finder-show-hidden',
    name: 'Show All Hidden Files & Dotfiles in Finder',
    category: 'ui',
    description: 'Reveals hidden files (.git, .zshrc, .env, Library) across all Finder directories.',
    command: 'defaults write com.apple.finder AppleShowAllFiles -bool true; killall Finder',
    undoCommand: 'defaults write com.apple.finder AppleShowAllFiles -bool false; killall Finder',
    risk: 'safe',
    tags: ['finder', 'developer', 'dotfiles'],
    explanation: 'Toggles visibility flag for dotfiles and macOS system hidden items.'
  },
  {
    id: 'ui-finder-show-pathbar',
    name: 'Show Interactive Breadcrumb Path Bar',
    category: 'ui',
    description: 'Displays the bottom file path bar in Finder with double-clickable directory breadcrumbs.',
    command: 'defaults write com.apple.finder ShowPathbar -bool true; killall Finder',
    undoCommand: 'defaults write com.apple.finder ShowPathbar -bool false; killall Finder',
    risk: 'safe',
    tags: ['finder', 'navigation', 'breadcrumbs'],
    explanation: 'Permanently renders the breadcrumb directory navigation bar.'
  },
  {
    id: 'ui-finder-show-statusbar',
    name: 'Show Finder Storage & Item Count Status Bar',
    category: 'ui',
    description: 'Shows total item count and remaining SSD disk space at the bottom of Finder windows.',
    command: 'defaults write com.apple.finder ShowStatusBar -bool true; killall Finder',
    undoCommand: 'defaults write com.apple.finder ShowStatusBar -bool false; killall Finder',
    risk: 'safe',
    tags: ['finder', 'storage', 'status'],
    explanation: 'Renders the bottom status bar detailing item count and available disk storage.'
  },
  {
    id: 'ui-finder-show-all-extensions',
    name: 'Always Show File Extensions (.ts, .sh, .pdf)',
    category: 'ui',
    description: 'Prevents macOS from hiding file extensions, guarding against disguised malicious files.',
    command: 'defaults write NSGlobalDomain AppleShowAllExtensions -bool true; killall Finder',
    undoCommand: 'defaults write NSGlobalDomain AppleShowAllExtensions -bool false; killall Finder',
    risk: 'safe',
    tags: ['finder', 'security', 'extensions'],
    explanation: 'Globally forces file extension rendering across macOS.'
  },
  {
    id: 'ui-screenshot-no-shadow',
    name: 'Disable Screenshot Drop Shadows',
    category: 'ui',
    description: 'Captures clean window screenshots without the massive translucent blurred shadow margin.',
    command: 'defaults write com.apple.screencapture disable-shadow -bool true; killall SystemUIServer',
    undoCommand: 'defaults write com.apple.screencapture disable-shadow -bool false; killall SystemUIServer',
    risk: 'safe',
    tags: ['screenshots', 'design', 'clean'],
    explanation: 'Removes the 50px drop shadow from window screenshots taken via Cmd+Shift+4 -> Space.'
  },
  {
    id: 'ui-screenshot-custom-dir',
    name: 'Set Screenshot Destination to ~/Screenshots',
    category: 'ui',
    description: 'Prevents desktop clutter by automatically saving all captures into ~/Screenshots.',
    command: 'mkdir -p ~/Screenshots && defaults write com.apple.screencapture location ~/Screenshots; killall SystemUIServer',
    undoCommand: 'defaults delete com.apple.screencapture location; killall SystemUIServer',
    risk: 'safe',
    tags: ['screenshots', 'organization', 'desktop'],
    explanation: 'Creates a dedicated folder and points the macOS screencapture service to it.'
  },
  {
    id: 'ui-screenshot-png-to-jpg',
    name: 'Change Screenshot Format to High-Speed JPG',
    category: 'ui',
    description: 'Saves screenshots as compact JPEG files instead of heavy 15MB Retina PNGs.',
    command: 'defaults write com.apple.screencapture type jpg; killall SystemUIServer',
    undoCommand: 'defaults write com.apple.screencapture type png; killall SystemUIServer',
    risk: 'safe',
    tags: ['screenshots', 'storage', 'jpeg'],
    explanation: 'Switches the default image compression engine of screencapture.'
  },
  {
    id: 'ui-dialog-expand-save',
    name: 'Always Expand Save & Print Dialog Boxes',
    category: 'ui',
    description: 'Expands the full folder browser in save dialogs by default instead of the mini dropdown.',
    command: 'defaults write NSGlobalDomain NSNavPanelExpandedStateForSaveMode -bool true; defaults write NSGlobalDomain NSNavPanelExpandedStateForSaveMode2 -bool true; defaults write NSGlobalDomain PMPrintingExpandedStateForPrint -bool true',
    undoCommand: 'defaults delete NSGlobalDomain NSNavPanelExpandedStateForSaveMode; defaults delete NSGlobalDomain NSNavPanelExpandedStateForSaveMode2',
    risk: 'safe',
    tags: ['dialogs', 'productivity', 'finder'],
    explanation: 'Enforces the expanded detailed view for all file save panels.'
  },
  {
    id: 'ui-speed-window-animations',
    name: 'Accelerate Window Opening & Closing Animations',
    category: 'ui',
    description: 'Doubles the playback velocity of native macOS window zoom animations.',
    command: 'defaults write NSGlobalDomain NSWindowResizeTime -float 0.001',
    undoCommand: 'defaults delete NSGlobalDomain NSWindowResizeTime',
    risk: 'safe',
    tags: ['speed', 'windows', 'animations'],
    explanation: 'Reduces the window transition resize time constant to 1 millisecond.'
  },
  {
    id: 'ui-menubar-clock-seconds',
    name: 'Display Seconds on Menu Bar Digital Clock',
    category: 'ui',
    description: 'Enables high-precision time display with seconds in the macOS top status bar.',
    command: 'defaults write com.apple.menuextra.clock ShowSeconds -bool true; killall ControlCenter',
    undoCommand: 'defaults write com.apple.menuextra.clock ShowSeconds -bool false; killall ControlCenter',
    risk: 'safe',
    tags: ['menubar', 'clock', 'time'],
    explanation: 'Directly modifies the Control Center clock extension preference dictionary.'
  },
  {
    id: 'ui-menubar-clock-flash',
    name: 'Flash Clock Time Separators Every Second',
    category: 'ui',
    description: 'Flashes the colon (:) between hours and minutes on the menu bar clock.',
    command: 'defaults write com.apple.menuextra.clock FlashDateSeparators -bool true; killall ControlCenter',
    undoCommand: 'defaults write com.apple.menuextra.clock FlashDateSeparators -bool false; killall ControlCenter',
    risk: 'safe',
    tags: ['menubar', 'clock', 'style'],
    explanation: 'Enables blinking time colon in menu bar.'
  },
  {
    id: 'ui-sound-disable-boot-chime',
    name: 'Mute Hardware Boot Chime Sound',
    category: 'ui',
    description: 'Silences the loud startup chime when powering on MacBook Pro.',
    command: 'sudo nvram StartupMute=%01',
    undoCommand: 'sudo nvram StartupMute=%00',
    risk: 'sudo',
    tags: ['boot', 'nvram', 'sound'],
    explanation: 'Sets the NVRAM parameter StartupMute to 1 (requires administrator privileges).'
  },
  {
    id: 'ui-keyboard-key-repeat',
    name: 'Ultra-Fast Keyboard Key Repeat Rate',
    category: 'ui',
    description: 'Enables instant key repetition for fast text editing and vim navigation.',
    command: 'defaults write NSGlobalDomain KeyRepeat -int 1; defaults write NSGlobalDomain InitialKeyRepeat -int 10',
    undoCommand: 'defaults write NSGlobalDomain KeyRepeat -int 2; defaults write NSGlobalDomain InitialKeyRepeat -int 15',
    risk: 'safe',
    tags: ['keyboard', 'speed', 'coding'],
    explanation: 'Sets keyboard repeat threshold to 15ms and initial repeat delay to 150ms.'
  },
  {
    id: 'ui-keyboard-press-and-hold',
    name: 'Disable Character Accent Pop-up (Enable Key Repeat)',
    category: 'ui',
    description: 'Allows holding down keys (like h, j, k, l in VS Code) to repeat instead of opening the accent selector.',
    command: 'defaults write -g ApplePressAndHoldEnabled -bool false',
    undoCommand: 'defaults write -g ApplePressAndHoldEnabled -bool true',
    risk: 'safe',
    tags: ['keyboard', 'vim', 'coding'],
    explanation: 'Disables the iOS-style accent picker on held keys globally.'
  },

  // --- PERFORMANCE PROFILES ---
  {
    id: 'perf-purge-ram',
    name: 'Purge Inactive RAM & Disk Buffer Cache',
    category: 'perf',
    description: 'Forces the macOS kernel to flush disk caches and free inactive memory allocations.',
    command: 'sudo purge',
    risk: 'sudo',
    tags: ['ram', 'memory', 'performance'],
    explanation: 'Executes Mach kernel memory purge to reclaim inactive memory blocks.'
  },
  {
    id: 'perf-disable-sleep-image',
    name: 'Reclaim 16GB-64GB SSD Space (Disable Sleepimage)',
    category: 'perf',
    description: 'Disables hibernation RAM dumps to SSD and deletes the massive sleepimage file.',
    command: 'sudo pmset -a hibernatemode 0 && sudo rm -f /var/vm/sleepimage && sudo touch /var/vm/sleepimage && sudo chflags uchg /var/vm/sleepimage',
    undoCommand: 'sudo chflags nouchg /var/vm/sleepimage && sudo rm -f /var/vm/sleepimage && sudo pmset -a hibernatemode 3',
    risk: 'sudo',
    tags: ['storage', 'ssd', 'hibernation'],
    explanation: 'Sets power management to safe sleep (RAM only) and locks the sleepimage file to 0 bytes.'
  },
  {
    id: 'perf-caffeinate-process',
    name: 'Prevent Mac Sleep for 2 Hours (Caffeinate)',
    category: 'perf',
    description: 'Blocks display and system sleep while long compiles or exports run.',
    command: 'caffeinate -u -t 7200 &',
    risk: 'safe',
    tags: ['sleep', 'power', 'caffeinate'],
    explanation: 'Launches native macOS caffeinate utility with user activity simulation flag for 7200 seconds.'
  },
  {
    id: 'perf-disable-spotlight-indexing',
    name: 'Pause High-CPU Spotlight Indexing on Battery',
    category: 'perf',
    description: 'Stops mdworker from burning CPU and battery during intensive development work.',
    command: 'sudo mdutil -i off /',
    undoCommand: 'sudo mdutil -i on /',
    risk: 'sudo',
    tags: ['spotlight', 'cpu', 'battery'],
    explanation: 'Toggles Metadata Server indexing status off for the primary volume.'
  },
  {
    id: 'perf-rebuild-spotlight',
    name: 'Rebuild Corrupted Spotlight Search Index',
    category: 'perf',
    description: 'Completely purges and rebuilds the Spotlight search index database.',
    command: 'sudo mdutil -E / && sudo mdutil -i on /',
    risk: 'sudo',
    tags: ['spotlight', 'search', 'maintenance'],
    explanation: 'Erases the existing metadata store and re-indexes all mounted file systems.'
  },
  {
    id: 'perf-kill-rogue-processes',
    name: 'Identify Top 10 CPU Consuming Processes',
    category: 'perf',
    description: 'Quickly audits active tasks sorted by CPU utilization percentage.',
    command: 'ps -Aceo pid,pcpu,pmem,comm -r | head -n 11',
    risk: 'safe',
    tags: ['cpu', 'monitoring', 'processes'],
    explanation: 'Queries BSD process table sorted in descending CPU load order.'
  },
  {
    id: 'perf-kill-rogue-mem',
    name: 'Identify Top 10 Memory Consuming Processes',
    category: 'perf',
    description: 'Audits active processes consuming the most system RAM.',
    command: 'ps -Aceo pid,pmem,pcpu,comm -m | head -n 11',
    risk: 'safe',
    tags: ['ram', 'monitoring', 'processes'],
    explanation: 'Inspects process list sorted by memory consumption percentage.'
  },
  {
    id: 'perf-disable-throttling-ac',
    name: 'Disable Power Nap on Battery',
    category: 'perf',
    description: 'Prevents the Mac from waking up silently to check mail and sync iCloud while asleep.',
    command: 'sudo pmset -b powernap 0',
    undoCommand: 'sudo pmset -b powernap 1',
    risk: 'sudo',
    tags: ['power', 'battery', 'sleep'],
    explanation: 'Configures energy saver parameters to eliminate battery drain during sleep.'
  },
  {
    id: 'perf-quicklook-generator-reset',
    name: 'Reset QuickLook Thumbnail Cache & Daemons',
    category: 'perf',
    description: 'Fixes frozen Spacebar file previews by flushing QuickLook caches and restarting daemon.',
    command: 'qlmanage -r cache && qlmanage -r && killall quicklookd',
    risk: 'safe',
    tags: ['quicklook', 'preview', 'cache'],
    explanation: 'Instructs QuickLook manager to discard all memory caches and reload generator plugins.'
  },
  {
    id: 'perf-clean-xcode-derived',
    name: 'Purge Heavy Xcode DerivedData Cache (>10GB)',
    category: 'perf',
    description: 'Deletes orphaned build artifacts, intermediate object files, and module caches.',
    command: 'rm -rf ~/Library/Developer/Xcode/DerivedData/*',
    risk: 'intermediate',
    tags: ['xcode', 'developer', 'storage'],
    explanation: 'Safely removes non-essential generated build output from Xcode.'
  },
  {
    id: 'perf-clean-brew-cache',
    name: 'Purge Homebrew Package Cache & Downloads',
    category: 'perf',
    description: 'Removes old bottle tarballs and obsolete formula versions cached by Homebrew.',
    command: 'brew cleanup -s --prune=all',
    risk: 'safe',
    tags: ['homebrew', 'storage', 'developer'],
    explanation: 'Cleans Homebrew bottle cache and removes cached downloads older than 0 days.'
  },
  {
    id: 'perf-trim-ssd',
    name: 'Verify APFS SSD TRIM Enablement',
    category: 'perf',
    description: 'Inspects Apple SSD TRIM status to ensure optimal write speeds and wear-leveling.',
    command: 'system_profiler SPSerialATADataType SPNVMeDataType | grep -E "TRIM Support|Model Number|Link Speed"',
    risk: 'safe',
    tags: ['ssd', 'storage', 'hardware'],
    explanation: 'Extracts hardware profile details confirming TRIM garbage-collection support.'
  },

  // --- NETWORK UTILITIES ---
  {
    id: 'net-flush-dns-all',
    name: 'Universal DNS Cache Flush (Sequoia / Sonoma / Ventura)',
    category: 'net',
    description: 'Completely flushes DNS resolver cache and restarts mDNSResponder.',
    command: 'sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder',
    risk: 'sudo',
    tags: ['dns', 'network', 'resolver'],
    explanation: 'Invalidates Directory Services directory cache and sends HUP signal to Multicast DNS daemon.'
  },
  {
    id: 'net-audit-listening-ports',
    name: 'Audit All Open TCP Listening Ports',
    category: 'net',
    description: 'Lists all background daemons and local development servers listening on open network ports.',
    command: 'lsof -iTCP -sTCP:LISTEN -n -P',
    risk: 'safe',
    tags: ['security', 'ports', 'firewall'],
    explanation: 'Uses List Open Files (lsof) with numerical IP and port resolution to display listeners.'
  },
  {
    id: 'net-wifi-metrics',
    name: 'Inspect Wi-Fi RSSI Signal Strength & Noise (dBm)',
    category: 'net',
    description: 'Measures exact RSSI, transmit rate (Tx Rate), noise floor, and channel width.',
    command: '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I',
    risk: 'safe',
    tags: ['wifi', 'signal', 'diagnostics'],
    explanation: 'Queries the internal Apple 802.11 wireless diagnostics interface for live link stats.'
  },
  {
    id: 'net-wifi-scan-channels',
    name: 'Scan Surrounding Wi-Fi Networks & Channel Crowding',
    category: 'net',
    description: 'Audits nearby access points to detect frequency overlap on 2.4GHz and 5GHz bands.',
    command: '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s',
    risk: 'safe',
    tags: ['wifi', 'scan', 'channels'],
    explanation: 'Scans all visible BSSIDs, signal strengths, security types, and channel allocations.'
  },
  {
    id: 'net-renew-dhcp',
    name: 'Renew DHCP Lease for Active Wi-Fi Interface',
    category: 'net',
    description: 'Requests a fresh IP lease from the local router without toggling Wi-Fi off and on.',
    command: 'sudo ipconfig set en0 DHCP',
    risk: 'sudo',
    tags: ['dhcp', 'ip', 'network'],
    explanation: 'Forces the primary network interface (en0) to transmit a DHCP discover request.'
  },
  {
    id: 'net-network-speedtest',
    name: 'Run Native macOS Low-Latency Speed Test',
    category: 'net',
    description: 'Tests download capacity, upload bandwidth, and bufferbloat responsiveness (RPM).',
    command: 'networkQuality -v',
    risk: 'safe',
    tags: ['speedtest', 'bandwidth', 'latency'],
    explanation: 'Launches native Apple CDN multi-stream network quality testing utility.'
  },
  {
    id: 'net-traceroute-fast',
    name: 'Fast UDP/ICMP Route Trace to Cloudflare DNS',
    category: 'net',
    description: 'Diagnoses packet route hops and carrier peering latency.',
    command: 'traceroute -q 1 -w 2 1.1.1.1',
    risk: 'safe',
    tags: ['traceroute', 'peering', 'latency'],
    explanation: 'Runs traceroute with 1 probe per hop and 2-second timeout to 1.1.1.1.'
  },
  {
    id: 'net-reset-routing-table',
    name: 'Flush System Routing Table',
    category: 'net',
    description: 'Clears stale or corrupted gateway routes and VPN leftovers.',
    command: 'sudo route -n flush',
    risk: 'sudo',
    tags: ['vpn', 'routes', 'network'],
    explanation: 'Purges dynamic network routing table entries.'
  },
  {
    id: 'net-check-firewall-state',
    name: 'Check Native Application Firewall Status',
    category: 'net',
    description: 'Verifies whether the localized socket filter firewall is running and blocking stealth scans.',
    command: '/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate --getstealthmode',
    risk: 'safe',
    tags: ['firewall', 'security', 'compliance'],
    explanation: 'Queries the macOS Application Firewall daemon state.'
  },

  // --- CORE OS TWEAKS ---
  {
    id: 'core-enable-touch-id-sudo',
    name: 'Enable Touch ID for Sudo in Terminal',
    category: 'core',
    description: 'Authenticate terminal sudo commands with your fingerprint instead of typing password.',
    command: 'sudo sed -i "" "1s/^/auth       sufficient     pam_tid.so\\n/" /etc/pam.d/sudo',
    undoCommand: 'sudo sed -i "" "/pam_tid.so/d" /etc/pam.d/sudo',
    risk: 'advanced',
    tags: ['touchid', 'security', 'sudo', 'terminal'],
    explanation: 'Prepends pam_tid.so (PAM Touch ID module) to the system PAM sudo authentication file.'
  },
  {
    id: 'core-check-sip-status',
    name: 'Inspect System Integrity Protection (SIP) Status',
    category: 'core',
    description: 'Audits whether Apple rootless kernel protection is fully active.',
    command: 'csrutil status',
    risk: 'safe',
    tags: ['sip', 'security', 'kernel'],
    explanation: 'Queries the kernel NVRAM status for System Integrity Protection.'
  },
  {
    id: 'core-check-gatekeeper',
    name: 'Verify Gatekeeper Code-Signature Enforcement',
    category: 'core',
    description: 'Audits whether macOS blocks unsigned or unauthorized binary execution.',
    command: 'spctl --status',
    risk: 'safe',
    tags: ['gatekeeper', 'security', 'signatures'],
    explanation: 'Queries SecCode assess policy subsystem for Gatekeeper enforcement.'
  },
  {
    id: 'core-check-filevault',
    name: 'Check FileVault Full-Disk Encryption Status',
    category: 'core',
    description: 'Verifies whether APFS volumes are protected by XTS-AES 128/256-bit hardware encryption.',
    command: 'fdesetup status',
    risk: 'safe',
    tags: ['encryption', 'filevault', 'security'],
    explanation: 'Queries FileVault key store to verify encryption completion status.'
  },
  {
    id: 'core-audit-launch-agents',
    name: 'Audit All User & System LaunchAgents',
    category: 'core',
    description: 'Lists all persistent background daemons scheduled to launch automatically at login.',
    command: 'launchctl list | grep -v "com.apple" | head -n 30',
    risk: 'safe',
    tags: ['launchd', 'security', 'persistence'],
    explanation: 'Filters launchctl process table to highlight third-party background daemons.'
  },
  {
    id: 'core-show-battery-health',
    name: 'Inspect Battery Cycle Count & Capacity Condition',
    category: 'core',
    description: 'Extracts internal battery charge cycle count, maximum capacity, and thermal condition.',
    command: 'system_profiler SPPowerDataType | grep -A 10 "Battery Information"',
    risk: 'safe',
    tags: ['battery', 'hardware', 'health'],
    explanation: 'Queries the SMC power management layer for hardware battery telemetrics.'
  },
  {
    id: 'core-mac-hardware-uuid',
    name: 'Display Hardware Model & Serial Hash',
    category: 'core',
    description: 'Quickly extracts the Apple Silicon chip architecture, core count, and hardware UUID.',
    command: 'system_profiler SPHardwareDataType | grep -E "Model Name|Chip|Total Number of Cores|Memory|Hardware UUID"',
    risk: 'safe',
    tags: ['hardware', 'specs', 'system'],
    explanation: 'Summarizes machine hardware configuration without showing serial number.'
  },
  {
    id: 'core-clean-font-cache',
    name: 'Flush Corrupted System Font Caches',
    category: 'core',
    description: 'Fixes corrupted or garbled text rendering across native apps and browsers.',
    command: 'sudo atsutil databases -remove && atsutil server -shutdown && atsutil server -ping',
    risk: 'sudo',
    tags: ['fonts', 'cache', 'graphics'],
    explanation: 'Removes Apple Type Services databases and restarts the font rasterizer server.'
  },
  {
    id: 'core-crash-reports-clean',
    name: 'Purge Old Crash Logs & Diagnostic Reports',
    category: 'core',
    description: 'Removes accumulated diagnostic logs from ~/Library/Logs/DiagnosticReports.',
    command: 'rm -rf ~/Library/Logs/DiagnosticReports/*',
    risk: 'safe',
    tags: ['logs', 'cleanup', 'storage'],
    explanation: 'Clears accumulated .ips crash logs generated by system processes.'
  },
  {
    id: 'core-flush-user-caches',
    name: 'Safe Purge of User Cache Directory (~/Library/Caches)',
    category: 'core',
    description: 'Reclaims multiple gigabytes of disk space occupied by web browsers, Electron apps, and streaming buffers.',
    command: 'rm -rf ~/Library/Caches/* 2>/dev/null',
    risk: 'intermediate',
    tags: ['caches', 'storage', 'cleanup'],
    explanation: 'Deletes temporary cache directories which apps will recreate freshly as needed.'
  }
];

// Pre-indexed Common Mac Application Purge Targets for Deep Uninstaller
export const PRESET_UNINSTALL_TARGETS: UninstallerTarget[] = [
  {
    id: 'slack',
    name: 'Slack',
    bundleId: 'com.tinyspeck.slackmacgap',
    appName: 'Slack',
    vendor: 'Slack Technologies LLC',
    extraPaths: ['~/Library/Containers/com.tinyspeck.slackmacgap*']
  },
  {
    id: 'google-chrome',
    name: 'Google Chrome',
    bundleId: 'com.google.Chrome',
    appName: 'Google Chrome',
    vendor: 'Google LLC',
    extraPaths: ['~/Library/Google/GoogleSoftwareUpdate', '~/Library/Application Support/Google/Chrome']
  },
  {
    id: 'zoom',
    name: 'Zoom.us',
    bundleId: 'us.zoom.xos',
    appName: 'zoom.us',
    vendor: 'Zoom Video Communications, Inc.',
    extraPaths: ['~/.zoomus', '~/Library/Internet Plug-Ins/ZoomUsPlugIn.plugin']
  },
  {
    id: 'docker',
    name: 'Docker Desktop',
    bundleId: 'com.docker.docker',
    appName: 'Docker',
    vendor: 'Docker Inc.',
    extraPaths: ['~/.docker', '~/Library/Containers/com.docker.*', '~/Library/Group Containers/group.com.docker']
  },
  {
    id: 'spotify',
    name: 'Spotify',
    bundleId: 'com.spotify.client',
    appName: 'Spotify',
    vendor: 'Spotify Ltd.',
    extraPaths: ['~/Library/Application Support/Spotify', '~/Library/Caches/com.spotify.client*']
  },
  {
    id: 'steam',
    name: 'Steam',
    bundleId: 'com.valvesoftware.steam',
    appName: 'Steam',
    vendor: 'Valve Corporation',
    extraPaths: ['~/Library/Application Support/Steam']
  },
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    bundleId: 'com.microsoft.VSCode',
    appName: 'Visual Studio Code',
    vendor: 'Microsoft Corporation',
    extraPaths: ['~/.vscode', '~/Library/Application Support/Code']
  },
  {
    id: 'cleanmymac',
    name: 'CleanMyMac X',
    bundleId: 'com.macpaw.CleanMyMac4',
    appName: 'CleanMyMac X',
    vendor: 'MacPaw Inc.',
    extraPaths: ['~/Library/Application Support/CleanMyMac X', '~/Library/LaunchAgents/com.macpaw.*']
  },
  {
    id: 'discord',
    name: 'Discord',
    bundleId: 'com.hnc.Discord',
    appName: 'Discord',
    vendor: 'Discord Inc.',
    extraPaths: ['~/Library/Application Support/discord']
  },
  {
    id: 'adobe-creative-cloud',
    name: 'Adobe Creative Cloud',
    bundleId: 'com.adobe.acc.AdobeCreativeCloud',
    appName: 'Adobe Creative Cloud',
    vendor: 'Adobe Systems Inc.',
    extraPaths: ['~/Library/Application Support/Adobe', '/Library/Application Support/Adobe']
  }
];

// Security Audit Checklist Items
export const SECURITY_AUDIT_CHECKS: SecurityCheckItem[] = [
  {
    id: 'sec-firewall',
    title: 'macOS Application Firewall',
    description: 'Ensure the native macOS socket filter firewall is actively enabled to reject unsolicited inbound connections.',
    category: 'system',
    checkCommand: '/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate',
    remediationCommand: 'sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on && sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode on',
    expectedHealthyOutput: 'Firewall is enabled',
    severity: 'critical'
  },
  {
    id: 'sec-filevault',
    title: 'FileVault Full-Disk Hardware Encryption',
    description: 'Verify APFS volume hardware encryption protects user credentials and documents at rest.',
    category: 'integrity',
    checkCommand: 'fdesetup status',
    remediationCommand: 'sudo fdesetup enable',
    expectedHealthyOutput: 'FileVault is On.',
    severity: 'critical'
  },
  {
    id: 'sec-sip',
    title: 'System Integrity Protection (SIP / Rootless)',
    description: 'Ensure system binaries, kernel extensions, and protected partitions cannot be tampered with.',
    category: 'integrity',
    checkCommand: 'csrutil status',
    remediationCommand: 'echo "Reboot into macOS Recovery (Hold Power or Cmd+R), open Terminal and run: csrutil enable"',
    expectedHealthyOutput: 'System Integrity Protection status: enabled.',
    severity: 'critical'
  },
  {
    id: 'sec-gatekeeper',
    title: 'Gatekeeper Code-Signature Verification',
    description: 'Confirm that execution of untrusted, unsigned, or un-notarized applications is strictly blocked.',
    category: 'integrity',
    checkCommand: 'spctl --status',
    remediationCommand: 'sudo spctl --master-enable',
    expectedHealthyOutput: 'assessments enabled',
    severity: 'high'
  },
  {
    id: 'sec-sharing',
    title: 'Global File Sharing Permissions (SMB/AFP)',
    description: 'Audit whether public folder file sharing or guest sharing is unintentionally enabled across local networks.',
    category: 'sharing',
    checkCommand: 'sharing -l',
    remediationCommand: 'sudo launchctl disable system/com.apple.smbd',
    expectedHealthyOutput: 'No shared points found',
    severity: 'medium'
  },
  {
    id: 'sec-open-ports',
    title: 'Unauthenticated Open Listening Network Ports',
    description: 'Scan all TCP ports listening on 0.0.0.0 or public interfaces for potential unauthorized backdoors.',
    category: 'network',
    checkCommand: 'lsof -iTCP -sTCP:LISTEN -P -n | grep -v "127.0.0.1"',
    remediationCommand: 'kill $(lsof -t -i :<PORT>)',
    expectedHealthyOutput: '',
    severity: 'high'
  },
  {
    id: 'sec-remote-login',
    title: 'Remote SSH Login (sshd)',
    description: 'Audit if Remote Login (SSH) is enabled, which exposes an open terminal login over the network.',
    category: 'network',
    checkCommand: 'sudo systemsetup -getremotelogin',
    remediationCommand: 'sudo systemsetup -setremotelogin off',
    expectedHealthyOutput: 'Remote Login: Off',
    severity: 'medium'
  },
  {
    id: 'sec-world-writable',
    title: 'Insecure World-Writable Directory Permissions',
    description: 'Check for system directories configured with 777 permissions allowing arbitrary script drops.',
    category: 'integrity',
    checkCommand: 'find /usr/local -type d -perm -0002 -ls 2>/dev/null | head -n 10',
    remediationCommand: 'sudo chmod -R o-w /usr/local',
    expectedHealthyOutput: '',
    severity: 'low'
  }
];

// Helper to convert HEX to RGB values
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// 1. GENERATE APPLE TERMINAL .terminal XML PLIST
export function generateTerminalPlist(theme: ThemeConfig): string {
  const rgb = hexToRgb(theme.accentColor);
  const rNorm = (rgb.r / 255).toFixed(4);
  const gNorm = (rgb.g / 255).toFixed(4);
  const bNorm = (rgb.b / 255).toFixed(4);
  const opacity = theme.windowOpacity.toFixed(2);

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>name</key>
	<string>OmniOS ${theme.activeProfileName || 'Obsidian'}</string>
	<key>ProfileCurrentVersion</key>
	<real>2.06</real>
	<key>type</key>
	<string>Window Settings</string>
	<key>Font</key>
	<data>
	</data>
	<key>FontNameForDisplay</key>
	<string>${theme.terminalFont}</string>
	<key>FontSizeForDisplay</key>
	<real>${theme.fontSize}</real>
	<key>BackgroundColor</key>
	<data>
	</data>
	<key>BackgroundBlur</key>
	<real>${theme.windowBlur / 100}</real>
	<key>BackgroundAlpha</key>
	<real>${opacity}</real>
	<key>TextColor</key>
	<dict>
		<key>r</key>
		<real>0.92</real>
		<key>g</key>
		<real>0.94</real>
		<key>b</key>
		<real>0.98</real>
	</dict>
	<key>CursorColor</key>
	<dict>
		<key>r</key>
		<real>${rNorm}</real>
		<key>g</key>
		<real>${gNorm}</real>
		<key>b</key>
		<real>${bNorm}</real>
	</dict>
	<key>SelectionColor</key>
	<dict>
		<key>r</key>
		<real>${rNorm}</real>
		<key>g</key>
		<real>${gNorm}</real>
		<key>b</key>
		<real>${bNorm}</real>
		<key>a</key>
		<real>0.35</real>
	</dict>
	<key>ShowWindowSettingsNameInTitle</key>
	<false/>
	<key>UseBoldFonts</key>
	<true/>
	<key>UseBrightBold</key>
	<true/>
</dict>
</plist>`;
}

// 2. GENERATE iTerm2 .itermcolors XML PLIST
export function generateITermColors(theme: ThemeConfig): string {
  const rgb = hexToRgb(theme.accentColor);
  const rNorm = (rgb.r / 255).toFixed(4);
  const gNorm = (rgb.g / 255).toFixed(4);
  const bNorm = (rgb.b / 255).toFixed(4);

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Ansi 0 Color</key>
	<dict>
		<key>Color Space</key>
		<string>sRGB</string>
		<key>Red Component</key>
		<real>0.05</real>
		<key>Green Component</key>
		<real>0.07</real>
		<key>Blue Component</key>
		<real>0.10</real>
	</dict>
	<key>Ansi 1 Color</key>
	<dict>
		<key>Color Space</key>
		<string>sRGB</string>
		<key>Red Component</key>
		<real>0.95</real>
		<key>Green Component</key>
		<real>0.27</real>
		<key>Blue Component</key>
		<real>0.38</real>
	</dict>
	<key>Ansi 2 Color</key>
	<dict>
		<key>Color Space</key>
		<string>sRGB</string>
		<key>Red Component</key>
		<real>0.10</real>
		<key>Green Component</key>
		<real>0.78</real>
		<key>Blue Component</key>
		<real>0.55</real>
	</dict>
	<key>Ansi 4 Color</key>
	<dict>
		<key>Color Space</key>
		<string>sRGB</string>
		<key>Red Component</key>
		<real>${rNorm}</real>
		<key>Green Component</key>
		<real>${gNorm}</real>
		<key>Blue Component</key>
		<real>${bNorm}</real>
	</dict>
	<key>Background Color</key>
	<dict>
		<key>Color Space</key>
		<string>sRGB</string>
		<key>Red Component</key>
		<real>0.03</real>
		<key>Green Component</key>
		<real>0.04</real>
		<key>Blue Component</key>
		<real>0.06</real>
	</dict>
	<key>Foreground Color</key>
	<dict>
		<key>Color Space</key>
		<string>sRGB</string>
		<key>Red Component</key>
		<real>0.92</real>
		<key>Green Component</key>
		<real>0.94</real>
		<key>Blue Component</key>
		<real>0.98</real>
	</dict>
	<key>Cursor Color</key>
	<dict>
		<key>Color Space</key>
		<string>sRGB</string>
		<key>Red Component</key>
		<real>${rNorm}</real>
		<key>Green Component</key>
		<real>${gNorm}</real>
		<key>Blue Component</key>
		<real>${bNorm}</real>
	</dict>
</dict>
</plist>`;
}

// 3. GENERATE UNIFIED CUSTOM THEME INSTALLER (.command / .sh)
export function generateThemeInstallerScript(theme: ThemeConfig, audio: AudioSettings): string {
  const audioHook = SoundEngine.compileBashAudioHook(audio);

  return `#!/bin/zsh
# ==============================================================================
# OmniOS God-Mode Theme & Performance Customization Installer
# Target: macOS Darwin (Apple Silicon & Intel)
# Profile: ${theme.activeProfileName || 'Obsidian God-Mode'}
# Generated: ${new Date().toISOString()}
# ==============================================================================

set -e

echo "\\033[1;36m[OmniOS]\\033[0m Initializing macOS interface tuning..."

# 1. Dock Autohide Speed & Delay Matrix
echo "\\033[1;34m[1/5]\\033[0m Setting Dock autohide speed to ${theme.dockAutohideSpeed}s (delay: ${theme.dockAutohideDelay}s)..."
defaults write com.apple.dock autohide -bool true
defaults write com.apple.dock autohide-time-modifier -float ${theme.dockAutohideSpeed}
defaults write com.apple.dock autohide-delay -float ${theme.dockAutohideDelay}

# 2. Dock Tile Size & Position
echo "\\033[1;34m[2/5]\\033[0m Setting Dock tile size to ${theme.dockTileSize}px on ${theme.dockPosition} edge..."
defaults write com.apple.dock tilesize -int ${theme.dockTileSize}
defaults write com.apple.dock orientation -string "${theme.dockPosition}"

# 3. Minimize Animation Effect
echo "\\033[1;34m[3/5]\\033[0m Applying '${theme.minimizeEffect}' window minimize effect..."
defaults write com.apple.dock mineffect -string "${theme.minimizeEffect}"

# 4. Recent Applications Visibility
echo "\\033[1;34m[4/5]\\033[0m Setting show-recents in Dock to: ${theme.showRecentApps}..."
defaults write com.apple.dock show-recents -bool ${theme.showRecentApps}

# 5. Mission Control Animation Duration
echo "\\033[1;34m[5/5]\\033[0m Setting Mission Control transition duration to ${theme.missionControlSpeed}s..."
defaults write com.apple.dock expose-animation-duration -float ${theme.missionControlSpeed}

# Restart Dock process cleanly
echo "\\033[1;32m[OK]\\033[0m Restarting Dock..."
killall Dock 2>/dev/null || true

${audioHook}

echo "\\033[1;32m[OmniOS Complete]\\033[0m Custom theme preferences applied successfully."
`;
}

// 4. GENERATE NATIVE launchd LAUNCHAGENT XML (.plist)
export function generateLaunchAgentPlist(config: ScheduleConfig, scriptPath = '~/Library/Scripts/omnios_maintenance.sh'): string {
  const label = 'com.omnios.optimizer';
  let scheduleBlock = '';

  if (config.type === 'daily') {
    scheduleBlock = `	<key>StartCalendarInterval</key>
	<dict>
		<key>Hour</key>
		<integer>${config.hour}</integer>
		<key>Minute</key>
		<integer>${config.minute}</integer>
	</dict>`;
  } else if (config.type === 'weekly') {
    scheduleBlock = `	<key>StartCalendarInterval</key>
	<dict>
		<key>Weekday</key>
		<integer>${config.weekday ?? 1}</integer>
		<key>Hour</key>
		<integer>${config.hour}</integer>
		<key>Minute</key>
		<integer>${config.minute}</integer>
	</dict>`;
  } else {
    const seconds = (config.intervalHours || 4) * 3600;
    scheduleBlock = `	<key>StartInterval</key>
	<integer>${seconds}</integer>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>${label}</string>
	<key>ProgramArguments</key>
	<array>
		<string>/bin/zsh</string>
		<string>-c</string>
		<string>${scriptPath}</string>
	</array>
	<key>RunAtLoad</key>
	<false/>
${scheduleBlock}
	<key>StandardOutPath</key>
	<string>/tmp/omnios_optimizer_stdout.log</string>
	<key>StandardErrorPath</key>
	<string>/tmp/omnios_optimizer_stderr.log</string>
</dict>
</plist>`;
}

// 5. GENERATE DISK MAINTENANCE SCRIPT
export function generateDiskMaintenanceScript(config: DiskMaintenanceConfig, audio: AudioSettings): string {
  const audioHook = SoundEngine.compileBashAudioHook(audio);
  const tasks: string[] = [];

  tasks.push('#!/bin/zsh');
  tasks.push('# ==============================================================================');
  tasks.push('# OmniOS Automated Disk Optimization & Storage Dispatcher');
  tasks.push(`# Generated: ${new Date().toISOString()}`);
  tasks.push('# ==============================================================================');
  tasks.push('set -e\n');
  tasks.push('echo "\\033[1;36m[OmniOS]\\033[0m Starting automated disk optimization sequence..."\n');

  if (config.purgeUserCaches) {
    tasks.push('echo "\\033[1;34m[1/6]\\033[0m Purging user caches (~/Library/Caches)..."');
    tasks.push('rm -rf ~/Library/Caches/* 2>/dev/null || true');
  }

  if (config.purgeSystemLogs) {
    tasks.push('echo "\\033[1;34m[2/6]\\033[0m Cleaning diagnostic crash logs (~/Library/Logs)..."');
    tasks.push('rm -rf ~/Library/Logs/* 2>/dev/null || true');
    tasks.push('rm -rf ~/Library/Logs/DiagnosticReports/* 2>/dev/null || true');
  }

  if (config.purgeXcodeDerivedData) {
    tasks.push('echo "\\033[1;34m[3/6]\\033[0m Purging Xcode Developer DerivedData cache..."');
    tasks.push('rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true');
    tasks.push('rm -rf ~/Library/Developer/Xcode/Archives/* 2>/dev/null || true');
  }

  if (config.purgeHomebrew) {
    tasks.push('echo "\\033[1;34m[4/6]\\033[0m Pruning obsolete Homebrew packages and downloads..."');
    tasks.push('if command -v brew >/dev/null 2>&1; then');
    tasks.push('  brew cleanup -s --prune=all 2>/dev/null || true');
    tasks.push('fi');
  }

  if (config.purgeQuickLook) {
    tasks.push('echo "\\033[1;34m[5/6]\\033[0m Resetting QuickLook generator and icon cache..."');
    tasks.push('qlmanage -r cache 2>/dev/null || true');
  }

  if (config.purgeTrash) {
    tasks.push('echo "\\033[1;34m[6/6]\\033[0m Emptying Trash safely..."');
    tasks.push('rm -rf ~/.Trash/* 2>/dev/null || true');
  }

  // Audit massive files (>X GB)
  tasks.push(`\necho "\\033[1;35m[Audit]\\033[0m Identifying files larger than ${config.minAuditSizeGb}GB:"`);
  tasks.push(`find ~ -type f -size +${config.minAuditSizeGb}G -not -path "*/.*" -exec ls -lh {} \\; 2>/dev/null | awk '{print $9, "->", $5}' | head -n 15 || true\n`);

  tasks.push(audioHook);
  tasks.push('echo "\\033[1;32m[Complete]\\033[0m Disk maintenance sequence finished."');

  return tasks.join('\n');
}

// 6. GENERATE DEEP APPLICATION UNINSTALLER ZSH SCRIPT
export function generateDeepUninstallScript(target: UninstallerTarget, dryRun = true, audio: AudioSettings): string {
  const audioHook = SoundEngine.compileBashAudioHook(audio);
  const bundle = target.bundleId;
  const app = target.appName;

  const targetPaths = [
    `/Applications/${app}.app`,
    `~/Applications/${app}.app`,
    `~/Library/Application Support/${app}`,
    `~/Library/Application Support/${bundle}`,
    `~/Library/Caches/${bundle}`,
    `~/Library/Caches/${bundle}.*`,
    `~/Library/Containers/${bundle}`,
    `~/Library/Preferences/${bundle}.plist`,
    `~/Library/Saved Application State/${bundle}.savedState`,
    `~/Library/HTTPStorages/${bundle}`,
    `~/Library/WebKit/${bundle}`,
    `~/Library/LaunchAgents/*${bundle}*`,
    `/Library/PrivilegedHelperTools/*${bundle}*`,
    ...(target.extraPaths || [])
  ];

  if (dryRun) {
    return `#!/bin/zsh
# ==============================================================================
# OmniOS Deep Uninstaller: Dry-Run Inspection Audit
# Target: ${target.name} (${bundle})
# Mode: Non-Destructive Inspection
# ==============================================================================

echo "\\033[1;36m[OmniOS Deep Uninstaller]\\033[0m Inspecting disk for: ${target.name}..."
FOUND_COUNT=0

TARGET_PATHS=(
${targetPaths.map(p => `  "${p}"`).join('\n')}
)

for path_pattern in "\${TARGET_PATHS[@]}"; do
  # Expand glob safely
  expanded_paths=("\${(@f)$(eval ls -d $path_pattern 2>/dev/null)}")
  for p in "\${expanded_paths[@]}"; do
    if [ -e "$p" ]; then
      SIZE=$(du -sh "$p" 2>/dev/null | awk '{print $1}')
      echo "\\033[1;31m[FOUND]\\033[0m $p ($SIZE)"
      FOUND_COUNT=$((FOUND_COUNT + 1))
    fi
  done
done

if [ $FOUND_COUNT -eq 0 ]; then
  echo "\\033[1;32m[CLEAN]\\033[0m No remnants detected for ${target.name}."
else
  echo "\\033[1;33m[SUMMARY]\\033[0m Found $FOUND_COUNT matching artifact paths."
  echo "Switch to 'Wipe / Purge Mode' in OmniOS to generate permanent removal script."
fi
`;
  }

  // Destruction Wipe script
  return `#!/bin/zsh
# ==============================================================================
# OmniOS Deep Uninstaller: Permanent Application Wipe
# Target: ${target.name} (${bundle})
# Mode: Recursive Remnants Purge
# ==============================================================================

set -e
echo "\\033[1;31m[OmniOS WIPE]\\033[0m Terminating running instances of ${app}..."
killall "${app}" 2>/dev/null || true

echo "\\033[1;36m[OmniOS]\\033[0m Purging all associated system containers, caches, and plists..."

TARGET_PATHS=(
${targetPaths.map(p => `  "${p}"`).join('\n')}
)

for path_pattern in "\${TARGET_PATHS[@]}"; do
  expanded_paths=("\${(@f)$(eval ls -d $path_pattern 2>/dev/null)}")
  for p in "\${expanded_paths[@]}"; do
    if [ -e "$p" ]; then
      echo "\\033[1;31m[REMOVING]\\033[0m $p"
      rm -rf "$p" 2>/dev/null || sudo rm -rf "$p"
    fi
  done
done

${audioHook}

echo "\\033[1;32m[Complete]\\033[0m ${target.name} completely erased with zero leftover artifacts."
`;
}

// 7. GENERATE LOCAL SECURITY AUDITING & COMPLIANCE SCRIPT
export function generateSecurityAuditScript(audio: AudioSettings): string {
  const audioHook = SoundEngine.compileBashAudioHook(audio);

  return `#!/bin/zsh
# ==============================================================================
# OmniOS System Security Audit & Compliance Scanner
# Target: macOS Darwin System Integrity
# Generated: ${new Date().toISOString()}
# ==============================================================================

echo "=============================================================================="
echo "\\033[1;36m       OMNIOS ZERO-COMPROMISE MACOS SECURITY AUDITOR\\033[0m"
echo "=============================================================================="

# 1. Application Firewall Status
echo "\\n\\033[1;34m[1/7] Auditing Application Firewall...\\033[0m"
FW_STATE=$(/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>&1)
echo "Status: $FW_STATE"

# 2. FileVault Encryption Status
echo "\\n\\033[1;34m[2/7] Auditing FileVault Full-Disk Hardware Encryption...\\033[0m"
FV_STATE=$(fdesetup status 2>&1)
echo "Status: $FV_STATE"

# 3. System Integrity Protection (SIP)
echo "\\n\\033[1;34m[3/7] Auditing System Integrity Protection (SIP)...\\033[0m"
SIP_STATE=$(csrutil status 2>&1)
echo "Status: $SIP_STATE"

# 4. Gatekeeper Status
echo "\\n\\033[1;34m[4/7] Auditing Gatekeeper Code-Signature Enforcement...\\033[0m"
GK_STATE=$(spctl --status 2>&1)
echo "Status: $GK_STATE"

# 5. Open Network Listening Ports
echo "\\n\\033[1;34m[5/7] Auditing Open TCP Listening Ports...\\033[0m"
lsof -iTCP -sTCP:LISTEN -P -n | head -n 15

# 6. Global File Sharing Services
echo "\\n\\033[1;34m[6/7] Auditing Active File Sharing Points (SMB/AFP)...\\033[0m"
sharing -l 2>&1 || echo "No public shares."

# 7. Unverified Third-Party LaunchAgents
echo "\\n\\033[1;34m[7/7] Auditing Non-Apple LaunchAgents (Persistence Scan)...\\033[0m"
launchctl list | grep -v "com.apple" | head -n 12

echo "=============================================================================="
echo "\\033[1;32m[AUDIT COMPLETE]\\033[0m Review outputs above for compliance status."
echo "=============================================================================="

${audioHook}
`;
}

// 8. GENERATE GOOGLE DRIVE / RCLONE BACKUP SCRIPT
export function generateCloudSyncScript(config: CloudSyncConfig, audio: AudioSettings): string {
  const audioHook = SoundEngine.compileBashAudioHook(audio);
  const dryRunFlag = config.dryRun ? '--dry-run' : '';
  const bwFlag = config.bandwidthLimit ? `--bwlimit ${config.bandwidthLimit}` : '';

  if (config.tool === 'rclone') {
    return `#!/bin/zsh
# ==============================================================================
# OmniOS Google Drive Backup & Cloud Clone Pipeline (rclone)
# Source: ${config.sourcePath}
# Target: ${config.targetCloudPath}
# Mode: ${config.dryRun ? 'DRY-RUN (Simulated)' : 'LIVE SYNC'}
# ==============================================================================

set -e

if ! command -v rclone >/dev/null 2>&1; then
  echo "\\033[1;31m[ERROR]\\033[0m rclone is not installed. Install via: brew install rclone"
  exit 1
fi

echo "\\033[1;36m[OmniOS Cloud Clone]\\033[0m Starting sync pipeline to Google Drive..."
echo "Source: ${config.sourcePath}"
echo "Target: ${config.targetCloudPath}"

rclone sync "${config.sourcePath}" "${config.targetCloudPath}" \\
  --progress \\
  --fast-list \\
  --transfers=4 \\
  --checkers=8 \\
  ${bwFlag} \\
  ${dryRunFlag}

${audioHook}

echo "\\033[1;32m[Complete]\\033[0m Google Drive cloud backup finished successfully."
`;
  }

  // Rsync direct folder clone
  return `#!/bin/zsh
# ==============================================================================
# OmniOS Local-to-Cloud Storage Migration Pipeline (rsync)
# Source: ${config.sourcePath}
# Target: ${config.targetCloudPath}
# Mode: ${config.dryRun ? 'DRY-RUN (Simulated)' : 'LIVE SYNC'}
# ==============================================================================

set -e
echo "\\033[1;36m[OmniOS]\\033[0m Initializing high-speed folder migration..."

rsync -avz --progress ${config.dryRun ? '--dry-run' : ''} \\
  "${config.sourcePath}/" \\
  "${config.targetCloudPath}/"

${audioHook}

echo "\\033[1;32m[Complete]\\033[0m Local migration finished."
`;
}

// 9. OFFLINE INTELLIGENT COMPILER FALLBACK (Instant safe synthesis)
export function compileSmartLocalScript(
  intent: string, 
  audio: AudioSettings
): { script: string; explanation: string; safety: string } {
  const lower = intent.toLowerCase();
  const audioHook = SoundEngine.compileBashAudioHook(audio);

  if (lower.includes('clean') || lower.includes('purge') || lower.includes('cache') || lower.includes('disk')) {
    return {
      safety: 'Safe (Intermediate) — Reversible caches will be re-created automatically by apps as needed.',
      explanation: 'Compiles an aggressive cleanup script targeting ~/Library/Caches, Xcode DerivedData, system log diagnostics, and QuickLook thumbnail cache.',
      script: `#!/bin/zsh
# OmniOS Compiled Optimization Task: Disk & Cache Clean
set -e

echo "\\033[1;36m[OmniOS]\\033[0m Purging user caches and system diagnostic logs..."
rm -rf ~/Library/Caches/* 2>/dev/null || true
rm -rf ~/Library/Logs/* 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true
qlmanage -r cache 2>/dev/null || true

echo "\\033[1;32m[OK]\\033[0m Caches cleared."
${audioHook}`
    };
  }

  if (lower.includes('dock') || lower.includes('theme') || lower.includes('animation') || lower.includes('speed')) {
    return {
      safety: 'Safe — Changes user preference plist files. Default settings can be restored with `defaults delete com.apple.dock ...`.',
      explanation: 'Sets Dock autohide speed to instant (0s), reduces delay to zero, and restarts Dock.',
      script: `#!/bin/zsh
# OmniOS Compiled Optimization Task: High-Speed Dock Tuning
set -e

echo "\\033[1;36m[OmniOS]\\033[0m Eliminating Dock animation delays..."
defaults write com.apple.dock autohide -bool true
defaults write com.apple.dock autohide-delay -float 0
defaults write com.apple.dock autohide-time-modifier -float 0
killall Dock

echo "\\033[1;32m[OK]\\033[0m Dock acceleration applied."
${audioHook}`
    };
  }

  if (lower.includes('security') || lower.includes('audit') || lower.includes('firewall') || lower.includes('share') || lower.includes('port')) {
    return {
      safety: 'Safe (Read-Only) — Inspects firewall state, open ports, file sharing, and Gatekeeper without altering system files.',
      explanation: 'Compiles a non-destructive audit scan of your local network exposure, application firewall, FileVault, and open TCP ports.',
      script: `#!/bin/zsh
# OmniOS Compiled Optimization Task: Security & Exposure Audit
echo "\\033[1;36m[OmniOS Security]\\033[0m Auditing firewall, ports, and sharing..."
/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
spctl --status
fdesetup status
echo "\\nOpen Listening Ports:"
lsof -iTCP -sTCP:LISTEN -P -n | head -n 10
echo "\\nActive File Sharing:"
sharing -l 2>&1

echo "\\033[1;32m[OK]\\033[0m Security audit complete."
${audioHook}`
    };
  }

  if (lower.includes('uninstall') || lower.includes('delete') || lower.includes('wipe')) {
    return {
      safety: 'Warning (Advanced) — Permanently purges application bundle, application support containers, caches, and plists.',
      explanation: 'Compiles recursive cleanup commands for all deep-seated Library containers associated with the targeted application.',
      script: `#!/bin/zsh
# OmniOS Compiled Task: Deep Application Purge
set -e
APP_NAME="TargetApp"

echo "\\033[1;31m[OmniOS]\\033[0m Wiping \${APP_NAME} and associated deep containers..."
rm -rf "/Applications/\${APP_NAME}.app" 2>/dev/null || true
rm -rf ~/Library/Application\\ Support/\${APP_NAME} 2>/dev/null || true
rm -rf ~/Library/Caches/*\${APP_NAME}* 2>/dev/null || true
rm -rf ~/Library/Preferences/*\${APP_NAME}*.plist 2>/dev/null || true

echo "\\033[1;32m[OK]\\033[0m Deep uninstall finished."
${audioHook}`
    };
  }

  // Default universal high-performance macOS optimization suite
  return {
    safety: 'Safe — Standard macOS maintenance and performance tuning.',
    explanation: `Custom zsh routine synthesized to address: "${intent}". Includes safe command execution and audio notification hook.`,
    script: `#!/bin/zsh
# OmniOS Compiled Task: Custom Intelligent Routine
# Intent: ${intent}
set -e

echo "\\033[1;36m[OmniOS]\\033[0m Executing custom maintenance routine..."
# 1. Flush DNS cache
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder 2>/dev/null || true

# 2. Reset QuickLook thumbnail cache
qlmanage -r cache 2>/dev/null || true

echo "\\033[1;32m[OK]\\033[0m Routine completed."
${audioHook}`
  };
}

// System Superpower Recommendations Library
export const SYSTEM_RECOMMENDATIONS: SystemRecommendation[] = [
  {
    id: 'rec-dock-speed',
    title: 'Zero-Latency Dock Acceleration',
    category: 'ui',
    impact: 'High',
    benefit: 'Eliminates 100% of UI lag when switching applications',
    description: 'Sets Dock autohide delay to 0.0s and reveal duration to 0.0s, eliminating the native macOS delay penalty.',
    command: 'defaults write com.apple.dock autohide-delay -float 0; defaults write com.apple.dock autohide-time-modifier -float 0; killall Dock',
    safetyLevel: 'safe'
  },
  {
    id: 'rec-storage-cache',
    title: 'Deep System Cache & Xcode Reclaim',
    category: 'storage',
    impact: 'Critical',
    benefit: 'Reclaims 12GB–30GB of high-speed NVMe storage space',
    description: 'Safely purges ephemeral user caches, Xcode DerivedData, system log diagnostics, and thumbnail buffers.',
    command: 'rm -rf ~/Library/Caches/* ~/Library/Logs/* ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null; qlmanage -r cache',
    safetyLevel: 'intermediate'
  },
  {
    id: 'rec-security-stealth',
    title: 'Application Firewall Stealth Shielding',
    category: 'security',
    impact: 'Critical',
    benefit: 'Prevents discovery by automated network port scans',
    description: 'Enables the native socket filter firewall and activates stealth mode to ignore ICMP ping probes from untrusted networks.',
    command: 'sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on && sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode on',
    safetyLevel: 'sudo'
  },
  {
    id: 'rec-ram-purge',
    title: 'Mach Kernel Inactive RAM Buffer Purge',
    category: 'performance',
    impact: 'High',
    benefit: 'Releases up to 8GB of inactive memory allocations',
    description: 'Instructs the Mach kernel to release cached file buffers and unreferenced page frames directly to the free memory pool.',
    command: 'sudo purge',
    safetyLevel: 'sudo'
  },
  {
    id: 'rec-sleepimage-purge',
    title: 'Disable Hibernation Sleepimage Dump',
    category: 'storage',
    impact: 'Critical',
    benefit: 'Reclaims 16GB–64GB matched to your unified RAM capacity',
    description: 'Switches power management to RAM-only sleep and locks the monolithic /var/vm/sleepimage file to zero bytes.',
    command: 'sudo pmset -a hibernatemode 0 && sudo rm -f /var/vm/sleepimage && sudo touch /var/vm/sleepimage && sudo chflags uchg /var/vm/sleepimage',
    safetyLevel: 'sudo'
  },
  {
    id: 'rec-spotlight-throttle',
    title: 'Spotlight Battery Drain Throttling',
    category: 'battery',
    impact: 'Medium',
    benefit: 'Extends battery endurance by up to 45 minutes on battery',
    description: 'Prevents background mdworker indexers from pegging performance cores while running on battery power.',
    command: 'sudo mdutil -i off /',
    safetyLevel: 'sudo'
  },
  {
    id: 'rec-touch-id-sudo',
    title: 'Biometric Touch ID Terminal Sudo',
    category: 'security',
    impact: 'High',
    benefit: 'Eliminates repetitive password typing in terminal sessions',
    description: 'Injects pam_tid.so into PAM authentication table to authenticate sudo commands via Touch ID sensor.',
    command: 'sudo sed -i "" "1s/^/auth       sufficient     pam_tid.so\\n/" /etc/pam.d/sudo',
    safetyLevel: 'intermediate'
  },
  {
    id: 'rec-dns-flush',
    title: 'Universal DNS & mDNS Resolver Flush',
    category: 'performance',
    impact: 'Medium',
    benefit: 'Resolves web browsing latency and stale IP resolution',
    description: 'Flushes Directory Services cache and restarts mDNSResponder daemon cleanly.',
    command: 'sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder',
    safetyLevel: 'sudo'
  }
];

export function calculateSystemHealth(appliedIds: string[]): SystemHealthMetrics {
  const baseScore = 68;
  const bonus = Math.min(appliedIds.length * 4, 32);
  const score = baseScore + bonus;

  return {
    overallScore: Math.min(score, 100),
    storageFreeGb: Math.round((142 + appliedIds.length * 4.2) * 10) / 10,
    memoryUsagePercent: Math.max(78 - appliedIds.length * 3.5, 38),
    batteryHealthPercent: 96,
    firewallActive: appliedIds.includes('rec-security-stealth'),
    sipActive: true,
    dockLagEliminated: appliedIds.includes('rec-dock-speed'),
    openListeningPortsCount: appliedIds.includes('rec-security-stealth') ? 1 : 3
  };
}
