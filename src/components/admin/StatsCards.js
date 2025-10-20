const stats = [
    { label: "Total Aset", value: 1245 },
    { label: "Upload Hari Ini", value: 32 },
    { label: "Admin Aktif", value: 5 },
    { label: "Aset Dipakai", value: 678 },
];

export default function StatsCards() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className="p-4 bg-white shadow rounded-lg text-center"
                >
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-gray-500 text-sm">{s.label}</p>
                </div>
            ))}
        </div>
    );
}
