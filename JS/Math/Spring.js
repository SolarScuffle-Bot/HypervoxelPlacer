// Import M3 library for vector operations
import * as M from './Mat.js';

export const handledSprings = []

/**
 * @template {number | number[]} T
 * @param {T} initialPosition
 * @param {number} frequency
 * @param {number} damping
 */
export function create(initialPosition, frequency, damping) {
    const velocity = (typeof initialPosition === 'number') ? 0 : new Array(initialPosition.length).fill(0);
    const spring = {
        frequency,
        damping,
        target: initialPosition,
        position: initialPosition,
        velocity,
    };
	handledSprings.push(spring)
	return spring
}

/**
 * @param {number} dt
 * @param {number} position
 * @param {number} velocity
 * @param {number} frequency
 * @param {number} damping
 */
export function rungeKuttaNumber(dt, position, velocity, frequency, damping) {
    const w = frequency;
    const d = -2 * damping;
    const w2 = w ** 2;
    const dt2 = 0.5 * dt;
    const dt6 = dt / 6;

    const k1x = velocity;
    const k1v = d * w * velocity - w2 * position;

    const k2x = velocity + k1v * dt2;
    const k2v = d * w * (velocity + k1v * dt2) - w2 * (position + k1x * dt2);

    const k3x = velocity + k2v * dt2;
    const k3v = d * w * (velocity + k2v * dt2) - w2 * (position + k2x * dt2);

    const k4x = velocity + k3v * dt;
    const k4v = d * w * (velocity + k3v * dt) - w2 * (position + k3x * dt);

    return [
        position + dt6 * (k1x + 2 * k2x + 2 * k3x + k4x),
        velocity + dt6 * (k1v + 2 * k2v + 2 * k3v + k4v),
    ];
}

/**
 * @param {number} dt
 * @param {number[]} position
 * @param {number[]} velocity
 * @param {number} frequency
 * @param {number} damping
 */
export function rungeKuttaArray(dt, position, velocity, frequency, damping) {
    const w = frequency;
    const d = -2 * damping;
    const w2 = w ** 2;
    const dt2 = 0.5 * dt;
    const dt6 = dt / 6;

    const k1x = velocity;
    const k1v = M.sub(M.mul_s(velocity, d * w), M.mul_s(position, w2));

    const k2x = M.add(velocity, M.mul_s(k1v, dt2));
    const k2v = M.sub(M.mul_s(M.add(velocity, M.mul_s(k1v, dt2)), d * w), M.mul_s(M.add(position, M.mul_s(k1x, dt2)), w2));

    const k3x = M.add(velocity, M.mul_s(k2v, dt2));
    const k3v = M.sub(M.mul_s(M.add(velocity, M.mul_s(k2v, dt2)), d * w), M.mul_s(M.add(position, M.mul_s(k2x, dt2)), w2));

    const k4x = M.add(velocity, M.mul_s(k3v, dt));
    const k4v = M.sub(M.mul_s(M.add(velocity, M.mul_s(k3v, dt)), d * w), M.mul_s(M.add(position, M.mul_s(k3x, dt)), w2));

    return [
        M.add(position, M.mul_s(M.add(M.add(k1x, M.mul_s(k2x, 2)), M.add(M.mul_s(k3x, 2), k4x)), dt6)),
        M.add(velocity, M.mul_s(M.add(M.add(k1v, M.mul_s(k2v, 2)), M.add(M.mul_s(k3v, 2), k4v)), dt6)),
    ];
}

/**
 * @param {number} dt
 */
export function updateAllSprings(dt) {
	dt = Math.min(dt, 1 / 60)

    for (const spring of handledSprings) {
        const g = spring.target
        const isNumber = typeof spring.position === 'number'
        const position = isNumber ? spring.position - g : M.sub(spring.position, g)

        const [newPosition, newVelocity] = isNumber
            ? rungeKuttaNumber(dt, /**@type {number}*/(position), spring.velocity, spring.frequency, spring.damping)
            : rungeKuttaArray(dt, /**@type {number[]}*/(position), spring.velocity, spring.frequency, spring.damping);

        spring.position = isNumber ? newPosition + g : M.add(/**@type {number[]}*/(newPosition), g);
        spring.velocity = newVelocity;
    }
}
