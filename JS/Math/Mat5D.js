import * as M from "./Mat.js"
import * as M4 from "./Mat4D.js"

/**
 * @param {number} x
 * @returns {M.Matrix5}
 */
export function diagonal(x) {
	return [
		x, 0, 0, 0, 0,
		0, x, 0, 0, 0,
		0, 0, x, 0, 0,
		0, 0, 0, x, 0,
		0, 0, 0, 0, x,
	]
}

/**
 * @type {M.Matrix5}
 */
export const IDENTITY = diagonal(1)

/**
 *
 * @param {M.Matrix5} m
 * @returns {M.Vector4}
 */
export function getPosition4(m) {
	return [m[20], m[21], m[22], m[23]]
}

/**
 *
 * @param {M.Matrix5} m
 * @param {M.Vector4} position4
 */
export function setPosition4(m, position4) {
	m[20] = position4[0]
	m[21] = position4[1]
	m[22] = position4[2]
	m[23] = position4[3]
}

/**
 *
 * @param {M.Matrix5} m
 * @returns {M.Vector4}
 */
export function getRight4(m) {
	return [m[0], m[1], m[2], m[3]]
}

/**
 *
 * @param {M.Matrix5} m
 * @returns {M.Vector4}
 */
export function getForward4(m) {
	return [m[5], m[6], m[7], m[8]]
}

/**
 *
 * @param {M.Matrix5} m
 * @returns {M.Vector4}
 */
export function getUp4(m) {
	return [m[10], m[11], m[12], m[13]]
}

/**
 *
 * @param {M.Matrix5} m
 * @returns {M.Vector4}
 */
export function getAna4(m) {
	return [m[15], m[16], m[17], m[18]]
}

/**
 * @param {M.Vector4} position4
 * @returns {M.Matrix5}
 */
export function translate(position4) {
	return [
		1, 0, 0, 0, 0,
		0, 1, 0, 0, 0,
		0, 0, 1, 0, 0,
		0, 0, 0, 1, 0,
		position4[0], position4[1], position4[2], position4[3], 1,
	]
}

/**
 * @param {M.Vector4} scale4
 * @returns {M.Matrix5}
 */
export function dilate(scale4) {
	return [
		scale4[0], 0, 0, 0, 0,
		0, scale4[1], 0, 0, 0,
		0, 0, scale4[2], 0, 0,
		0, 0, 0, scale4[3], 0,
		0, 0, 0, 0, 1,
	]
}

/**
 * @param {number} angle
 * @returns {M.Matrix5}
 */
export function rotate_xy(angle) {
	return [
		Math.cos(angle), -Math.sin(angle), 0, 0, 0,
		Math.sin(angle), Math.cos(angle), 0, 0, 0,
		0, 0, 1, 0, 0,
		0, 0, 0, 1, 0,
		0, 0, 0, 0, 1,
	]
}

/**
 * @param {number} angle
 * @returns {M.Matrix5}
 */
export function rotate_yz(angle) {
	return [
		1, 0, 0, 0, 0,
		0, Math.cos(angle), -Math.sin(angle), 0, 0,
		0, Math.sin(angle), Math.cos(angle), 0, 0,
		0, 0, 0, 1, 0,
		0, 0, 0, 0, 1,
	]
}

/**
 * @param {number} angle
 * @returns {M.Matrix5}
 */
export function rotate_zx(angle) {
	return [
		Math.cos(angle), 0, Math.sin(angle), 0, 0,
		0, 1, 0, 0, 0,
		-Math.sin(angle), 0, Math.cos(angle), 0, 0,
		0, 0, 0, 1, 0,
		0, 0, 0, 0, 1,
	]
}

/**
 * @param {number} angle
 * @returns {M.Matrix5}
 */
export function rotate_wy(angle) {
	return [
		1, 0, 0, 0, 0,
		0, Math.cos(angle), 0, Math.sin(angle), 0,
		0, 0, 1, 0, 0,
		0, -Math.sin(angle), 0, Math.cos(angle), 0,
		0, 0, 0, 0, 1,
	]
}

/**
 * @param {number} angle
 * @returns {M.Matrix5}
 */
export function rotate_wx(angle) {
	return [
		Math.cos(angle), 0, 0, Math.sin(angle), 0,
		0, 1, 0, 0, 0,
		0, 0, 1, 0, 0,
		-Math.sin(angle), 0, 0, Math.cos(angle), 0,
		0, 0, 0, 0, 1,
	]
}

/**
 * @param {number} angle
 * @returns {M.Matrix5}
 */
export function rotate_wz(angle) {
	return [
		1, 0, 0, 0, 0,
		0, 1, 0, 0, 0,
		0, 0, Math.cos(angle), Math.sin(angle), 0,
		0, 0, -Math.sin(angle), Math.cos(angle), 0,
		0, 0, 0, 0, 1,
	]
}

/**
 * @param {M.Matrix5} m
* @param {number} precision
 */
export function print(m, precision = 0) {
	let txt = ""
	const cols = m.length / 5
	for (let i = 0; i < cols; i++) {
		txt += "|"
		for (let j = 0; j < 5; j++)
			txt += " " + (Math.round(m[5 * j + i] * 100) / 100).toFixed(precision)
		txt += " |"
		if (i < cols - 1)
			txt += "\n"
	}
	console.log(txt)
}

/**
* @param {M.Matrix5} a
* @param {M.Matrix5} b
* @returns {M.Matrix5}
*/
export function mul_5x5(a, b) {
	return [
		a[0] * b[0] + a[5] * b[1] + a[10] * b[2] + a[15] * b[3] + a[20] * b[4],
		a[1] * b[0] + a[6] * b[1] + a[11] * b[2] + a[16] * b[3] + a[21] * b[4],
		a[2] * b[0] + a[7] * b[1] + a[12] * b[2] + a[17] * b[3] + a[22] * b[4],
		a[3] * b[0] + a[8] * b[1] + a[13] * b[2] + a[18] * b[3] + a[23] * b[4],
		a[4] * b[0] + a[9] * b[1] + a[14] * b[2] + a[19] * b[3] + a[24] * b[4],

		a[0] * b[5] + a[5] * b[6] + a[10] * b[7] + a[15] * b[8] + a[20] * b[9],
		a[1] * b[5] + a[6] * b[6] + a[11] * b[7] + a[16] * b[8] + a[21] * b[9],
		a[2] * b[5] + a[7] * b[6] + a[12] * b[7] + a[17] * b[8] + a[22] * b[9],
		a[3] * b[5] + a[8] * b[6] + a[13] * b[7] + a[18] * b[8] + a[23] * b[9],
		a[4] * b[5] + a[9] * b[6] + a[14] * b[7] + a[19] * b[8] + a[24] * b[9],

		a[0] * b[10] + a[5] * b[11] + a[10] * b[12] + a[15] * b[13] + a[20] * b[14],
		a[1] * b[10] + a[6] * b[11] + a[11] * b[12] + a[16] * b[13] + a[21] * b[14],
		a[2] * b[10] + a[7] * b[11] + a[12] * b[12] + a[17] * b[13] + a[22] * b[14],
		a[3] * b[10] + a[8] * b[11] + a[13] * b[12] + a[18] * b[13] + a[23] * b[14],
		a[4] * b[10] + a[9] * b[11] + a[14] * b[12] + a[19] * b[13] + a[24] * b[14],

		a[0] * b[15] + a[5] * b[16] + a[10] * b[17] + a[15] * b[18] + a[20] * b[19],
		a[1] * b[15] + a[6] * b[16] + a[11] * b[17] + a[16] * b[18] + a[21] * b[19],
		a[2] * b[15] + a[7] * b[16] + a[12] * b[17] + a[17] * b[18] + a[22] * b[19],
		a[3] * b[15] + a[8] * b[16] + a[13] * b[17] + a[18] * b[18] + a[23] * b[19],
		a[4] * b[15] + a[9] * b[16] + a[14] * b[17] + a[19] * b[18] + a[24] * b[19],

		a[0] * b[20] + a[5] * b[21] + a[10] * b[22] + a[15] * b[23] + a[20] * b[24],
		a[1] * b[20] + a[6] * b[21] + a[11] * b[22] + a[16] * b[23] + a[21] * b[24],
		a[2] * b[20] + a[7] * b[21] + a[12] * b[22] + a[17] * b[23] + a[22] * b[24],
		a[3] * b[20] + a[8] * b[21] + a[13] * b[22] + a[18] * b[23] + a[23] * b[24],
		a[4] * b[20] + a[9] * b[21] + a[14] * b[22] + a[19] * b[23] + a[24] * b[24],
	]
}

