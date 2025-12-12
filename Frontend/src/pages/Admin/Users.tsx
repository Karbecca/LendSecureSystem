import { useEffect, useState } from "react";
import { Search, MoreVertical, Shield, Eye, Mail, Phone, Calendar, User as UserIcon } from "lucide-react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { formatDate } from "../../lib/utils";
import Modal from "../../components/ui/Modal";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";

interface User {
    userId: string;
    email: string;
    role: string;
    profile: {
        firstName: string;
        lastName: string;
        phone: string;
    } | null;
    createdAt: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");

    // Modal State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [roleToSet, setRoleToSet] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let result = users;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(u =>
                u.email.toLowerCase().includes(lowerTerm) ||
                u.profile?.firstName.toLowerCase().includes(lowerTerm) ||
                u.profile?.lastName.toLowerCase().includes(lowerTerm)
            );
        }

        if (roleFilter !== "All") {
            result = result.filter(u => u.role === roleFilter);
        }

        setFilteredUsers(result);
    }, [users, searchTerm, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.getAllUsers();
            if (response.success) {
                setUsers(response.data);
                setFilteredUsers(response.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const initiateRoleChange = (user: User, newRole: string) => {
        setSelectedUser(user);
        setRoleToSet(newRole);
        setIsConfirmOpen(true);
    };

    const executeRoleChange = async () => {
        if (!selectedUser || !roleToSet) return;

        try {
            setIsProcessing(true);
            await api.updateUserRole(selectedUser.userId, roleToSet);
            await fetchUsers();
            setIsConfirmOpen(false);
            setSelectedUser(null);
        } catch (err) {
            console.error("Failed to update role", err);

            alert("Failed to update user role");
        } finally {
            setIsProcessing(false);
        }
    };

    const openDetails = (user: User) => {
        setSelectedUser(user);
        setIsDetailsOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                    <p className="text-text-secondary">Manage borrowers, lenders, and administrators</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={fetchUsers}>Refresh</Button>

                </div>
            </div>

            <Card className="p-6 border-none shadow-soft">

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {["All", "Borrower", "Lender", "Admin"].map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === role
                                    ? "bg-primary text-white"
                                    : "bg-surface-muted text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>


                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-surface-border">
                                <th className="pb-3 text-sm font-semibold text-slate-500 pl-4">User</th>
                                <th className="pb-3 text-sm font-semibold text-slate-500">Role</th>
                                <th className="pb-3 text-sm font-semibold text-slate-500">Phone</th>
                                <th className="pb-3 text-sm font-semibold text-slate-500">Joined Date</th>
                                <th className="pb-3 text-sm font-semibold text-slate-500 pr-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-500">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-500">No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.userId} className="group hover:bg-surface-muted transition-colors">
                                        <td className="py-4 pl-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                                    {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">
                                                        {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "No Profile"}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <Badge variant={
                                                user.role === 'Admin' ? 'destructive' :
                                                    user.role === 'Lender' ? 'success' : 'default'
                                            }>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="py-4 text-sm text-slate-600">
                                            {user.profile?.phone || "-"}
                                        </td>
                                        <td className="py-4 text-sm text-slate-600">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="py-4 pr-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {user.role !== 'Admin' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => initiateRoleChange(user, 'Admin')}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        title="Promote to Admin"
                                                    >
                                                        <Shield className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDetails(user)}
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4 text-slate-400" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>


            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeRoleChange}
                title="Change User Role"
                message={`Are you sure you want to change this user's role to ${roleToSet}? This gives them different permissions in the system.`}
                confirmLabel="Yes, Change Role"
                isLoading={isProcessing}
                type="warning"
            />


            <Modal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                title="User Details"
            >
                {selectedUser && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-600">
                                {selectedUser.profile?.firstName?.[0] || selectedUser.email[0].toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {selectedUser.profile ? `${selectedUser.profile.firstName} ${selectedUser.profile.lastName}` : "No Profile"}
                                </h3>
                                <Badge variant={
                                    selectedUser.role === 'Admin' ? 'destructive' :
                                        selectedUser.role === 'Lender' ? 'success' : 'default'
                                }>
                                    {selectedUser.role}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1 text-slate-500">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Email</span>
                                </div>
                                <p className="font-medium text-slate-800">{selectedUser.email}</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1 text-slate-500">
                                    <Phone className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Phone</span>
                                </div>
                                <p className="font-medium text-slate-800">{selectedUser.profile?.phone || "Not provided"}</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1 text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Joined</span>
                                </div>
                                <p className="font-medium text-slate-800">{formatDate(selectedUser.createdAt)}</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1 text-slate-500">
                                    <UserIcon className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">User ID</span>
                                </div>
                                <p className="font-medium text-slate-800 text-xs font-mono">{selectedUser.userId}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
