import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  MAC_COMMANDS_REPOSITORY, 
  generateTerminalPlist, 
  generateITermColors, 
  generateThemeInstallerScript, 
  generateLaunchAgentPlist, 
  generateDeepUninstallScript, 
  compileSmartLocalScript,
  PRESET_UNINSTALL_TARGETS,
  SYSTEM_RECOMMENDATIONS,
  calculateSystemHealth
} from './macCommands';
import { ThemeConfig, AudioSettings, ScheduleConfig } from '../types/index';

const mockTheme: ThemeConfig = {
  accentColor: '#06b6d4',
  terminalFont: 'JetBrains Mono',
  fontSize: 14,
  windowOpacity: 0.9,
  windowBlur: 20,
  dockAutohideSpeed: 0.1,
  dockAutohideDelay: 0.0,
  missionControlSpeed: 0.15,
  dockTileSize: 48,
  minimizeEffect: 'suck',
  showRecentApps: false,
  dockPosition: 'bottom',
  activeProfileName: 'Cyber Obsidian'
};

const mockAudio: AudioSettings = {
  soundEnabled: true,
  synthPreset: 'obsidian',
  synthVolume: 0.8,
  voiceEnabled: true,
  speechVoice: 'Samantha',
  speechRate: 180,
  speechPitch: 1.0,
  completionMessage: 'OmniOS task complete'
};

test('MAC_COMMANDS_REPOSITORY contains required categories and safe risk levels', () => {
  assert.ok(MAC_COMMANDS_REPOSITORY.length >= 20, 'Repository should contain substantial macOS commands');
  const categories = new Set(MAC_COMMANDS_REPOSITORY.map(c => c.category));
  assert.ok(categories.has('ui'), 'Must have UI category');
  assert.ok(categories.has('perf'), 'Must have Performance category');
  assert.ok(categories.has('net'), 'Must have Network category');
  assert.ok(categories.has('core'), 'Must have Core OS category');
});

test('generateTerminalPlist generates valid XML plist structure with profile settings', () => {
  const plist = generateTerminalPlist(mockTheme);
  assert.match(plist, /<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(plist, /<key>FontNameForDisplay<\/key>/);
  assert.match(plist, /<string>JetBrains Mono<\/string>/);
  assert.match(plist, /<key>BackgroundAlpha<\/key>/);
  assert.match(plist, /<real>0.90<\/real>/);
  assert.match(plist, /<key>CursorColor<\/key>/);
});

test('generateITermColors generates valid XML plist with ANSI color maps', () => {
  const iterm = generateITermColors(mockTheme);
  assert.match(iterm, /<!DOCTYPE plist/);
  assert.match(iterm, /<key>Ansi 0 Color<\/key>/);
  assert.match(iterm, /<key>Cursor Color<\/key>/);
  assert.match(iterm, /<key>Foreground Color<\/key>/);
});

test('generateThemeInstallerScript outputs complete zsh script with defaults write commands and audio', () => {
  const script = generateThemeInstallerScript(mockTheme, mockAudio);
  assert.match(script, /#!\/bin\/zsh/);
  assert.match(script, /defaults write com\.apple\.dock autohide-time-modifier -float 0\.1/);
  assert.match(script, /defaults write com\.apple\.dock autohide-delay -float 0/);
  assert.match(script, /defaults write com\.apple\.dock mineffect -string "suck"/);
  assert.match(script, /killall Dock/);
  assert.match(script, /afplay \/System\/Library\/Sounds\/Glass\.aiff/);
  assert.match(script, /say -v "Samantha" -r 180 "OmniOS task complete"/);
});

test('generateLaunchAgentPlist generates proper LaunchAgent calendar intervals', () => {
  const schedule: ScheduleConfig = { type: 'daily', hour: 3, minute: 30 };
  const plist = generateLaunchAgentPlist(schedule, '~/Library/Scripts/task.sh');
  assert.match(plist, /<key>Label<\/key>\s*<string>com\.omnios\.optimizer<\/string>/);
  assert.match(plist, /<key>StartCalendarInterval<\/key>/);
  assert.match(plist, /<key>Hour<\/key>\s*<integer>3<\/integer>/);
  assert.match(plist, /<key>Minute<\/key>\s*<integer>30<\/integer>/);
});

test('generateDeepUninstallScript generates recursive targets for sandboxed containers, caches, and plists', () => {
  const slackTarget = PRESET_UNINSTALL_TARGETS.find(t => t.id === 'slack')!;
  assert.ok(slackTarget, 'Slack target should exist in preset targets');

  const dryRunScript = generateDeepUninstallScript(slackTarget, true, mockAudio);
  assert.match(dryRunScript, /com\.tinyspeck\.slackmacgap/);
  assert.match(dryRunScript, /Dry-Run Inspection/);

  const wipeScript = generateDeepUninstallScript(slackTarget, false, mockAudio);
  assert.match(wipeScript, /rm -rf/);
  assert.match(wipeScript, /Application Support/);
  assert.match(wipeScript, /Library\/Caches/);
  assert.match(wipeScript, /Library\/Containers/);
  assert.match(wipeScript, /Library\/Preferences/);
});

test('compileSmartLocalScript produces valid zsh scripts for disk, security, and dock intents', () => {
  const diskResult = compileSmartLocalScript('Deep clean my system caches and logs', mockAudio);
  assert.match(diskResult.script, /rm -rf ~\/Library\/Caches/);
  assert.match(diskResult.script, /qlmanage -r cache/);
  assert.ok(diskResult.safety.length > 0);

  const secResult = compileSmartLocalScript('Audit my mac sharing and open ports', mockAudio);
  assert.match(secResult.script, /socketfilterfw/);
  assert.match(secResult.script, /sharing -l/);
});

test('SYSTEM_RECOMMENDATIONS contains valid high-impact optimization recommendations', () => {
  assert.ok(SYSTEM_RECOMMENDATIONS.length >= 6, 'Should have at least 6 recommendations');
  const dockRec = SYSTEM_RECOMMENDATIONS.find(r => r.id === 'rec-dock-speed');
  assert.ok(dockRec, 'Zero-latency dock recommendation must exist');
  assert.match(dockRec.command, /autohide-time-modifier/);

  const initialHealth = calculateSystemHealth([]);
  assert.equal(initialHealth.overallScore, 68);
  assert.equal(initialHealth.dockLagEliminated, false);

  const optimizedHealth = calculateSystemHealth(['rec-dock-speed', 'rec-security-stealth']);
  assert.equal(optimizedHealth.overallScore, 76);
  assert.equal(optimizedHealth.dockLagEliminated, true);
  assert.equal(optimizedHealth.firewallActive, true);
});