/**
 * @param  {...M.Matrix5} args
 * @returns {M.Matrix5}
 */
export function mul_5x5s(...args) {
	let m = args[args.length - 1]
	for (let i = args.length - 2; i >= 0; i--)
		m = mul_5x5(args[i], m)
	return m
}

/**
* @param  {M.Matrix5} m
* @param {M.Vector5} v
*/
export function mul_5x5_5x1(m, v) {
	return [
		m[0] * v[0] + m[5] * v[1] + m[10] * v[2] + m[15] * v[3] + m[20] * v[4],
		m[1] * v[0] + m[6] * v[1] + m[11] * v[2] + m[16] * v[3] + m[21] * v[4],
		m[2] * v[0] + m[7] * v[1] + m[12] * v[2] + m[17] * v[3] + m[22] * v[4],
		m[3] * v[0] + m[8] * v[1] + m[13] * v[2] + m[18] * v[3] + m[23] * v[4],
		m[4] * v[0] + m[9] * v[1] + m[14] * v[2] + m[19] * v[3] + m[24] * v[4],
	]
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
export function mul_mx5_5xn(a, b) {
	const m = a.length / 5
	const n = b.length / 5

	const mat = Array(m * n)
	for (let i = 0; i < m; i++) {
		for (let j = 0; j < n; j++) {
			mat[i + j * 5] =
				a[i + 0 * 5] * b[0 + j * 5] +
				a[i + 1 * 5] * b[1 + j * 5] +
				a[i + 2 * 5] * b[2 + j * 5] +
				a[i + 3 * 5] * b[3 + j * 5] +
				a[i + 4 * 5] * b[4 + j * 5]
		}
	}

	return mat
}

/**
 * @param {M.Matrix5} a
 * @param {number[]} b
 * @returns {number[]}
 */
export function mul_5x5_5xn(a, b) {
	const n = b.length / 5

	const mat = Array(5 * n)
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < n; j++) {
			mat[i + j * 5] =
				a[i + 0 * 5] * b[0 + j * 5] +
				a[i + 1 * 5] * b[1 + j * 5] +
				a[i + 2 * 5] * b[2 + j * 5] +
				a[i + 3 * 5] * b[3 + j * 5] +
				a[i + 4 * 5] * b[4 + j * 5]
		}
	}

	return mat
}

/**
 * @param {...number[]} args
 * @returns {number[]}
 */
export function mul_5x5_5xns(...args) {
	let m = args[args.length - 1]
	for (let i = args.length - 2; i >= 0; i--)
		// @ts-ignore
		m = mul_5x5_5xn(args[i], m)
	return m
}

