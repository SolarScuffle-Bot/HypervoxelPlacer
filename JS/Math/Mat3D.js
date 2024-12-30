/**
 * @param {[number, number, number]} u
 * @param {[number, number, number]} v
 */
export function dot(u, v) {
	return u[0] * v[0] + u[1] * v[1] + u[2] * v[2]
}

/**
 * @param {[number, number, number]} u
 * @param {[number, number, number]} v
 * @returns {[number, number, number]}
 */
export function cross(u, v) {
	return [
		u[1] * v[2] - v[1] * u[2],
		v[2] * u[0] - u[2] * v[0],
		u[0] * v[1] - v[0] * u[1],
	]
}

/**
 * @param {[number, number, number]} u
 */
export function mag(u) {
	return Math.hypot(u[0], u[1], u[2])
}

/**
 * @param {[number, number, number]} u
 * @returns {[number, number, number]}
 */
export function norm(u) {
	const m = 1 / mag(u)
	return [
		u[0] * m,
		u[1] * m,
		u[2] * m,
	]
}

/**
 * @param {[number, number, number]} u
 * @param {[number, number, number]} v
 * @returns {[number, number, number]}
 */
export function proj(u, v) {
	const scale = dot(v, u) / dot(u, u)
	return [
		scale * u[0],
		scale * u[1],
		scale * u[2],
	]
}

/**
 * @param {[number, number, number]} u
 * @param {number} s
 * @returns {[number, number, number]}
 */
export function muls(u, s) {
	return [
		u[0] * s,
		u[1] * s,
		u[2] * s,
	]
}

/**
 * @param {[number, number, number]} u
 * @param {[number, number, number]} v
 * @returns {[number, number, number]}
 */
export function sub(u, v) {
	return [
		u[0] - v[0],
		u[1] - v[1],
		u[2] - v[2],
	]
}

/**
 * @param {[number, number, number]} u
 * @param {[number, number, number]} v
 * @param {[number, number, number]} w
 * @returns {[number, number, number]}
 */
export function sub_2(u, v, w) {
	return [
		u[0] - v[0] - w[0],
		u[1] - v[1] - w[1],
		u[2] - v[2] - w[2],
	]
}

/**
 * @param {[number, number, number]} u
 * @param {[number, number, number]} v
 * @param {[number, number, number]} w
 * @param {[number, number, number]} x
 * @returns {[number, number, number]}
 */
export function sub_3(u, v, w, x) {
	return [
		u[0] - v[0] - w[0] - x[0],
		u[1] - v[1] - w[1] - x[1],
		u[2] - v[2] - w[2] - x[2],
	]
}

/**
 * @type {[number, number, number]}
 */
export const X = [1, 0, 0]
/**
 * @type {[number, number, number]}
 */
export const Y = [0, 1, 0]
/**
 * @type {[number, number, number]}
 */
export const Z = [0, 0, 1]
/**
 * @type {[number, number, number]}
 */
export const ZERO = [0, 0, 0]
/**
 * @type {[number, number, number]}
 */
export const ONE = [1, 1, 1]
