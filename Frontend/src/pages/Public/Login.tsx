
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError(null) // Clear error on typing
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const user = await login(formData.email, formData.password)

            if (user.role === 'Admin') {
                navigate("/admin")
            } else if (user.role === 'Lender') {
                navigate("/lender")
            } else {
                navigate("/dashboard")
            }
        } catch (err: any) {
            console.error("Login failed", err);
            setError("Invalid email or password. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-surface-muted p-4 relative overflow-hidden">

            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div
                className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[500px] relative z-10"
            >

                {/* LEFT SIDE - VISUAL/IMAGE */}
                <motion.div
                    initial={{ x: -200, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                    className="hidden lg:flex flex-col justify-between p-8 relative overflow-hidden bg-primary text-white"
                >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
                            alt="Secure Banking"
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
                        <h2 className="text-2xl font-bold mb-3 leading-tight">Secure Peer-to-Peer<br />Lending.</h2>
                        <p className="text-primary-light/90 text-xs leading-relaxed mb-6">
                            "LendSecure changed the way I manage my finances. The transparency is unmatched."
                        </p>
                        <div className="flex items-center space-x-2">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-6 w-6 rounded-full border-2 border-primary bg-gray-200 flex items-center justify-center overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                                    </div >
                                ))}
                            </div >
                            <span className="text-[10px] font-medium opacity-80">Join 5,000+ others</span>
                        </div >
                    </div >
                </motion.div >


                {/* RIGHT SIDE - FORM */}
                <motion.div
                    initial={{ x: 200, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 2.5, ease: "easeOut", delay: 0.1 }}
                    className="flex flex-col justify-center p-8 relative bg-white"
                >

                    <div className="lg:hidden flex justify-center mb-6">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="bg-primary p-2 rounded-xl shadow-lg">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-lg font-bold text-primary tracking-tight">LendSecure</span>
                        </Link>
                    </div>

                    <div className="text-center lg:text-left mb-6">
                        <h1 className="text-2xl font-bold text-primary">Welcome Back</h1>
                        <p className="text-xs text-text-secondary mt-1">Enter your details to access your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-text-secondary tracking-wider ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10 h-12 bg-surface-muted/30 border-surface-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-text-secondary tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="pl-10 h-12 bg-surface-muted/30 border-surface-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-xl"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="flex justify-end pt-1">
                                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-secondary transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg hover:shadow-primary/30 mt-2 rounded-xl transition-all hover:scale-[1.02]" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Logging in...
                                </>
                            ) : (
                                "Log In"
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-text-secondary">
                            Don't have an account?{" "}
                            <Link to="/register" className="font-bold text-primary hover:underline">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                    <div className="mt-4 text-center">
                        <Link to="/" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors flex items-center justify-center gap-2">
                            <ArrowRight className="h-4 w-4 rotate-180" /> Back to Home
                        </Link>
                    </div>
                </motion.div >

            </div >
        </div >
    )
}
