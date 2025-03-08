const VERTICES4 = array<f32, 16>(
	vec4f(0.0, 0.0, 0.0, 0.0),
	vec4f(1.0, 0.0, 0.0, 0.0),
	vec4f(0.0, 1.0, 0.0, 0.0),
	vec4f(1.0, 1.0, 0.0, 0.0),
	vec4f(0.0, 0.0, 1.0, 0.0),
	vec4f(1.0, 0.0, 1.0, 0.0),
	vec4f(0.0, 1.0, 1.0, 0.0),
	vec4f(1.0, 1.0, 1.0, 0.0),
	vec4f(0.0, 0.0, 0.0, 1.0),
	vec4f(1.0, 0.0, 0.0, 1.0),
	vec4f(0.0, 1.0, 0.0, 1.0),
	vec4f(1.0, 1.0, 0.0, 1.0),
	vec4f(0.0, 0.0, 1.0, 1.0),
	vec4f(1.0, 0.0, 1.0, 1.0),
	vec4f(0.0, 1.0, 1.0, 1.0),
	vec4f(1.0, 1.0, 1.0, 1.0),
);

const INDICES4 = array<u32, 288>(
	// -X Normal Cell (6 quads -> 12 triangles)
	// Quad (1,9,13,5) => Tri (1,9,13) , (1,13,5)
	1,9,13, 1,13,5,
	3,7,15, 3,15,11,
	9,11,15, 9,15,13,
	3,1,5, 3,5,7,
	7,5,13, 7,13,15,
	1,3,11, 1,11,9,

	// X Normal Cell
	0,8,12, 0,12,4,
	2,6,14, 2,14,10,
	8,10,14, 8,14,12,
	2,0,4, 2,4,6,
	6,4,12, 6,12,14,
	0,2,10, 0,10,8,

	// -Y Normal Cell
	6,2,10, 6,10,14,
	3,7,15, 3,15,11,
	10,11,15, 10,15,14,
	3,2,6, 3,6,7,
	7,6,14, 7,14,15,
	2,3,11, 2,11,10,

	// Y Normal Cell
	4,0,8, 4,8,12,
	1,5,13, 1,13,9,
	8,9,13, 8,13,12,
	1,0,4, 1,4,5,
	5,4,12, 5,12,13,
	0,1,9, 0,9,8,

	// -Z Normal Cell
	4,5,7, 4,7,6,
	13,12,14, 13,14,15,
	5,4,12, 5,12,13,
	6,7,15, 6,15,14,
	7,5,13, 7,13,15,
	4,6,14, 4,14,12,

	// Z Normal Cell
	0,1,3, 0,3,2,
	9,8,10, 9,10,11,
	1,0,8, 1,8,9,
	2,3,11, 2,11,10,
	3,1,9, 3,9,11,
	0,2,10, 0,10,8,

	// -W Normal Cell
	9,8,10, 9,10,11,
	12,13,15, 12,15,14,
	9,11,15, 9,15,13,
	10,8,12, 10,12,14,
	8,9,13, 8,13,12,
	11,10,14, 11,14,15,

	// W Normal Cell
	1,0,2, 1,2,3,
	4,5,7, 4,7,6,
	0,1,5, 0,5,4,
	3,2,6, 3,6,7,
	1,3,7, 1,7,5,
	2,0,4, 2,4,6,
);

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

struct AtomicSliceU32 {
    count: atomic<u32>,
    buffer: array<u32>, // store indices or references to positions that survived
};

struct BitonicConstants {
    n: u32,          // Number of valid elements in data
    k: u32,          // The current bitonic sub-block size
    ascending: u32,  // 1 => final sort ascending, 0 => descending
}

fn mul_camera4_position(camera: Camera4Input, position: vec4<f32>) -> vec4<f32> {
	return vec4(
		camera.x.x * position.x + camera.y.x * position.y + camera.z.x * position.z + camera.w.x * position.w + camera.p.x,
		camera.x.y * position.x + camera.y.y * position.y + camera.z.y * position.z + camera.w.y * position.w + camera.p.y,
		camera.x.z * position.x + camera.y.z * position.y + camera.z.z * position.z + camera.w.z * position.w + camera.p.z,
		camera.x.w * position.x + camera.y.w * position.y + camera.z.w * position.z + camera.w.w * position.w + camera.p.w,
	);
}

fn mul_camera3_position(camera: Camera3Input, position: vec4<f32>) -> vec4<f32> {
	return vec4(
		camera.x.x * position.x + camera.y.x * position.y + camera.z.x * position.z + camera.w.x * position.w + camera.p.x,
		camera.x.y * position.x + camera.y.y * position.y + camera.z.y * position.z + camera.w.y * position.w + camera.p.y,
		camera.x.z * position.x + camera.y.z * position.y + camera.z.z * position.z + camera.w.z * position.w + camera.p.z,
		camera.x.w * position.x + camera.y.w * position.y + camera.z.w * position.z + camera.w.w * position.w + camera.p.w,
	);
}

fn mul_projection4_position(far: f32, near: f32, fov: f32, position: vec4<f32>) -> vec4<f32> {
	let fn_den = 1.0 / (far - near);
	let a = far * fn_den;
	let b = far * near * -fn_den;

	let s = 1.0 / tan(fov * 0.5);
	let w_den = 1.0 / position.w; // This is the homogeneous coordinate
	return vec4(
		s * position.x * w_den,
		s * position.y * w_den,
		s * position.z * w_den,
		a + b * w_den,
	);
}

