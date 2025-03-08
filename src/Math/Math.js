

export function mul_transform5(m, n) {
    const
        m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3],
        m4 = m[5], m5 = m[6], m6 = m[7], m7 = m[8],
        m8 = m[10], m9 = m[11], m10 = m[12], m11 = m[13],
        m12 = m[15], m13 = m[16], m14 = m[17], m15 = m[18],
        m16 = m[20], m17 = m[21], m18 = m[22], m19 = m[23]

    const
        n0 = n[0], n1 = n[1], n2 = n[2], n3 = n[3],
        n4 = n[5], n5 = n[6], n6 = n[7], n7 = n[8],
        n8 = n[10], n9 = n[11], n10 = n[12], n11 = n[13],
        n12 = n[15], n13 = n[16], n14 = n[17], n15 = n[18],
        n16 = n[20], n17 = n[21], n18 = n[22], n19 = n[23]

    return [
        m0*n0  + m1*n4  + m2*n8  + m3*n12,        m0*n1  + m1*n5  + m2*n9  + m3*n13,        m0*n2  + m1*n6  + m2*n10  + m3*n14,        m0*n2  + m1*n7  + m2*n11  + m3*n15,        0,
        m4*n0  + m5*n4  + m6*n8  + m7*n12,        m4*n1  + m5*n5  + m6*n9  + m7*n13,        m4*n2  + m5*n6  + m6*n10  + m7*n14,        m4*n2  + m5*n7  + m6*n11  + m7*n15,        0,
        m8*n0  + m9*n4  + m10*n8 + m11*n12,       m8*n1  + m9*n5  + m10*n9 + m11*n13,       m8*n2  + m9*n6  + m10*n10 + m11*n14,       m8*n2  + m9*n7  + m10*n11 + m11*n15,       0,
        m12*n0 + m13*n4 + m14*n8 + m15*n12,       m12*n1 + m13*n5 + m14*n9 + m15*n13,       m12*n2 + m13*n6 + m14*n10 + m15*n14,       m12*n2 + m13*n7 + m14*n11 + m15*n15,       0,
        m16*n0 + m17*n4 + m18*n8 + m19*n12 + n16, m16*n1 + m17*n5 + m18*n9 + m19*n13 + n17, m16*n2 + m17*n6 + m18*n10 + m19*n14 + n18, m16*n3 + m17*n7 + m18*n11 + m19*n15 + n19, 1,
    ]
}

export function add_transform5(m, v) {
    const v_v = 1 / v[4]
    const new_m = [...m]
    new_m[20] += v[0] * v_v
    new_m[21] += v[1] * v_v
    new_m[22] += v[2] * v_v
    new_m[23] += v[3] * v_v
    return new_m
}

export function dot3(u, v) {
	return u[0] * v[0] + u[1] * v[1] + u[2] * v[2]
}

export function dot4(u, v) {
	return u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3]
}

export function dot5(u, v) {
	return u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3] + u[4] * u[4]
}

export function mag3(u) {
	return Math.hypot(u[0], u[1], u[2])
}

export function mag4(u) {
	return Math.hypot(u[0], u[1], u[2], u[3])
}

export function mag5(u) {
	return Math.hypot(u[0], u[1], u[2], u[3], u[4])
}

export function norm4(u) {
	const mag = 1 / (mag3(u) * u[3])
	return [
		u[0] * mag,
		u[1] * mag,
		u[2] * mag,
        1,
	]
}

export function norm5(u) {
	const mag = 1 / (mag4(u) * u[4])
	return [
		u[0] * mag,
		u[1] * mag,
		u[2] * mag,
		u[3] * mag,
        1,
	]
}

export function proj4(u, v) {
    const v_w = 1 / v[3]
	const scale = v_w * dot3(v, u) / dot3(u, u)
	return [
		scale * u[0],
		scale * u[1],
		scale * u[2],
        1,
	]
}

export function proj5(u, v) {
    const v_v = 1 / v[4]
	const scale = v_v * dot4(v, u) / dot4(u, u)
	return [
		scale * u[0],
		scale * u[1],
		scale * u[2],
		scale * u[3],
        1,
	]
}

export function sub4(u, v) {
    const u_w = 1 / u[3]
    const v_w = 1 / v[3]

	return [
		u[0]*u_w - v[0]*v_w,
		u[1]*u_w - v[1]*v_w,
		u[2]*u_w - v[2]*v_w,
        1,
	]
}

