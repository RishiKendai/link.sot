export const copyClipboard = (value: string) => {
    if (value) {
        navigator.clipboard.writeText(value);
    }
};