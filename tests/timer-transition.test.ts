import { playTone } from '#js/audio';
import PomodoroTimer from '#js/timer';
import { afterAll, afterEach, beforeEach, describe, expect, it, jest, type Mock, mock } from 'bun:test';

// Capture the real implementation before mocking. bun's mock.module is global
// and persists across files (vitest's vi.mock was per-file), so we restore it in
// afterAll to keep the mock from leaking into other test files.
const realPlayTone = playTone;

// Mock the audio module so we can count tone calls. timer.ts imports it via the
// '#js/audio' subpath import, which resolves to the same file, so this
// intercepts both.
mock.module('#js/audio', () => ({ playTone: jest.fn() }));

afterAll(() => {
	mock.module('#js/audio', () => ({ playTone: realPlayTone }));
});

function setupDOM() {
	document.body.innerHTML = `
    <svg><circle class="progress-ring__progress" r="50"></circle></svg>
    <div id="timer-display"></div>
    <div id="current-mode"></div>
    <div id="session-count"></div>
    <button id="start-button"><span class="btn-text"></span><span class="btn-icon"></span></button>
    <button id="pause-button"></button>
    <button id="reset-button"></button>
    <div id="completed-sessions"></div>
    <div id="total-focus-time"></div>
  `;
}

describe('PomodoroTimer completion transition', () => {
	beforeEach(() => {
		setupDOM();
		globalThis.localStorage = { setItem: jest.fn(), getItem: jest.fn() } as any;
		jest.useFakeTimers();
		(globalThis as any).playTone = jest.fn();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('reset() cancels a pending auto-advance', () => {
		const timer = new PomodoroTimer({ skipInit: true });
		timer.updateUI = () => {};
		timer.updateProgress = () => {};
		timer.settings.autoStartBreaks = true;
		timer.state.remainingTime = 1;
		timer.start();

		// Session completes; advance is now scheduled but hasn't fired.
		jest.advanceTimersByTime(1000);
		expect(timer.state.mode).toBe('focus');
		expect(timer.transitioning).toBe(true);

		// Reset during the transition window must cancel the pending advance.
		timer.reset();
		jest.advanceTimersByTime(1000);

		expect(timer.transitioning).toBe(false);
		expect(timer.state.mode).toBe('focus');
		expect(timer.state.isRunning).toBe(false);
	});

	it('ignores Space while transitioning so it cannot restart a finished timer', () => {
		const timer = new PomodoroTimer({ skipInit: true });
		timer.updateUI = () => {};
		timer.updateProgress = () => {};
		timer.bindEvents();
		timer.settings.autoStartBreaks = false;
		timer.state.remainingTime = 1;
		timer.start();

		jest.advanceTimersByTime(1000);
		expect(timer.transitioning).toBe(true);
		expect(timer.state.isRunning).toBe(false);

		// Space during the transition window must be a no-op.
		document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
		expect(timer.state.isRunning).toBe(false);

		// After the advance fires, Space works normally again.
		jest.advanceTimersByTime(1000);
		expect(timer.transitioning).toBe(false);
	});

	it('does not double-beep on auto-advance (start tone suppressed)', () => {
		(playTone as unknown as Mock<typeof playTone>).mockClear();
		const timer = new PomodoroTimer({ skipInit: true });
		timer.updateUI = () => {};
		timer.updateProgress = () => {};
		timer.settings.autoStartBreaks = true;
		timer.state.remainingTime = 1;
		timer.start(); // user-initiated start: one 440Hz tone
		expect(playTone).toHaveBeenCalledTimes(1);

		jest.advanceTimersByTime(1000); // complete(): one 880Hz tone
		jest.advanceTimersByTime(1000); // advanceMode → start(false): no tone
		// 1 start + 1 complete = 2 tones total, not 3.
		expect(playTone).toHaveBeenCalledTimes(2);
	});
});

describe('PomodoroTimer expired-session resume', () => {
	beforeEach(() => {
		setupDOM();
		jest.useFakeTimers();
		(globalThis as any).playTone = jest.fn();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('flags expired without running complete() during loadStats', () => {
		const today = new Date().toDateString();
		globalThis.localStorage = {
			setItem: jest.fn(),
			getItem: jest.fn().mockReturnValue(
				JSON.stringify({
					date: today,
					completedSessions: 2,
					mode: 'focus',
					remainingTime: 1500,
					totalTime: 1500,
					isRunning: true,
					isPaused: false,
					lastUpdated: Date.now() - 1600 * 1000,
				}),
			),
		} as any;

		const timer = new PomodoroTimer({ skipInit: true });
		const completeSpy = jest.spyOn(timer, 'complete');

		const { resume, expired } = timer.loadStats();

		expect(resume).toBe(false);
		expect(expired).toBe(true);
		// complete() must NOT run during load — it is deferred to init().
		expect(completeSpy).not.toHaveBeenCalled();
		expect(timer.state.completedSessions).toBe(2);
	});
});