/**
* @param {M.Matrix5} m
* @returns {M.Matrix5}
*/
export function inverse(m) {
	const [
		m_0, m_1, m_2, m_3, m_4,
		m_5, m_6, m_7, m_8, m_9,
		m_10, m_11, m_12, m_13, m_14,
		m_15, m_16, m_17, m_18, m_19,
		m_20, m_21, m_22, m_23, m_24
	] = m

	const denominator = 1 / (
		m_14 * m_18 * m_2 * m_21 * m_5 - m_13 * m_19 * m_2 * m_21 * m_5 - m_1 * m_14 * m_18 * m_22 * m_5 + m_1 * m_13 * m_19 * m_22 * m_5 + m_1 * m_14 * m_17 * m_23 * m_5 -
		m_1 * m_12 * m_19 * m_23 * m_5 - m_14 * m_16 * m_2 * m_23 * m_5 + m_11 * m_19 * m_2 * m_23 * m_5 - m_1 * m_13 * m_17 * m_24 * m_5 + m_1 * m_12 * m_18 * m_24 * m_5 +
		m_13 * m_16 * m_2 * m_24 * m_5 - m_11 * m_18 * m_2 * m_24 * m_5 - m_14 * m_17 * m_21 * m_3 * m_5 + m_12 * m_19 * m_21 * m_3 * m_5 + m_14 * m_16 * m_22 * m_3 * m_5 -
		m_11 * m_19 * m_22 * m_3 * m_5 - m_12 * m_16 * m_24 * m_3 * m_5 + m_11 * m_17 * m_24 * m_3 * m_5 + m_13 * m_17 * m_21 * m_4 * m_5 - m_12 * m_18 * m_21 * m_4 * m_5 -
		m_13 * m_16 * m_22 * m_4 * m_5 + m_11 * m_18 * m_22 * m_4 * m_5 + m_12 * m_16 * m_23 * m_4 * m_5 - m_11 * m_17 * m_23 * m_4 * m_5 - m_14 * m_18 * m_2 * m_20 * m_6 +
		m_13 * m_19 * m_2 * m_20 * m_6 + m_0 * m_14 * m_18 * m_22 * m_6 - m_0 * m_13 * m_19 * m_22 * m_6 - m_0 * m_14 * m_17 * m_23 * m_6 + m_0 * m_12 * m_19 * m_23 * m_6 +
		m_14 * m_15 * m_2 * m_23 * m_6 - m_10 * m_19 * m_2 * m_23 * m_6 + m_0 * m_13 * m_17 * m_24 * m_6 - m_0 * m_12 * m_18 * m_24 * m_6 - m_13 * m_15 * m_2 * m_24 * m_6 +
		m_10 * m_18 * m_2 * m_24 * m_6 + m_14 * m_17 * m_20 * m_3 * m_6 - m_12 * m_19 * m_20 * m_3 * m_6 - m_14 * m_15 * m_22 * m_3 * m_6 + m_10 * m_19 * m_22 * m_3 * m_6 +
		m_12 * m_15 * m_24 * m_3 * m_6 - m_10 * m_17 * m_24 * m_3 * m_6 - m_13 * m_17 * m_20 * m_4 * m_6 + m_12 * m_18 * m_20 * m_4 * m_6 + m_13 * m_15 * m_22 * m_4 * m_6 -
		m_10 * m_18 * m_22 * m_4 * m_6 - m_12 * m_15 * m_23 * m_4 * m_6 + m_10 * m_17 * m_23 * m_4 * m_6 + m_1 * m_14 * m_18 * m_20 * m_7 - m_1 * m_13 * m_19 * m_20 * m_7 -
		m_0 * m_14 * m_18 * m_21 * m_7 + m_0 * m_13 * m_19 * m_21 * m_7 - m_1 * m_14 * m_15 * m_23 * m_7 + m_0 * m_14 * m_16 * m_23 * m_7 + m_1 * m_10 * m_19 * m_23 * m_7 -
		m_0 * m_11 * m_19 * m_23 * m_7 + m_1 * m_13 * m_15 * m_24 * m_7 - m_0 * m_13 * m_16 * m_24 * m_7 - m_1 * m_10 * m_18 * m_24 * m_7 + m_0 * m_11 * m_18 * m_24 * m_7 -
		m_14 * m_16 * m_20 * m_3 * m_7 + m_11 * m_19 * m_20 * m_3 * m_7 + m_14 * m_15 * m_21 * m_3 * m_7 - m_10 * m_19 * m_21 * m_3 * m_7 - m_11 * m_15 * m_24 * m_3 * m_7 +
		m_10 * m_16 * m_24 * m_3 * m_7 + m_13 * m_16 * m_20 * m_4 * m_7 - m_11 * m_18 * m_20 * m_4 * m_7 - m_13 * m_15 * m_21 * m_4 * m_7 + m_10 * m_18 * m_21 * m_4 * m_7 +
		m_11 * m_15 * m_23 * m_4 * m_7 - m_10 * m_16 * m_23 * m_4 * m_7 - m_1 * m_14 * m_17 * m_20 * m_8 + m_1 * m_12 * m_19 * m_20 * m_8 + m_14 * m_16 * m_2 * m_20 * m_8 -
		m_11 * m_19 * m_2 * m_20 * m_8 + m_0 * m_14 * m_17 * m_21 * m_8 - m_0 * m_12 * m_19 * m_21 * m_8 - m_14 * m_15 * m_2 * m_21 * m_8 + m_10 * m_19 * m_2 * m_21 * m_8 +
		m_1 * m_14 * m_15 * m_22 * m_8 - m_0 * m_14 * m_16 * m_22 * m_8 - m_1 * m_10 * m_19 * m_22 * m_8 + m_0 * m_11 * m_19 * m_22 * m_8 - m_1 * m_12 * m_15 * m_24 * m_8 +
		m_0 * m_12 * m_16 * m_24 * m_8 + m_1 * m_10 * m_17 * m_24 * m_8 - m_0 * m_11 * m_17 * m_24 * m_8 + m_11 * m_15 * m_2 * m_24 * m_8 - m_10 * m_16 * m_2 * m_24 * m_8 -
		m_12 * m_16 * m_20 * m_4 * m_8 + m_11 * m_17 * m_20 * m_4 * m_8 + m_12 * m_15 * m_21 * m_4 * m_8 - m_10 * m_17 * m_21 * m_4 * m_8 - m_11 * m_15 * m_22 * m_4 * m_8 +
		m_10 * m_16 * m_22 * m_4 * m_8 + m_1 * m_13 * m_17 * m_20 * m_9 - m_1 * m_12 * m_18 * m_20 * m_9 - m_13 * m_16 * m_2 * m_20 * m_9 + m_11 * m_18 * m_2 * m_20 * m_9 -
		m_0 * m_13 * m_17 * m_21 * m_9 + m_0 * m_12 * m_18 * m_21 * m_9 + m_13 * m_15 * m_2 * m_21 * m_9 - m_10 * m_18 * m_2 * m_21 * m_9 - m_1 * m_13 * m_15 * m_22 * m_9 +
		m_0 * m_13 * m_16 * m_22 * m_9 + m_1 * m_10 * m_18 * m_22 * m_9 - m_0 * m_11 * m_18 * m_22 * m_9 + m_1 * m_12 * m_15 * m_23 * m_9 - m_0 * m_12 * m_16 * m_23 * m_9 -
		m_1 * m_10 * m_17 * m_23 * m_9 + m_0 * m_11 * m_17 * m_23 * m_9 - m_11 * m_15 * m_2 * m_23 * m_9 + m_10 * m_16 * m_2 * m_23 * m_9 + m_12 * m_16 * m_20 * m_3 * m_9 -
		m_11 * m_17 * m_20 * m_3 * m_9 - m_12 * m_15 * m_21 * m_3 * m_9 + m_10 * m_17 * m_21 * m_3 * m_9 + m_11 * m_15 * m_22 * m_3 * m_9 - m_10 * m_16 * m_22 * m_3 * m_9
	)

	return [
		(m_14 * m_18 * m_22 * m_6 - m_13 * m_19 * m_22 * m_6 - m_14 * m_17 * m_23 * m_6 + m_12 * m_19 * m_23 * m_6 + m_13 * m_17 * m_24 * m_6 - m_12 * m_18 * m_24 * m_6 - m_14 * m_18 * m_21 * m_7 + m_13 * m_19 * m_21 * m_7 + m_14 * m_16 * m_23 * m_7 - m_11 * m_19 * m_23 * m_7 - m_13 * m_16 * m_24 * m_7 + m_11 * m_18 * m_24 * m_7 + m_14 * m_17 * m_21 * m_8 - m_12 * m_19 * m_21 * m_8 - m_14 * m_16 * m_22 * m_8 + m_11 * m_19 * m_22 * m_8 + m_12 * m_16 * m_24 * m_8 - m_11 * m_17 * m_24 * m_8 - m_13 * m_17 * m_21 * m_9 + m_12 * m_18 * m_21 * m_9 + m_13 * m_16 * m_22 * m_9 - m_11 * m_18 * m_22 * m_9 - m_12 * m_16 * m_23 * m_9 + m_11 * m_17 * m_23 * m_9) * denominator,
		(m_14 * m_18 * m_2 * m_21 - m_13 * m_19 * m_2 * m_21 - m_1 * m_14 * m_18 * m_22 + m_1 * m_13 * m_19 * m_22 + m_1 * m_14 * m_17 * m_23 - m_1 * m_12 * m_19 * m_23 - m_14 * m_16 * m_2 * m_23 + m_11 * m_19 * m_2 * m_23 - m_1 * m_13 * m_17 * m_24 + m_1 * m_12 * m_18 * m_24 + m_13 * m_16 * m_2 * m_24 - m_11 * m_18 * m_2 * m_24 - m_14 * m_17 * m_21 * m_3 + m_12 * m_19 * m_21 * m_3 + m_14 * m_16 * m_22 * m_3 - m_11 * m_19 * m_22 * m_3 - m_12 * m_16 * m_24 * m_3 + m_11 * m_17 * m_24 * m_3 + m_13 * m_17 * m_21 * m_4 - m_12 * m_18 * m_21 * m_4 - m_13 * m_16 * m_22 * m_4 + m_11 * m_18 * m_22 * m_4 + m_12 * m_16 * m_23 * m_4 - m_11 * m_17 * m_23 * m_4) * denominator,
		(-m_19 * m_2 * m_23 * m_6 + m_18 * m_2 * m_24 * m_6 + m_19 * m_22 * m_3 * m_6 - m_17 * m_24 * m_3 * m_6 - m_18 * m_22 * m_4 * m_6 + m_17 * m_23 * m_4 * m_6 + m_1 * m_19 * m_23 * m_7 - m_1 * m_18 * m_24 * m_7 - m_19 * m_21 * m_3 * m_7 + m_16 * m_24 * m_3 * m_7 + m_18 * m_21 * m_4 * m_7 - m_16 * m_23 * m_4 * m_7 + m_19 * m_2 * m_21 * m_8 - m_1 * m_19 * m_22 * m_8 + m_1 * m_17 * m_24 * m_8 - m_16 * m_2 * m_24 * m_8 - m_17 * m_21 * m_4 * m_8 + m_16 * m_22 * m_4 * m_8 - m_18 * m_2 * m_21 * m_9 + m_1 * m_18 * m_22 * m_9 - m_1 * m_17 * m_23 * m_9 + m_16 * m_2 * m_23 * m_9 + m_17 * m_21 * m_3 * m_9 - m_16 * m_22 * m_3 * m_9) * denominator,
		(m_14 * m_2 * m_23 * m_6 - m_13 * m_2 * m_24 * m_6 - m_14 * m_22 * m_3 * m_6 + m_12 * m_24 * m_3 * m_6 + m_13 * m_22 * m_4 * m_6 - m_12 * m_23 * m_4 * m_6 - m_1 * m_14 * m_23 * m_7 + m_1 * m_13 * m_24 * m_7 + m_14 * m_21 * m_3 * m_7 - m_11 * m_24 * m_3 * m_7 - m_13 * m_21 * m_4 * m_7 + m_11 * m_23 * m_4 * m_7 - m_14 * m_2 * m_21 * m_8 + m_1 * m_14 * m_22 * m_8 - m_1 * m_12 * m_24 * m_8 + m_11 * m_2 * m_24 * m_8 + m_12 * m_21 * m_4 * m_8 - m_11 * m_22 * m_4 * m_8 + m_13 * m_2 * m_21 * m_9 - m_1 * m_13 * m_22 * m_9 + m_1 * m_12 * m_23 * m_9 - m_11 * m_2 * m_23 * m_9 - m_12 * m_21 * m_3 * m_9 + m_11 * m_22 * m_3 * m_9) * denominator,
		(-m_14 * m_18 * m_2 * m_6 + m_13 * m_19 * m_2 * m_6 + m_14 * m_17 * m_3 * m_6 - m_12 * m_19 * m_3 * m_6 - m_13 * m_17 * m_4 * m_6 + m_12 * m_18 * m_4 * m_6 + m_1 * m_14 * m_18 * m_7 - m_1 * m_13 * m_19 * m_7 - m_14 * m_16 * m_3 * m_7 + m_11 * m_19 * m_3 * m_7 + m_13 * m_16 * m_4 * m_7 - m_11 * m_18 * m_4 * m_7 - m_1 * m_14 * m_17 * m_8 + m_1 * m_12 * m_19 * m_8 + m_14 * m_16 * m_2 * m_8 - m_11 * m_19 * m_2 * m_8 - m_12 * m_16 * m_4 * m_8 + m_11 * m_17 * m_4 * m_8 + m_1 * m_13 * m_17 * m_9 - m_1 * m_12 * m_18 * m_9 - m_13 * m_16 * m_2 * m_9 + m_11 * m_18 * m_2 * m_9 + m_12 * m_16 * m_3 * m_9 - m_11 * m_17 * m_3 * m_9) * denominator,

		(-m_14 * m_18 * m_22 * m_5 + m_13 * m_19 * m_22 * m_5 + m_14 * m_17 * m_23 * m_5 - m_12 * m_19 * m_23 * m_5 - m_13 * m_17 * m_24 * m_5 + m_12 * m_18 * m_24 * m_5 + m_14 * m_18 * m_20 * m_7 - m_13 * m_19 * m_20 * m_7 - m_14 * m_15 * m_23 * m_7 + m_10 * m_19 * m_23 * m_7 + m_13 * m_15 * m_24 * m_7 - m_10 * m_18 * m_24 * m_7 - m_14 * m_17 * m_20 * m_8 + m_12 * m_19 * m_20 * m_8 + m_14 * m_15 * m_22 * m_8 - m_10 * m_19 * m_22 * m_8 - m_12 * m_15 * m_24 * m_8 + m_10 * m_17 * m_24 * m_8 + m_13 * m_17 * m_20 * m_9 - m_12 * m_18 * m_20 * m_9 - m_13 * m_15 * m_22 * m_9 + m_10 * m_18 * m_22 * m_9 + m_12 * m_15 * m_23 * m_9 - m_10 * m_17 * m_23 * m_9) * denominator,
		(-m_14 * m_18 * m_2 * m_20 + m_13 * m_19 * m_2 * m_20 + m_0 * m_14 * m_18 * m_22 - m_0 * m_13 * m_19 * m_22 - m_0 * m_14 * m_17 * m_23 + m_0 * m_12 * m_19 * m_23 + m_14 * m_15 * m_2 * m_23 - m_10 * m_19 * m_2 * m_23 + m_0 * m_13 * m_17 * m_24 - m_0 * m_12 * m_18 * m_24 - m_13 * m_15 * m_2 * m_24 + m_10 * m_18 * m_2 * m_24 + m_14 * m_17 * m_20 * m_3 - m_12 * m_19 * m_20 * m_3 - m_14 * m_15 * m_22 * m_3 + m_10 * m_19 * m_22 * m_3 + m_12 * m_15 * m_24 * m_3 - m_10 * m_17 * m_24 * m_3 - m_13 * m_17 * m_20 * m_4 + m_12 * m_18 * m_20 * m_4 + m_13 * m_15 * m_22 * m_4 - m_10 * m_18 * m_22 * m_4 - m_12 * m_15 * m_23 * m_4 + m_10 * m_17 * m_23 * m_4) * denominator,
		(m_19 * m_2 * m_23 * m_5 - m_18 * m_2 * m_24 * m_5 - m_19 * m_22 * m_3 * m_5 + m_17 * m_24 * m_3 * m_5 + m_18 * m_22 * m_4 * m_5 - m_17 * m_23 * m_4 * m_5 - m_0 * m_19 * m_23 * m_7 + m_0 * m_18 * m_24 * m_7 + m_19 * m_20 * m_3 * m_7 - m_15 * m_24 * m_3 * m_7 - m_18 * m_20 * m_4 * m_7 + m_15 * m_23 * m_4 * m_7 - m_19 * m_2 * m_20 * m_8 + m_0 * m_19 * m_22 * m_8 - m_0 * m_17 * m_24 * m_8 + m_15 * m_2 * m_24 * m_8 + m_17 * m_20 * m_4 * m_8 - m_15 * m_22 * m_4 * m_8 + m_18 * m_2 * m_20 * m_9 - m_0 * m_18 * m_22 * m_9 + m_0 * m_17 * m_23 * m_9 - m_15 * m_2 * m_23 * m_9 - m_17 * m_20 * m_3 * m_9 + m_15 * m_22 * m_3 * m_9) * denominator,
		(-m_14 * m_2 * m_23 * m_5 + m_13 * m_2 * m_24 * m_5 + m_14 * m_22 * m_3 * m_5 - m_12 * m_24 * m_3 * m_5 - m_13 * m_22 * m_4 * m_5 + m_12 * m_23 * m_4 * m_5 + m_0 * m_14 * m_23 * m_7 - m_0 * m_13 * m_24 * m_7 - m_14 * m_20 * m_3 * m_7 + m_10 * m_24 * m_3 * m_7 + m_13 * m_20 * m_4 * m_7 - m_10 * m_23 * m_4 * m_7 + m_14 * m_2 * m_20 * m_8 - m_0 * m_14 * m_22 * m_8 + m_0 * m_12 * m_24 * m_8 - m_10 * m_2 * m_24 * m_8 - m_12 * m_20 * m_4 * m_8 + m_10 * m_22 * m_4 * m_8 - m_13 * m_2 * m_20 * m_9 + m_0 * m_13 * m_22 * m_9 - m_0 * m_12 * m_23 * m_9 + m_10 * m_2 * m_23 * m_9 + m_12 * m_20 * m_3 * m_9 - m_10 * m_22 * m_3 * m_9) * denominator,
		(m_14 * m_18 * m_2 * m_5 - m_13 * m_19 * m_2 * m_5 - m_14 * m_17 * m_3 * m_5 + m_12 * m_19 * m_3 * m_5 + m_13 * m_17 * m_4 * m_5 - m_12 * m_18 * m_4 * m_5 - m_0 * m_14 * m_18 * m_7 + m_0 * m_13 * m_19 * m_7 + m_14 * m_15 * m_3 * m_7 - m_10 * m_19 * m_3 * m_7 - m_13 * m_15 * m_4 * m_7 + m_10 * m_18 * m_4 * m_7 + m_0 * m_14 * m_17 * m_8 - m_0 * m_12 * m_19 * m_8 - m_14 * m_15 * m_2 * m_8 + m_10 * m_19 * m_2 * m_8 + m_12 * m_15 * m_4 * m_8 - m_10 * m_17 * m_4 * m_8 - m_0 * m_13 * m_17 * m_9 + m_0 * m_12 * m_18 * m_9 + m_13 * m_15 * m_2 * m_9 - m_10 * m_18 * m_2 * m_9 - m_12 * m_15 * m_3 * m_9 + m_10 * m_17 * m_3 * m_9) * denominator,

		(m_14 * m_18 * m_21 * m_5 - m_13 * m_19 * m_21 * m_5 - m_14 * m_16 * m_23 * m_5 + m_11 * m_19 * m_23 * m_5 + m_13 * m_16 * m_24 * m_5 - m_11 * m_18 * m_24 * m_5 - m_14 * m_18 * m_20 * m_6 + m_13 * m_19 * m_20 * m_6 + m_14 * m_15 * m_23 * m_6 - m_10 * m_19 * m_23 * m_6 - m_13 * m_15 * m_24 * m_6 + m_10 * m_18 * m_24 * m_6 + m_14 * m_16 * m_20 * m_8 - m_11 * m_19 * m_20 * m_8 - m_14 * m_15 * m_21 * m_8 + m_10 * m_19 * m_21 * m_8 + m_11 * m_15 * m_24 * m_8 - m_10 * m_16 * m_24 * m_8 - m_13 * m_16 * m_20 * m_9 + m_11 * m_18 * m_20 * m_9 + m_13 * m_15 * m_21 * m_9 - m_10 * m_18 * m_21 * m_9 - m_11 * m_15 * m_23 * m_9 + m_10 * m_16 * m_23 * m_9) * denominator,
		(m_1 * m_14 * m_18 * m_20 - m_1 * m_13 * m_19 * m_20 - m_0 * m_14 * m_18 * m_21 + m_0 * m_13 * m_19 * m_21 - m_1 * m_14 * m_15 * m_23 + m_0 * m_14 * m_16 * m_23 + m_1 * m_10 * m_19 * m_23 - m_0 * m_11 * m_19 * m_23 + m_1 * m_13 * m_15 * m_24 - m_0 * m_13 * m_16 * m_24 - m_1 * m_10 * m_18 * m_24 + m_0 * m_11 * m_18 * m_24 - m_14 * m_16 * m_20 * m_3 + m_11 * m_19 * m_20 * m_3 + m_14 * m_15 * m_21 * m_3 - m_10 * m_19 * m_21 * m_3 - m_11 * m_15 * m_24 * m_3 + m_10 * m_16 * m_24 * m_3 + m_13 * m_16 * m_20 * m_4 - m_11 * m_18 * m_20 * m_4 - m_13 * m_15 * m_21 * m_4 + m_10 * m_18 * m_21 * m_4 + m_11 * m_15 * m_23 * m_4 - m_10 * m_16 * m_23 * m_4) * denominator,
		(-m_1 * m_19 * m_23 * m_5 + m_1 * m_18 * m_24 * m_5 + m_19 * m_21 * m_3 * m_5 - m_16 * m_24 * m_3 * m_5 - m_18 * m_21 * m_4 * m_5 + m_16 * m_23 * m_4 * m_5 + m_0 * m_19 * m_23 * m_6 - m_0 * m_18 * m_24 * m_6 - m_19 * m_20 * m_3 * m_6 + m_15 * m_24 * m_3 * m_6 + m_18 * m_20 * m_4 * m_6 - m_15 * m_23 * m_4 * m_6 + m_1 * m_19 * m_20 * m_8 - m_0 * m_19 * m_21 * m_8 - m_1 * m_15 * m_24 * m_8 + m_0 * m_16 * m_24 * m_8 - m_16 * m_20 * m_4 * m_8 + m_15 * m_21 * m_4 * m_8 - m_1 * m_18 * m_20 * m_9 + m_0 * m_18 * m_21 * m_9 + m_1 * m_15 * m_23 * m_9 - m_0 * m_16 * m_23 * m_9 + m_16 * m_20 * m_3 * m_9 - m_15 * m_21 * m_3 * m_9) * denominator,
		(m_1 * m_14 * m_23 * m_5 - m_1 * m_13 * m_24 * m_5 - m_14 * m_21 * m_3 * m_5 + m_11 * m_24 * m_3 * m_5 + m_13 * m_21 * m_4 * m_5 - m_11 * m_23 * m_4 * m_5 - m_0 * m_14 * m_23 * m_6 + m_0 * m_13 * m_24 * m_6 + m_14 * m_20 * m_3 * m_6 - m_10 * m_24 * m_3 * m_6 - m_13 * m_20 * m_4 * m_6 + m_10 * m_23 * m_4 * m_6 - m_1 * m_14 * m_20 * m_8 + m_0 * m_14 * m_21 * m_8 + m_1 * m_10 * m_24 * m_8 - m_0 * m_11 * m_24 * m_8 + m_11 * m_20 * m_4 * m_8 - m_10 * m_21 * m_4 * m_8 + m_1 * m_13 * m_20 * m_9 - m_0 * m_13 * m_21 * m_9 - m_1 * m_10 * m_23 * m_9 + m_0 * m_11 * m_23 * m_9 - m_11 * m_20 * m_3 * m_9 + m_10 * m_21 * m_3 * m_9) * denominator,
		(-m_1 * m_14 * m_18 * m_5 + m_1 * m_13 * m_19 * m_5 + m_14 * m_16 * m_3 * m_5 - m_11 * m_19 * m_3 * m_5 - m_13 * m_16 * m_4 * m_5 + m_11 * m_18 * m_4 * m_5 + m_0 * m_14 * m_18 * m_6 - m_0 * m_13 * m_19 * m_6 - m_14 * m_15 * m_3 * m_6 + m_10 * m_19 * m_3 * m_6 + m_13 * m_15 * m_4 * m_6 - m_10 * m_18 * m_4 * m_6 + m_1 * m_14 * m_15 * m_8 - m_0 * m_14 * m_16 * m_8 - m_1 * m_10 * m_19 * m_8 + m_0 * m_11 * m_19 * m_8 - m_11 * m_15 * m_4 * m_8 + m_10 * m_16 * m_4 * m_8 - m_1 * m_13 * m_15 * m_9 + m_0 * m_13 * m_16 * m_9 + m_1 * m_10 * m_18 * m_9 - m_0 * m_11 * m_18 * m_9 + m_11 * m_15 * m_3 * m_9 - m_10 * m_16 * m_3 * m_9) * denominator,

		(-m_14 * m_17 * m_21 * m_5 + m_12 * m_19 * m_21 * m_5 + m_14 * m_16 * m_22 * m_5 - m_11 * m_19 * m_22 * m_5 - m_12 * m_16 * m_24 * m_5 + m_11 * m_17 * m_24 * m_5 + m_14 * m_17 * m_20 * m_6 - m_12 * m_19 * m_20 * m_6 - m_14 * m_15 * m_22 * m_6 + m_10 * m_19 * m_22 * m_6 + m_12 * m_15 * m_24 * m_6 - m_10 * m_17 * m_24 * m_6 - m_14 * m_16 * m_20 * m_7 + m_11 * m_19 * m_20 * m_7 + m_14 * m_15 * m_21 * m_7 - m_10 * m_19 * m_21 * m_7 - m_11 * m_15 * m_24 * m_7 + m_10 * m_16 * m_24 * m_7 + m_12 * m_16 * m_20 * m_9 - m_11 * m_17 * m_20 * m_9 - m_12 * m_15 * m_21 * m_9 + m_10 * m_17 * m_21 * m_9 + m_11 * m_15 * m_22 * m_9 - m_10 * m_16 * m_22 * m_9) * denominator,
		(-m_19 * m_2 * m_21 * m_5 + m_1 * m_19 * m_22 * m_5 - m_1 * m_17 * m_24 * m_5 + m_16 * m_2 * m_24 * m_5 + m_17 * m_21 * m_4 * m_5 - m_16 * m_22 * m_4 * m_5 + m_19 * m_2 * m_20 * m_6 - m_0 * m_19 * m_22 * m_6 + m_0 * m_17 * m_24 * m_6 - m_15 * m_2 * m_24 * m_6 - m_17 * m_20 * m_4 * m_6 + m_15 * m_22 * m_4 * m_6 - m_1 * m_19 * m_20 * m_7 + m_0 * m_19 * m_21 * m_7 + m_1 * m_15 * m_24 * m_7 - m_0 * m_16 * m_24 * m_7 + m_16 * m_20 * m_4 * m_7 - m_15 * m_21 * m_4 * m_7 + m_1 * m_17 * m_20 * m_9 - m_16 * m_2 * m_20 * m_9 - m_0 * m_17 * m_21 * m_9 + m_15 * m_2 * m_21 * m_9 - m_1 * m_15 * m_22 * m_9 + m_0 * m_16 * m_22 * m_9) * denominator,
		(-m_1 * m_14 * m_17 * m_20 + m_1 * m_12 * m_19 * m_20 + m_14 * m_16 * m_2 * m_20 - m_11 * m_19 * m_2 * m_20 + m_0 * m_14 * m_17 * m_21 - m_0 * m_12 * m_19 * m_21 - m_14 * m_15 * m_2 * m_21 + m_10 * m_19 * m_2 * m_21 + m_1 * m_14 * m_15 * m_22 - m_0 * m_14 * m_16 * m_22 - m_1 * m_10 * m_19 * m_22 + m_0 * m_11 * m_19 * m_22 - m_1 * m_12 * m_15 * m_24 + m_0 * m_12 * m_16 * m_24 + m_1 * m_10 * m_17 * m_24 - m_0 * m_11 * m_17 * m_24 + m_11 * m_15 * m_2 * m_24 - m_10 * m_16 * m_2 * m_24 - m_12 * m_16 * m_20 * m_4 + m_11 * m_17 * m_20 * m_4 + m_12 * m_15 * m_21 * m_4 - m_10 * m_17 * m_21 * m_4 - m_11 * m_15 * m_22 * m_4 + m_10 * m_16 * m_22 * m_4) * denominator,
		(m_14 * m_2 * m_21 * m_5 - m_1 * m_14 * m_22 * m_5 + m_1 * m_12 * m_24 * m_5 - m_11 * m_2 * m_24 * m_5 - m_12 * m_21 * m_4 * m_5 + m_11 * m_22 * m_4 * m_5 - m_14 * m_2 * m_20 * m_6 + m_0 * m_14 * m_22 * m_6 - m_0 * m_12 * m_24 * m_6 + m_10 * m_2 * m_24 * m_6 + m_12 * m_20 * m_4 * m_6 - m_10 * m_22 * m_4 * m_6 + m_1 * m_14 * m_20 * m_7 - m_0 * m_14 * m_21 * m_7 - m_1 * m_10 * m_24 * m_7 + m_0 * m_11 * m_24 * m_7 - m_11 * m_20 * m_4 * m_7 + m_10 * m_21 * m_4 * m_7 - m_1 * m_12 * m_20 * m_9 + m_11 * m_2 * m_20 * m_9 + m_0 * m_12 * m_21 * m_9 - m_10 * m_2 * m_21 * m_9 + m_1 * m_10 * m_22 * m_9 - m_0 * m_11 * m_22 * m_9) * denominator,
		(m_1 * m_14 * m_17 * m_5 - m_1 * m_12 * m_19 * m_5 - m_14 * m_16 * m_2 * m_5 + m_11 * m_19 * m_2 * m_5 + m_12 * m_16 * m_4 * m_5 - m_11 * m_17 * m_4 * m_5 - m_0 * m_14 * m_17 * m_6 + m_0 * m_12 * m_19 * m_6 + m_14 * m_15 * m_2 * m_6 - m_10 * m_19 * m_2 * m_6 - m_12 * m_15 * m_4 * m_6 + m_10 * m_17 * m_4 * m_6 - m_1 * m_14 * m_15 * m_7 + m_0 * m_14 * m_16 * m_7 + m_1 * m_10 * m_19 * m_7 - m_0 * m_11 * m_19 * m_7 + m_11 * m_15 * m_4 * m_7 - m_10 * m_16 * m_4 * m_7 + m_1 * m_12 * m_15 * m_9 - m_0 * m_12 * m_16 * m_9 - m_1 * m_10 * m_17 * m_9 + m_0 * m_11 * m_17 * m_9 - m_11 * m_15 * m_2 * m_9 + m_10 * m_16 * m_2 * m_9) * denominator,

		(m_13 * m_17 * m_21 * m_5 - m_12 * m_18 * m_21 * m_5 - m_13 * m_16 * m_22 * m_5 + m_11 * m_18 * m_22 * m_5 + m_12 * m_16 * m_23 * m_5 - m_11 * m_17 * m_23 * m_5 - m_13 * m_17 * m_20 * m_6 + m_12 * m_18 * m_20 * m_6 + m_13 * m_15 * m_22 * m_6 - m_10 * m_18 * m_22 * m_6 - m_12 * m_15 * m_23 * m_6 + m_10 * m_17 * m_23 * m_6 + m_13 * m_16 * m_20 * m_7 - m_11 * m_18 * m_20 * m_7 - m_13 * m_15 * m_21 * m_7 + m_10 * m_18 * m_21 * m_7 + m_11 * m_15 * m_23 * m_7 - m_10 * m_16 * m_23 * m_7 - m_12 * m_16 * m_20 * m_8 + m_11 * m_17 * m_20 * m_8 + m_12 * m_15 * m_21 * m_8 - m_10 * m_17 * m_21 * m_8 - m_11 * m_15 * m_22 * m_8 + m_10 * m_16 * m_22 * m_8) * denominator,
		(m_1 * m_13 * m_17 * m_20 - m_1 * m_12 * m_18 * m_20 - m_13 * m_16 * m_2 * m_20 + m_11 * m_18 * m_2 * m_20 - m_0 * m_13 * m_17 * m_21 + m_0 * m_12 * m_18 * m_21 + m_13 * m_15 * m_2 * m_21 - m_10 * m_18 * m_2 * m_21 - m_1 * m_13 * m_15 * m_22 + m_0 * m_13 * m_16 * m_22 + m_1 * m_10 * m_18 * m_22 - m_0 * m_11 * m_18 * m_22 + m_1 * m_12 * m_15 * m_23 - m_0 * m_12 * m_16 * m_23 - m_1 * m_10 * m_17 * m_23 + m_0 * m_11 * m_17 * m_23 - m_11 * m_15 * m_2 * m_23 + m_10 * m_16 * m_2 * m_23 + m_12 * m_16 * m_20 * m_3 - m_11 * m_17 * m_20 * m_3 - m_12 * m_15 * m_21 * m_3 + m_10 * m_17 * m_21 * m_3 + m_11 * m_15 * m_22 * m_3 - m_10 * m_16 * m_22 * m_3) * denominator,
		(m_18 * m_2 * m_21 * m_5 - m_1 * m_18 * m_22 * m_5 + m_1 * m_17 * m_23 * m_5 - m_16 * m_2 * m_23 * m_5 - m_17 * m_21 * m_3 * m_5 + m_16 * m_22 * m_3 * m_5 - m_18 * m_2 * m_20 * m_6 + m_0 * m_18 * m_22 * m_6 - m_0 * m_17 * m_23 * m_6 + m_15 * m_2 * m_23 * m_6 + m_17 * m_20 * m_3 * m_6 - m_15 * m_22 * m_3 * m_6 + m_1 * m_18 * m_20 * m_7 - m_0 * m_18 * m_21 * m_7 - m_1 * m_15 * m_23 * m_7 + m_0 * m_16 * m_23 * m_7 - m_16 * m_20 * m_3 * m_7 + m_15 * m_21 * m_3 * m_7 - m_1 * m_17 * m_20 * m_8 + m_16 * m_2 * m_20 * m_8 + m_0 * m_17 * m_21 * m_8 - m_15 * m_2 * m_21 * m_8 + m_1 * m_15 * m_22 * m_8 - m_0 * m_16 * m_22 * m_8) * denominator,
		(-m_13 * m_2 * m_21 * m_5 + m_1 * m_13 * m_22 * m_5 - m_1 * m_12 * m_23 * m_5 + m_11 * m_2 * m_23 * m_5 + m_12 * m_21 * m_3 * m_5 - m_11 * m_22 * m_3 * m_5 + m_13 * m_2 * m_20 * m_6 - m_0 * m_13 * m_22 * m_6 + m_0 * m_12 * m_23 * m_6 - m_10 * m_2 * m_23 * m_6 - m_12 * m_20 * m_3 * m_6 + m_10 * m_22 * m_3 * m_6 - m_1 * m_13 * m_20 * m_7 + m_0 * m_13 * m_21 * m_7 + m_1 * m_10 * m_23 * m_7 - m_0 * m_11 * m_23 * m_7 + m_11 * m_20 * m_3 * m_7 - m_10 * m_21 * m_3 * m_7 + m_1 * m_12 * m_20 * m_8 - m_11 * m_2 * m_20 * m_8 - m_0 * m_12 * m_21 * m_8 + m_10 * m_2 * m_21 * m_8 - m_1 * m_10 * m_22 * m_8 + m_0 * m_11 * m_22 * m_8) * denominator,
		(-m_1 * m_13 * m_17 * m_5 + m_1 * m_12 * m_18 * m_5 + m_13 * m_16 * m_2 * m_5 - m_11 * m_18 * m_2 * m_5 - m_12 * m_16 * m_3 * m_5 + m_11 * m_17 * m_3 * m_5 + m_0 * m_13 * m_17 * m_6 - m_0 * m_12 * m_18 * m_6 - m_13 * m_15 * m_2 * m_6 + m_10 * m_18 * m_2 * m_6 + m_12 * m_15 * m_3 * m_6 - m_10 * m_17 * m_3 * m_6 + m_1 * m_13 * m_15 * m_7 - m_0 * m_13 * m_16 * m_7 - m_1 * m_10 * m_18 * m_7 + m_0 * m_11 * m_18 * m_7 - m_11 * m_15 * m_3 * m_7 + m_10 * m_16 * m_3 * m_7 - m_1 * m_12 * m_15 * m_8 + m_0 * m_12 * m_16 * m_8 + m_1 * m_10 * m_17 * m_8 - m_0 * m_11 * m_17 * m_8 + m_11 * m_15 * m_2 * m_8 - m_10 * m_16 * m_2 * m_8) * denominator,
	]
}

