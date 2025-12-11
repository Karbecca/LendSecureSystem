export interface User {
    userId: string;
    email: string;
    role: "Borrower" | "Lender" | "Admin";
    firstName?: string;
    lastName?: string;
    phone?: string;
    createdAt?: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    expiresIn: number;
    user: User;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    user: User;
}
