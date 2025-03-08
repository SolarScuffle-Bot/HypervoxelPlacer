@location(0) var<in> inPosition: vec4<f32>;  // from canonical vertex buffer
@builtin(instance_index) var<in> instanceIndex: u32;

@group(0) @binding(0) var<storage, read> instanceTransforms: array<InstanceData>;

struct VertexOutput {
    @builtin(position) pos: vec4<f32>,
    @location(0) color: vec4<f32>,
};

@vertex
fn vertex_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    // Read the per-instance transform.
    let transform = instanceTransforms[instanceIndex].transform;
    // Apply transform to canonical vertex.
    let pos = transform * inPosition;
    var out: VertexOutput;
    out.pos = pos;
    // For demonstration, pass a constant color.
    out.color = vec4(1.0, 1.0, 1.0, 1.0);
    return out;
}