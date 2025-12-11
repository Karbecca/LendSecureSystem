import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, LoginResponse } from "../types/auth";
import { api } from "../services/api";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (email: string, password: string, confirmPassword: string, role: string, firstName: string, lastName: string, phone: string) => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Init auth from local storage
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            try {
                // simple check if token pattern is valid, precise expiry check happens largely on backend or decode
                const decoded = jwtDecode(storedToken);
                // Check expiry if possible
                const isExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : false;

                if (!isExpired) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } else {
                    handleLogout();
                }
            } catch (e) {
                handleLogout();
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post("/auth/login", { email, password });
            // Backend returns { success: true, data: { token, user, ... } }
            const data = response.data.data;

            setToken(data.token);
            setUser(data.user);
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
        } catch (error) {
            throw error;
        }
    };

    const register = async (email: string, password: string, confirmPassword: string, role: string, firstName: string, lastName: string, phone: string) => {
        try {
            await api.post("/auth/register", {
                email,
                password,
                confirmPassword,
                role,
                firstName,
                lastName,
                phone
            });
        } catch (error) {
            throw error;
        }
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            register,
            logout: handleLogout,
            isAuthenticated: !!user,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
