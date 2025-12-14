
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { TypeAnimation } from 'react-type-animation'
import Tilt from 'react-parallax-tilt'
import { Navbar } from "../../components/layout/Navbar"
import { Footer } from "../../components/layout/Footer"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { CheckCircle2, Shield, Zap, TrendingUp, Users, Lock, PieChart } from "lucide-react"

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
                    {/* Soft Background Gradient Glow */}
                    <div className="absolute top-20 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full blur-3xl -z-10" style={{ background: 'radial-gradient(circle, rgba(0, 102, 204, 0.08) 0%, transparent 70%)' }}></div>
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-72 h-72 rounded-full blur-3xl -z-10" style={{ background: 'radial-gradient(circle, rgba(0, 102, 204, 0.06) 0%, transparent 70%)' }}></div>
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
                                    <span className="text-xs font-medium text-text-secondary"></span>
                                </motion.div>

                                <motion.h1
                                    variants={itemVariants}
                                    className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-primary mb-6 leading-[1.1]"
                                >
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
                                </motion.h1>

                                <motion.p variants={itemVariants} className="text-lg md:text-xl text-text-secondary mb-8 leading-relaxed max-w-lg">
                                    Lend directly to people you trust, or borrow with rates that make sense.
                                    Secure, transparent, and built for your financial freedom.
                                </motion.p>
                                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                                    <motion.div
                                        whileHover={{ y: -2, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                        <Button
                                            size="lg"
                                            className="rounded-full px-8 text-base shadow-lg hover:shadow-2xl transition-shadow duration-300"
                                            onClick={() => navigate("/register")}
                                        >
                                            Get Started Now
                                        </Button>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="rounded-full px-8 text-base bg-white/50 backdrop-blur-sm hover:bg-white hover:shadow-md transition-all"
                                            onClick={() => window.location.href = '#how-it-works'}
                                        >
                                            How it Works
                                        </Button>
                                    </motion.div>
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
                                        <div className="h-80 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl flex items-center justify-center overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
                                            <img
                                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
                                                alt="Financial Dashboard"
                                                className="object-cover w-full h-full opacity-40"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <TrendingUp className="h-24 w-24 text-primary drop-shadow-lg" />
                                            </div>
                                        </div>
                                    </div>
                                </Tilt>
                            </motion.div>
                        </div >
                    </div >
                </section >

                {/* TRUST BAR */}
                <section className="py-10 border-y border-surface-border bg-white/50 backdrop-blur-sm overflow-hidden">
                    <div className="relative">
                        {/* Infinite scroll container */}
                        <div className="flex animate-marquee whitespace-nowrap">
                            {/* First set of logos */}
                            <div className="flex items-center gap-16 px-8">
                                <span className="text-2xl font-bold font-serif text-text-muted opacity-60">Fortis</span>
                                <span className="text-2xl font-bold font-mono text-text-muted opacity-60">STRIPE</span>
                                <span className="text-2xl font-bold font-sans text-text-muted opacity-60">VISA</span>
                                <span className="text-2xl font-bold font-serif text-text-muted opacity-60">BankCorp</span>
                                <span className="text-2xl font-bold font-mono text-text-muted opacity-60">SecureID</span>
                                <span className="text-2xl font-bold font-serif text-text-muted opacity-60">PayTrust</span>
                                <span className="text-2xl font-bold font-mono text-text-muted opacity-60">FinSecure</span>
                            </div>
                            {/* Duplicate set for seamless loop */}
                            <div className="flex items-center gap-16 px-8">
                                <span className="text-2xl font-bold font-serif text-text-muted opacity-60">Fortis</span>
                                <span className="text-2xl font-bold font-mono text-text-muted opacity-60">STRIPE</span>
                                <span className="text-2xl font-bold font-sans text-text-muted opacity-60">VISA</span>
                                <span className="text-2xl font-bold font-serif text-text-muted opacity-60">BankCorp</span>
                                <span className="text-2xl font-bold font-mono text-text-muted opacity-60">SecureID</span>
                                <span className="text-2xl font-bold font-serif text-text-muted opacity-60">PayTrust</span>
                                <span className="text-2xl font-bold font-mono text-text-muted opacity-60">FinSecure</span>
                            </div>
                        </div>
                    </div>
                </section>

                <style>{`
                    @keyframes marquee {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(-50%);
                        }
                    }
                    .animate-marquee {
                        animation: marquee 30s linear infinite;
                    }
                    .animate-marquee:hover {
                        animation-play-state: paused;
                    }
                `}</style>

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
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{
                                        duration: 0.5,
                                        delay: idx * 0.15,
                                        ease: "easeOut"
                                    }}
                                >
                                    <Tilt key={idx} tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02} transitionSpeed={2000}>
                                        <Card className="border-none shadow-none bg-surface-muted/50 hover:bg-white hover:shadow-lg transition-all duration-300 group h-full">
                                            <CardContent className="pt-8 text-center flex flex-col h-full items-center justify-center">
                                                <motion.div
                                                    className="h-14 w-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-primary group-hover:text-secondary transition-all"
                                                    initial={{ scale: 0 }}
                                                    whileInView={{ scale: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{
                                                        duration: 0.4,
                                                        delay: idx * 0.15 + 0.2,
                                                        type: "spring",
                                                        stiffness: 200
                                                    }}
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                >
                                                    <feature.icon className="h-7 w-7" />
                                                </motion.div>
                                                <h4 className="text-xl font-bold text-primary mb-3">{feature.title}</h4>
                                                <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
                                            </CardContent>
                                        </Card>
                                    </Tilt>
                                </motion.div>
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
                                    viewport={{ once: true, margin: "-80px" }}
                                    transition={{
                                        delay: idx * 0.2,
                                        duration: 0.6,
                                        ease: "easeOut"
                                    }}
                                    className="relative z-10 flex flex-col items-center text-center"
                                >
                                    <motion.div
                                        className="h-24 w-24 bg-white rounded-full shadow-soft flex items-center justify-center mb-6 relative group border-4 border-surface-muted hover:border-secondary transition-all duration-300"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <step.icon className="h-8 w-8 text-primary group-hover:text-secondary transition-colors" />
                                        <motion.div
                                            className="absolute -top-2 -right-2 h-8 w-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg"
                                            initial={{ scale: 0 }}
                                            whileInView={{
                                                scale: [0, 1, 1.15, 1]
                                            }}
                                            viewport={{ once: true }}
                                            transition={{
                                                delay: idx * 0.2 + 0.3,
                                                duration: 0.8,
                                                times: [0, 0.4, 0.7, 1],
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 15
                                            }}
                                        >
                                            {step.num}
                                        </motion.div>
                                    </motion.div>
                                    <h4 className="text-xl font-bold text-primary mb-2">{step.title}</h4>
                                    <p className="text-text-secondary max-w-xs">{step.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section >

                {/* CTA SECTION */}
                <section className="py-24 bg-surface-muted">
                    <div className="container mx-auto px-4 md:px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="bg-white rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-lg border border-slate-100"
                        >
                            {/* Decorative gradient accents */}
                            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -z-0" style={{ background: 'radial-gradient(circle, rgba(0, 102, 204, 0.1) 0%, transparent 70%)' }}></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl -z-0" style={{ background: 'radial-gradient(circle, rgba(0, 102, 204, 0.08) 0%, transparent 70%)' }}></div>

                            <div className="relative z-10 max-w-3xl mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >
                                    <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">Ready to Take Control of Your Finances?</h2>
                                    <p className="text-slate-600 text-xl mb-10">Join LendSecure today and experience a smarter way to borrow and lend.</p>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        size="lg"
                                        className="rounded-full px-12 h-16 text-lg font-bold shadow-lg hover:shadow-2xl transition-all w-full sm:w-auto"
                                        style={{ backgroundColor: '#0066CC' }}
                                        onClick={() => navigate("/register")}
                                    >
                                        Get Started for Free
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>

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
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                                <Card className="border-none shadow-2xl relative overflow-hidden backdrop-blur-sm bg-white/90">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
                                    <CardContent className="p-8">
                                        <h3 className="text-2xl font-bold text-primary mb-6">Send a Message</h3>
                                        <form className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">First Name</label>
                                                    <input
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 transition-all"
                                                        style={{
                                                            '--tw-ring-color': 'rgba(0, 102, 204, 0.3)',
                                                        } as React.CSSProperties}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Last Name</label>
                                                    <input
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 transition-all"
                                                        style={{
                                                            '--tw-ring-color': 'rgba(0, 102, 204, 0.3)',
                                                        } as React.CSSProperties}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Email</label>
                                                <input
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 transition-all"
                                                    style={{
                                                        '--tw-ring-color': 'rgba(0, 102, 204, 0.3)',
                                                    } as React.CSSProperties}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Message</label>
                                                <textarea
                                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 transition-all"
                                                    style={{
                                                        '--tw-ring-color': 'rgba(0, 102, 204, 0.3)',
                                                    } as React.CSSProperties}
                                                />
                                            </div>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Button
                                                    className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all"
                                                    style={{ backgroundColor: '#0066CC' }}
                                                >
                                                    Send Message
                                                </Button>
                                            </motion.div>
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