export function sub5(u, v) {
    const u_v = 1 / u[4]
    const v_v = 1 / v[4]

	return [
		u[0]*u_v - v[0]*v_v,
		u[1]*u_v - v[1]*v_v,
		u[2]*u_v - v[2]*v_v,
		u[3]*u_v - v[3]*v_v,
        1,
	]
}

export function add5(u, v) {
    const u_v = 1 / u[4]
    const v_v = 1 / v[4]

	return [
		u[0]*u_v + v[0]*v_v,
		u[1]*u_v + v[1]*v_v,
		u[2]*u_v + v[2]*v_v,
		u[3]*u_v + v[3]*v_v,
        1,
	]
}

export function mul5(u, s) {
    const u_v = s / u[4]

	return [
		u[0]*u_v,
		u[1]*u_v,
		u[2]*u_v,
		u[3]*u_v,
        1,
	]
}

export function sub4_2(u, v, w) {
    const u_w = 1 / u[3]
    const v_w = 1 / v[3]
    const w_w = 1 / w[3]

	return [
		u[0]*u_w - v[0]*v_w - w[0]*w_w,
		u[1]*u_w - v[1]*v_w - w[1]*w_w,
		u[2]*u_w - v[2]*v_w - w[2]*w_w,
        1,
	]
}

export function sub5_2(u, v, w) {
    const u_v = 1 / u[4]
    const v_v = 1 / v[4]
    const w_v = 1 / w[4]

	return [
		u[0]*u_v - v[0]*v_v - w[0]*w_v,
		u[1]*u_v - v[1]*v_v - w[1]*w_v,
		u[2]*u_v - v[2]*v_v - w[2]*w_v,
		u[3]*u_v - v[3]*v_v - w[3]*w_v,
        1,
	]
}

export function sub5_3(u, v, w, x) {
    const u_v = 1 / u[4]
    const v_v = 1 / v[4]
    const w_v = 1 / w[4]
    const x_v = 1 / x[4]

	return [
		u[0]*u_v - v[0]*v_v - w[0]*w_v - x[0]*x_v,
		u[1]*u_v - v[1]*v_v - w[1]*w_v - x[1]*x_v,
		u[2]*u_v - v[2]*v_v - w[2]*w_v - x[2]*x_v,
		u[3]*u_v - v[3]*v_v - w[3]*w_v - x[3]*x_v,
        1,
	]
}

export function div4(u, s) {
	const m = 1 / (s * u[3])
	return [
		u[0] * m,
		u[1] * m,
		u[2] * m,
        1,
	]
}

export function div5(u, s) {
	const m = 1 / (s * u[4])
	return [
		u[0] * m,
		u[1] * m,
		u[2] * m,
		u[3] * m,
        1,
	]
}

export const X4 = [1, 0, 0, 1]
export const Y4 = [0, 1, 0, 1]
export const Z4 = [0, 0, 1, 1]
export const ZERO4 = [0, 0, 0, 1]
export const ONE4 = [1, 1, 1, 1]

export const X5 = [1, 0, 0, 0, 1]
export const Y5 = [0, 1, 0, 0, 1]
export const Z5 = [0, 0, 1, 0, 1]
export const W5 = [0, 0, 0, 1, 1]
export const ZERO5 = [0, 0, 0, 0, 1]
export const ONE5 = [1, 1, 1, 1, 1]

export function look_along_4(position, direction) {
	const EPSILON = 1e-8

    const direction_w = 1 / direction[3]
    const normalized_direction = [
        direction[0] * direction_w,
        direction[1] * direction_w,
        direction[2] * direction_w,
        1,
    ]

    const position_w = 1 / position[3]
    const normalized_position = [
        position[0] * position_w,
        position[1] * position_w,
        position[2] * position_w,
        1,
    ]

    const norm = mag3(normalized_direction)
	const e0 = div4(normalized_direction, norm)

	let new_x, new_y
	if (Math.abs(e0[0]) > 1 - EPSILON)
		new_x = Y4, new_y = Z4
	else if (Math.abs(e0[1]) > 1 - EPSILON)
		new_x = Z4, new_y = X4
    else
    new_x = X4, new_y = Y4

    const u1 = sub4(new_x, proj4(e0, new_x))
	const u2 = sub4_2(new_y, proj4(e0, new_y), proj4(u1, new_y))

    const e1 = norm4(u1)
    const e2 = norm4(u2)

	return [
		e1[0], e1[1], e1[2], 0,
		e2[0], e2[1], e2[2], 0,
		e0[0], e0[1], e0[2], 0,
		...normalized_position,
	]
}

