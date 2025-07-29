export function sanitizeData<T extends Record<string, any>>(data: T): T {
    const sanitized: any = {};

    for (const key in data) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) continue;

        const value = data[key];

        if (typeof value === 'string') {
            sanitized[key] = value.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeData(value); // deep sanitize
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}
  