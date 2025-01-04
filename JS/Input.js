import * as M from "./Math/Mat.js"
import * as Canvas from "./Canvas.js"

/**
 * @typedef {(e: KeyboardEvent) => void} KeyCallback
 * @typedef {(e: WheelEvent) => void} WheelCallback
 * @typedef {(e: MouseEvent) => void} MouseCallback
 * @typedef {Set<KeyCallback>} KeyCallbacks
 * @typedef {Set<WheelCallback>} WheelCallbacks
 * @typedef {Set<MouseCallback>} MouseCallbacks
 * @typedef {Map<string, KeyCallbacks>} KeyCallbacksMap
 * @typedef {[MouseCallbacks, MouseCallbacks, MouseCallbacks, MouseCallbacks, MouseCallbacks, MouseCallbacks]} MouseCallbacksMap
 */

/**
 * @type {KeyCallbacksMap}
 */
const keydown_callbacks = new Map()

/**
 * @type {KeyCallbacksMap}
 */
const keydownonce_callbacks = new Map()

/**
 * @type {KeyCallbacksMap}
 */
const keyup_callbacks = new Map()

/**
 * @type {KeyCallbacksMap}
 */
const keyholddown_callbacks = new Map()

/**
 * @type {KeyCallbacksMap}
 */
const keyholdup_callbacks = new Map()

/**
 * @type {WheelCallbacks}
 */
const wheel_callbacks = new Set()

/**
 * @type {MouseCallbacks}
 */
const mousemove_callbacks = new Set()

/**
 * @type {MouseCallbacksMap}
*/
const mousedown_callbacks = [
	new Set(),
	new Set(),
	new Set(),
	new Set(),
	new Set(),
	new Set(),
]

/**
 * @type {MouseCallbacksMap}
 */
const mouseup_callbacks = [
	new Set(),
	new Set(),
	new Set(),
	new Set(),
	new Set(),
	new Set(),
]

/**
 * @type {Set<string>}
 */
export const keys_down = new Set()

/**
 * @type {Set<string>}
 */
export const keys_holding = new Set()

export let left_mouse_down = false
export let right_mouse_down = false
export let middle_mouse_down = false

/**
 * @param {KeyCallbacksMap} map
 * @param {string} key
 * @returns {KeyCallbacks}
 */
function get_key_callbacks(map, key) {
	const foundKeyCallbacks = map.get(key)
	if (foundKeyCallbacks !== undefined)
		return foundKeyCallbacks

	const newKeyCallbacks = new Set()
	map.set(key, newKeyCallbacks)
	return newKeyCallbacks
}

/**
 * @param {KeyCallbacksMap} map
 */
function get_key_connect(map) {
	/**
	 * @param {{ (e: KeyboardEvent): void; }} callback
	 * @param {["any"] | string[]} keys
	 */
	return function(callback, ...keys) {
		if (keys.length === 0) {
			throw new Error(`Passed 0 keys in a key_connect function!`)
		}

		if (keys.length[0] === "any") {
			const keyCallbacks = get_key_callbacks(map, "any")
			keyCallbacks.add(callback)
			return () => {
				keyCallbacks.delete(callback)
			}
		} else {
			for (const key of keys) {
				const keyCallbacks = get_key_callbacks(map, key)
				keyCallbacks.add(callback)
			}
			return () => {
				for (const key of keys) {
					const keyCallbacks = get_key_callbacks(map, key)
					keyCallbacks.delete(callback)
				}
			}
		}
	}
}

/**
 * @param {MouseCallbacksMap} map
*/
function get_mouse_connect(map) {
	/**
	 * @param { MouseCallback } callback
	 * @param {["any"] | ("left" | "middle" | "right" | "backward" | "forward")[]} sides
	 * */
	return function(callback, ...sides) {
		for (const side of sides) {
			const num =
				side == "left" ? 0 :
				side == "middle" ? 1 :
				side == "right" ? 2 :
				side == "backward" ? 3 :
				side == "forward" ? 4 :
				5

			const callbacks = map[num]
			callbacks.add(callback)
		}
		return () => {
			for (const side of sides) {
				const num =
					side == "left" ? 0 :
					side == "middle" ? 1 :
					side == "right" ? 2 :
					side == "backward" ? 3 :
					side == "forward" ? 4 :
					5

				const callbacks = map[num]
				callbacks.delete(callback)
			}
		}
	}
}

/**
 * @param {WheelCallback} callback
*/
export function connect_wheel(callback) {
	wheel_callbacks.add(callback)
	return () => {
		wheel_callbacks.delete(callback)
	}
}

/**
 * @param {MouseCallback} callback
*/
export function connect_mousemove(callback) {
	mousemove_callbacks.add(callback)
	return () => {
		mousemove_callbacks.delete(callback)
	}
}

export const connect_keydown = get_key_connect(keydown_callbacks)
export const connect_keydownonce = get_key_connect(keydownonce_callbacks)
export const connect_keyup = get_key_connect(keyup_callbacks)
export const connect_keyholddown = get_key_connect(keyholddown_callbacks)
export const connect_keyholdup = get_key_connect(keyholdup_callbacks)
export const connect_mousedown = get_mouse_connect(mousedown_callbacks)
export const connect_mouseup = get_mouse_connect(mouseup_callbacks)

/**
 * @type {M.Vector2}
 */
export let mouse = [0, 0]

/**
 * @type {M.Vector2}
 */
export let lastMouse = [0, 0]

/**
 * @param {KeyboardEvent} e
 * @param {KeyCallbacksMap} map
 * @param {string} key
 */
function call_all(e, map, key) {
	const callbacks = map.get(key)
	if (callbacks !== undefined)
		for (const callback of callbacks)
			callback(e)
}

document.addEventListener("keydown", e => {
	const key = e.code

	call_all(e, keydown_callbacks, key)
	call_all(e, keydown_callbacks, "any")

	if (keys_down.has(key) && !keys_holding.has(key)) {
		call_all(e, keyholddown_callbacks, key)
		call_all(e, keyholddown_callbacks, "any")

		keys_holding.add(e.code)
	} else if (!keys_down.has(key)) {
		call_all(e, keydownonce_callbacks, key)
		call_all(e, keydownonce_callbacks, "any")

		keys_down.add(e.code)
	}
})

document.addEventListener("keyup", e => {
	const key = e.code

	if (keys_holding.has(key)) {
		keys_holding.delete(e.code)

		call_all(e, keyholdup_callbacks, key)
		call_all(e, keyholdup_callbacks, "any")
	}

	keys_down.delete(key)

	call_all(e, keyup_callbacks, key)
	call_all(e, keyup_callbacks, "any")
})

document.addEventListener("wheel", e => {
	for (const callback of wheel_callbacks)
		callback(e)
})

document.addEventListener("mousemove", e => {
	const newX = e.offsetX - Canvas.cw * 0.5
	const newY = e.offsetY - Canvas.ch * 0.5

	lastMouse[0] = mouse[0]
	lastMouse[1] = mouse[1]

	mouse[0] = newX
	mouse[1] = newY

	for (const callback of mousemove_callbacks) {
		callback(e)
	}
})

document.addEventListener("mousedown", e => {
	const button = e.button !== undefined ? e.button : 5
	const button_mousedown_callbacks = mousedown_callbacks[button]
	for (const callback of button_mousedown_callbacks) {
		callback(e)
	}
})

document.addEventListener("mouseup", e => {
	const button = e.button !== undefined ? e.button : 5
	const button_mouseup_callbacks = mouseup_callbacks[button]
	for (const callback of button_mouseup_callbacks) {
		callback(e)
	}
})