export function look_along_5(position, direction) {
	const EPSILON = 1e-8

    const direction_v = 1 / direction[4]
    const normalized_direction = [
        direction[0] * direction_v,
        direction[1] * direction_v,
        direction[2] * direction_v,
        direction[3] * direction_v,
        1,
    ]

    const position_v = 1 / position[4]
    const normalized_position = [
        position[0] * position_v,
        position[1] * position_v,
        position[2] * position_v,
        position[3] * position_v,
        1,
    ]

    const norm = mag4(normalized_direction)
	const e0 = div5(normalized_direction, norm)

	let new_x, new_y, new_z
	if (Math.abs(e0[0]) > 1 - EPSILON)
		new_x = W5, new_y = Y5, new_z = Z5
	else if (Math.abs(e0[1]) > 1 - EPSILON)
		new_x = W5, new_y = Z5, new_z = X5
	else if (Math.abs(e0[2]) > 1 - EPSILON)
		new_x = W5, new_y = X5, new_z = Y5
	else
		new_x = Z5, new_y = Y5, new_z = X5

	const u1 = sub5(new_x, proj5(e0, new_x))
	const u2 = sub5_2(new_y, proj5(e0, new_y), proj5(u1, new_y))
	const u3 = sub5_3(new_z, proj5(e0, new_z), proj5(u1, new_z), proj5(u2, new_z))

    const e1 = norm5(u1)
    const e2 = norm5(u2)
    const e3 = norm5(u3)

	return [
		e1[0], e1[1], e1[2], e1[3], 0,
		e2[0], e2[1], e2[2], e2[3], 0,
		e3[0], e3[1], e3[2], e3[3], 0,
		e0[0], e0[1], e0[2], e0[3], 0,
		...normalized_position,
	]
}

export function mul_mx3_3xn(m, n) {
    // m is an mx3 matrix
    // n is a 3xn matrix
    // the result will be an mxn matrix

    // Extract dimensions
    let m_rows = m.length / 3
    let n_cols = n.length / 3

    // Initialize the result matrix
    let result = new Array(m_rows * n_cols)

    // Perform the multiplication
    for (let i = 0; i < m_rows; i++) {
        for (let j = 0; j < n_cols; j++) {
            result[i * n_cols + j] =
                m[i * 3 + 0] * n[0 * n_cols + j] +
                m[i * 3 + 1] * n[1 * n_cols + j] +
                m[i * 3 + 2] * n[2 * n_cols + j]
        }
    }

    return result
}

export function mul_mx4_4xn(m, n) {
    // m is an mx4 matrix
    // n is a 4xn matrix
    // the result will be an mxn matrix

    // Extract dimensions
    let m_rows = m.length / 4
    let n_cols = n.length / 4

    // Initialize the result matrix
    let result = new Array(m_rows * n_cols)

    // Perform the multiplication
    for (let i = 0; i < m_rows; i++) {
        for (let j = 0; j < n_cols; j++) {
            result[i * n_cols + j] =
                m[i * 4 + 0] * n[0 * n_cols + j] +
                m[i * 4 + 1] * n[1 * n_cols + j] +
                m[i * 4 + 2] * n[2 * n_cols + j] +
                m[i * 4 + 3] * n[3 * n_cols + j]
        }
    }

    return result
}

export function mul_mx5_5xn(m, n) {
    // m is an mx5 matrix
    // n is a 5xn matrix
    // the result will be an mxn matrix

    // Extract dimensions
    let m_rows = m.length / 5
    let n_cols = n.length / 5

    // Initialize the result matrix
    let result = new Array(m_rows * n_cols);

    // Perform the multiplication
    for (let i = 0; i < m_rows; i++) {
        for (let j = 0; j < n_cols; j++) {
            result[i * n_cols + j] =
                m[i * 5 + 0] * n[0 * n_cols + j] +
                m[i * 5 + 1] * n[1 * n_cols + j] +
                m[i * 5 + 2] * n[2 * n_cols + j] +
                m[i * 5 + 3] * n[3 * n_cols + j] +
                m[i * 5 + 4] * n[4 * n_cols + j]
        }
    }

    return result
}

