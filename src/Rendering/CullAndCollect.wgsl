// cull_and_collect.wgsl

// Structures for camera and projection uniforms.
struct Camera4Input {
    x: vec4<f32>,
    y: vec4<f32>,
    z: vec4<f32>,
    w: vec4<f32>,
    p: vec4<f32>,
};

struct Camera3Input {
    x: vec3<f32>,
    y: vec3<f32>,
    z: vec3<f32>,
    p: vec3<f32>,
};

struct ProjectionInput {
    far: f32,
    near: f32,
    fov: f32,
};

// A structure to hold an atomic counter plus a storage array of indices.
struct AtomicSliceU32 {
    count: atomic<u32>,
    buffer: array<u32>,
};

// Bindings (all in group(0)):
@group(0) @binding(0)
var<uniform> camera4_inverse: Camera4Input;
@group(0) @binding(1)
var<uniform> camera3_inverse: Camera3Input;
@group(0) @binding(2)
var<uniform> projection4: ProjectionInput;
@group(0) @binding(3)
var<uniform> projection3: ProjectionInput;
@group(0) @binding(4)
var<uniform> tesseract_count: u32;
@group(0) @binding(5)
var<storage, read> tesseract_positions: array<vec4<f32>>;
// (tesseract_colors could be used if needed – omitted here for brevity)
@group(0) @binding(6)
var<storage, read_write> positions_infront_camera4: array<vec4<f32>>;
@group(0) @binding(7)
var<storage, read_write> positions_infront_camera3: array<vec4<f32>>;
// The output index buffer (first element is the atomic counter, then indices)
@group(0) @binding(8)
var<storage, read_write> indices_in_view: AtomicSliceU32;

// Helper functions for transforming positions.
fn mul_camera4_position(camera: Camera4Input, position: vec4<f32>) -> vec4<f32> {
    return vec4(
        camera.x.x * position.x + camera.y.x * position.y + camera.z.x * position.z + camera.w.x * position.w + camera.p.x,
        camera.x.y * position.x + camera.y.y * position.y + camera.z.y * position.z + camera.w.y * position.w + camera.p.y,
        camera.x.z * position.x + camera.y.z * position.y + camera.z.z * position.z + camera.w.z * position.w + camera.p.z,
        camera.x.w * position.x + camera.y.w * position.y + camera.z.w * position.z + camera.w.w * position.w + camera.p.w
    );
}

fn mul_projection4_position(far: f32, near: f32, fov: f32, position: vec4<f32>) -> vec4<f32> {
    let fn_den = 1.0 / (far - near);
    let a = far * fn_den;
    let b = far * near * -fn_den;
    let s = 1.0 / tan(fov * 0.5);
    let w_den = 1.0 / position.w;
    return vec4(
        s * position.x * w_den,
        s * position.y * w_den,
        s * position.z * w_den,
        a + b * w_den
    );
}

@compute @workgroup_size(64)
fn cull_cells_out_view(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let i = global_id.x;
    if (i >= tesseract_count) {
        return;
    }
    let position = tesseract_positions[i];
    let relative_position4 = mul_camera4_position(camera4_inverse, position);
    // Discard if behind the camera.
    if (relative_position4.w <= 0.0) {
        return;
    }
    let clip_position = mul_projection4_position(projection4.far, projection4.near, projection4.fov, relative_position4);
    // Discard if outside the clip volume.
    if (clip_position.x <= -1.0 || clip_position.x >= 1.0 ||
        clip_position.y <= -1.0 || clip_position.y >= 1.0 ||
        clip_position.z <= -1.0 || clip_position.z >= 1.0 ||
        clip_position.w <= -1.0 || clip_position.w >= 1.0) {
        return;
    }
    // For simplicity, we do not recompute a camera3 projection here.
    // (In your actual code you may want to compute relative_position3 similarly.)
    let relative_position3 = clip_position; // using clip_position as a proxy

    // Atomically obtain the next free index.
    let j = atomicAdd(&indices_in_view.count, 1u);
    indices_in_view.buffer[j] = i;
    positions_infront_camera4[i] = relative_position4;
    positions_infront_camera3[i] = clip_position;
}