/*
[
	1, -0, -0, -0, -1,
	-0, 1, -0, -0, -2,
	-0, -0, 1, -0, -3,
	-0, -0, -0, 1, -4,
	-0, -0, -0, -0, 1
]
*/

/**
 * @type {M.Vector5}
 */
export const X = [1, 0, 0, 0, 0]
/**
 * @type {M.Vector5}
 */
export const Y = [0, 1, 0, 0, 0]
/**
 * @type {M.Vector5}
 */
export const Z = [0, 0, 1, 0, 0]
/**
 * @type {M.Vector5}
 */
export const W = [0, 0, 0, 1, 0]
/**
 * @type {M.Vector5}
 */
export const V = [0, 0, 0, 0, 1]
/**
 * @type {M.Vector5}
 */
export const ZERO = [0, 0, 0, 0, 0]
/**
 * @type {M.Vector5}
 */
export const ONE = [1, 1, 1, 1, 1]

/**
 * @type {[M.Vector4, M.Vector4, M.Vector4, M.Vector4]}
 */
const CANDIDATE_AXES = [
	[1, 0, 0, 0],
	[0, 1, 0, 0],
	[0, 0, 1, 0],
	[0, 0, 0, 1],
]

/**
 Assumes `direction`, `ana`, and `up` are normalized
 * @param {M.Vector4} position4
 * @param {M.Vector4} direction4
 * @param {M.Vector4} [ana4]
 * @param {M.Vector4} [up4]
 * @returns {M.Matrix5}
 */
