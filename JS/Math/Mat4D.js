import * as M3 from "./Mat3D.js"

/**
 *
 * @param {[number, number, number, number]} u
 * @returns {[
*	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* ]}
*/
export function rightIsoclinicQuaternion(u) {
	const [p, q, r, s] = u
	return [
		p, -q, -r, -s,
		q, p, s, -r,
		r, -s, p, q,
		s, r, -q, p,
	]
}

/**
 *
 * @param {[number, number, number, number]} u
 * @returns {[
*	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* ]}
*/
export function leftIsoclinicQuaternion(u) {
	const [a, b, c, d] = u
	return [
		a, -b, -c, -d,
		b, a, -d, c,
		c, d, a, -b,
		d, -c, b, a,
	]
}

/**
 *
 * @param {[number, number, number]} position3
 * @returns {[
*	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* ]}
*/
export function translate(position3) {
	return [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		position3[0], position3[1], position3[2], 1,
	]
}

/**
 *
 * @param {number} scale
 * @returns {[
 *	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * ]}
 */
export function dilate(scale) {
	return [
		scale, 0, 0, 0,
		0, scale, 0, 0,
		0, 0, scale, 0,
		0, 0, 0, 1,
	]
}

/**
 * @param {[
 *	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * ]} m
 * @param {number} precision
 */
export function print(m, precision = 0) {
	let txt = ""
	const cols = m.length / 4
	for (let i = 0; i < 4; i++) {
		txt += "|"
		for (let j = 0; j < cols; j++)
			txt += " " + (Math.round(m[4 * j + i] * 100) / 100).toFixed(precision)
		txt += " |"
		if (i < cols - 1)
			txt += "\n"
	}
	console.log(txt)
}

/**
 * @param {[
 *	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * ]} a
 * @param {[
 *	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * ]} b
 * @returns {[
 *	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * ]}
 */
export function mul_4x4(a, b) {
	return [
		a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3],
		a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3],
		a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3],
		a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3],

		a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7],
		a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7],
		a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7],
		a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7],

		a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11],
		a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11],
		a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11],
		a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11],

		a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15],
		a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15],
		a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15],
		a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15],
	]
}

/**
 * @param  {...[
*	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* ]} args
 * @returns {[
*	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* ]}
 */
export function mul_4x4s(...args) {
	let m = args[args.length - 1]
	for (let i = args.length - 2; i >= 0; i--)
		m = mul_4x4(args[i], m)
	return m
}

/**
* @param {[
*	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* ]} m
* @param {[number, number, number, number]} u
* @returns {[number, number, number, number]}
*/
export function mul_4x4_4x1(m, u) {
	return [
		m[0] * u[0] + m[4] * u[1] + m[8] * u[2] + m[12] * u[3],
		m[1] * u[0] + m[5] * u[1] + m[9] * u[2] + m[13] * u[3],
		m[2] * u[0] + m[6] * u[1] + m[10] * u[2] + m[14] * u[3],
		m[3] * u[0] + m[7] * u[1] + m[11] * u[2] + m[15] * u[3],
	]
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
export function mul_mx4_4xn(a, b) {
	const m = a.length / 4
	const n = b.length / 4

	const mat = Array(m * n)
	for (let i = 0; i < m; i++) {
		for (let j = 0; j < n; j++) {
			mat[i + j * 4] =
				a[i + 0 * 4] * b[0 + j * 4] +
				a[i + 1 * 4] * b[1 + j * 4] +
				a[i + 2 * 4] * b[2 + j * 4] +
				a[i + 3 * 4] * b[3 + j * 4]
		}
	}

	return mat
}

/**
* @param {[
*	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* ]} a
* @param {number[]} b
* @returns {number[]}
*/
export function mul_4x4_4xn(a, b) {
	const n = b.length / 4

	const mat = Array(4 * n)
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < n; j++) {
			mat[i + j * 4] =
				a[i + 0 * 4] * b[0 + j * 4] +
				a[i + 1 * 4] * b[1 + j * 4] +
				a[i + 2 * 4] * b[2 + j * 4] +
				a[i + 3 * 4] * b[3 + j * 4]
		}
	}

	return mat
}

export function mul_4x4_4xns(...args) {
	let m = args[args.length - 1]
	for (let i = args.length - 2; i >= 0; i--)
		m = mul_4x4_4xn(args[i], m)
	return m
}

