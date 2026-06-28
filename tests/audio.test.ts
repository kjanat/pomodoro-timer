import { playTone } from '#js/audio';
import { afterEach, beforeEach, describe, expect, it, jest } from 'bun:test';

describe('playTone helper', () => {
	let originalWindow: typeof globalThis.window;

	beforeEach(() => {
		originalWindow = globalThis.window;
	});

	afterEach(() => {
		globalThis.window = originalWindow;
		// ensure a fresh AudioContext for each test
		playTone.ctx = undefined;
	});

	it('does nothing when window is undefined', () => {
		// @ts-expect-error - Testing undefined window scenario
		delete globalThis.window;
		expect(() => playTone(440)).not.toThrow();
	});

	it('uses AudioContext if available', () => {
		const oscStart = jest.fn();
		const oscStop = jest.fn();
		const oscillator = {
			connect: jest.fn(),
			start: oscStart,
			stop: oscStop,
			frequency: { value: 0 },
			type: '',
		};
		const gain = { connect: jest.fn(), gain: { value: 0 } };
		const createOscillator = jest.fn(() => oscillator);
		const createGain = jest.fn(() => gain);

		// Use a proper function constructor instead of arrow function with jest.fn
		class AudioContextMock {
			createOscillator = createOscillator;
			createGain = createGain;
			destination = {};
			currentTime = 0;
			state = 'running';
			resume = jest.fn();
		}
		(globalThis.window as any).AudioContext = AudioContextMock;
		expect(() => playTone(330, 0.1)).not.toThrow();
		expect(createOscillator).toHaveBeenCalled();
		expect(oscStart).toHaveBeenCalled();
		expect(oscStop).toHaveBeenCalled();
	});

	it('resumes a suspended AudioContext', () => {
		const resume = jest.fn();
		const oscillator = {
			connect: jest.fn(),
			start: jest.fn(),
			stop: jest.fn(),
			frequency: { value: 0 },
			type: '',
		};
		const gain = { connect: jest.fn(), gain: { value: 0 } };
		const createOscillator = jest.fn(() => oscillator);
		const createGain = jest.fn(() => gain);

		// Use a proper function constructor instead of arrow function with jest.fn
		class AudioContextMock {
			createOscillator = createOscillator;
			createGain = createGain;
			destination = {};
			currentTime = 0;
			state = 'suspended';
			resume = resume;
		}
		(globalThis.window as any).AudioContext = AudioContextMock;
		playTone(440);
		expect(resume).toHaveBeenCalled();
	});
});