export function lookAlong(position4, direction4, ana4, up4) {
	let candidateHead = 0
	const candidates = []
	if (!!ana4) candidates.push(ana4)
	if (!!up4) candidates.push(up4)
	candidates.push(...CANDIDATE_AXES)

	const e0 = direction4

	let e1
	do {
		const axis = candidates[candidateHead++]
		e1 = M4.sub(axis, M4.proj(e0, axis))
	} while (M4.mag(e1) < 0.01)
	e1 = M4.norm(e1)

	let e2
	do {
		const axis = candidates[candidateHead++]
		e2 = M4.sub_2(axis, M4.proj(e0, axis), M4.proj(e1, axis))
	} while (M4.mag(e2) < 0.01)
	e2 = M4.norm(e2)

	let e3
	do {
		const axis = candidates[candidateHead++]
		e3 = M4.sub_3(axis, M4.proj(e0, axis), M4.proj(e1, axis), M4.proj(e2, axis))
	} while (M4.mag(e3) < 0.01)
	e3 = M4.norm(e3)

	return [
		e1[0], e1[1], e1[2], e1[3], 0,
		e2[0], e2[1], e2[2], e2[3], 0,
		e3[0], e3[1], e3[2], e3[3], 0,
		e0[0], e0[1], e0[2], e0[3], 0,
		position4[0], position4[1], position4[2], position4[3], 1,
	]
}