fn mul_projection3_position(far: f32, near: f32, fov: f32, position: vec4<f32>) -> vec4<f32> {
	let fn_den = 1.0 / (far - near);
	let a = far * fn_den;
	let b = far * near * -fn_den;

	let s = 1.0 / tan(fov * 0.5);
	let z_den = 1.0 / position.z; // This is the homogeneous coordinate
	return vec4(
		s * position.x,
		s * position.y,
		a * position.z + b,
		position.z,
	);
}

// // given an array arr of length n, this code sorts it in place
//     // all indices run from 0 to n-1
//     for (k = 2; k <= n; k *= 2) // k is doubled every iteration
//         for (j = k/2; j > 0; j /= 2) // j is halved at every iteration, with truncation of fractional parts
//             for (i = 0; i < n; i++)
//                 l = bitwiseXOR (i, j); // in C-like languages this is "i ^ j"
//                 if (l > i)
//                     if (  (bitwiseAND (i, k) == 0) AND (arr[i] > arr[l])
//                        OR (bitwiseAND (i, k) != 0) AND (arr[i] < arr[l]) )
//                           swap the elements arr[i] and arr[l]

// @group(Bind Group) @binding(Binding Index)
@group(0) @binding(0) var<uniform> camera4_inverse: Camera4Input;
@group(0) @binding(1) var<uniform> camera3_inverse: Camera3Input;
@group(0) @binding(2) var<uniform> projection4: ProjectionInput;
@group(0) @binding(3) var<uniform> projection3: ProjectionInput;
@group(0) @binding(4) var<uniform> tesseract_count: u32;
@group(0) @binding(5) var<storage, read> tesseract_positions: array<vec4<f32>>;
@group(0) @binding(6) var<storage, read> tesseract_colors: array<u32>;
@group(0) @binding(7) var<storage, read_write> positions_infront_camera4: array<vec4<f32>>;
@group(0) @binding(7) var<storage, read_write> positions_infront_camera3: array<vec4<f32>>;
@group(0) @binding(8) var<storage, read_write> indices_in_view: AtomicSliceU32;
// @group(0) @binding(9) var<storage, read> bitonic_constants: BitonicConstants;

@compute @workgroup_size(64, 1, 1)
fn cull_cells_out_view(
	@builtin(global_invocation_id) global_id : vec3<u32>
) {
	let i = global_id.x;
	if (i >= tesseract_count) {
        return;
    }

	let position = tesseract_positions[i];
	let relative_position4 = mul_camera4_position(camera4_inverse, position);
	if (relative_position4.w <= 0.0) {
		return;
	}

	let clip_position = mul_projection4_position(projection4.far, projection4.near, projection4.fov, relative_position4);
	if (
		clip_position.x <= -1.0 || 1.0 <= clip_position.x ||
		clip_position.y <= -1.0 || 1.0 <= clip_position.y ||
		clip_position.z <= -1.0 || 1.0 <= clip_position.z ||
		clip_position.w <= -1.0 || 1.0 <= clip_position.w
	) {
		return;
	}

	let relative_position3 = mul_camera3_position(camera3_inverse, clip_position);

	let j = atomicAdd(&indices_in_view.count, 1);
	indices_in_view.buffer[j] = i;
	positions_infront_camera4[i] = relative_position4;
	positions_infront_camera3[i] = clip_position;
}

/*
    // given an array arr of length n, this code sorts it in place
    // all indices run from 0 to n-1
    for (k = 2; k <= n; k *= 2) { // k is doubled every iteration
        for (j = k/2; j > 0; j /= 2) { // j is halved at every iteration, with truncation of fractional parts
            for (i = 0; i < n; i++) {
                l = i ^ j;
                if (l > i) {
                    if ((i & k == 0) && (arr[i] > arr[l]) || (i & k != 0) && (arr[i] < arr[l])) {
						let arrl = arr[l];
						arr[l] = arr[i];
						arr[i] = arrl;
					}
				}
			}
		}
	}
*/

@compute @workgroup_size(64)
fn bitonic_sort_infront_positions(@builtin(global_invocation_id) globalID: vec3<u32>) {
    let i = globalID.x;
    let n = bitonic_constants.n;
    if (i >= n) {
        return;
    }

    // Outer param: k
    let k_val = bitonic_constants.k;
    // Ascending flag => up or down merges
    let ascending_flag = bitonic_constants.ascending;

    // We'll loop j from (k_val >> 1) down to 1
    // (some references do ascending j, either is fine,
    //  so long as the merges are consistent).
    var j = k_val >> 1u;
    loop {
        if (j == 0u) {
            break;
        }

        let ixj = i ^ j;
        if (ixj > i && ixj < n) {
            // Standard bitonic direction logic: "up" if (i & k_val) == 0
            var up = ((i & k_val) == 0u);
            // Flip if final sort is descending
            if (ascending_flag == 0u) {
                up = !up;
            }

            let ai = indices_in_view[i];
            let bi = indices_in_view[ixj];
			let a = positions_in_view[ai];
			let b = positions_in_view[bi];
            if ((up && a > b) || (!up && a < b)) {
                data_buffer[i]  = b;
                data_buffer[ixj] = a;
            }
        }

        // Decrement j
        j = j >> 1u;
    }
}
@vertex
fn vertex_main(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
	let j = INDICES4[i];
	let vertex = VERTICES4[j] - vec4(0.5, 0.5, 0.5, 0.5) + vec4(0.0, 0.0, 1.5, 0.0);
	return vec4(vertex.xyz, vertex.w + 1);
}

@fragment
fn fragment_main() -> @location(0) vec4f {
	return vec4(1.0, 1.0, 1.0, 0.1);
}