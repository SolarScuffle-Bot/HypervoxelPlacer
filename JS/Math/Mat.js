/**
 * @typedef {[number, number]} Vector2
 * @typedef {[number, number, number]} Vector3
 * @typedef {[number, number, number, number]} Vector4
 * @typedef {[number, number, number, number, number]} Vector5
 * @typedef {[
 * 	number, number, number,
 * 	number, number, number,
 * 	number, number, number
 * ]} Matrix3
 * @typedef {[
 *	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * 	number, number, number, number,
 * ]} Matrix4
 * @typedef {[
 * 	number, number, number, number, number,
 * 	number, number, number, number, number,
 * 	number, number, number, number, number,
 * 	number, number, number, number, number,
 * 	number, number, number, number, number,
 * ]} Matrix5
 */

/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
export function add(a, b) {
    const result = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] + b[i];
    }
    return result;
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
export function sub(a, b) {
    const result = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] - b[i];
    }
    return result;
}

/**
 * @param {number[]} a
 * @param {number} scalar
 * @returns {number[]}
 */
export function mul_s(a, scalar) {
    const result = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] * scalar;
    }
    return result;
}
