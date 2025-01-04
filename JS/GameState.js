import * as M from "./Math/Mat.js"
import * as Spring from "./Math/Spring.js"
import * as Canvas from "./Canvas.js"
import * as M4 from "./Math/Mat4D.js"
import * as Sound from "./Sound.js"
import * as Input from "./Input.js"
import * as Ui from "./Ui.js"

/**
 * @typedef {{
 *  position: M.Vector4,
 *  color: string,
 * }} HypervoxelData
*/

export const CURRENT_CAMERA_4 = 0
export const CURRENT_CAMERA_5 = 1

export const CURRENT_PROJECTION_PERSPECTIVE = 0
export const CURRENT_PROJECTION_ORTHOGONAL = 1

export let currentProjection4 = CURRENT_PROJECTION_PERSPECTIVE
export let currentProjection5 = CURRENT_PROJECTION_PERSPECTIVE
export let currentCamera = CURRENT_CAMERA_4

export let xy3 = Spring.create(Math.PI / 3, 40, 0.5)
export let yz3 = Spring.create(Math.PI / 3, 40, 0.5)
export let distance3 = Spring.create(3, 20, 0.75)

export let xy4 = Spring.create(0, 40, 0.5)
export let yz4 = Spring.create(0, 40, 0.5)
export let zx4 = Spring.create(0, 20, 0.75)
export let wx4 = Spring.create(0, 40, 0.5)
export let wy4 = Spring.create(0, 40, 0.5)
export let wz4 = Spring.create(0, 20, 0.75)

export let focus4 = Spring.create(M4.ZERO, 40, 0.75)
export let distance4 = Spring.create(2, 20, 0.75)

export let use_hopf_coordinates = false
export let zeta1 = 0
export let zeta2 = 0
export let eta = Spring.create(Math.PI / 4, 20, 0.75)

/** @type {Map<string, HypervoxelData>} */
let hypervoxels = new Map()

function add_hypervoxel(hash, data) {
    hypervoxels.set(hash, data)
}

function remove_hypervoxel(hash) {
    hypervoxels.delete(hash)
}

function migrate_state_version(snapshot) {

}

function save_state() {
    const snapshot = {
        xy4: xy4.target,
        yz4: yz4.target,
        zx4: zx4.target,
        wx4: wx4.target,
        wy4: wy4.target,
        wz4: wz4.target,

        focus4: focus4.target,
        distance4: distance4.target,

        zeta1,
        zeta2,
        eta: eta.target,

        hypervoxels: Array.from(hypervoxels.values()),
    }

    const link = document.createElement("a")
    const file = new Blob([JSON.stringify(snapshot)], { type: "application/json" })
    link.href = URL.createObjectURL(file)
    link.download = "hypervoxel_build.json"
    link.click()
    URL.revokeObjectURL(link.href)

    return snapshot
}

function load_state() {
    let input = document.createElement("input")
    input.type = "file"
    input.multiple = false
    input.accept = "application/json"

    input.onchange = e => {
        const file = input.files[0]

        const reader = new FileReader()
        reader.onload = readerEvent => {
            const json = readerEvent.target.result
            if (typeof json !== "string") {
                throw new Error("Expected JSON")
            }

            const snapshot = JSON.parse(json)

            xy4.target = snapshot.xy4
            yz4.target = snapshot.yz4
            zx4.target = snapshot.zx4
            wx4.target = snapshot.wx4
            wy4.target = snapshot.wy4
            wz4.target = snapshot.wz4

            focus4.target = snapshot.focus4
            distance4.target = snapshot.distance4

            zeta1 = snapshot.zeta1
            zeta2 = snapshot.zeta2
            eta.target = snapshot.eta

            hypervoxels.clear()
            for (let data of snapshot.hypervoxels) {
                hypervoxels.set(data.position.toString(), {
                    position: data.position,
                    color: data.color,
                })
            }
        };
        reader.readAsText(file, 'UTF-8')
    };
    input.click()
}

// TODO: I FORGOT ALREADY, SOMETHING WITH INPUT

Input.connect_keydownonce(e => {
    currentCamera = currentCamera == CURRENT_CAMERA_4 ? CURRENT_CAMERA_5 : CURRENT_CAMERA_4;
    Sound.SUCCESS_SOUND.play();

    const shiftedAlready = Input.keys_down.has("ShiftLeft")
    if (shiftedAlready && currentCamera == CURRENT_CAMERA_4) {
        Sound.SOFT_CLICK_SOUND.play();
    }

    if (shiftedAlready && currentCamera == CURRENT_CAMERA_5) {
        Sound.SOFT_CLICK_SOUND.play();
    }
}, "KeyZ")

// Input.connect_keydownonce(e => {
//     use_hopf_coordinates = !use_hopf_coordinates;
// }, "KeyH")

Input.connect_keydownonce(e => {
    focus4.target = M4.add(focus4.target, [1, 0, 0, 0]);
    Sound.playRandomSoundFrom(Sound.MOVE_SOUNDS);
}, "KeyD")

Input.connect_keydown(e => {
    focus4.target = M4.add(focus4.target, [-1, 0, 0, 0]);
    Sound.playRandomSoundFrom(Sound.MOVE_SOUNDS);
}, "KeyA")

Input.connect_keydown(e => {
    focus4.target = M4.add(focus4.target, [0, 1, 0, 0]);
    Sound.playRandomSoundFrom(Sound.MOVE_SOUNDS);
}, "KeyW")

Input.connect_keydown(e => {
    focus4.target = M4.add(focus4.target, [0, -1, 0, 0]);
    Sound.playRandomSoundFrom(Sound.MOVE_SOUNDS);
}, "KeyS")

