import { useState } from "react";

export default function AssetTable({ assets }) {
    const [filter, setFilter] = useState("");

    const filtered = assets.filter(
        (a) =>
            a.name.toLowerCase().includes(filter.toLowerCase()) ||
            a.category.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="bg-white shadow rounded-lg p-4">
            {/* Filter/Search */}
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Cari aset..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border rounded px-3 py-2 w-64"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    + Tambah Aset
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-3 border-b">Preview</th>
                            <th className="p-3 border-b">Nama</th>
                            <th className="p-3 border-b">Tipe</th>
                            <th className="p-3 border-b">Kategori</th>
                            <th className="p-3 border-b">Uploader</th>
                            <th className="p-3 border-b">Tanggal</th>
                            <th className="p-3 border-b text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((a) => (
                            <tr key={a.id} className="hover:bg-gray-50">
                                <td className="p-3 border-b">
                                    <img
                                        src={a.previewUrl}
                                        alt={a.name}
                                        className="w-16 h-12 object-cover rounded"
                                    />
                                </td>
                                <td className="p-3 border-b">{a.name}</td>
                                <td className="p-3 border-b capitalize">{a.type}</td>
                                <td className="p-3 border-b">
                                    {a.category} - {a.subCategory}
                                </td>
                                <td className="p-3 border-b">{a.uploadedBy}</td>
                                <td className="p-3 border-b">{a.uploadedAt}</td>
                                <td className="p-3 border-b text-center">
                                    <button className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 mr-2">
                                        Lihat
                                    </button>
                                    <button className="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 mr-2">
                                        Edit
                                    </button>
                                    <button className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200">
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center p-4 text-gray-500">
                                    Tidak ada aset ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