export function project_vertices4(vertices4, projection4) {
    const rows = vertices4.length / 4
    const vertices3 = new Array(rows * 3)

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < 3; j++) {
            vertices3[i * 3 + j] =
                vertices4[i * 4 + 0] * projection4[0 * 4 + j] +
                vertices4[i * 4 + 1] * projection4[1 * 4 + j] +
                vertices4[i * 4 + 2] * projection4[2 * 4 + j] +
                vertices4[i * 4 + 3] * projection4[3 * 4 + j]
        }
    }

    for (let i = 0; i < rows; i += 3) {
        const z = vertices3[i + 2]
        vertices3[i + 0] /= z
        vertices3[i + 1] /= z
        vertices3[i + 2] /= z
    }

    return vertices3
}

export function project_vertices5(vertices5, projection5) {
    const rows = vertices5.length / 5
    const vertices4 = new Array(rows * 4)

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < 4; j++) {
            vertices4[i * 4 + j] =
                vertices5[i * 5 + 0] * projection5[0 * 5 + j] +
                vertices5[i * 5 + 1] * projection5[1 * 5 + j] +
                vertices5[i * 5 + 2] * projection5[2 * 5 + j] +
                vertices5[i * 5 + 3] * projection5[3 * 5 + j] +
                vertices5[i * 5 + 4] * projection5[4 * 5 + j]
        }
    }

    for (let i = 0; i < rows; i += 4) {
        const w = vertices4[i + 3]
        vertices4[i + 0] /= w
        vertices4[i + 1] /= w
        vertices4[i + 2] /= w
        vertices4[i + 3] /= w
    }

    return vertices4
}

export function inverse_transform4(m) {
    const
        m0 = m[0], m1 = m[1], m2 = m[2],
        m3 = m[4], m4 = m[5], m5 = m[6],
        m6 = m[8], m7 = m[9], m8 = m[10],
        m9 = m[12], m10 = m[13], m11 = m[14]

    const det = 1 / (m2*m4*m6-m1*m5*m6-m2*m3*m7+m0*m5*m7+m1*m3*m8-m0*m4*m8)

    return [
        det * (m5*m7-m4*m8),
        det * (-m2*m7+m1*m8),
        det * (m2*m4-m1*m5),
        0,

        det * (-m5*m6+m3*m8),
        det * (m2*m6-m0*m8),
        det * (-m2*m3+m0*m5),
        0,

        det * (m4*m6-m3*m7),
        det * (-m1*m6+m0*m7),
        det * (m1*m3-m0*m4),
        0,

        det * (-m11*m4*m6+m10*m5*m6+m11*m3*m7-m10*m3*m8-m5*m7*m9+m4*m8*m9),
        det * (m1*m11*m6-m10*m2*m6-m0*m11*m7+m0*m10*m8+m2*m7*m9-m1*m8*m9),
        det * (-m1*m11*m3+m10*m2*m3+m0*m11*m4-m0*m10*m5-m2*m4*m9+m1*m5*m9),
        1,
    ]
}

