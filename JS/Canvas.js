export const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("Canvas"))

const c_or_null = canvas.getContext("webgpu")
if (c_or_null === null) throw new Error("No context found!")
export const c = c_or_null

export const gpu = navigator.gpu
if (!gpu) {
    throw new Error("WebGPU not supported on this browser.")
}

const adapter = await gpu.requestAdapter()
if (!adapter) {
  throw new Error("No appropriate GPUAdapter found.")
}

export const device = await adapter.requestDevice()

const cformat = gpu.getPreferredCanvasFormat()
c.configure({
  device,
  format: cformat,
  alphaMode: "premultiplied",
})

export const DEFAULT_COLOR = "#111122"

/** @type {number} */
export let cw // Canvas Width
/** @type {number} */
export let ch // Canvas Height
/** @type {number} */
export let uw // Unit Width
/** @type {number} */
export let uh // Unit Height
/** @type {number} */
export let min // Minimum Width/Height
/** @type {number} */
export let umin // Unit Minimum
/** @type {number} */
export let max // Maximum Width/Height
/** @type {number} */
export let umax // Unit Maximum
/** @type {number} */
export let left // Leftmost Side
/** @type {number} */
export let right // Rightmost Side
/** @type {number} */
export let bottom // Bottommost Side
/** @type {number} */
export let top // Topmost Side

/**
 * @param {HTMLCanvasElement} canvas
 */
function update_units(canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    cw = canvas.width
    ch = canvas.height
    uw = 0.01*cw
    uh = 0.01*ch

    min = Math.min(cw, ch)
    max = Math.max(uw, uh)
    umin = 0.01*min
    umax = 0.01*max

    left = -0.5 * cw
    right = 0.5 * cw
    bottom = -0.5 * ch
    top = 0.5 * ch
}
update_units(canvas)

/**
 * @param {string} color
 */
export function update(color) {
    update_units(canvas)

    // c.fillStyle = color
    // c.fillRect(0, 0, cw, ch)

    // c.translate(cw/2, ch/2)
}