// /pages/dashboard/index.js
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

function AdminDashboard({ user }) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Selamat datang, ADMIN 👋</p>
            </div>
        </div>
    );
}

export default withAdminAuth(AdminDashboard);