export function inverse_transform5(m) {
    const
        m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3],
        m4 = m[5], m5 = m[6], m6 = m[7], m7 = m[8],
        m8 = m[10], m9 = m[11], m10 = m[12], m11 = m[13],
        m12 = m[15], m13 = m[16], m14 = m[17], m15 = m[18],
        m16 = m[20], m17 = m[21], m18 = m[22], m19 = m[23]

    const det = 1 / (
        m1*m11*m14*m4-m1*m10*m15*m4-m11*m13*m2*m4+
        m10*m13*m3*m4-m0*m11*m14*m5+m0*m10*m15*m5+
        m11*m12*m2*m5-m10*m12*m3*m5-m1*m11*m12*m6+
        m0*m11*m13*m6+m1*m10*m12*m7-m0*m10*m13*m7-
        m15*m2*m5*m8+m14*m3*m5*m8+m1*m15*m6*m8-
        m13*m3*m6*m8-m1*m14*m7*m8+m13*m2*m7*m8+
        m15*m2*m4*m9-m14*m3*m4*m9-m0*m15*m6*m9+
        m12*m3*m6*m9+m0*m14*m7*m9-m12*m2*m7*m9
    )

    return [
        det * (-m11*m14*m5+m10*m15*m5+m11*m13*m6-m10*m13*m7-m15*m6*m9+m14*m7*m9),
        det * (m1*m11*m14-m1*m10*m15-m11*m13*m2+m10*m13*m3+m15*m2*m9-m14*m3*m9),
        det * (-m15*m2*m5+m14*m3*m5+m1*m15*m6-m13*m3*m6-m1*m14*m7+m13*m2*m7),
        det * (m11*m2*m5-m10*m3*m5-m1*m11*m6+m1*m10*m7+m3*m6*m9-m2*m7*m9),
        0,

        det * (m11*m14*m4-m10*m15*m4-m11*m12*m6+m10*m12*m7+m15*m6*m8-m14*m7*m8),
        det * (-m0*m11*m14+m0*m10*m15+m11*m12*m2-m10*m12*m3-m15*m2*m8+m14*m3*m8),
        det * (m15*m2*m4-m14*m3*m4-m0*m15*m6+m12*m3*m6+m0*m14*m7-m12*m2*m7),
        det * (-m11*m2*m4+m10*m3*m4+m0*m11*m6-m0*m10*m7-m3*m6*m8+m2*m7*m8),
        0,

        det * (-m11*m13*m4+m11*m12*m5-m15*m5*m8+m13*m7*m8+m15*m4*m9-m12*m7*m9),
        det * (-m1*m11*m12+m0*m11*m13+m1*m15*m8-m13*m3*m8-m0*m15*m9+m12*m3*m9),
        det * (-m1*m15*m4+m13*m3*m4+m0*m15*m5-m12*m3*m5+m1*m12*m7-m0*m13*m7),
        det * (m1*m11*m4-m0*m11*m5+m3*m5*m8-m1*m7*m8-m3*m4*m9+m0*m7*m9),
        0,

        det * (m10*m13*m4-m10*m12*m5+m14*m5*m8-m13*m6*m8-m14*m4*m9+m12*m6*m9),
        det * (m1*m10*m12-m0*m10*m13-m1*m14*m8+m13*m2*m8+m0*m14*m9-m12*m2*m9),
        det * (m1*m14*m4-m13*m2*m4-m0*m14*m5+m12*m2*m5-m1*m12*m6+m0*m13*m6),
        det * (-m1*m10*m4+m0*m10*m5-m2*m5*m8+m1*m6*m8+m2*m4*m9-m0*m6*m9),
        0,

        det * (-m11*m14*m17*m4+m10*m15*m17*m4+m11*m13*m18*m4-m10*m13*m19*m4+
            m11*m14*m16*m5-m10*m15*m16*m5-m11*m12*m18*m5+m10*m12*m19*m5-m11*m13*m16*m6+
            m11*m12*m17*m6+m10*m13*m16*m7-m10*m12*m17*m7+m15*m18*m5*m8-m14*m19*m5*m8-
            m15*m17*m6*m8+m13*m19*m6*m8+m14*m17*m7*m8-m13*m18*m7*m8-m15*m18*m4*m9+
            m14*m19*m4*m9+m15*m16*m6*m9-m12*m19*m6*m9-m14*m16*m7*m9+m12*m18*m7*m9),
        det * (-m1*m11*m14*m16+m1*m10*m15*m16+m0*m11*m14*m17-m0*m10*m15*m17+
            m1*m11*m12*m18-m0*m11*m13*m18-m1*m10*m12*m19+m0*m10*m13*m19+m11*m13*m16*m2-
            m11*m12*m17*m2-m10*m13*m16*m3+m10*m12*m17*m3-m1*m15*m18*m8+m1*m14*m19*m8+
            m15*m17*m2*m8-m13*m19*m2*m8-m14*m17*m3*m8+m13*m18*m3*m8+m0*m15*m18*m9-
            m0*m14*m19*m9-m15*m16*m2*m9+m12*m19*m2*m9+m14*m16*m3*m9-m12*m18*m3*m9),
        det * (m1*m15*m18*m4-m1*m14*m19*m4-m15*m17*m2*m4+m13*m19*m2*m4+
            m14*m17*m3*m4-m13*m18*m3*m4-m0*m15*m18*m5+m0*m14*m19*m5+m15*m16*m2*m5-
            m12*m19*m2*m5-m14*m16*m3*m5+m12*m18*m3*m5-m1*m15*m16*m6+m0*m15*m17*m6+
            m1*m12*m19*m6-m0*m13*m19*m6+m13*m16*m3*m6-m12*m17*m3*m6+m1*m14*m16*m7-
            m0*m14*m17*m7-m1*m12*m18*m7+m0*m13*m18*m7-m13*m16*m2*m7+m12*m17*m2*m7),
        det * (-m1*m11*m18*m4+m1*m10*m19*m4+m11*m17*m2*m4-m10*m17*m3*m4+
            m0*m11*m18*m5-m0*m10*m19*m5-m11*m16*m2*m5+m10*m16*m3*m5+m1*m11*m16*m6-
            m0*m11*m17*m6-m1*m10*m16*m7+m0*m10*m17*m7+m19*m2*m5*m8-m18*m3*m5*m8-
            m1*m19*m6*m8+m17*m3*m6*m8+m1*m18*m7*m8-m17*m2*m7*m8-m19*m2*m4*m9+
            m18*m3*m4*m9+m0*m19*m6*m9-m16*m3*m6*m9-m0*m18*m7*m9+m16*m2*m7*m9),
        1,
    ]
}

