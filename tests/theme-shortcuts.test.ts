import type { KeyboardShortcuts, ThemeManager } from '#js/app';
import { beforeAll, beforeEach, describe, expect, it } from 'bun:test';

let ThemeManagerCls: typeof ThemeManager;
let KeyboardShortcutsCls: typeof KeyboardShortcuts;

beforeAll(async () => {
	window.matchMedia = window.matchMedia
		|| (() => ({
			matches: false,
			addEventListener: () => {},
			removeEventListener: () => {},
		}));
	await import('#js/app');
	document.dispatchEvent(new Event('DOMContentLoaded'));
	ThemeManagerCls = window.themeManager!.constructor as typeof ThemeManager;
	KeyboardShortcutsCls = window.keyboardShortcuts!
		.constructor as typeof KeyboardShortcuts;
});

describe('ThemeManager', () => {
	beforeEach(() => {
		document.documentElement.className = '';
		localStorage.clear();
	});

	it('applies dark theme', () => {
		const tm = new ThemeManagerCls();
		tm.setTheme('dark');
		expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
		expect(localStorage.getItem('theme')).toBe('dark');
	});
});

describe('KeyboardShortcuts panel helpers', () => {
	beforeEach(() => {
		document.body.innerHTML = '<div id="settings-panel"></div>';
	});
	it('toggles and closes panel', () => {
		const ks = new KeyboardShortcutsCls();
		ks.toggleSettings();
		expect(
			document.getElementById('settings-panel')!.hasAttribute('open'),
		).toBe(true);
		ks.closeSettings();
		expect(
			document.getElementById('settings-panel')!.hasAttribute('open'),
		).toBe(false);
	});
});
