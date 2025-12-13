// Validation constants for the application

export const VALIDATION = {
    LOAN: {
        AMOUNT: {
            MIN: 10000,
            MAX: 10000000,
            LABEL: "10,000 - 10,000,000 RWF"
        },
        TERM: {
            MIN: 1,
            MAX: 60,
            LABEL: "1-60 months"
        },
        INTEREST: {
            MIN: 5,
            MAX: 30,
            LABEL: "5-30%"
        },
        PURPOSE: {
            MIN_LENGTH: 10,
            MAX_LENGTH: 500
        }
    },
    WALLET: {
        ADD_FUNDS: {
            MIN: 1000,
            MAX: 1000000,
            LABEL: "1,000 - 1,000,000 RWF"
        }
    },
    FUNDING: {
        MIN: 1000,
        LABEL: "Minimum 1,000 RWF"
    }
};

export const ERROR_MESSAGES = {
    LOAN: {
        AMOUNT_REQUIRED: "Loan amount is required",
        AMOUNT_MIN: `Minimum loan amount is ${VALIDATION.LOAN.AMOUNT.MIN.toLocaleString()} RWF`,
        AMOUNT_MAX: `Maximum loan amount is ${VALIDATION.LOAN.AMOUNT.MAX.toLocaleString()} RWF`,
        TERM_REQUIRED: "Loan term is required",
        TERM_MIN: `Minimum term is ${VALIDATION.LOAN.TERM.MIN} month`,
        TERM_MAX: `Maximum term is ${VALIDATION.LOAN.TERM.MAX} months`,
        INTEREST_REQUIRED: "Interest rate is required",
        INTEREST_MIN: `Minimum interest rate is ${VALIDATION.LOAN.INTEREST.MIN}%`,
        INTEREST_MAX: `Maximum interest rate is ${VALIDATION.LOAN.INTEREST.MAX}%`,
        PURPOSE_REQUIRED: "Purpose is required",
        PURPOSE_MIN: `Purpose must be at least ${VALIDATION.LOAN.PURPOSE.MIN_LENGTH} characters`,
        PURPOSE_MAX: `Purpose cannot exceed ${VALIDATION.LOAN.PURPOSE.MAX_LENGTH} characters`
    },
    WALLET: {
        AMOUNT_REQUIRED: "Amount is required",
        AMOUNT_MIN: `Minimum amount is ${VALIDATION.WALLET.ADD_FUNDS.MIN.toLocaleString()} RWF`,
        AMOUNT_MAX: `Maximum amount is ${VALIDATION.WALLET.ADD_FUNDS.MAX.toLocaleString()} RWF`,
        AMOUNT_INVALID: "Please enter a valid amount"
    },
    FUNDING: {
        AMOUNT_REQUIRED: "Funding amount is required",
        AMOUNT_MIN: `Minimum funding is ${VALIDATION.FUNDING.MIN.toLocaleString()} RWF`,
        AMOUNT_INVALID: "Please enter a valid amount",
        EXCEEDS_REMAINING: "Amount exceeds remaining loan amount"
    },
    GENERIC: {
        NETWORK_ERROR: "Network error. Please check your connection and try again.",
        UNAUTHORIZED: "Your session has expired. Please log in again.",
        SERVER_ERROR: "Server error. Please try again later.",
        UNKNOWN_ERROR: "An unexpected error occurred. Please try again."
    }
};

// Helper function to get user-friendly error message
export function getErrorMessage(error: any): string {
    if (!error) return ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;

    if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 401) return ERROR_MESSAGES.GENERIC.UNAUTHORIZED;
        if (status >= 500) return ERROR_MESSAGES.GENERIC.SERVER_ERROR;
        if (message) return message;
    }

    if (error.message === "Network Error") {
        return ERROR_MESSAGES.GENERIC.NETWORK_ERROR;
    }

    return error.message || ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
}

// Validation helper functions
export function validateLoanAmount(amount: number): string | null {
    if (!amount) return ERROR_MESSAGES.LOAN.AMOUNT_REQUIRED;
    if (amount < VALIDATION.LOAN.AMOUNT.MIN) return ERROR_MESSAGES.LOAN.AMOUNT_MIN;
    if (amount > VALIDATION.LOAN.AMOUNT.MAX) return ERROR_MESSAGES.LOAN.AMOUNT_MAX;
    return null;
}

export function validateLoanTerm(term: number): string | null {
    if (!term) return ERROR_MESSAGES.LOAN.TERM_REQUIRED;
    if (term < VALIDATION.LOAN.TERM.MIN) return ERROR_MESSAGES.LOAN.TERM_MIN;
    if (term > VALIDATION.LOAN.TERM.MAX) return ERROR_MESSAGES.LOAN.TERM_MAX;
    return null;
}

export function validateInterestRate(rate: number): string | null {
    if (!rate) return ERROR_MESSAGES.LOAN.INTEREST_REQUIRED;
    if (rate < VALIDATION.LOAN.INTEREST.MIN) return ERROR_MESSAGES.LOAN.INTEREST_MIN;
    if (rate > VALIDATION.LOAN.INTEREST.MAX) return ERROR_MESSAGES.LOAN.INTEREST_MAX;
    return null;
}

export function validatePurpose(purpose: string): string | null {
    if (!purpose || !purpose.trim()) return ERROR_MESSAGES.LOAN.PURPOSE_REQUIRED;
    if (purpose.trim().length < VALIDATION.LOAN.PURPOSE.MIN_LENGTH) return ERROR_MESSAGES.LOAN.PURPOSE_MIN;
    if (purpose.trim().length > VALIDATION.LOAN.PURPOSE.MAX_LENGTH) return ERROR_MESSAGES.LOAN.PURPOSE_MAX;
    return null;
}

export function validateWalletAmount(amount: number): string | null {
    if (!amount) return ERROR_MESSAGES.WALLET.AMOUNT_REQUIRED;
    if (isNaN(amount)) return ERROR_MESSAGES.WALLET.AMOUNT_INVALID;
    if (amount < VALIDATION.WALLET.ADD_FUNDS.MIN) return ERROR_MESSAGES.WALLET.AMOUNT_MIN;
    if (amount > VALIDATION.WALLET.ADD_FUNDS.MAX) return ERROR_MESSAGES.WALLET.AMOUNT_MAX;
    return null;
}

export function validateFundingAmount(amount: number, remaining: number): string | null {
    if (!amount) return ERROR_MESSAGES.FUNDING.AMOUNT_REQUIRED;
    if (isNaN(amount)) return ERROR_MESSAGES.FUNDING.AMOUNT_INVALID;
    if (amount < VALIDATION.FUNDING.MIN) return ERROR_MESSAGES.FUNDING.AMOUNT_MIN;
    if (amount > remaining) return ERROR_MESSAGES.FUNDING.EXCEEDS_REMAINING;
    return null;
}
