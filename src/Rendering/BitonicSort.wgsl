// bitonic_sort.wgsl

struct BitonicParams {
    n: u32,         // number of indices to sort
    k: u32,         // current bitonic subarray size
    ascending: u32, // 1 for ascending, 0 for descending
};

@group(0) @binding(0)
var<uniform> bitonic_params: BitonicParams;

// The array of indices to sort.
@group(0) @binding(1)
var<storage, read_write> sorted_indices: array<u32>;

// The buffer holding clip-space positions (one per tesseract).
// We use the z component as the depth key.
@group(0) @binding(2)
var<storage, read> positions_clip: array<vec4<f32>>;

@group(0) @binding(3)
var<storage, read> indices_in_view: array<vec4<f32>>;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) globalID: vec3<u32>) {
    let i = globalID.x;
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
            let indexA = sorted_indices[i];
            let indexB = sorted_indices[ixj];
            let depthA = positions_clip[indexA].z;
            let depthB = positions_clip[indexB].z;
            // For transparent objects you typically want back-to-front.
            // Adjust the comparison as needed (here, "up" means we want depthA <= depthB).
            if ((up && depthA < depthB) || (!up && depthA > depthB)) {
                let temp = sorted_indices[i];
                sorted_indices[i] = sorted_indices[ixj];
                sorted_indices[ixj] = temp;
            }
        }
        workgroupBarrier();
        j = j >> 1u;
    }
}