Input.connect_keydown(e => {
    focus4.target = M4.add(focus4.target, [0, 0, 1, 0]);
    Sound.playRandomSoundFrom(Sound.MOVE_SOUNDS);
}, "KeyE")

Input.connect_keydown(e => {
    focus4.target = M4.add(focus4.target, [0, 0, -1, 0]);
    Sound.playRandomSoundFrom(Sound.MOVE_SOUNDS);
}, "KeyQ")

Input.connect_keydown(e => {
    focus4.target = M4.add(focus4.target, [0, 0, 0, 1])
    Sound.playRandomSoundFrom(Sound.MOVE_SOUNDS);
}, "KeyR")

Input.connect_keydown(e => {
    focus4.target = M4.add(focus4.target, [0, 0, 0, -1])
    Sound.playRandomSoundFrom(Sound.MOVE_SOUNDS);
}, "KeyF")

Input.connect_keydown(e => {
    const offsetUp = -1
    const DISTANCE_UP = 1.1
    distance4.target *= DISTANCE_UP ** offsetUp

    if (!Sound.ZOOM_SOUND.audio.loop) {
        Sound.ZOOM_SOUND.audio.loop = true
        Sound.ZOOM_SOUND.play()
    }
}, "ArrowUp")

Input.connect_keydown(e => {
    const offsetDown = 1
    const DISTANCE_DOWN = 1.1
    distance4.target *= DISTANCE_DOWN ** offsetDown

    if (!Sound.ZOOM_SOUND.audio.loop) {
        Sound.ZOOM_SOUND.audio.loop = true
        Sound.ZOOM_SOUND.play()
    }
}, "ArrowDown")

Input.connect_keyup(e => {
    Sound.ZOOM_SOUND.audio.loop = false
}, "ArrowUp", "ArrowDown")

Input.connect_keydownonce(e => {
    const hash = focus4.target.toString()

    if (hypervoxels.has(hash)) {
        remove_hypervoxel(hash)
    } else {
        const color = Ui.alpha_slider.color(Ui.get_slider_color_alpha(Ui.alpha_slider))
        const data = {
            position: focus4.target,
            color,
        }
        add_hypervoxel(hash, data)
    }

    Sound.HARD_CLICK_SOUND.play()
}, "Space")

Input.connect_keydownonce(e => {
    xy4.target = 0;
    yz4.target = 0;
    zx4.target = 0;
    wx4.target = 0;
    wy4.target = 0;
    wz4.target = 0;

    distance4.target = 2;

    zeta1 = 0;
    zeta2 = 0;
    eta.target = Math.PI / 4;

    Sound.playRandomSoundFrom(Sound.RESET_MOVE_SOUNDS);
}, "ControlLeft")

Input.connect_keydownonce(e => {
    focus4.target = M4.ZERO;
    Sound.playRandomSoundFrom(Sound.RESET_MOVE_SOUNDS);
}, "ControlRight")

Input.connect_keyup(e => {
    if (currentCamera == CURRENT_CAMERA_5) {
        Sound.SOFT_CLICK_SOUND.play();
    }
}, "ShiftLeft")

Input.connect_keydownonce(e => {
    save_state()
}, "Digit9")

Input.connect_keydownonce(e => {
    load_state()
}, "Digit0")

let dragging = null
function disconnect_dragging() {
    if (dragging === null) return
    dragging()
    dragging = null
}

Input.connect_mousedown(e => {
    disconnect_dragging()
    if (Ui.get_guitype_hovered(null)) return

    dragging = Input.connect_mousemove(e => {
        const dx = Input.mouse[0] - Input.lastMouse[0]
        const dy = Input.mouse[1] - Input.lastMouse[1]

        const SPEED = 1
        if (currentCamera == CURRENT_CAMERA_4) {
            xy3.target += SPEED * dx / Canvas.min
            yz3.target += SPEED * -dy / Canvas.min

            // xy3.target %= 2 * Math.PI
            yz3.target = Math.max(Math.min(yz3.target, Math.PI), 0)
        } else {
            if (Input.keys_down.has("ShiftLeft")) {
                wx4.target += SPEED * dx / Canvas.min
                wy4.target += SPEED * -dy / Canvas.min
                // wx4.target %= 2 * Math.PI
                // wy4.target %= 2 * Math.PI
            } else {
                xy4.target += SPEED * dx / Canvas.min
                yz4.target -= SPEED * -dy / Canvas.min
                // xy4.target %= 2 * Math.PI
                // yz4.target %= 2 * Math.PI
            }

            zeta1 += SPEED * dx / Canvas.min
            zeta2 += SPEED * -dy / Canvas.min
            // zeta1 %= 2 * Math.PI
            // zeta2 %= 2 * Math.PI
        }
    })
}, "left")

Input.connect_mouseup(e => {
    disconnect_dragging()
}, "left")

Input.connect_wheel(e => {
    const offset = Math.sign(e.deltaY)

    if (currentCamera == CURRENT_CAMERA_4) {
        const DISTANCE = 1.1
        distance3.target *= DISTANCE ** offset
    } else {
        const SPEED1 = Math.PI / 16
        if (Input.keys_down.has("ShiftLeft")) {
            wz4.target += SPEED1 * offset
            // wz4.target = Math.max(Math.min(wz4.target, Math.PI), 0)
        } else {
            zx4.target += SPEED1 * offset
            // zx4.target = Math.max(Math.min(zx4.target, Math.PI), 0)
        }

        const SPEED2 = Math.PI / 32
        eta.target += SPEED2 * offset
        eta.target = Math.max(Math.min(eta.target, Math.PI / 2), 0)
    }
})