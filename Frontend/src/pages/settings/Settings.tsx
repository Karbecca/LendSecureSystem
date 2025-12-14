import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    Lock,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import api from "../../services/api";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";

export default function Settings() {
    const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Profile state
    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        phoneNumber: ""
    });

    // Password state
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get("/users/profile");
            const data = response.data?.data || response.data;
            setProfile({
                fullName: data.fullName || "",
                email: data.email || "",
                phoneNumber: data.phoneNumber || ""
            });
        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            await api.put("/users/profile", profile);
            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (error: any) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            setIsLoading(false);
            return;
        }

        if (passwords.newPassword.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters" });
            setIsLoading(false);
            return;
        }

        try {
            await api.put("/users/password", {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
                confirmPassword: passwords.confirmPassword
            });
            setMessage({ type: "success", text: "Password changed successfully!" });
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to change password" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your account settings and preferences</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={cn(
                        "px-4 py-3 font-medium text-sm transition-colors border-b-2",
                        activeTab === "profile"
                            ? "border-b-2"
                            : "text-slate-600 border-transparent hover:text-slate-800"
                    )}
                    style={activeTab === "profile" ? { color: '#0066CC', borderBottomColor: '#0066CC' } : {}}
                >
                    Profile Information
                </button>
                <button
                    onClick={() => setActiveTab("password")}
                    className={cn(
                        "px-4 py-3 font-medium text-sm transition-colors border-b-2",
                        activeTab === "password"
                            ? "border-b-2"
                            : "text-slate-600 border-transparent hover:text-slate-800"
                    )}
                    style={activeTab === "password" ? { color: '#0066CC', borderBottomColor: '#0066CC' } : {}}
                >
                    Change Password
                </button>
            </div>

            {/* Message */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "p-4 rounded-xl flex items-center gap-3",
                        message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    )}
                >
                    {message.type === "success" ? (
                        <CheckCircle2 className="h-5 w-5" />
                    ) : (
                        <AlertCircle className="h-5 w-5" />
                    )}
                    <p className="font-medium">{message.text}</p>
                </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100"
                >
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Update Profile Information</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={profile.fullName}
                                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 outline-none transition-all"
                                    style={{ focusRingColor: 'rgba(0, 102, 204, 0.2)', focusBorderColor: '#0066CC' }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 outline-none transition-all"
                                    style={{ focusRingColor: 'rgba(0, 102, 204, 0.2)', focusBorderColor: '#0066CC' }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="tel"
                                    value={profile.phoneNumber}
                                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 outline-none transition-all"
                                    style={{ focusRingColor: 'rgba(0, 102, 204, 0.2)', focusBorderColor: '#0066CC' }}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-white"
                            style={{ backgroundColor: '#0066CC' }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </form>
                </motion.div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100"
                >
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 outline-none transition-all"
                                    style={{ focusRingColor: 'rgba(0, 102, 204, 0.2)', focusBorderColor: '#0066CC' }}
                                    required
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 outline-none transition-all"
                                    style={{ focusRingColor: 'rgba(0, 102, 204, 0.2)', focusBorderColor: '#0066CC' }}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 outline-none transition-all"
                                    style={{ focusRingColor: 'rgba(0, 102, 204, 0.2)', focusBorderColor: '#0066CC' }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-white"
                            style={{ backgroundColor: '#0066CC' }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Changing Password...
                                </>
                            ) : (
                                <>
                                    <Lock className="h-5 w-5 mr-2" />
                                    Change Password
                                </>
                            )}
                        </Button>
                    </form>
                </motion.div>
            )}
        </div>
    );
}
