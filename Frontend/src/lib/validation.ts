export const VALIDATION = {
    WALLET: {
        ADD_FUNDS: {
            MIN: 100,
            MAX: 1000000,
            LABEL: "Min: 100 RWF, Max: 1,000,000 RWF"
        }
    },
    LOAN: {
        AMOUNT: {
            MIN: 5000,
            MAX: 5000000,
            LABEL: "Min: 5,000 RWF, Max: 5,000,000 RWF"
        },
        TERM: {
            MIN: 1,
            MAX: 60,
            LABEL: "1 - 60 Months"
        },
        INTEREST: {
            MIN: 1,
            MAX: 30,
            LABEL: "1% - 30%"
        },
        PURPOSE: {
            MIN_LENGTH: 10,
            MAX_LENGTH: 500
        }
    }
};

export const validateWalletAmount = (amount: number): string | null => {
    if (isNaN(amount) || amount <= 0) {
        return "Please enter a valid amount greater than 0.";
    }
    if (amount < VALIDATION.WALLET.ADD_FUNDS.MIN) {
        return `Minimum amount is ${VALIDATION.WALLET.ADD_FUNDS.MIN} RWF.`;
    }
    if (amount > VALIDATION.WALLET.ADD_FUNDS.MAX) {
        return `Maximum amount is ${VALIDATION.WALLET.ADD_FUNDS.MAX} RWF.`;
    }
    return null;
};

export const validateLoanAmount = (amount: number): string | null => {
    if (isNaN(amount)) return "Invalid amount";
    if (amount < VALIDATION.LOAN.AMOUNT.MIN) return `Minimum loan is ${VALIDATION.LOAN.AMOUNT.MIN} RWF`;
    if (amount > VALIDATION.LOAN.AMOUNT.MAX) return `Maximum loan is ${VALIDATION.LOAN.AMOUNT.MAX} RWF`;
    return null;
};

export const validateLoanTerm = (months: number): string | null => {
    if (isNaN(months)) return "Invalid term";
    if (months < VALIDATION.LOAN.TERM.MIN) return `Minimum term is ${VALIDATION.LOAN.TERM.MIN} month(s)`;
    if (months > VALIDATION.LOAN.TERM.MAX) return `Maximum term is ${VALIDATION.LOAN.TERM.MAX} months`;
    return null;
};

export const validateInterestRate = (rate: number): string | null => {
    if (isNaN(rate)) return "Invalid rate";
    if (rate < VALIDATION.LOAN.INTEREST.MIN) return `Minimum rate is ${VALIDATION.LOAN.INTEREST.MIN}%`;
    if (rate > VALIDATION.LOAN.INTEREST.MAX) return `Maximum rate is ${VALIDATION.LOAN.INTEREST.MAX}%`;
    return null;
};

export const validatePurpose = (purpose: string): string | null => {
    if (!purpose || purpose.trim().length < 10) return "Purpose must be at least 10 characters long description";
    return null;
};

export const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error.response && error.response.data && error.response.data.message) {
        return error.response.data.message;
    }
    if (error.message) return error.message;
    return "An unknown error occurred.";
};
