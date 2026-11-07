export type CommandCategory = 'ui' | 'perf' | 'net' | 'core';
export type RiskLevel = 'safe' | 'intermediate' | 'advanced' | 'sudo';

export interface MacCommand {
  id: string;
  name: string;
  category: CommandCategory;
  description: string;
  command: string;
  undoCommand?: string;
  risk: RiskLevel;
  tags: string[];
  explanation: string;
}

export interface ThemeConfig {
  accentColor: string;
  terminalFont: string;
  fontSize: number;
  windowOpacity: number;
  windowBlur: number;
  dockAutohideSpeed: number; // e.g. 0.1s
  dockAutohideDelay: number; // e.g. 0.0s
  missionControlSpeed: number; // e.g. 0.15s
  dockTileSize: number; // e.g. 48px
  minimizeEffect: 'genie' | 'scale' | 'suck';
  showRecentApps: boolean;
  dockPosition: 'bottom' | 'left' | 'right';
  activeProfileName: string;
}

export interface ScheduleConfig {
  type: 'daily' | 'weekly' | 'hourly';
  hour: number;
  minute: number;
  weekday?: number; // 0=Sunday, 1=Monday...
  intervalHours?: number;
}

export interface DiskMaintenanceConfig {
  purgeUserCaches: boolean;
  purgeSystemLogs: boolean;
  purgeXcodeDerivedData: boolean;
  purgeHomebrew: boolean;
  purgeTrash: boolean;
  purgeQuickLook: boolean;
  minAuditSizeGb: number;
  schedule: ScheduleConfig;
}

export interface CloudSyncConfig {
  sourcePath: string;
  targetCloudPath: string;
  tool: 'rclone' | 'rsync' | 'gdrive-cli';
  bandwidthLimit: string;
  dryRun: boolean;
  backupRetentionDays: number;
  syncExcludes: string[];
}

export interface UninstallerTarget {
  id: string;
  name: string;
  bundleId: string;
  appName: string;
  vendor: string;
  extraPaths?: string[];
}

export interface SecurityCheckItem {
  id: string;
  title: string;
  description: string;
  category: 'network' | 'sharing' | 'integrity' | 'system';
  checkCommand: string;
  remediationCommand: string;
  expectedHealthyOutput: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AudioSettings {
  soundEnabled: boolean;
  synthPreset: 'obsidian' | 'quantum' | 'warp' | 'glass' | 'triad';
  synthVolume: number;
  voiceEnabled: boolean;
  speechVoice: string;
  speechRate: number; // 120-220
  speechPitch: number; // 0.8-1.4
  completionMessage: string;
}

export interface TerminalLogEntry {
  id: string;
  type: 'input' | 'output' | 'error' | 'system' | 'success';
  content: string;
  timestamp: string;
  exitCode?: number;
}

export type CopilotModel = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon';
export type CopilotRole = 'architect' | 'security' | 'performance';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  model?: CopilotModel;
  codeSnippet?: string;
}

export interface SystemRecommendation {
  id: string;
  title: string;
  category: 'performance' | 'security' | 'storage' | 'battery' | 'ui';
  impact: 'High' | 'Medium' | 'Critical';
  benefit: string;
  description: string;
  command: string;
  safetyLevel: 'safe' | 'intermediate' | 'sudo';
}

export interface SystemHealthMetrics {
  overallScore: number;
  storageFreeGb: number;
  memoryUsagePercent: number;
  batteryHealthPercent: number;
  firewallActive: boolean;
  sipActive: boolean;
  dockLagEliminated: boolean;
  openListeningPortsCount: number;
}