export function rot_xy(angle) {
	return [
		Math.cos(angle), Math.sin(angle), 0, 0, 0,
		-Math.sin(angle), Math.cos(angle), 0, 0, 0,
		0, 0, 1, 0, 0,
		0, 0, 0, 1, 0,
		0, 0, 0, 0, 1,
	]
}

export function rot_zw(angle) {
	return [
		1, 0, 0, 0, 0,
		0, 1, 0, 0, 0,
		0, 0, Math.cos(angle), Math.sin(angle), 0,
		0, 0, -Math.sin(angle), Math.cos(angle), 0,
		0, 0, 0, 0, 1,
	]
}

export function rot_xz(angle) {
	return [
		Math.cos(angle), 0, Math.sin(angle), 0, 0,
		0, 1, 0, 0, 0,
		-Math.sin(angle), 0, Math.cos(angle), 0, 0,
		0, 0, 0, 1, 0,
		0, 0, 0, 0, 1,
	];
}

export function rot_xw(angle) {
	return [
		Math.cos(angle), 0, 0, Math.sin(angle), 0,
		0, 1, 0, 0, 0,
		0, 0, 1, 0, 0,
		-Math.sin(angle), 0, 0, Math.cos(angle), 0,
		0, 0, 0, 0, 1,
	];
}

export function rot_yz(angle) {
	return [
		1, 0, 0, 0, 0,
		0, Math.cos(angle), Math.sin(angle), 0, 0,
		0, -Math.sin(angle), Math.cos(angle), 0, 0,
		0, 0, 0, 1, 0,
		0, 0, 0, 0, 1,
	];
}

export function translate5(distance) {
    const v = 1 / distance[4]
	return [
		1, 0, 0, 0, 0,
		0, 1, 0, 0, 0,
		0, 0, 1, 0, 0,
		0, 0, 0, 1, 0,
		distance[0] * v, distance[1] * v, distance[2] * v, distance[3] * v, 1,
	]
}

export function scale4(size) {
    const w = 1 / size[3]
    return [
        size[0] * w, 0, 0, 0,
		0, size[1] * w, 0, 0,
		0, 0, size[2] * w, 0,
		0, 0, 0, 1,
    ]
}

export function scale5(size) {
    const v = 1 / size[4]
    return [
        size[0] * v, 0, 0, 0, 0,
		0, size[1] * v, 0, 0, 0,
		0, 0, size[2] * v, 0, 0,
		0, 0, 0, size[3] * v, 0,
        0, 0, 0, 0, 1,
    ]
}

export function rot_yw(angle) {
	return [
		1, 0, 0, 0, 0,
		0, Math.cos(angle), 0, Math.sin(angle), 0,
		0, 0, 1, 0, 0,
		0, -Math.sin(angle), 0, Math.cos(angle), 0,
		0, 0, 0, 0, 1,
	];
}

export function get_x(m) {
	return [m[0], m[1], m[2], m[3], m[4]]
}

export function get_y(m) {
	return [m[5], m[6], m[7], m[8], m[9]]
}

export function get_z(m) {
	return [m[10], m[11], m[12], m[13], m[14]]
}

export function get_w(m) {
	return [m[15], m[16], m[17], m[18], m[19]]
}

