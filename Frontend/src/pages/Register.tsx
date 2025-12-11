import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ShieldCheck, Mail, Lock, User, Loader2, AlertCircle, Check, Phone } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { cn } from "../lib/utils"

export default function Register() {
    const navigate = useNavigate()
    const { register } = useAuth()

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "Borrower", // Default role
        phone: ""
    })
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError(null)
    }

    const toggleRole = (role: string) => {
        setFormData(prev => ({ ...prev, role }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.")
            setIsLoading(false)
            return
        }

        try {
            // Combine names for simplicity if backend expects full name, or adjust backend later. 
            // For now, assuming standard registration.
            // Note: The useAuth signature might need adjustment if we want to send First/Last name.
            // Based on previous files, useAuth calls API.register(email, password, role).
            // If backend requires First/Last, we might need to update useAuth/API. 
            // For now, I'll assume basic Auth logic and maybe update valid data later.

            await register(formData.email, formData.password, formData.confirmPassword, formData.role, formData.firstName, formData.lastName, formData.phone)
            navigate("/dashboard")
        } catch (err: any) {
            console.error("Registration failed", err);
            // Try to extract the most specific error message possible
            let errorMessage = "Registration failed. Please try again.";

            if (err.response?.data) {
                const data = err.response.data;
                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data.message) {
                    errorMessage = data.message;
                } else if (data.errors) {
                    // Handle validation errors object { Field: ["Error"] }
                    const firstErrorKey = Object.keys(data.errors)[0];
                    if (firstErrorKey) {
                        errorMessage = data.errors[firstErrorKey][0];
                    }
                } else if (data.title) {
                    errorMessage = data.title;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-surface-muted p-4 relative overflow-hidden">

            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-secondary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[500px] relative z-10"
            >

                {/* LEFT SIDE - VISUAL/IMAGE */}
                <div className="hidden lg:flex flex-col justify-between p-8 relative overflow-hidden bg-primary text-white">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
                            alt="City Finance"
                            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/40"></div>
                    </div>

                    {/* Content over image */}
                    <div className="relative z-10">
                        <Link to="/" className="flex items-center space-x-2 w-fit group">
                            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-colors">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">LendSecure</span>
                        </Link>
                    </div>

                    <div className="relative z-10 max-w-md">
                        <h2 className="text-2xl font-bold mb-3 leading-tight">Join the Financial<br />Revolution.</h2>
                        <p className="text-white/80 text-xs leading-relaxed mb-6">
                            Create an account today to start lending or borrowing with complete transparency and control.
                        </p>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <Check className="h-4 w-4 text-sky-300" />
                                <span className="text-xs font-medium">Bank-Grade Security</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-sky-300" />
                                <span className="text-xs font-medium">No Hidden Fees</span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* RIGHT SIDE - FORM */}
                <div className="flex flex-col justify-center p-8 relative bg-white overflow-y-auto">

                    <div className="lg:hidden flex justify-center mb-6">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="bg-primary p-2 rounded-xl shadow-lg">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-lg font-bold text-primary tracking-tight">LendSecure</span>
                        </Link>
                    </div>

                    <div className="text-center lg:text-left mb-6">
                        <h1 className="text-2xl font-bold text-primary">Create Account</h1>
                        <p className="text-xs text-text-secondary mt-1">Join our community of secure lending</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider ml-1">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        name="firstName"
                                        placeholder="John"
                                        className="pl-9 h-10 bg-surface-muted/30 border-surface-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl text-sm"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider ml-1">Last Name</label>
                                <Input
                                    name="lastName"
                                    placeholder="Doe"
                                    className="h-10 bg-surface-muted/30 border-surface-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl text-sm"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-9 h-10 bg-surface-muted/30 border-surface-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl text-sm"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    name="phone"
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    className="pl-9 h-10 bg-surface-muted/30 border-surface-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl text-sm"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Create a password"
                                    className="pl-9 h-10 bg-surface-muted/30 border-surface-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl text-sm"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider ml-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    className="pl-9 h-10 bg-surface-muted/30 border-surface-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl text-sm"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider ml-1">I want to be a:</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => toggleRole("Borrower")}
                                    className={cn(
                                        "flex items-center justify-center py-2.5 rounded-xl border transition-all duration-200 font-medium text-xs",
                                        formData.role === "Borrower"
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                                            : "bg-white border-surface-border text-text-secondary hover:border-primary/50"
                                    )}
                                >
                                    Borrower
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleRole("Lender")}
                                    className={cn(
                                        "flex items-center justify-center py-2.5 rounded-xl border transition-all duration-200 font-medium text-xs",
                                        formData.role === "Lender"
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                                            : "bg-white border-surface-border text-text-secondary hover:border-primary/50"
                                    )}
                                >
                                    Lender
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-11 text-sm font-bold shadow-lg hover:shadow-primary/30 mt-4 rounded-xl transition-all hover:scale-[1.02]" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                                </>
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-text-secondary">
                            Already have an account?{" "}
                            <Link to="/login" className="font-bold text-primary hover:underline">
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>

            </motion.div>
        </div>
    )
}
