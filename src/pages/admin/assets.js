import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from 'next/router';
import AdminLayout from "@/components/admin/AdminLayout";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";

const initialFormData = {
    type: "",
    title: "",
    description: "",
    workspaceId: "",
    categories: [],
    tags: [],
    tagsInput: "",
    width: "", // ✅ Kosong, biar backend SVGO yang tentukan
    height: "", // ✅ Kosong, biar backend SVGO yang tentukan
    unit: "PX",
    premiumLevel: "FREE",
    previewSize: "medium",
    visibility: "PUBLIC",
    format: "SVG",
    colorable: false,
    animated: false,
    loop: false,
    duration: "10",
    fps: "30",
    ratio: "1.78",
    color: "#ffffff",
    family: "",
    weights: "400",
    subsets: "latin",
    styles: "normal",
    previewText: "Almost before we knew it, we had left the ground.",
    weight: "400",
    style: "normal",
    subset: "latin",
};

// ✅ Helper: ambil URL preview langsung dari File table
const getAssetThumbnail = (asset) => {
    if (!asset) return null;

    // Struktur dari /api/assets/element-files (langsung dari File table)
    const previewUrl = asset.previewUrl || asset.thumbnailUrl || asset.url;
    return previewUrl;
};

function AssetTable({ session }) {
    const router = useRouter();
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [filter, setFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [assetList, setAssetList] = useState([]);
    const [categories, setCategories] = useState({});
    const [tags, setTags] = useState({});
    const GLOBAL_WORKSPACE_ID = "cmf2b8nek0000gxvo7r9abgb7";
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState(initialFormData);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slide1Valid, setSlide1Valid] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [uploadStep, setUploadStep] = useState('upload');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 24;
    const [keywordInput, setKeywordInput] = useState('');
    const [keywords, setKeywords] = useState([]);
    const [recentAssets, setRecentAssets] = useState([]);
    const [gridCols, setGridCols] = useState(3); // Default mobile

    const fileInputRef = useRef(null);

    // Function to calculate grid columns based on screen width
    const calculateGridCols = () => {
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            if (width >= 1536) return 8; // 2xl
            if (width >= 1280) return 7; // xl
            if (width >= 1024) return 6; // lg
            if (width >= 768) return 5;  // md
            if (width >= 640) return 4;  // sm
            return 3; // mobile
        }
        return 3;
    };

    useEffect(() => {
        Promise.all([fetchAssets(1), fetchAllCategories(), fetchAllTags(), fetchRecentAssets()]);

        // Set initial grid columns
        setGridCols(calculateGridCols());

        // Add resize listener
        const handleResize = () => {
            setGridCols(calculateGridCols());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (currentSlide === 1) validateSlide1();
    }, [formData.title, formData.type, selectedFile, currentSlide]);

    const authenticatedFetch = async (url, options = {}) => {
        const defaultOptions = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };
        if (options.body instanceof FormData) {
            delete defaultOptions.headers['Content-Type'];
        }
        return fetch(url, defaultOptions);
    };

    // Fetch detail Asset dari database untuk modal
    const fetchAssetDetail = async (assetId) => {
        try {
            const res = await authenticatedFetch(`/api/assets/${assetId}`);
            const data = await res.json();

            if (!res.ok) {
                // Jika aset tidak ditemukan atau terjadi error
                alert(data.message || "Gagal mengambil detail aset");
                return null;
            }

            return data.asset || null;
        } catch (error) {
            console.error("Error fetching asset detail:", error);
            alert("Terjadi kesalahan saat mengambil detail aset");
            return null;
        }
    };

    // Fungsi untuk menghapus aset
    const deleteAsset = async (assetId) => {
        if (!confirm("Apakah Anda yakin ingin menghapus aset ini? Tindakan ini akan menandai aset sebagai dihapus.")) {
            return;
        }

        try {
            const res = await authenticatedFetch(`/api/assets/${assetId}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (res.ok) {
                alert("Aset berhasil dihapus!");
                setSelectedAsset(null);
                fetchAssets(currentPage); // Refresh halaman saat ini
            } else {
                alert(`Gagal menghapus aset: ${data.message || "Terjadi kesalahan"}`);
            }
        } catch (error) {
            console.error("Error deleting asset:", error);
            alert("Terjadi kesalahan saat menghapus aset");
        }
    };

    const fetchAssets = async (page = 1) => {
        try {
            const res = await authenticatedFetch(`/api/assets/element-files?limit=${ITEMS_PER_PAGE}&page=${page}`);
            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Gagal mengambil daftar aset");
                setAssetList([]);
                setTotalItems(0);
                setTotalPages(1);
                setCurrentPage(1);
                return;
            }

            if (data.files && Array.isArray(data.files)) {
                // Transform files ke format yang sesuai untuk UI dengan struktur yang sama seper Red Cross Mascot
                const transformedAssets = data.files.map(file => {
                    return {
                        id: file.id,
                        title: file.title,
                        type: 'ELEMENT',
                        assetableType: 'ELEMENT',
                        status: 'PUBLISHED',
                        visibility: 'PUBLIC',
                        createdAt: file.createdAt || new Date().toISOString(),
                        workspace: { name: 'Global Workspace' },
                        description: file.description || "Tidak ada deskripsi",
                        // Langsung dari File table
                        previewUrl: file.url,
                        thumbnailUrl: file.url,
                        url: file.url, // Tambahkan untuk preview
                        element: file.element || null,
                        // Tambahkan struktur tags untuk konsistensi
                        tags: file.element?.tags || [],
                        categories: file.element?.categories || [],
                        format: file.element?.format || (file.mime?.includes('svg') ? 'SVG' : 'PNG'),
                        width: file.width || null,
                        height: file.height || null,
                        size: file.size || null,
                        mime: file.mime || null,
                        premiumLevel: file.element?.premiumLevel || 'FREE'
                    };
                });

                setAssetList(transformedAssets);
                setTotalItems(data.pagination?.total || 0);
                setTotalPages(data.pagination?.pages || 1);
                setCurrentPage(data.pagination?.page || 1);
            } else {
                setAssetList([]);
                setTotalItems(0);
                setTotalPages(1);
                setCurrentPage(1);
            }
        } catch (error) {
            console.error("Fetch element files error:", error);
            alert("Terjadi kesalahan saat mengambil daftar aset");
            setAssetList([]);
        }
    };

    const fetchAllCategories = async () => {
        const types = ["TEMPLATE", "ELEMENT", "PHOTO", "VIDEO", "FONT"];
        const data = {};
        for (const type of types) {
            try {
                const res = await authenticatedFetch(`/api/assets/categories?type=${type}`);
                data[type] = await res.json();
            } catch {
                data[type] = [];
            }
        }
        setCategories(data);
    };

    const fetchAllTags = async () => {
        const types = ["TEMPLATE", "ELEMENT", "PHOTO", "VIDEO", "FONT"];
        const data = {};
        for (const type of types) {
            try {
                const res = await authenticatedFetch(`/api/assets/tags?type=${type}`);
                data[type] = await res.json();
            } catch {
                data[type] = [];
            }
        }
        setTags(data);
    };

    const fetchRecentAssets = async () => {
        try {
            // Ambil lebih banyak aset untuk memenuhi grid sampai pojok
            // Maksimal 16 aset untuk memastikan grid terisi penuh di semua breakpoint
            const res = await authenticatedFetch(`/api/assets/element-files?limit=8&page=1`);
            const data = await res.json();

            if (!res.ok) {
                setRecentAssets([]);
                return;
            }

            if (data.files && Array.isArray(data.files)) {
                const transformedAssets = data.files.map(file => {
                    return {
                        id: file.id,
                        title: file.title,
                        type: 'ELEMENT',
                        createdAt: file.createdAt || new Date().toISOString(),
                        previewUrl: file.url,
                        thumbnailUrl: file.url,
                        url: file.url,
                        format: file.element?.format || (file.mime?.includes('svg') ? 'SVG' : 'PNG'),
                        premiumLevel: file.element?.premiumLevel || 'FREE'
                    };
                });
                setRecentAssets(transformedAssets);
            } else {
                setRecentAssets([]);
            }
        } catch (error) {
            console.error("Fetch recent assets error:", error);
            setRecentAssets([]);
        }
    };

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setUploadProgress(0);
        setCurrentSlide(0);
        setSlide1Valid(false);
        setSelectedFile(null);
        if (filePreview) URL.revokeObjectURL(filePreview);
        setFilePreview(null);
        setUploadStep('upload');
        setShowModal(false);
        setKeywords([]);
        setKeywordInput('');
    }, [filePreview]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "type") {
            setFormData({ ...initialFormData, type: value });
        } else {
            setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        }
        setTimeout(() => {
            if (currentSlide === 1) validateSlide1();
        }, 100);
    };

    const validateSlide1 = () => {
        const file = selectedFile || fileInputRef.current?.files?.[0];
        const isValid = formData.title.trim() && formData.type && file;
        setSlide1Valid(isValid);
        return isValid;
    };

    const handleFileSelect = (file) => {
        if (!file) return;
        setSelectedFile(file);

        if (file.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(file);
            setFilePreview(previewUrl);

            // ✅ Auto-resize sekarang handled di backend oleh SVGO
            // Hanya set format dan colorable berdasarkan file type
            setFormData(prev => ({
                ...prev,
                // Auto-detect format based on file type
                format: file.type.includes('svg') ? 'SVG' :
                    file.type.includes('png') ? 'PNG' :
                        file.type.includes('gif') ? 'GIF' : 'PNG',
                // Enable colorable for SVG files by default
                colorable: file.type.includes('svg')
            }));

        }

        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({
            ...prev,
            // ✅ Hanya set title auto jika user belum input manual
            title: prev.title.trim() ? prev.title : fileName,
            type: file.type.startsWith('image/') ? 'ELEMENT' : 'PHOTO'
        }));
    };

    const handleArrayChange = (key, id, checked) => {
        setFormData((prev) => ({
            ...prev,
            [key]: checked ? [...prev[key], id] : prev[key].filter((i) => i !== id),
        }));
    };

    const handleAddKeyword = () => {
        const keyword = keywordInput.trim();
        if (keyword && !keywords.includes(keyword) && keywords.length < 20) {
            setKeywords(prev => [...prev, keyword]);
            setKeywordInput('');
        }
    };

    const handleRemoveKeyword = (index) => {
        setKeywords(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!session?.user?.id) {
            alert("Anda harus login terlebih dahulu!");
            return;
        }
        setLoading(true);
        setUploadProgress(0);

        const file = selectedFile || fileInputRef.current?.files?.[0];
        if (!file) {
            alert("File harus diupload!");
            setLoading(false);
            return;
        }

        const data = new FormData();
        data.append("title", formData.title);
        data.append("type", formData.type);
        data.append("description", formData.description || "");
        data.append("visibility", formData.visibility || "PUBLIC");
        data.append("previewSize", formData.previewSize || "medium");
        data.append("workspaceId", GLOBAL_WORKSPACE_ID);

        formData.categories.forEach((id) => data.append("categoryIds[]", id));
        formData.tags.forEach((id) => data.append("tagIds[]", id));
        // Send keywords as individual tag names
        keywords.forEach((keyword) => data.append("tagNames[]", keyword));

        const dynamic = {
            TEMPLATE: ["width", "height", "unit", "premiumLevel"],
            ELEMENT: ["width", "height", "format", "colorable", "animated", "loop", "premiumLevel"],
            PHOTO: ["width", "height", "ratio", "color", "premiumLevel"],
            VIDEO: ["width", "height", "ratio", "duration", "fps", "premiumLevel"],
            FONT: ["family", "weights", "subsets", "styles", "previewText", "weight", "style", "subset", "premiumLevel"],
        };

        dynamic[formData.type]?.forEach((key) => {
            if (formData[key] !== "" && formData[key] !== false) {
                data.append(key, formData[key]);
            }
        });

        data.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) setUploadProgress((e.loaded / e.total) * 100);
        });
        xhr.addEventListener("load", () => {
            if (xhr.status === 201) {
                alert("Asset berhasil diupload!");
                resetForm();
                fetchAssets();
                fetchRecentAssets();
            } else {
                alert("Upload gagal: " + xhr.responseText);
            }
            setLoading(false);
            setUploadProgress(0);
        });
        xhr.addEventListener("error", () => {
            alert("Network error saat upload");
            setLoading(false);
            setUploadProgress(0);
        });
        xhr.open("POST", "/api/assets/upload");
        xhr.send(data);
    };

    const renderDynamicFields = () => {
        const currentCategories = categories[formData.type] || [];
        const currentTags = tags[formData.type] || [];

        const fields = {
            TEMPLATE: (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dimensi</label>
                        <div className="grid grid-cols-3 gap-2">
                            <input name="width" type="number" placeholder="Width" value={formData.width} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                            <input name="height" type="number" placeholder="Height" value={formData.height} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                            <select name="unit" value={formData.unit} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                <option value="PX">Pixel</option>
                                <option value="CM">CM</option>
                                <option value="IN">Inch</option>
                            </select>
                        </div>
                    </div>
                </div>
            ),
            ELEMENT: (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dimensi & Format</label>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <input name="width" type="number" placeholder="Width" value={formData.width} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                            <input name="height" type="number" placeholder="Height" value={formData.height} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <select name="format" value={formData.format} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                            <option value="SVG">SVG (Vector)</option>
                            <option value="PNG">PNG (Raster)</option>
                            <option value="JPEG">JPEG (Photo)</option>
                            <option value="GIF">GIF (Animation)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Properti</label>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="colorable" checked={formData.colorable} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">Dapat diubah warna</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="animated" checked={formData.animated} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">Animasi</span>
                            </label>
                            {formData.animated && (
                                <label className="flex items-center space-x-2 ml-6">
                                    <input type="checkbox" name="loop" checked={formData.loop} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm">Loop animasi</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            ),
            PHOTO: (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dimensi & Rasio</label>
                        <div className="grid grid-cols-3 gap-2">
                            <input name="width" type="number" placeholder="Width" value={formData.width} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                            <input name="height" type="number" placeholder="Height" value={formData.height} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                            <input name="ratio" type="number" step="0.01" placeholder="Rasio" value={formData.ratio} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Warna Dominan</label>
                        <input name="color" type="color" value={formData.color} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
            ),
            VIDEO: (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dimensi & Rasio</label>
                        <div className="grid grid-cols-3 gap-2">
                            <input name="width" type="number" placeholder="Width" value={formData.width} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                            <input name="height" type="number" placeholder="Height" value={formData.height} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                            <input name="ratio" type="number" step="0.01" placeholder="Rasio" value={formData.ratio} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Durasi & Frame Rate</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input name="duration" type="number" placeholder="Durasi (detik)" value={formData.duration} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                            <input name="fps" type="number" placeholder="FPS" value={formData.fps} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </div>
            ),
            FONT: (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                        <input name="family" placeholder="Nama Font Family" value={formData.family} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Weight & Subset</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input name="weights" placeholder="Weight (400, 700)" value={formData.weights} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                            <input name="subsets" placeholder="Subset (latin)" value={formData.subsets} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Settings</label>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <input name="weight" placeholder="Default Weight" value={formData.weight} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
                            <select name="style" value={formData.style} onChange={handleInputChange} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                <option value="normal">Normal</option>
                                <option value="italic">Italic</option>
                            </select>
                        </div>
                        <input name="subset" placeholder="Default Subset" value={formData.subset} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mb-2" />
                        <textarea name="previewText" placeholder="Teks preview untuk font" value={formData.previewText} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" rows="2" />
                    </div>
                </div>
            ),
        };

        return (
            <div className="space-y-4">
                {fields[formData.type]}
                {(Array.isArray(currentCategories) ? currentCategories : []).length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                        <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto space-y-1">
                            {currentCategories.map((c) => (
                                <label key={c.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.categories.includes(c.id)}
                                        onChange={(e) => handleArrayChange("categories", c.id, e.target.checked)}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm">{c.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                {(Array.isArray(currentTags) ? currentTags : []).length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags yang Tersedia</label>
                        <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto space-y-1">
                            {currentTags.map((t) => (
                                <label key={t.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.tags.includes(t.id)}
                                        onChange={(e) => handleArrayChange("tags", t.id, e.target.checked)}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm">{t.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="bg-white shadow rounded-lg p-6 max-h-screen overflow-y-auto">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl lg:text-2xl font-bold">Manajemen Aset</h1>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <div className="text-sm text-gray-600 text-center sm:text-left">
                            Welcome, {session?.user?.name || session?.user?.email}
                        </div>
                        <div className="flex gap-2">
                            <input
                                placeholder="Cari..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="border px-2 py-1 rounded flex-1 sm:w-auto"
                            />
                            <button onClick={() => setShowModal(true)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap">
                                Upload
                            </button>
                        </div>
                    </div>
                </div>

                {/* ---- SEPARATOR AFTER HEADER ---- */}
                <div className="border-t border-gray-200 mb-8"></div>

                {/* ---- RECENT ASSETS SECTION ---- */}
                {recentAssets.length > 0 && (
                    <div className="mb-10">
                        {/* Section Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Aset Terbaru</h2>
                                        <p className="text-sm text-blue-700 mt-0.5">Aset yang baru saja ditambahkan ke sistem</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full shadow-sm">
                                        {Math.min(recentAssets.length, gridCols * 2)} Item Terbaru
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grid with smaller items - Now fills 2 full rows */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
                            {recentAssets.slice(0, gridCols * 2).map((asset) => (
                                <div
                                    key={asset.id}
                                    onClick={async () => {
                                        const assetDetail = await fetchAssetDetail(asset.id);
                                        setSelectedAsset(assetDetail || asset);
                                    }}
                                    className="group relative bg-gradient-to-b from-white to-blue-50/30 rounded-lg border border-blue-200/60 shadow-sm hover:shadow-lg hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                                >
                                    {/* Image Container - Smaller */}
                                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-blue-50/50 flex items-center justify-center p-2">
                                        {asset.previewUrl ? (
                                            <img
                                                src={asset.previewUrl}
                                                alt={asset.title}
                                                className="w-full h-full object-contain max-h-16 group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-gray-400 text-[10px]">No preview</span></div>';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-gray-400 text-[10px]">No preview</span>
                                            </div>
                                        )}

                                        {/* Premium Badge - Smaller */}
                                        <div className="absolute top-1 right-1">
                                            {asset.premiumLevel === 'FREE' ? (
                                                <div className="w-3 h-3 bg-green-500 rounded-full border border-white shadow-sm" title="FREE">
                                                    <svg className="w-2 h-2 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            ) : asset.premiumLevel === 'PRO' ? (
                                                <div className="w-3 h-3 bg-blue-500 rounded-full border border-white shadow-sm" title="PRO">
                                                    <svg className="w-2 h-2 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            ) : asset.premiumLevel === 'PREMIUM' ? (
                                                <div className="w-3 h-3 bg-purple-500 rounded-full border border-white shadow-sm" title="PREMIUM">
                                                    <svg className="w-2 h-2 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="w-3 h-3 bg-gray-400 rounded-full border border-white shadow-sm" title="FREE">
                                                    <svg className="w-2 h-2 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Format Badge - Smaller */}
                                        <div className="absolute top-1 left-1">
                                            <span className="px-1 py-0.5 text-[7px] font-bold bg-white/95 text-blue-700 rounded border border-blue-200 shadow-sm">
                                                {asset.format}
                                            </span>
                                        </div>

                                        {/* NEW Badge - Eye catching */}
                                        <div className="absolute -top-1 -right-1">
                                            <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                                                <span className="text-white text-[8px] font-bold">NEW</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content - More compact */}
                                    <div className="p-2 bg-white/80">
                                        <h3 className="text-[11px] font-semibold text-gray-900 mb-1 line-clamp-1 leading-tight">
                                            {asset.title}
                                        </h3>
                                        <div className="text-[9px] text-gray-500 flex items-center gap-1">
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {new Date(asset.createdAt).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short'
                                            })}
                                        </div>
                                    </div>

                                    {/* Hover Effect Overlay - Different effect */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Separator with visual break */}
                        <div className="mt-10 mb-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <div className="px-4 bg-white">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                            <span className="text-sm font-medium">Semua Aset</span>
                                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ---- MAIN GRID HEADER ---- */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 11H5m14-7v4m0 6v4m0-10a4 4 0 00-4-4H9a4 4 0 00-4 4v6a4 4 0 004 4h6a4 4 0 004-4v-4z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Semua Aset</h2>
                            <p className="text-sm text-gray-500">Total banyak jumlah Asset adalah {totalItems} aset</p>
                        </div>
                    </div>
                </div>

                {/* ---- GRID ---- */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {assetList
                        .filter((a) => filter === "" || a.title.toLowerCase().includes(filter.toLowerCase()))
                        .map((a) => (
                            <div
                                key={a.id}
                                onClick={async () => {
                                    // Fetch detail Asset dari database untuk modal
                                    const assetDetail = await fetchAssetDetail(a.id);
                                    setSelectedAsset(assetDetail || a); // Fallback ke data grid jika gagal
                                }}
                                className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer"
                            >
                                <div className="absolute inset-0">
                                    {getAssetThumbnail(a) ? (
                                        <img
                                            src={getAssetThumbnail(a)}
                                            alt={a.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentNode.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500 text-xs">No preview</span></div>';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <span className="text-gray-400 text-xs">No preview</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-white text-[11px] leading-tight line-clamp-2">{a.title}</p>
                                    {/* Premium Level Badge */}
                                    <div className="flex items-center gap-1 mt-1">
                                        {a.premiumLevel === 'FREE' ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-medium bg-green-100 text-green-800 rounded">
                                                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                FREE
                                            </span>
                                        ) : a.premiumLevel === 'PRO' ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-medium bg-blue-100 text-blue-800 rounded">
                                                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                </svg>
                                                PRO
                                            </span>
                                        ) : a.premiumLevel === 'PREMIUM' ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-medium bg-purple-100 text-purple-800 rounded">
                                                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                PREMIUM
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-medium bg-gray-100 text-gray-800 rounded">
                                                FREE
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-medium bg-white/80 text-gray-700 rounded">
                                    {a.status}
                                </span>
                            </div>
                        ))}
                    {assetList.filter(a => filter === "" || a.title.toLowerCase().includes(filter.toLowerCase())).length === 0 && (
                        <div className="col-span-full text-center p-4 text-gray-500 text-sm">
                            Tidak ada aset ditemukan.
                        </div>
                    )}
                </div>

                {/* ---- PAGINATION ---- */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600 text-center sm:text-left">
                            Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} dari {totalItems} items
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => {
                                    if (currentPage > 1) {
                                        fetchAssets(currentPage - 1);
                                    }
                                }}
                                disabled={currentPage <= 1}
                                className={`px-3 py-2 rounded text-sm ${currentPage <= 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                <span className="hidden sm:inline">Previous</span>
                                <span className="sm:hidden">‹</span>
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 7) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 4) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 3) {
                                        pageNum = totalPages - 6 + i;
                                    } else {
                                        pageNum = currentPage - 3 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => fetchAssets(pageNum)}
                                            className={`w-8 h-8 rounded text-sm ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => {
                                    if (currentPage < totalPages) {
                                        fetchAssets(currentPage + 1);
                                    }
                                }}
                                disabled={currentPage >= totalPages}
                                className={`px-3 py-2 rounded text-sm ${currentPage >= totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                <span className="hidden sm:inline">Next</span>
                                <span className="sm:hidden">›</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ---- MODAL UPLOAD ---- */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-blue-800">Upload Asset Baru</h2>
                                <button type="button" onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                            </div>
                            <div className="p-4 bg-white text-blue-900 min-h-[500px]">
                                {uploadStep === 'upload' && (
                                    <div className="text-center space-y-6">
                                        {!selectedFile ? (
                                            <>
                                                <div className="space-y-2">
                                                    <div className="flex justify-center mb-4">
                                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <h3 className="text-lg font-medium text-blue-900">Pilih semua 1 item</h3>
                                                    <p className="text-blue-700 text-sm">Tambahkan item lainnya</p>
                                                </div>
                                                <div
                                                    className="border-2 border-dashed border-blue-300 rounded-lg p-8 hover:border-blue-500 transition-colors cursor-pointer"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        const files = e.dataTransfer.files;
                                                        if (files.length > 0) handleFileSelect(files[0]);
                                                    }}
                                                >
                                                    <div className="space-y-4">
                                                        <div className="w-16 h-16 mx-auto bg-blue-200 rounded-lg flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-blue-900">Tambahkan item lainnya</p>
                                                            <p className="text-blue-700 text-sm">Seret dan jatuhkan file atau klik untuk memilih</p>
                                                            <p className="text-blue-600 text-xs">JPG, PNG, SVG, GIF (maks. 25MB)</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    hidden
                                                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                                                    accept="image/*,.svg"
                                                />
                                            </>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="relative">
                                                    <div className="w-32 h-32 mx-auto bg-white rounded-lg overflow-hidden shadow-lg border border-blue-200">
                                                        {filePreview && <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />}
                                                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-blue-900 font-medium">{selectedFile?.name}</p>
                                                    <p className="text-blue-700 text-sm">{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setUploadStep('form')}
                                                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                                >
                                                    Berikutnya
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {uploadStep === 'form' && (
                                    <div className="space-y-6 max-h-96 overflow-y-auto">
                                        <div className="flex items-center gap-3 pb-4 border-b border-blue-200">
                                            <div className="w-12 h-12 bg-white rounded overflow-hidden border border-blue-200">
                                                {filePreview && <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <p className="text-blue-900 text-sm font-medium">{selectedFile?.name}</p>
                                                <p className="text-blue-700 text-xs">Dibutuhkan</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-blue-900 text-sm font-medium mb-2">Judul</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    placeholder="Tambahkan judul"
                                                    className="w-full p-3 bg-white border border-blue-300 rounded-lg text-blue-900 placeholder-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-blue-900 text-sm font-medium mb-2">Seniman</label>
                                                <input
                                                    type="text"
                                                    name="artist"
                                                    placeholder="Nama pembuat konten"
                                                    className="w-full p-3 bg-white border border-blue-300 rounded-lg text-blue-900 placeholder-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-blue-900 text-sm font-medium">Keywords</label>
                                                    <span className="text-blue-600 text-sm">{keywords.length}/20</span>
                                                </div>
                                                <div className="relative mb-3">
                                                    <input
                                                        type="text"
                                                        value={keywordInput}
                                                        onChange={(e) => setKeywordInput(e.target.value)}
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleAddKeyword();
                                                            }
                                                        }}
                                                        placeholder="Keywords, 51"
                                                        className="w-full p-3 pr-16 bg-white border border-blue-300 rounded-lg text-blue-900 placeholder-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddKeyword}
                                                        className="absolute right-2 top-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                {keywords.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {keywords.map((keyword, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                                                            >
                                                                {keyword}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveKeyword(index)}
                                                                    className="text-blue-600 hover:text-blue-800 ml-1"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {uploadStep === 'pricing' && (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="border-2 border-blue-500 bg-blue-100 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="pricing"
                                                        value="pro"
                                                        checked={formData.premiumLevel === "PRO"}
                                                        onChange={() => setFormData(prev => ({ ...prev, premiumLevel: "PRO" }))}
                                                        className="mt-1 w-4 h-4 text-blue-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">Pro</div>
                                                        </div>
                                                        <p className="text-blue-900 text-sm">
                                                            Elemen ini hanya akan tersedia bagi pengguna Pro. Anda akan mendapatkan penghasilan berdasarkan penggunaan.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border border-purple-500 bg-purple-100 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="pricing"
                                                        value="premium"
                                                        checked={formData.premiumLevel === "PREMIUM"}
                                                        onChange={() => setFormData(prev => ({ ...prev, premiumLevel: "PREMIUM" }))}
                                                        className="mt-1 w-4 h-4 text-purple-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded font-bold">Premium</div>
                                                        </div>
                                                        <p className="text-blue-900 text-sm">
                                                            Elemen ini hanya akan tersedia bagi pengguna Premium. Akses eksklusif untuk subscription tertinggi.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border border-blue-300 bg-blue-50 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="pricing"
                                                        value="gratis"
                                                        checked={formData.premiumLevel === "FREE"}
                                                        onChange={() => setFormData(prev => ({ ...prev, premiumLevel: "FREE" }))}
                                                        className="mt-1 w-4 h-4 text-green-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="bg-green-200 text-green-900 text-xs px-2 py-1 rounded font-bold">Gratis</div>
                                                        </div>
                                                        <p className="text-blue-900 text-sm">
                                                            Elemen ini akan tersedia bagi semua pengguna secara gratis.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3 pt-4 border-t border-blue-200">
                                            <label className="flex items-start gap-2">
                                                <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 bg-white border-blue-300" />
                                                <span className="text-sm text-blue-900">
                                                    Saya adalah pemilik konten dan memiliki izin untuk semua orang, properti, serta merek yang ditampilkan di konten
                                                </span>
                                            </label>
                                            <label className="flex items-start gap-2">
                                                <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 bg-white border-blue-300" />
                                                <span className="text-sm text-blue-900">
                                                    Saya menyetujui <span className="text-blue-600 underline">Persyaratan Penggunaan</span> dan <span className="text-blue-600 underline">Perjanjian Kontributor</span> Canva.
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-blue-50 border-t border-blue-200">
                                {uploadStep === 'upload' && (
                                    <div className="text-center">
                                        <button type="button" onClick={resetForm} className="text-blue-700 hover:text-blue-900 text-sm">
                                            Batal
                                        </button>
                                    </div>
                                )}
                                {uploadStep === 'form' && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setUploadStep('pricing')}
                                            disabled={!formData.title.trim()}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Berikutnya
                                        </button>
                                    </div>
                                )}
                                {uploadStep === 'pricing' && (
                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setUploadStep('form')}
                                            className="flex items-center gap-2 px-4 py-2 text-blue-700 hover:text-blue-900"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Kembali
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Mengirim...
                                                </>
                                            ) : (
                                                'Kirim Item'
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {selectedAsset && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedAsset(null)}
                    >
                        <div
                            className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-0 border border-gray-200"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex">
                                {/* Preview Image */}
                                <div className="w-1/2 bg-gray-50 flex items-center justify-center p-8 rounded-l-lg">
                                    {getAssetThumbnail(selectedAsset) ? (
                                        <img
                                            src={getAssetThumbnail(selectedAsset)}
                                            alt={selectedAsset.title}
                                            className="max-w-full max-h-80 object-contain"
                                        />
                                    ) : (
                                        <div className="text-gray-400">No preview available</div>
                                    )}
                                </div>

                                {/* Asset Details */}
                                <div className="w-1/2 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-gray-900">{selectedAsset.title}</h2>
                                        <button
                                            onClick={() => setSelectedAsset(null)}
                                            className="text-gray-400 hover:text-gray-600 text-2xl"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Tipe:</span>
                                            <div className="text-blue-600 font-medium">{selectedAsset.type}</div>
                                        </div>

                                        <div>
                                            <span className="text-gray-600">Status:</span>
                                            <div className="text-blue-600 font-medium">{selectedAsset.status}</div>
                                        </div>

                                        <div>
                                            <span className="text-gray-600">Premium Level:</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                {selectedAsset.premiumLevel === 'FREE' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        FREE - Tersedia untuk semua user
                                                    </span>
                                                ) : selectedAsset.premiumLevel === 'PRO' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                        </svg>
                                                        PRO - Tersedia untuk user Pro & Premium
                                                    </span>
                                                ) : selectedAsset.premiumLevel === 'PREMIUM' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        PREMIUM - Hanya untuk user Premium
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                                        FREE - Tersedia untuk semua user
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-gray-600">Workspace:</span>
                                            <div className="text-blue-600 font-medium">{selectedAsset.workspace?.name}</div>
                                        </div>

                                        <div>
                                            <span className="text-gray-600">Tanggal Upload:</span>
                                            <div className="text-blue-600 font-medium">{new Date(selectedAsset.createdAt).toLocaleDateString()}</div>
                                        </div>

                                        {selectedAsset.format && (
                                            <div>
                                                <span className="text-gray-600">Format:</span>
                                                <div className="text-blue-600 font-medium">{selectedAsset.format}</div>
                                            </div>
                                        )}

                                        {(selectedAsset.width && selectedAsset.height) && (
                                            <div>
                                                <span className="text-gray-600">Dimensi:</span>
                                                <div className="text-blue-600 font-medium">{selectedAsset.width} × {selectedAsset.height}px</div>
                                            </div>
                                        )}

                                        <div>
                                            <span className="text-gray-600">Deskripsi:</span>
                                            <div className="text-blue-600 font-medium">{selectedAsset.description || "Tidak ada deskripsi"}</div>
                                        </div>

                                        {/* Tags jika ada */}
                                        {selectedAsset.tags && selectedAsset.tags.length > 0 && (
                                            <div>
                                                <span className="text-gray-600">Tags:</span>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {selectedAsset.tags.map((tag, index) => (
                                                        <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                                            {tag.name || tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tombol Hapus dan Tutup */}
                                    <div className="flex gap-2 mt-6">
                                        <button
                                            onClick={() => deleteAsset(selectedAsset.id)}
                                            className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Hapus
                                        </button>
                                        <button
                                            onClick={() => setSelectedAsset(null)}
                                            className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function AdminAssetsPage({ user }) {
    return <AssetTable session={{ user }} />;
}

// Protected with withAdminAuth HOC - no getServerSideProps needed
export default withAdminAuth(AdminAssetsPage);