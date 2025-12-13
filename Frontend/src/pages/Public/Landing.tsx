
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { TypeAnimation } from 'react-type-animation'
import Tilt from 'react-parallax-tilt'
import { Navbar } from "../../components/layout/Navbar"
import { Footer } from "../../components/layout/Footer"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { ArrowRight, CheckCircle2, Shield, Zap, TrendingUp, Users, Lock, PieChart } from "lucide-react"

export default function Landing() {
    const navigate = useNavigate()

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }

    return (
        <div className="min-h-screen bg-surface-muted flex flex-col font-sans text-text-primary overflow-x-hidden">
            <Navbar />

            <main className="flex-grow">
                {/* HERO SECTION */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                    {/* Floating Particles/Blobs Background */}
                    <div className="absolute top-20 right-0 -mr-20 -mt-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse -z-10"></div>
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10"></div>
                    <motion.div
                        animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-secondary/30 blur-sm -z-10"
                    />
                    <motion.div
                        animate={{ y: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/3 right-1/3 w-8 h-8 rounded-full bg-primary/20 blur-md -z-10"
                    />

                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                            {/* Text Content */}
                            <motion.div
                                className="max-w-2xl"
                                initial="hidden"
                                animate="visible"
                                variants={containerVariants}
                            >
                                <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm border border-surface-border mb-6">
                                    <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
                                    <span className="text-xs font-medium text-text-secondary">v1.0 Live & Secure</span>
                                </motion.div>

                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-primary mb-6 leading-[1.1]">
                                    Banking without <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                        <TypeAnimation
                                            sequence={[
                                                'the Bank.',
                                                2000,
                                                'the Fees.',
                                                2000,
                                                'the Limits.',
                                                2000
                                            ]}
                                            wrapper="span"
                                            speed={50}
                                            repeat={Infinity}
                                        />
                                    </span>
                                </h1>

                                <motion.p variants={itemVariants} className="text-lg md:text-xl text-text-secondary mb-8 leading-relaxed max-w-lg">
                                    Lend directly to people you trust, or borrow with rates that make sense.
                                    Secure, transparent, and built for your financial freedom.
                                </motion.p>
                                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                                    <Button size="lg" className="rounded-full px-8 text-base shadow-lg hover:shadow-xl transition-all hover:scale-105" onClick={() => navigate("/register")}>
                                        Get Started Now
                                    </Button>
                                    <Button variant="outline" size="lg" className="rounded-full px-8 text-base bg-white/50 backdrop-blur-sm hover:bg-white" onClick={() => window.location.href = '#how-it-works'}>
                                        How it Works
                                    </Button>
                                </motion.div>

                                {/* Mini Trust Signals */}
                                <motion.div variants={itemVariants} className="mt-12 flex items-center space-x-6 text-sm text-text-muted">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className={`h - 8 w - 8 rounded - full border - 2 border - white bg - gray - 200 flex items - center justify - center text - [10px] font - bold overflow - hidden`}>
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                                            </div >
                                        ))}
                                    </div >
                                    <p>Trusted by <span className="font-semibold text-text-primary">5,000+</span> users</p>
                                </motion.div >
                            </motion.div >

                            {/* Hero Visual / Image - WITH TILT */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative hidden lg:block"
                            >
                                <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={2500}>
                                    <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 transform transition-all duration-500">
                                        <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                            + 12.5% Yield
                                        </div>
                                        <div className="h-64 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
                                            <img
                                                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
                                                alt="Financial Growth"
                                                className="object-cover w-full h-full opacity-30"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <TrendingUp className="h-20 w-20 text-primary drop-shadow-lg" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
                                            <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse"></div>
                                            <div className="flex justify-between items-center pt-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-text-muted">Total Lent</span>
                                                    <span className="text-lg font-bold text-primary">$1,240.00</span>
                                                </div>
                                                <Button size="sm" className="rounded-full">Fund Loans <ArrowRight className="ml-2 h-3 w-3" /></Button>
                                            </div>
                                        </div>
                                    </div>
                                </Tilt>
                            </motion.div>
                        </div >
                    </div >
                </section >

                {/* TRUST BAR */}
                < section className="py-10 border-y border-surface-border bg-white/50 backdrop-blur-sm" >
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-70 grayscale transition-all hover:grayscale-0">
                            <span className="text-xl font-bold font-serif text-text-muted cursor-default hover:text-primary transition-colors">Fortis</span>
                            <span className="text-xl font-bold font-mono text-text-muted cursor-default hover:text-primary transition-colors">STRIPE</span>
                            <span className="text-xl font-bold font-sans text-text-muted cursor-default hover:text-primary transition-colors">VISA</span>
                            <span className="text-xl font-bold font-serif text-text-muted cursor-default hover:text-primary transition-colors">BankCorp</span>
                            <span className="text-xl font-bold font-mono text-text-muted cursor-default hover:text-primary transition-colors">SecureID</span>
                        </div>
                    </div>
                </section >

                {/* FEATURES */}
                < section id="features" className="py-24 bg-white relative" >
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-base font-semibold text-secondary uppercase tracking-wider mb-2">Why LendSecure?</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-primary mb-4">Your Trusted Financial Partner</h3>
                            <p className="text-text-secondary text-lg">We provide a secure and straightforward platform to connect borrowers and lenders directly.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: PieChart, title: "Low Interest Rates", desc: "Access capital at competitive rates tailored to your financial profile." },
                                { icon: Shield, title: "Secure Transactions", desc: "Your data and transactions are protected with bank-level encryption security." },
                                { icon: Zap, title: "Easy Process", desc: "A streamlined application and approval process gets you funded faster." }
                            ].map((feature, idx) => (
                                <Tilt key={idx} tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02} transitionSpeed={2000}>
                                    <Card className="border-none shadow-none bg-surface-muted/50 hover:bg-white hover:shadow-float transition-all duration-300 group h-full">
                                        <CardContent className="pt-8 text-center flex flex-col h-full items-center justify-center">
                                            <div className="h-14 w-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-primary group-hover:text-secondary group-hover:scale-110 transition-all">
                                                <feature.icon className="h-7 w-7" />
                                            </div>
                                            <h4 className="text-xl font-bold text-primary mb-3">{feature.title}</h4>
                                            <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
                                        </CardContent>
                                    </Card>
                                </Tilt>
                            ))}
                        </div>
                    </div>
                </section >

                {/* HOW IT WORKS */}
                < section id="how-it-works" className="py-24 bg-surface-muted" >
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-primary">How It Works</h2>
                            <p className="text-text-secondary mt-4">A simple, transparent process for both borrowers and lenders.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-secondary/30 to-transparent z-0"></div>

                            {[
                                { num: 1, title: "Create Account", desc: "Sign up in minutes and complete our simple identity verification process.", icon: Users },
                                { num: 2, title: "List or Find Loans", desc: "Borrowers post requests. Lenders browse and fund opportunities.", icon: CheckCircle2 },
                                { num: 3, title: "Get Funded", desc: "Once a loan is funded, the money is transferred securely to your account.", icon: Lock }
                            ].map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2 }}
                                    className="relative z-10 flex flex-col items-center text-center"
                                >
                                    <div className="h-24 w-24 bg-white rounded-full shadow-soft flex items-center justify-center mb-6 relative group border-4 border-surface-muted hover:border-secondary transition-all duration-300">
                                        <step.icon className="h-8 w-8 text-primary group-hover:text-secondary transition-colors" />
                                        <div className="absolute -top-2 -right-2 h-8 w-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                                            {step.num}
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold text-primary mb-2">{step.title}</h4>
                                    <p className="text-text-secondary max-w-xs">{step.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section >

                {/* CTA SECTION */}
                < section className="py-24 bg-white" >
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="bg-primary rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl group">
                            {/* Decorative circles */}
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-white/10 transition-colors duration-700"></div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 group-hover:bg-secondary/20 transition-colors duration-700"></div>

                            <div className="relative z-10 max-w-3xl mx-auto">
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Take Control of Your Finances?</h2>
                                <p className="text-primary-light/80 text-xl mb-10">Join LendSecure today and experience a smarter way to borrow and lend.</p>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="rounded-full px-12 h-16 text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all w-full sm:w-auto"
                                    onClick={() => navigate("/register")}
                                >
                                    Get Started for Free
                                </Button>
                            </div>
                        </div>
                    </div>
                </section >

                {/* CONTACT US (Fixed placement at bottom) */}
                < section id="contact" className="py-24 bg-surface-muted relative overflow-hidden" >
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/50 to-transparent pointer-events-none"></div>

                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Get in Touch</h2>
                                <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                                    Have questions about your loan? Need help with verification?
                                    Our team is here to help you achieve your financial goals.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4 group">
                                        <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-primary">Support Team</h4>
                                            <p className="text-text-secondary">support@lendsecure.com</p>
                                            <p className="text-sm text-text-muted">+1 (555) 123-4567</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4 group">
                                        <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                                            <Shield className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-primary">Security Center</h4>
                                            <p className="text-text-secondary">Report an issue</p>
                                            <p className="text-sm text-text-muted">security@lendsecure.com</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <Card className="border-none shadow-2xl relative overflow-hidden backdrop-blur-sm bg-white/90">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
                                    <CardContent className="p-8">
                                        <h3 className="text-2xl font-bold text-primary mb-6">Send a Message</h3>
                                        <form className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">First Name</label>
                                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Jane" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Last Name</label>
                                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Doe" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Email</label>
                                                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="jane@example.com" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Message</label>
                                                <textarea className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="How can we help?" />
                                            </div>
                                            <Button className="w-full h-12 text-base shadow-lg hover:shadow-primary/25">Send Message</Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    )
}
