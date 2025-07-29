interface ValidateOptions {
    name: string;
    value: string;
    type?: keyof typeof REGEX_PATTERNS;
    fieldName?: string;
    required?: boolean;
    message?: string;
    shouldTrim?: boolean;
    setError: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const REGEX_PATTERNS = {
    email: /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i,
    password: /[\w\d]*(([0-9]+.*[A-Za-z]+.*)|[A-Za-z]+.*([0-9]+.*))/,
    name: /^(?:[a-zA-Z]\s*){3,}$/,
    mobile: /^[0-9 -()+]{10}$/,
    number: /^[0-9]+$/,
    url: /^((http|https):\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(\/.*)?$/,
    domain: /^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$/,
};

const FIELD_LABELS: Record<string, string> = {
    email: 'Email',
    password: 'Password',
    name: 'Name',
    mobile: 'Mobile Number',
    url: 'URL',
    domain: 'Domain',
};

export const validateField = ({
    name,
    value,
    type,
    fieldName,
    required = true,
    message,
    shouldTrim = false,
    setError,
}: ValidateOptions): boolean => {
    let val = value ?? '';
    if (shouldTrim) val = val.trim();

    const label = fieldName || FIELD_LABELS[type || name] || name;

    if (required && val === '') {
        setError((prev) => ({ ...prev, [name]: `${label} is required.` }));
        return false;
    }

    if (!required && val === '') {
        setError((prev) => ({ ...prev, [name]: '' }));
        return true;
    }

    if (type && REGEX_PATTERNS[type] && !REGEX_PATTERNS[type].test(val)) {
        setError((prev) => ({
            ...prev,
            [name]: message || `Enter a valid ${label}.`,
        }));
        return false;
    }

    setError((prev) => ({ ...prev, [name]: '' }));
    return true;
};
