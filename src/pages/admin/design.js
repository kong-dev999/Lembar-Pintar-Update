import { useState, useEffect } from "react";

import { withAdminAuth } from "@/lib/auth/withAdminAuth";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";

function AdminDesign({ user }) {
    const router = useRouter();
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("grid");

    useEffect(() => {
        console.log("Fetching designs from /api/designs");
        fetch("/api/designs")
            .then((res) => {
                console.log("Response status:", res.status);
                return res.json();
            })
            .then((data) => {
                console.log("API response:", data);
                if (data.success) {
                    console.log("Designs found:", data.designs?.length || 0);
                    setDesigns(data.designs || []);
                } else {
                    console.error("API returned error:", data.error || data.message);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching designs:", error);
                setLoading(false);
            });
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PUBLISHED":
                return "bg-green-100 text-green-800";
            case "DRAFT":
                return "bg-yellow-100 text-yellow-800";
            case "ARCHIVED":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getVisibilityColor = (visibility) => {
        switch (visibility) {
            case "PUBLIC":
                return "bg-blue-100 text-blue-800";
            case "UNLISTED":
                return "bg-purple-100 text-purple-800";
            case "PRIVATE":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleDesignClick = (designId) => {
        router.push(`/admin/editor?id=${designId}`);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-600">Memuat desain...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manajemen Desain</h1>
                <div className="text-sm text-gray-600">
                    Total: {designs.length} desain
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex space-x-3 mb-6">
                <button
                    onClick={() => setView("grid")}
                    className={`px-4 py-2 rounded-md ${view === "grid" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                    Tampilan Grid
                </button>
                <button
                    onClick={() => setView("table")}
                    className={`px-4 py-2 rounded-md ${view === "table" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                    Tampilan Tabel
                </button>
            </div>

            {designs.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-600">Belum ada desain yang tersimpan.</p>
                </div>
            ) : view === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {designs.map((design) => (
                        <div
                            key={design.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handleDesignClick(design.id)}>
                            <div className="h-40 bg-gray-100 flex items-center justify-center">
                                {design.thumbnailUrl ? (
                                    <img
                                        src={design.thumbnailUrl}
                                        alt={design.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-gray-400 text-4xl">🎨</div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-1 truncate">{design.title}</h3>
                                <p className="text-sm text-gray-600 mb-2 truncate">
                                    oleh {design.owner.name || design.owner.email}
                                </p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(design.status)}`}>
                                        {design.status}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getVisibilityColor(design.visibility)}`}>
                                        {design.visibility}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    <p>Dibuat: {formatDate(design.createdAt)}</p>
                                    {design.updatedAt && design.updatedAt !== design.createdAt && (
                                        <p>Diperbarui: {formatDate(design.updatedAt)}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Desain
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pemilik
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Workspace
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Visibilitas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dibuat
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Diperbarui
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {designs.map((design) => (
                                    <tr
                                        key={design.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleDesignClick(design.id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {design.thumbnailUrl ? (
                                                        <img
                                                            className="h-10 w-10 rounded object-cover"
                                                            src={design.thumbnailUrl}
                                                            alt={design.title}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                                                            🎨
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {design.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {design.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {design.owner.name || design.owner.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {design.workspace.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(design.status)}`}>
                                                {design.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVisibilityColor(design.visibility)}`}>
                                                {design.visibility}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(design.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {design.updatedAt && design.updatedAt !== design.createdAt
                                                ? formatDate(design.updatedAt)
                                                : '-'
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default withAdminAuth(AdminDesign);