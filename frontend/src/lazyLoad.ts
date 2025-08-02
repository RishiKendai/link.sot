import { lazy } from 'react';
import type { LazyExoticComponent } from 'react';

// Lazy load default or named export
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function lazyLoad<T extends React.ComponentType<any>>(
    factory: () => Promise<Record<string, unknown>>,
    namedExport?: string
): LazyExoticComponent<T> {
    return lazy(async () => {
        const module = await factory();
        if (namedExport) {
            return { default: module[namedExport] as T };
        }
        return { default: module.default as T };
    });
}