/**
 Assumes `ana`, and `up` are normalized
 * @param {M.Vector4} here4
 * @param {M.Vector4} there4
 * @param {M.Vector4} [ana4]
 * @param {M.Vector4} [up4]
 * @returns {M.Matrix5}
 */
export function lookAt(here4, there4, ana4, up4) {
	const position = here4
	const direction = M4.norm(M4.sub(there4, here4))
	return lookAlong(position, direction, ana4, up4)
}

/**
 * @param {M.Matrix5} m
 * @returns {M.Matrix4}
 */
export function trim_4x4(m) {
	return [
		m[0], m[1], m[2], m[3],
		m[5], m[6], m[7], m[8],
		m[10], m[11], m[12], m[13],
		m[15], m[16], m[17], m[18],
	]
}

/**
 * @param {number[]} m
 * @returns {number[]}
 */
export function trim_5xn_4xn(m) {
	const n = m.length / 5
	const mat = Array(4 * n)
	for (let i = 0; i < n; i++) {
		mat[4 * i + 0] = m[5 * i + 0]
		mat[4 * i + 1] = m[5 * i + 1]
		mat[4 * i + 2] = m[5 * i + 2]
		mat[4 * i + 3] = m[5 * i + 3]
	}
	return mat
}


////////////

// Convert a 25-element array to a 5x5 for easy viewing
function toMatrix5x5(m) {
	const rows = [];
	for (let i = 0; i < 5; i++) {
		rows.push(m.slice(i * 5, i * 5 + 5));
	}
	return rows;
}

