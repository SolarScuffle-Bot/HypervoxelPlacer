// OptimizeIndices.wgsl

// We recycle the following bindings from the culling pass:
//   tesseract_count (uniform, binding 4)
//   positions_infront_camera4 (storage, read, binding 6)
//   indices_in_view (storage, read_write, binding 8)

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

// This buffer holds each instance’s camera-space position (from the previous pass).
@group(0) @binding(0)
var<storage, read> tesseract_positions: array<vec4<f32>>;

@group(0) @binding(1)
var<uniform> camera4: Camera4Input;

@group(0) @binding(2)
var<storage, read_write> indices_in_view: AtomicSliceU32;

@group(0) @binding(3)
var<storage, read_write> culled_indices: CulledIndices;

// --- Constants for the canonical tesseract geometry ---

// The canonical indices for the full tesseract, arranged by cell.
// We assume there are 8 cells and each cell has 36 indices (total 288).
const INDICES = array<u32, 288>(
    // Cell 0 (e.g. -X Normal Cell)
    1,9,13, 1,13,5,
    3,7,15, 3,15,11,
    9,11,15, 9,15,13,
    3,1,5, 3,5,7,
    7,5,13, 7,13,15,
    1,3,11, 1,11,9,

    // Cell 1 (X Normal Cell)
    0,8,12, 0,12,4,
    2,6,14, 2,14,10,
    8,10,14, 8,14,12,
    2,0,4, 2,4,6,
    6,4,12, 6,12,14,
    0,2,10, 0,10,8,

    // Cell 2 (-Y Normal Cell)
    6,2,10, 6,10,14,
    3,7,15, 3,15,11,
    10,11,15, 10,15,14,
    3,2,6, 3,6,7,
    7,6,14, 7,14,15,
    2,3,11, 2,11,10,

    // Cell 3 (Y Normal Cell)
    4,0,8, 4,8,12,
    1,5,13, 1,13,9,
    8,9,13, 8,13,12,
    1,0,4, 1,4,5,
    5,4,12, 5,12,13,
    0,1,9, 0,9,8,

    // Cell 4 (-Z Normal Cell)
    4,5,7, 4,7,6,
    13,12,14, 13,14,15,
    5,4,12, 5,12,13,
    6,7,15, 6,15,14,
    7,5,13, 7,13,15,
    4,6,14, 4,14,12,

    // Cell 5 (Z Normal Cell)
    0,1,3, 0,3,2,
    9,8,10, 9,10,11,
    1,0,8, 1,8,9,
    2,3,11, 2,11,10,
    3,1,9, 3,9,11,
    0,2,10, 0,10,8,

    // Cell 6 (-W Normal Cell)
    9,8,10, 9,10,11,
    12,13,15, 12,15,14,
    9,11,15, 9,15,13,
    10,8,12, 10,12,14,
    8,9,13, 8,13,12,
    11,10,14, 11,14,15,

    // Cell 7 (W Normal Cell)
    1,0,2, 1,2,3,
    4,5,7, 4,7,6,
    0,1,5, 0,5,4,
    3,2,6, 3,6,7,
    1,3,7, 1,7,5,
    2,0,4, 2,4,6
);

// For simplicity, we define a constant array of canonical cell normals,
// computed offline from VERTICES4. (These values need to be determined for your geometry.)
const CELL_NORMALS = array<vec4<f32>, 8>(
    vec4<f32>( 0.0,  0.0, -1.0,  0.0), // e.g. face normal for cell 0
    vec4<f32>( 0.0,  0.0,  1.0,  0.0), // cell 1
    vec4<f32>( 0.0, -1.0,  0.0,  0.0), // cell 2
    vec4<f32>( 0.0,  1.0,  0.0,  0.0), // cell 3
    vec4<f32>(-1.0,  0.0,  0.0,  0.0), // cell 4
    vec4<f32>( 1.0,  0.0,  0.0,  0.0), // cell 5
    vec4<f32>( 0.0,  0.0,  0.0, -1.0), // cell 6
    vec4<f32>( 0.0,  0.0,  0.0,  1.0)  // cell 7
);

fn getCanonicalNormal(cell: u32) -> vec4<f32> {
    return CELL_NORMALS[cell];
}

// We assume there are 8 cells and each cell has 36 indices.
const CELL_COUNT: u32 = 8u;
const INDICES_PER_CELL: u32 = 36u;
// We reserve a fixed region per instance: header + full set.
const MAX_INDICES_PER_INSTANCE: u32 = 144u;

// The idea is that for each instance, we will write our output to a region in
// indices_in_view.buffer starting at: instance * MAX_INDICES_PER_INSTANCE
// In that region, element 0 will hold the count of indices kept,
// and elements [1..count] will hold the indices.

// We assume the camera is at the origin in camera-space,
// so the view direction for an instance is simply normalize(instance_position.xyz).
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    if (global_id.x >= atomicLoad(&indices_in_view.count)) {
        return;
    }

    // Compute the output offset for this instance.
    let instance = indices_in_view.buffer[global_id.x];
    let outOffset = instance * MAX_INDICES_PER_INSTANCE;
    var count = 0u;

    // Retrieve the instance’s 4D camera-space position.
    let instPos = tesseract_positions[instance];

    // In camera space, the camera is at the origin.
    // Use the xyz components to get a view direction.
    let viewDir = camera4.w;

    var result = Indices(0, array<f32, 144>());

    // For each cell in the canonical tesseract.
    for (var cell = 0u; cell < CELL_COUNT; cell += 1u) {
        // Get the canonical normal for this cell.
        // (These normals are precomputed for your geometry.)
        let canonicalNormal = CELL_NORMALS[cell];
        // If the dot product is positive, the cell is considered front-facing.
        if (dot(canonicalNormal, viewDir) > 0.0) {
            // Calculate the starting index in the canonical indices for this cell.
            let cellStart = cell * INDICES_PER_CELL;
            // Copy this cell’s 36 indices into the output region.
            for (var j = 0u; j < INDICES_PER_CELL; j += 1u) {
                result.buffer[count] = INDICES[cellStart + j];
                result.count += 1u;
            }
        }
    }

    addAtomic(&culled_indices.total_count, result.count);
    culled_indices.buffer[global_id.x] = result;
}