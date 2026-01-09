export const validatePasswordInput = (
    password: string,
    setFunction: (value: string) => void,
    maxLength: number = 64
): void => {
    // Check if the input exceeds the maximum length.
    if (password.length > maxLength) {
        return;
    }

    if (password === "") {
        setFunction(password);
        return;
    }
    // Regex to allow only alphanumeric characters and special characters
    const validPasswordRegex = /^[a-zA-Z0-9!@#$%^&*()_+=]+$/;
    if (validPasswordRegex.test(password)) {
        setFunction(password);
    }
}

export const validateEmailInput = (
    email: string,
    maxLength: number = 254
): boolean => {

    // Check if the input exceeds the maximum length.
    if (email.length > maxLength) {
        return false;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
};


export const validateEmail = (
    email: string,
    setFunction: (value: string) => void,
    maxLength: number = 128
): void => {
    if (email === "") setFunction(email);

    // Check if the input exceeds the maximum length.
    if (email.length > maxLength) return;

    const emailPattern = /^(?:[\p{L}\p{N}@\.]+(?: [\p{L}\p{N}@\.]+)* ?)$/u;
    if (emailPattern.test(email)) {
        setFunction(email);
    }
};