// Extract row vector from 5x5 (row-major)
function getRow(mat, rowIndex) {
	const i = rowIndex * 5;
	return mat.slice(i, i + 5);
}

// Check approximate equality
function almostEqual(a, b, eps = 1e-5) {
	return Math.abs(a - b) < eps;
}

/**
 * Checks the first 4 rows are (in 4D part) orthonormal:
 * - dot(rowI, rowJ) ~ 0 if i != j
 * - dot(rowI, rowI) ~ 1
 * Then checks row 5 is position + 1 in the w-slot.
 */
function checkOrthonormalAndPosition(matrix, position) {
	// We'll interpret the row as [x, y, z, w, (homogeneous part)]
	// The first 4 rows are e1, e2, e3, e0
	// The 5th row should be [pos.x, pos.y, pos.z, pos.w, 1]

	for (let i = 0; i < 4; i++) {
		// Dot with itself
		const rowI = getRow(matrix, i).slice(0, 4); // ignore the 5th component
		const magI = M4.dot(rowI, rowI);
		if (!almostEqual(magI, 1.0)) {
			return false;
		}
		for (let j = i + 1; j < 4; j++) {
			const rowJ = getRow(matrix, j).slice(0, 4);
			const dotIJ = M4.dot(rowI, rowJ);
			if (!almostEqual(dotIJ, 0.0)) {
				return false;
			}
		}
	}

	// Check the 5th row is [p.x, p.y, p.z, p.w, 1]
	const row4 = getRow(matrix, 4); // row index 4 => 5th row
	for (let i = 0; i < 4; i++) {
		if (!almostEqual(row4[i], position[i], 1e-5)) {
			return false;
		}
	}
	if (!almostEqual(row4[4], 1.0)) {
		return false;
	}

	return true;
}


