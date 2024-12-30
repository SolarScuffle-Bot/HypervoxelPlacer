export const canvas = document.getElementById("Canvas")
export const c = canvas.getContext("2d")

export const DEFAULT_COLOR = "#111122"

export let cw // Canvas Width
export let ch // Canvas Height
export let uw // Unit Width
export let uh // Unit Height
export let min // Minimum Width/Height
export let umin // Unit Minimum
export let max // Maximum Width/Height
export let umax // Unit Maximum
export let left // Leftmost Side
export let right // Rightmost Side
export let bottom // Bottommost Side
export let top // Topmost Side

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

    c.fillStyle = color
    c.fillRect(0, 0, cw, ch)

    c.translate(cw/2, ch/2)
}