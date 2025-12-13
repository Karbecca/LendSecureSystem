export const VALIDATION = {
    WALLET: {
        ADD_FUNDS: {
            MIN: 100,
            MAX: 1000000,
            LABEL: "Min: 100 RWF, Max: 1,000,000 RWF"
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

export const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error.response && error.response.data && error.response.data.message) {
        return error.response.data.message;
    }
    if (error.message) return error.message;
    return "An unknown error occurred.";
};
