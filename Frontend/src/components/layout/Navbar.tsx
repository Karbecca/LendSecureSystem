import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X, ShieldCheck } from "lucide-react"
import { Button } from "../ui/Button"
import { cn } from "../../lib/utils"

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                isScrolled
                    ? "bg-slate-900/95 backdrop-blur-md shadow-lg border-slate-800"
                    : "bg-slate-900 border-slate-800 py-4"
            )}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="bg-primary p-1.5 rounded-lg group-hover:bg-secondary transition-colors duration-300">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            LendSecure
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Features
                        </a>
                        <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            How it Works
                        </a>
                        <a href="#contact" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Contact Us
                        </a>
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" onClick={() => navigate("/login")} className="text-white hover:bg-white/10">
                                Log in
                            </Button>
                            <Button variant="primary" onClick={() => navigate("/register")} className="shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                Get Started
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-300 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-800 border-b border-slate-700 shadow-lg p-4 flex flex-col space-y-4 animate-in slide-in-from-top-5">
                    <a href="#features" className="text-base font-medium text-slate-300 hover:text-white px-2 py-1" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                    <a href="#how-it-works" className="text-base font-medium text-slate-300 hover:text-white px-2 py-1" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
                    <a href="#contact" className="text-base font-medium text-slate-300 hover:text-white px-2 py-1" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</a>
                    <div className="h-px bg-slate-700 w-full" />
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" onClick={() => navigate("/login")}>Log in</Button>
                    <Button variant="primary" className="w-full" onClick={() => navigate("/register")}>Get Started</Button>
                </div>
            )}
        </nav>
    )
}
