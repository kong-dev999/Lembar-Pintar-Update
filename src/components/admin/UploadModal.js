// components/UploadAssetModal.jsx
import { useRef, useState, useCallback } from "react";

export default function UploadAssetModal({
    show,
    onClose,
    onSuccess,
    session,
    categories,
    tags,
    GLOBAL_WORKSPACE_ID,
}) {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        type: "",
        title: "",
        description: "",
        categories: [],
        tags: [],
    });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);

    const resetForm = useCallback(() => {
        setFormData({ type: "", title: "", description: "", categories: [], tags: [] });
        if (fileInputRef.current) fileInputRef.current.value = "";
        setUploadProgress(0);
        onClose();
    }, [onClose]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!session?.user?.id) {
            alert("Harus login dulu");
            return;
        }

        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            alert("File harus diupload!");
            return;
        }

        const data = new FormData();
        data.append("title", formData.title);
        data.append("type", formData.type);
        data.append("description", formData.description || "");
        data.append("workspaceId", GLOBAL_WORKSPACE_ID);
        data.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
                setUploadProgress((e.loaded / e.total) * 100);
            }
        });

        xhr.addEventListener("load", () => {
            if (xhr.status === 201) {
                alert("Upload berhasil");
                resetForm();
                onSuccess(); // panggil fetchAssets
            } else {
                alert("Upload gagal: " + xhr.responseText);
            }
            setLoading(false);
        });

        setLoading(true);
        xhr.open("POST", "/api/assets/upload");
        xhr.send(data);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">Upload Asset Baru</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Judul"
                        required
                        className="border p-2 rounded w-full"
                    />
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="border p-2 rounded w-full"
                    >
                        <option value="">Pilih Tipe</option>
                        {["ELEMENT", "PHOTO", "VIDEO", "FONT"].map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Deskripsi"
                        className="border p-2 rounded w-full"
                    />
                    <input ref={fileInputRef} type="file" required className="border p-2 rounded w-full" />
                    {uploadProgress > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Batal</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                            {loading ? "Mengupload..." : "Upload"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