/****************************************************
 * TEST RUNNER
 ****************************************************/
function runTests() {
	console.log("Running inline tests on lookAlong...");

	// Test 1: direction along X, trivial position
	(function () {
		/** @type {M.Vector4} */
		const pos = [0, 0, 0, 0];
		/** @type {M.Vector4} */
		const dir = [1, 0, 0, 0]; // normalized
		const result = lookAlong(pos, dir);
		const mat = toMatrix5x5(result);
		console.log("Test 1: dir = X-axis, pos = 0, up=Z, ana=W by default");
		console.log(mat);
		console.log("Check Orthonormal =>", checkOrthonormalAndPosition(result, pos));
	})();

	// Test 2: direction diagonal, random position
	(function () {
		/** @type {M.Vector4} */
		const pos = [1, 2, 3, 4];
		/** @type {M.Vector4} */
		const dir = M4.norm([1, 1, 1, 1]);
		// Normalize it

		const result = lookAlong(pos, dir);
		const mat = toMatrix5x5(result);
		console.log("Test 2: dir = diagonal norm([1,1,1,1]), pos = [1,2,3,4]");
		console.log(mat);
		console.log("Check Orthonormal =>", checkOrthonormalAndPosition(result, pos));
	})();

	// Test 3: direction near W, custom 'ana' and 'up'
	(function () {
		/** @type {M.Vector4} */
		const pos = [5, 5, 5, 5];
		// direction ~ W
		/** @type {M.Vector4} */
		const dir = M4.norm([0.01, 0.01, 0.0, 1.0]);

		const customAna = M4.norm([0, 0, 1, 1]); // arbitrary
		/** @type {M.Vector4} */
		const customUp = [1, 0, 0, 0]; // arbitrary

		const result = lookAlong(pos, dir, customAna, customUp);
		const mat = toMatrix5x5(result);
		console.log("Test 3: dir ~ W axis, pos=[5,5,5,5], ana=[0,0,1,1], up=[1,0,0,0]");
		console.log(mat);
		console.log("Check Orthonormal =>", checkOrthonormalAndPosition(result, pos));
	})();

	// Test 4: random directions a few times
	(function () {
		for (let t = 0; t < 3; t++) {
			/** @type {M.Vector4} */
			const pos = [Math.random(), Math.random(), Math.random(), Math.random()];
			const dir = M4.norm([Math.random(), Math.random(), Math.random(), Math.random()]);

			const result = lookAlong(pos, dir);
			const isOrtho = checkOrthonormalAndPosition(result, pos);
			console.log(`Test 4.${t + 1}: random dir = ${JSON.stringify(dir)}, pos=${JSON.stringify(pos)}, ortho=${isOrtho}`);
		}
	})();
}

// Execute test runner
runTests();