export function get_p(m) {
	return [m[20], m[21], m[22], m[23], m[24]]
}

export const identity5 = [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0,
    0, 0, 0, 0, 1,
]

const gram_schmidt_axes = [

]

export function rotate_around(a, b, theta) {
    const EPSILON = 1e-8

    const a_v = 1 / a[4]
    const unitized_a = [
        a[0] * a_v,
        a[1] * a_v,
        a[2] * a_v,
        a[3] * a_v,
        1,
    ]

    const b_v = 1 / b[4]
    const unitized_b = [
        b[0] * b_v,
        b[1] * b_v,
        b[2] * b_v,
        b[3] * b_v,
        1,
    ]

    const u_norm = norm5(unitized_a)

    for (let i = 0; i < 4; i++)
        if (Math.abs(u_norm[i]) >= 1 - EPSILON && Math.abs(unitized_b[i]) >= 1 - EPSILON)
            return identity5

    const v_norm = norm5(sub5(unitized_b, proj5(u_norm, unitized_b)))

    let w1 = [0, 0, 1, 0, 1];
    let w2 = [0, 0, 0, 1, 1];

    let cosTheta = Math.cos(theta);
    let sinTheta = Math.sin(theta);

    // Manually compute QRQ^T
    let u1 = u_norm[0], u2 = u_norm[1], u3 = u_norm[2], u4 = u_norm[3]
    let v1 = v_norm[0], v2 = v_norm[1], v3 = v_norm[2], v4 = v_norm[3]

    return [
        cosTheta * u1 * u1 + sinTheta * u1 * v1 + cosTheta * v1 * v1 + w1[0] * w1[0] + w2[0] * w2[0],
        cosTheta * u1 * u2 + sinTheta * u1 * v2 + cosTheta * v1 * v2 + w1[0] * w1[1] + w2[0] * w2[1],
        cosTheta * u1 * u3 + sinTheta * u1 * v3 + cosTheta * v1 * v3 + w1[0] * w1[2] + w2[0] * w2[2],
        cosTheta * u1 * u4 + sinTheta * u1 * v4 + cosTheta * v1 * v4 + w1[0] * w1[3] + w2[0] * w2[3],
        0,

        cosTheta * u2 * u1 + sinTheta * u2 * v1 + cosTheta * v2 * v1 + w1[1] * w1[0] + w2[1] * w2[0],
        cosTheta * u2 * u2 + sinTheta * u2 * v2 + cosTheta * v2 * v2 + w1[1] * w1[1] + w2[1] * w2[1],
        cosTheta * u2 * u3 + sinTheta * u2 * v3 + cosTheta * v2 * v3 + w1[1] * w1[2] + w2[1] * w2[2],
        cosTheta * u2 * u4 + sinTheta * u2 * v4 + cosTheta * v2 * v4 + w1[1] * w1[3] + w2[1] * w2[3],
        0,

        cosTheta * u3 * u1 + sinTheta * u3 * v1 + cosTheta * v3 * v1 + w1[2] * w1[0] + w2[2] * w2[0],
        cosTheta * u3 * u2 + sinTheta * u3 * v2 + cosTheta * v3 * v2 + w1[2] * w1[1] + w2[2] * w2[1],
        cosTheta * u3 * u3 + sinTheta * u3 * v3 + cosTheta * v3 * v3 + w1[2] * w1[2] + w2[2] * w2[2],
        cosTheta * u3 * u4 + sinTheta * u3 * v4 + cosTheta * v3 * v4 + w1[2] * w1[3] + w2[2] * w2[3],
        0,

        cosTheta * u4 * u1 + sinTheta * u4 * v1 + cosTheta * v4 * v1 + w1[3] * w1[0] + w2[3] * w2[0],
        cosTheta * u4 * u2 + sinTheta * u4 * v2 + cosTheta * v4 * v2 + w1[3] * w1[1] + w2[3] * w2[1],
        cosTheta * u4 * u3 + sinTheta * u4 * v3 + cosTheta * v4 * v3 + w1[3] * w1[2] + w2[3] * w2[2],
        cosTheta * u4 * u4 + sinTheta * u4 * v4 + cosTheta * v4 * v4 + w1[3] * w1[3] + w2[3] * w2[3],
        0,

        0, 0, 0, 0, 1,
    ]
}