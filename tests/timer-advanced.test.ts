import PomodoroTimer from '#js/timer';
import { beforeEach, describe, expect, it, jest } from 'bun:test';

describe('PomodoroTimer advanced', () => {
	beforeEach(() => {
		globalThis.localStorage = { setItem: jest.fn(), getItem: jest.fn() } as any;
		(globalThis as any).playTone = jest.fn();
	});

	it('advanceMode cycles correctly', () => {
		const timer = new PomodoroTimer({ skipInit: true });
		timer.updateUI = () => {};
		timer.state.completedSessions = 3;
		timer.settings.longBreakInterval = 4;
		timer.advanceMode();
		expect(timer.state.mode).toBe('shortBreak');

		timer.state.mode = 'focus';
		timer.state.completedSessions = 4;
		timer.advanceMode();
		expect(timer.state.mode as string).toBe('longBreak');

		timer.state.mode = 'shortBreak';
		timer.advanceMode();
		expect(timer.state.mode as string).toBe('focus');
	});

	it('saveStats and loadStats round trip', () => {
		const timer = new PomodoroTimer({ skipInit: true });
		timer.state.completedSessions = 2;
		timer.saveStats();
		const saved = JSON.parse(
			(globalThis.localStorage.setItem as any).mock.calls[0][1],
		);
		globalThis.localStorage.getItem = jest.fn(() => JSON.stringify(saved)) as any;

		const timer2 = new PomodoroTimer({ skipInit: true });
		timer2.loadStats();
		expect(timer2.state.completedSessions).toBe(2);
	});
});
