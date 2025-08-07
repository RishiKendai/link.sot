export function compareState<T>(initialValue: T, currentValue: T): T | null {
    // 1. Handle primitive types
    if (typeof initialValue !== 'object' || initialValue === null) {
        return initialValue !== currentValue ? currentValue : null;
    }

    // 2. Handle arrays
    if (Array.isArray(initialValue) && Array.isArray(currentValue)) {
        const diff: unknown[] = [];

        let changed = false;
        const length = Math.max(initialValue.length, currentValue.length);

        for (let i = 0; i < length; i++) {
            const subDiff = compareState(initialValue[i], currentValue[i]);
            if (subDiff !== null) {
                diff[i] = subDiff;
                changed = true;
            }
        }

        return changed ? (diff as T) : null;
    }

    // 3. Handle objects
    if (
        typeof initialValue === 'object' &&
        typeof currentValue === 'object' &&
        initialValue !== null &&
        currentValue !== null
    ) {
        const diff: Record<string, unknown> = {};
        let changed = false;

        for (const key in currentValue) {
            const subDiff = compareState(
                (initialValue as Record<string, unknown>)[key],
                (currentValue as Record<string, unknown>)[key]
            );

            if (subDiff !== null) {
                diff[key] = subDiff;
                changed = true;
            }
        }

        return changed ? (diff as T) : null;
    }

    // If types don't match or are not handled, return currentValue if different
    return initialValue !== currentValue ? currentValue : null;
}
