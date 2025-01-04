import * as M from "./Mat.js"

/**
 * @param {M.Vector3} u
 * @param {M.Vector3} v
 */
export function dot(u, v) {
	return u[0] * v[0] + u[1] * v[1] + u[2] * v[2]
}

/**
 * @param {M.Vector3} u
 * @param {M.Vector3} v
 * @returns {M.Vector3}
 */
export function cross(u, v) {
	return [
		u[1] * v[2] - v[1] * u[2],
		v[2] * u[0] - u[2] * v[0],
		u[0] * v[1] - v[0] * u[1],
	]
}

/**
 * @param {M.Vector3} u
 */
export function mag(u) {
	return Math.hypot(u[0], u[1], u[2])
}

/**
 * @param {M.Vector3} u
 * @returns {M.Vector3}
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
 * @param {M.Vector3} u
 * @param {M.Vector3} v
 * @returns {M.Vector3}
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
 * @param {M.Vector3} u
 * @param {number} s
 * @returns {M.Vector3}
 */
export function muls(u, s) {
	return [
		u[0] * s,
		u[1] * s,
		u[2] * s,
	]
}

/**
 * @param {M.Vector3} u
 * @param {M.Vector3} v
 * @returns {M.Vector3}
 */
export function sub(u, v) {
	return [
		u[0] - v[0],
		u[1] - v[1],
		u[2] - v[2],
	]
}

/**
 * @param {M.Vector3} u
 * @param {M.Vector3} v
 * @param {M.Vector3} w
 * @returns {M.Vector3}
 */
export function sub_2(u, v, w) {
	return [
		u[0] - v[0] - w[0],
		u[1] - v[1] - w[1],
		u[2] - v[2] - w[2],
	]
}

/**
 * @param {M.Vector3} u
 * @param {M.Vector3} v
 * @param {M.Vector3} w
 * @param {M.Vector3} x
 * @returns {M.Vector3}
 */
export function sub_3(u, v, w, x) {
	return [
		u[0] - v[0] - w[0] - x[0],
		u[1] - v[1] - w[1] - x[1],
		u[2] - v[2] - w[2] - x[2],
	]
}

/**
 * @type {M.Vector3}
 */
export const X = [1, 0, 0]
/**
 * @type {M.Vector3}
 */
export const Y = [0, 1, 0]
/**
 * @type {M.Vector3}
 */
export const Z = [0, 0, 1]
/**
 * @type {M.Vector3}
 */
export const ZERO = [0, 0, 0]
/**
 * @type {M.Vector3}
 */
export const ONE = [1, 1, 1]