/**
* @param {[
*	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* ]} m
* @returns {[
*	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* ]}
*/
export function inverse(m) {
	const
		m_0 = m[0], m_1 = m[1], m_2 = m[2],
		m_3 = m[4], m_4 = m[5], m_5 = m[6],
		m_6 = m[8], m_7 = m[9], m_8 = m[10],
		m_9 = m[12], m_10 = m[13], m_11 = m[14]

	const det = 1 / (m_2 * m_4 * m_6 - m_1 * m_5 * m_6 - m_2 * m_3 * m_7 + m_0 * m_5 * m_7 + m_1 * m_3 * m_8 - m_0 * m_4 * m_8)

	return [
		det * (m_5 * m_7 - m_4 * m_8), det * (-m_2 * m_7 + m_1 * m_8), det * (m_2 * m_4 - m_1 * m_5), 0,
		det * (-m_5 * m_6 + m_3 * m_8), det * (m_2 * m_6 - m_0 * m_8), det * (-m_2 * m_3 + m_0 * m_5), 0,
		det * (m_4 * m_6 - m_3 * m_7), det * (-m_1 * m_6 + m_0 * m_7), det * (m_1 * m_3 - m_0 * m_4), 0,

		det * (-m_11 * m_4 * m_6 + m_10 * m_5 * m_6 + m_11 * m_3 * m_7 - m_10 * m_3 * m_8 - m_5 * m_7 * m_9 + m_4 * m_8 * m_9),
		det * (m_1 * m_11 * m_6 - m_10 * m_2 * m_6 - m_0 * m_11 * m_7 + m_0 * m_10 * m_8 + m_2 * m_7 * m_9 - m_1 * m_8 * m_9),
		det * (-m_1 * m_11 * m_3 + m_10 * m_2 * m_3 + m_0 * m_11 * m_4 - m_0 * m_10 * m_5 - m_2 * m_4 * m_9 + m_1 * m_5 * m_9),
		1,
	]
}

/**
* @param {[
*	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* ]} m
* @returns {[number, number, number]}
*/
export function getPosition3(m) {
	return [m[12], m[13], m[14]]
}

/**
* @param {[
*	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* 	number, number, number, number,
* ]} m
* @param {[number, number, number]} position3
*/
export function setPosition3(m, position3) {
	m[12] = position3[0]
	m[13] = position3[1]
	m[14] = position3[2]
}

/**
 * @param {[number, number, number, number]} u
 * @param {[number, number, number, number]} v
 */
export function dot(u, v) {
	return u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3]
}

/**
 * @param {[number, number, number, number]} u
 */
export function mag(u) {
	return Math.hypot(u[0], u[1], u[2], u[3])
}

/**
 * @param {[number, number, number, number]} u
 * @returns {[number, number, number, number]}
 */
export function norm(u) {
	const m = 1 / mag(u)
	return [
		u[0] * m,
		u[1] * m,
		u[2] * m,
		u[3] * m,
	]
}

/**
 * @param {[number, number, number, number]} u
 * @param {[number, number, number, number]} v
 * @returns {[number, number, number, number]}
 */
export function projnorm(u, v) {
	const scale = dot(v, u)
	return [
		scale * u[0],
		scale * u[1],
		scale * u[2],
		scale * u[3],
	]
}

/**
 * @param {[number, number, number, number]} u
 * @param {[number, number, number, number]} v
 * @returns {[number, number, number, number]}
 */
export function proj(u, v) {
	const scale = dot(v, u) / dot(u, u)
	return [
		scale * u[0],
		scale * u[1],
		scale * u[2],
		scale * u[3],
	]
}

/**
 * @param {[number, number, number, number]} u
 * @param {number} s
 * @returns {[number, number, number, number]}
 */
export function muls(u, s) {
	return [
		u[0] * s,
		u[1] * s,
		u[2] * s,
		u[3] * s,
	]
}

/**
 * @param {[number, number, number, number]} u
 * @param {[number, number, number, number]} v
 * @returns {[number, number, number, number]}
 */
export function add(u, v) {
	return [
		u[0] + v[0],
		u[1] + v[1],
		u[2] + v[2],
		u[3] + v[3],
	]
}

/**
 * @param {[number, number, number, number]} u
 * @param {[number, number, number, number]} v
 * @returns {[number, number, number, number]}
 */
export function sub(u, v) {
	return [
		u[0] - v[0],
		u[1] - v[1],
		u[2] - v[2],
		u[3] - v[3],
	]
}
/**
 * @param {[number, number, number, number]} u
 * @param {[number, number, number, number]} v
 * @param {[number, number, number, number]} w
 * @returns {[number, number, number, number]}
 */
export function sub_2(u, v, w) {
	return [
		u[0] - v[0] - w[0],
		u[1] - v[1] - w[1],
		u[2] - v[2] - w[2],
		u[3] - v[3] - w[3],
	]
}

/**
 * @param {[number, number, number, number]} u
 * @param {[number, number, number, number]} v
 * @param {[number, number, number, number]} w
 * @param {[number, number, number, number]} x
 * @returns {[number, number, number, number]}
 */
export function sub_3(u, v, w, x) {
	return [
		u[0] - v[0] - w[0] - x[0],
		u[1] - v[1] - w[1] - x[1],
		u[2] - v[2] - w[2] - x[2],
		u[3] - v[3] - w[3] - x[3],
	]
}

