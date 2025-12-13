import { ShieldCheck, Twitter, Linkedin, Facebook } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="bg-primary p-1.5 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">LendSecure</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Empowering financial freedom through secure, transparent, and direct peer-to-peer lending.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Platform</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Browse Loans</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Lender Protection</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Connect</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
                        </div>
                        <p className="mt-6 text-xs text-slate-500">© 2024 LendSecure Inc.</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
