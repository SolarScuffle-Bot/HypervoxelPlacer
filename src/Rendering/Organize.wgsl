// Organize.wgsl

struct AtomicSliceU32 {
    count: atomic<u32>,
    buffer: array<u32>,
};

struct Camera4Input {
    x: vec4<f32>,
    y: vec4<f32>,
    z: vec4<f32>,
    w: vec4<f32>,
    p: vec4<f32>,
};

struct Indices {
    count: u32,
    buffer: array<u32, 144>,
};

struct CulledIndices {
    total_index_count: atomic<u32>,
    buffer: array<Indices>,
};

struct DrawIndirectArgs {
    indexCount: u32,
    instanceCount: u32,
    firstIndex: u32,
    baseVertex: i32,
    firstInstance: u32,
};

// This buffer holds each instance’s camera-space position (from the previous pass).
@group(0) @binding(0)
var<storage, read> tesseract_positions: array<vec4<f32>>;

@group(0) @binding(1)
var<uniform> camera4: Camera4Input;

@group(0) @binding(2)
var<storage, read_write> indices_in_view: AtomicSliceU32;

@group(0) @binding(3)
var<storage, read_write> culled_indices: CulledIndices;

@group(0) @binding(4)
var<uniform, read_write> draw_indirect_args: DrawIndirectArgs;

@compute
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
	
}