/**
 * @type {[number, number, number, number]}
 */
export const X = [1, 0, 0, 0]
/**
 * @type {[number, number, number, number]}
 */
export const Y = [0, 1, 0, 0]
/**
 * @type {[number, number, number, number]}
 */
export const Z = [0, 0, 1, 0]
/**
 * @type {[number, number, number, number]}
 */
export const W = [0, 0, 0, 1]
/**
 * @type {[number, number, number, number]}
 */
export const ZERO = [0, 0, 0, 0]
/**
 * @type {[number, number, number, number]}
 */
export const ONE = [1, 1, 1, 1]

/**
 * @type {[
 * 	[number, number, number],
 * 	[number, number, number],
 * 	[number, number, number]
 * ]}
 */
const CANDIDATE_AXES = [
	[-1, 0, 0],
	[0, -1, 0],
	[0, 0, 1],
]

/**
 * @param {[number, number, number]} position3
 * @param {[number, number, number]} direction3
 * @param {[number, number, number]} up3
 * @returns {[
 *	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * ]}
 */
export function lookAlong(position3, direction3, up3) {
	let candidateHead = 0
	const candidates = []
	if (!!up3) candidates.push(up3)
	candidates.push(...CANDIDATE_AXES)

	const e0 = direction3

	/**
	 * @type {[number, number, number]}
	 */
	let e1
	do {
		const axis = candidates[candidateHead++]
		e1 = M3.sub(axis, M3.proj(e0, axis))
	} while (M3.mag(e1) < 0.0001)
	e1 = M3.norm(e1)

	let e2
	do {
		const axis = candidates[candidateHead++]
		e2 = M3.sub_2(axis, M3.proj(e0, axis), M3.proj(e1, axis))
	} while (M3.mag(e2) < 0.0001)
	e2 = M3.norm(e2)

	return [
		e1[0], e1[1], e1[2], 0,
		e2[0], e2[1], e2[2], 0,
		e0[0], e0[1], e0[2], 0,
		position3[0], position3[1], position3[2], 1,
	]
}

/**
 * @param {[number, number, number]} here3
 * @param {[number, number, number]} there3
 * @param {[number, number, number] | undefined} up3
 */
export function lookAt(here3, there3, up3 = M3.Z) {
	const position = here3
	const direction = M3.norm(M3.sub(there3, here3))
	return lookAlong(position, direction, up3)
}

/**
 * @param {number} angle
 * @returns {[
 *	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * ]}
 */
export function rotate_xy(angle) {
	return [
		Math.cos(angle), -Math.sin(angle), 0, 0,
		Math.sin(angle), Math.cos(angle), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1,
	]
}

/**
 * @param {number} angle
 * @returns {[
 *	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * ]}
 */
export function rotate_yz(angle) {
	return [
		1, 0, 0, 0,
		0, Math.cos(angle), -Math.sin(angle), 0,
		0, Math.sin(angle), Math.cos(angle), 0,
		0, 0, 0, 1,
	]
}

/**
 * @param {number} angle
 * @returns {[
 *	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * ]}
 */
export function rotate_zx(angle) {
	return [
		Math.cos(angle), 0, Math.sin(angle), 0,
		0, 1, 0, 0,
		-Math.sin(angle), 0, Math.cos(angle), 0,
		0, 0, 0, 1,
	]
}

/**
 * @param {[
 *	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * ]} m
 * @returns {[
 *	number, number, number,
 * 	number, number, number,
 * 	number, number, number,
 * ]}
 */
export function trim_3x3(m) {
	return [
		m[0], m[1], m[2],
		m[4], m[5], m[6],
		m[8], m[9], m[10],
	]
}

/**
 * @param {number[]} m
 * @returns {number[]}
 */
export function trim_4xn_3xn(m) {
	const n = m.length / 4
	const mat = Array(3 * n)
	for (let i = 0; i < n; i++) {
		mat[3 * i + 0] = m[4 * i + 0]
		mat[3 * i + 1] = m[4 * i + 1]
		mat[3 * i + 2] = m[4 * i + 2]
	}
	return mat
}

/**
 * @param {[
 *	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * ]} m
 * @returns {[
 *	number, number, number, number, number,
 * 	number, number, number, number, number,
 * 	number, number, number, number, number,
 * 	number, number, number, number, number,
 * 	number, number, number, number, number,
 * ]}
 */
export function expand_4x4_5x5(m) {
	return [
		m[0], m[1], m[2], m[3], 0,
		m[4], m[5], m[6], m[7], 0,
		m[8], m[9], m[10], m[11], 0,
		m[12], m[13], m[14], m[15], 0,
		0, 0, 0, 0, 1,
	]
}