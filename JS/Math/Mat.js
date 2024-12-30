export function add(a, b) {
    const result = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] + b[i];
    }
    return result;
}

export function sub(a, b) {
    const result = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] - b[i];
    }
    return result;
}

export function mul_s(a, scalar) {
    const result = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] * scalar;
    }
    return result;
}
