type Position = vec4<i32>;
type Index = u32;
type Count = u32;

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

struct PositionColor {
	position: Position;
	color: vec4<u32>;
};

struct AtomicSliceU32 {
    count: atomic<Count>,
    buffer: array<Index>,
};

struct BitonicParams {
    n: u32,         // number of indices to sort
    k: u32,         // current bitonic subarray size
    ascending: u32, // 1 for ascending, 0 for descending
};

struct DrawIndirect {
	vertex_count: Count,
	instance_count: Count,
	first_vertex: Index,
	first_instance: Index,
};

struct Indices {
	count: Count,
	buffer: array<Index, 144>,
};

struct AllIndices {
	vindex_count: atomic<Count>,
	buffer: array<Indices>,
};

struct Vertex {
	vindex: Index,
	iindex: Index,
};

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

// ====================================================================
// Global resource declarations (all in group 0)
// ====================================================================
@group(0)	@binding(0)		var<uniform>				camera4_buffer: Camera4Input;

@group(0)	@binding(1)		var<uniform>				camera3_buffer: Camera3Input;

@group(0)	@binding(2)		var<uniform>				projection4_buffer: ProjectionInput;

@group(0)	@binding(3)		var<uniform>				projection3_buffer: ProjectionInput;

@group(0)	@binding(4)		var<uniform>				tesseract_count_buffer: Count;

@group(0)	@binding(5)		var<uniform>				bitonic_uniform_buffer: BitonicParams;

@group(0)	@binding(6)		var<uniform>				draw_indirect_buffer: DrawIndirect;

@group(0)	@binding(7)		var<uniform>				transparent_vertex_count: atomic<Count>;

@group(0)	@binding(8)		var<storage, read>			transparent_instance_buffer: array<PositionColor>;

@group(0)	@binding(9)		var<storage, read_write>	frustumculled_iindices_buffer: AtomicSliceU32;

@group(0)	@binding(10)	var<storage, read_write>	positions_infront_cam3_buffer: array<Position>;

@group(0)	@binding(11)	var<storage, read_write>	cell_culled_vindices_buffer: AllIndices;

@group(0)	@binding(12)	var<storage, read_write>	transparent_vertex_buffer: array<Vertex>;


// ====================================================================
// Compute Shader: Frustum Culling
// ====================================================================
@compute @workgroup_size(64)
fn frustum_culling(@builtin(global_invocation_id) global_id: vec3<Index>) {
	let i = global_id.x;
    if (i >= tesseract_count) {
        return;
    }

    let position = transparent_instance_buffer[i].position;
    let relative_position4 = mul_camera4_position(camera4_buffer, position);
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
    let j = atomicAdd(&frustumculled_iindices_buffer.count, 1u);
    frustumculled_iindices_buffer.buffer[j] = i;
    positions_infront_cam3_buffer[i] = clip_position;
}

// ====================================================================
// Compute Shader: Bitonic Sorting
// ====================================================================
@compute @workgroup_size(64)
fn bitonic_sorting(@builtin(global_invocation_id) global_id: vec3<Index>) {
	let i = global_id.x;
    let n = bitonic_params.n;
    if (i >= n) {
        return;
    }

    let k_val = bitonic_params.k;
    var j = k_val >> 1u;

    // Loop over the inner stages.
    while (j > 0u) {
        let ixj = i ^ j;
        if (ixj > i && ixj < n) {
            var up = ((i & k_val) == 0u);
            // Flip the comparison if sorting in descending order.
            if (bitonic_params.ascending == 0u) {
                up = !up;
            }
            let index_a = frustumculled_iindices_buffer.buffer[i];
            let index_b = frustumculled_iindices_buffer.buffer[ixj];
            let depth_a = positions_infront_cam3_buffer[index_a].z;
            let depth_b = positions_infront_cam3_buffer[index_b].z;
            // For transparent objects you typically want back-to-front.
            // Adjust the comparison as needed (here, "up" means we want depthA <= depthB).
            if ((up && depth_a < depth_b) || (!up && depth_a > depth_b)) {
                frustumculled_iindices_buffer.buffer[i] = index_b;
                frustumculled_iindices_buffer.buffer[ixj] = index_a;
            }
        }
        workgroupBarrier();
        j = j >> 1u;
    }
}

// ====================================================================
// Compute Shader: Backcell Culling
// ====================================================================
const CELL_COUNT = 8u;
const INDICES_PER_CELL = 36u;
const MAX_INDICES_PER_INSTANCE = 144u;
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
// computed offline from VERTICES4.
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

@compute @workgroup_size(64)
fn backcell_culling(@builtin(global_invocation_id) global_id: vec3<Index>) {
	let i = global_id.x;
	if (i >= atomicLoad(&frustumculled_iindices_buffer.count)) {
        return;
    }

    // Compute the output offset for this instance.
    let instance = frustumculled_iindices_buffer.buffer[i];
    var count = 0u;

    // In camera space, the camera is at the origin.
    // Use the xyz components to get a view direction.
    let view_dir = camera4_buffer.w;

	let result: Indices;
	result.count = 0;

    // For each cell in the canonical tesseract.
    for (var cell = 0u; cell < CELL_COUNT; cell += 1u) {
        // Get the canonical normal for this cell.
        // (These normals are precomputed for your geometry.)
        let canonical_normal = CELL_NORMALS[cell];
        // If the dot product is positive, the cell is considered front-facing.
        if (dot(canonical_normal, view_dir) > 0.0) {
            // Calculate the starting index in the canonical indices for this cell.
            let cell_start = cell * INDICES_PER_CELL;
            // Copy this cell’s 36 indices into the output region.
            for (var j = 0u; j < INDICES_PER_CELL; j += 1u) {
                result.buffer[count] = INDICES[cell_start + j];
            }
			result.count += INDICES_PER_CELL;
        }
    }

    addAtomic(&cell_culled_vindices_buffer.vindex_count, result.count);
    cell_culled_vindices_buffer.buffer[i] = result;
}

// ====================================================================
// Compute Shader: Vertex Compiling
// ====================================================================

@compute @workgroup_size(64)
fn prefix_sum(@builtin(global_invocation_id) global_id: vec3<Index>) {
	let i = global_id.x;
	if (i >= MAX_INDICES_PER_INSTANCE * atomicLoad(&cell_culled_vindices_buffer.vindex_count)) {
        return;
    }

    var index = 0;
    for (var i = 0; i < cell_culled_vindices_buffer.vindex_count; i++) {

    }
}

// ====================================================================
// Render Stage: Vertex and Fragment Shaders
// ====================================================================
struct VertexOutput {
  @builtin(position) Position: vec4<f32>,
  @location(0) fragColor: vec4<f32>,
};

@vertex
fn vertex_main(@location(0) position: vec4<f32>) -> VertexOutput {
  var out: VertexOutput;
  out.Position = projection4Buffer * camera4Buffer * position;
  out.fragColor = vec4<f32>(1.0, 1.0, 1.0, 1.0);
  return out;
}

@fragment
fn fragment_main(in: VertexOutput) -> @location(0) vec4<f32> {
  return in.fragColor;
}