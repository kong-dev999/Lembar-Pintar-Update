import React, { useEffect, useState } from 'react';
import { createStore } from 'polotno/model/store';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import CustomSidePanel from './SidePanelAdmin';
import { Workspace } from 'polotno/canvas/workspace';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { PagesTimeline } from 'polotno/pages-timeline';
import ToolbarAdmin from './ToolbarAdmin';
// import { observer } from 'mobx-react-lite';

const LoadingScreen = ({ image }) => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat editor admin...</p>
            {image && (
                <p className="text-sm text-gray-500 mt-2">
                    Memuat gambar: {image.split('/').pop()}
                </p>
            )}
        </div>
    </div>
);

const AdminPolotnoEditor = ({ image, initialData, designId }) => {
    // Debug props received
    console.log('🎯 AdminPolotnoEditor props received:');
    console.log('- designId:', designId);
    console.log('- initialData:', initialData);
    console.log('- initialData type:', typeof initialData);
    console.log('- image:', image);

    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentDesignId, setCurrentDesignId] = useState(designId);
    const [designTitle, setDesignTitle] = useState('Desain Saya');
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [publishForm, setPublishForm] = useState({
        title: '',
        description: '',
        artist: '',
        keywords: '',
        premiumLevel: "FREE",
        visibility: 'PUBLIC',
        categories: [],
        tags: [],
        educationLevels: [],
        grades: [],
        subjects: []
    });
    const [publishStep, setPublishStep] = useState('basic'); // 'basic', 'publish'
    const [keywordInput, setKeywordInput] = useState('');
    const [keywords, setKeywords] = useState([]);

    useEffect(() => {
        const newStore = createStore({
            key: process.env.NEXT_PUBLIC_POLOTNO_KEY,
            showCredit: false,
            translations: {
                id: {
                    'sidePanel.templates': 'Template',
                    'sidePanel.text': 'Teks',
                    'sidePanel.photos': 'Foto',
                    'sidePanel.elements': 'Elemen',
                    'sidePanel.upload': 'Unggah',
                    'sidePanel.background': 'Latar Belakang',
                    'sidePanel.layers': 'Lapisan',
                    'sidePanel.resize': 'Ubah Ukuran',
                    'templates': 'Template',
                    'text': 'Teks',
                    'photos': 'Foto',
                    'elements': 'Elemen',
                    'upload': 'Unggah',
                    'background': 'Latar Belakang',
                    'layers': 'Lapisan',
                    'resize': 'Ubah Ukuran',
                    'save': 'Simpan',
                    'download': 'Unduh',
                    'undo': 'Batalkan',
                    'redo': 'Ulangi',
                    'copy': 'Salin',
                    'paste': 'Tempel',
                    'delete': 'Hapus',
                    'duplicate': 'Gandakan',
                    'position': 'Posisi',
                    'size': 'Ukuran',
                    'rotation': 'Rotasi',
                    'opacity': 'Transparansi',
                    'color': 'Warna',
                    'font': 'Font',
                    'fontSize': 'Ukuran Font',
                    'fontWeight': 'Ketebalan Font',
                    'textAlign': 'Perataan Teks',
                    'lineHeight': 'Tinggi Baris',
                    'bringForward': 'Maju ke Depan',
                    'sendBackward': 'Kirim ke Belakang',
                    'bringToFront': 'Paling Depan',
                    'sendToBack': 'Paling Belakang',
                    'pages': 'Halaman',
                    'addPage': 'Tambah Halaman',
                    'deletePage': 'Hapus Halaman',
                    'duplicatePage': 'Gandakan Halaman',
                    'zoomIn': 'Perbesar',
                    'zoomOut': 'Perkecil',
                    'fitToPage': 'Sesuaikan Halaman',
                    'actualSize': 'Ukuran Sebenarnya',
                    'width': 'Lebar',
                    'height': 'Tinggi',
                    'loading': 'Memuat...',
                    'error': 'Terjadi kesalahan',
                    'ok': 'OK',
                    'cancel': 'Batal',
                    'apply': 'Terapkan',
                    'reset': 'Reset'
                }
            },
            language: 'id'
        });

        setStore(newStore);

        if (newStore.setLanguage) {
            newStore.setLanguage('id');
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        if (!store) return;

        const loadDesign = async () => {
            console.log('=== AdminPolotnoEditor loadDesign START ===');
            console.log('initialData received:', initialData);
            console.log('initialData type:', typeof initialData);

            if (initialData) {
                try {
                    console.log('Processing initialData...');

                    // Check if initialData is valid Polotno JSON
                    if (initialData && typeof initialData === 'object') {
                        if (initialData.pages && Array.isArray(initialData.pages)) {
                            console.log('Valid Polotno JSON structure detected');
                            console.log('Pages count:', initialData.pages.length);

                            // Load JSON into store
                            store.loadJSON(initialData);
                            await store.waitLoading();

                            console.log('✅ Design loaded successfully into Polotno!');
                        } else {
                            console.error('❌ Invalid Polotno JSON structure - missing pages array');
                            console.log('Expected: { pages: [...] }');
                            console.log('Received:', Object.keys(initialData));
                            store.addPage();
                        }
                    } else {
                        console.error('❌ initialData is not a valid object');
                        store.addPage();
                    }
                } catch (error) {
                    console.error('❌ Error loading design into Polotno:', error);
                    console.error('Error details:', error.message);
                    store.addPage();
                }
            } else {
                console.log('No initialData provided, creating blank page');
                store.addPage();
            }

            if (image) {
                console.log('Loading additional image:', image);
                loadImage(image);
            }

            console.log('=== AdminPolotnoEditor loadDesign END ===');
        };

        loadDesign();
    }, [store, initialData, image]);

    const loadImage = async (src) => {
        try {
            const url = decodeURIComponent(src);
            await new Promise((res, rej) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = res;
                img.onerror = rej;
                img.src = url;
            });
            store.activePage.addElement({ type: 'image', src: url, x: 50, y: 50, width: 200, height: 200 });
        } catch {
            store.activePage.addElement({ type: 'text', text: 'Gagal memuat gambar.', x: 50, y: 50, fontSize: 14, fill: '#ff4757' });
        }
    };

    // Smart Save Logic - distinguish between new and existing designs
    const handleSave = async (customTitle = null) => {
        // If no designId and no customTitle provided, show save modal for new design
        if (!currentDesignId && !customTitle) {
            setShowSaveModal(true);
            return;
        }

        // Perform actual save
        await performSave(customTitle);
    };

    // Actual save function
    const performSave = async (customTitle = null) => {
        try {
            setIsSaving(true);
            console.log('🎯 performSave called with:', {
                customTitle,
                currentDesignId,
                designTitle,
                hasStore: !!store
            });

            const designData = store.toJSON();
            const previewData = await store.toDataURL();

            // Use custom title from modal/SidePanel, atau fallback ke designTitle atau auto-generated
            const title = customTitle && customTitle.trim()
                ? customTitle.trim()
                : designTitle && designTitle.trim()
                    ? designTitle.trim()
                    : `Design ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

            console.log('📝 Final title determined:', title);
            console.log('📤 Sending request with:', {
                title,
                hasData: !!designData,
                designId: currentDesignId,
                isUpdate: !!currentDesignId
            });

            const response = await fetch('/api/designs/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: designData,
                    title: title,
                    description: `Design dengan ukuran ${designData.width} x ${designData.height} pixels`,
                    designId: currentDesignId,
                    workspaceId: null,
                    preview: previewData
                }),
            });

            const result = await response.json();
            console.log('📥 API Response:', {
                status: response.status,
                success: result.success,
                message: result.message,
                result
            });

            if (result.success) {
                // Update state after successful save
                const wasNewDesign = !currentDesignId;
                setCurrentDesignId(result.design.id);

                // Update designTitle if it was provided
                if (customTitle) {
                    setDesignTitle(customTitle);
                }

                // Close save modal if it was open
                setShowSaveModal(false);

                // Show appropriate success message
                alert(`Design berhasil ${wasNewDesign ? 'disimpan' : 'diperbarui'} sebagai draft.`);
            } else {
                alert(`Gagal menyimpan design: ${result.message}`);
            }
        } catch (error) {
            console.error('Error saving design:', error);
            alert('Gagal menyimpan design.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = () => {
        console.log('🎯 handlePublish called!');
        console.log('Current designTitle:', designTitle);

        // Initialize form with current design data
        const newFormData = {
            title: designTitle || `Template ${new Date().toLocaleDateString('id-ID')}`,
            description: `Template created on ${new Date().toLocaleDateString('id-ID')}`,
            artist: '',
            keywords: '',
            premiumLevel: "FREE",
            visibility: 'PUBLIC',
            categories: [],
            tags: [],
            educationLevels: [],
            grades: [],
            subjects: []
        };

        console.log('📝 Setting form data:', newFormData);
        setPublishForm(newFormData);
        setShowPublishModal(true);
        setPublishStep('basic');

        console.log('✅ Modal should be visible now');
    };

    const handleAddKeyword = () => {
        const keyword = keywordInput.trim();
        if (keyword && !keywords.includes(keyword) && keywords.length < 20) {
            setKeywords(prev => [...prev, keyword]);
            setKeywordInput('');
        } else if (keywords.length >= 20) {
            alert('Maksimal 20 keywords saja yang diperbolehkan');
        }
    };

    const handleRemoveKeyword = (index) => {
        setKeywords(prev => prev.filter((_, i) => i !== index));
    };

    const handlePublishFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPublishForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePublishSubmit = async () => {
        try {
            console.log('🚀 Starting publish process...');
            console.log('📋 Publish form data:', publishForm);

            const designData = store.toJSON();
            const previewData = await store.toDataURL();

            console.log('🎨 Polotno JSON structure:', {
                width: designData.width,
                height: designData.height,
                unit: designData.unit,
                pages: designData.pages?.length
            });

            const payload = {
                data: designData,
                name: publishForm.title,
                description: publishForm.description,
                preview: previewData,
                designId: currentDesignId,
                premiumLevel: publishForm.premiumLevel,
                visibility: publishForm.visibility,
                categories: publishForm.categories,
                tags: publishForm.tags,
                educationLevels: publishForm.educationLevels,
                grades: publishForm.grades,
                subjects: publishForm.subjects,
                keywords: keywords.join(', ') // Convert array to comma-separated string
            };

            console.log('📤 Sending payload to API:', payload);

            const response = await fetch('/api/designs/publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log('📡 Response status:', response.status);
            const result = await response.json();
            console.log('📥 API response:', result);

            if (result.success) {
                alert('Template berhasil diterbitkan untuk publik!');
                setShowPublishModal(false);
                setPublishForm({
                    title: '',
                    description: '',
                    artist: '',
                    keywords: '',
                    premiumLevel: "FREE",
                    visibility: 'PUBLIC',
                    categories: [],
                    tags: [],
                    educationLevels: [],
                    grades: [],
                    subjects: []
                });
                setKeywords([]);
                setKeywordInput('');
            } else {
                alert(`Gagal menerbitkan template: ${result.message}`);
            }
        } catch (error) {
            console.error('❌ Error publishing template:', error);
            alert('Gagal menerbitkan template: ' + error.message);
        }
    };

    // Polotno native keyboard shortcuts handling
    useEffect(() => {
        if (!store) return;

        // Setting up keyboard shortcuts for store

        // Let Polotno handle its own keyboard shortcuts natively
        // Just ensure the workspace can receive focus
        const ensureFocus = () => {
            setTimeout(() => {
                const canvas = document.querySelector('canvas');
                const workspace = document.querySelector('.polotno-workspace') ||
                    document.querySelector('[data-polotno="workspace"]') ||
                    canvas;

                if (workspace && workspace.tabIndex === undefined) {
                    workspace.tabIndex = 0;
                    workspace.focus();
                }
            }, 100);
        };

        ensureFocus();

        // Listen for store changes to monitor keyboard shortcuts
        const handleStoreChange = () => {
            // Store changed - shortcuts should be active
        };

        // Monitor store for changes
        if (store.on) {
            store.on('change', handleStoreChange);
        }

        return () => {
            if (store.off) {
                store.off('change', handleStoreChange);
            }
        };
    }, [store]);

    if (loading || !store) return <LoadingScreen image={image} />;

    return (
        <>
            <link rel="stylesheet" href="https://unpkg.com/@blueprintjs/core@5/lib/css/blueprint.css" />
            <div className="flex flex-col h-screen">
                <PolotnoContainer className="flex flex-grow">
                    <SidePanelWrap>
                        <CustomSidePanel
                            store={store}
                            onSave={handleSave}
                            onPublish={handlePublish}
                            currentDesignId={currentDesignId}
                            designTitle={designTitle} />
                    </SidePanelWrap>
                    <WorkspaceWrap>
                        <ToolbarAdmin store={store} />
                        <Workspace store={store} />
                        <div className="zoom">
                            <ZoomButtons store={store} />
                        </div>
                        <div className="pages">
                            <PagesTimeline store={store} />
                        </div>
                    </WorkspaceWrap>
                </PolotnoContainer>
            </div>

            {/* Publish Modal - Similar to Assets Upload Style */}
            {showPublishModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        {/* Modal */}
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-blue-800">Publish Template</h2>
                                <button
                                    onClick={() => setShowPublishModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Content - Similar to Assets Upload */}
                            <div className="p-6 bg-white text-blue-900 min-h-[500px]">
                                {publishStep === 'basic' && (
                                    <div className="space-y-6 max-h-96 overflow-y-auto">
                                        {/* Title */}
                                        <div>
                                            <label className="block text-blue-900 text-sm font-medium mb-2">Judul Template *</label>
                                            <input
                                                type="text"
                                                value={publishForm.title}
                                                onChange={(e) => setPublishForm(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="Masukkan judul template"
                                                className="w-full p-3 bg-white border border-blue-300 rounded-lg text-blue-900 placeholder-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        {/* Description & Created by */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-blue-900 text-sm font-medium mb-2">Deskripsi</label>
                                                <textarea
                                                    value={publishForm.description}
                                                    onChange={(e) => setPublishForm(prev => ({ ...prev, description: e.target.value }))}
                                                    placeholder="Deskripsikan template Anda..."
                                                    className="w-full p-3 bg-white border border-blue-300 rounded-lg text-blue-900 placeholder-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-24 resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-blue-900 text-sm font-medium mb-2">Pembuat</label>
                                                <input
                                                    type="text"
                                                    value={publishForm.artist}
                                                    onChange={(e) => setPublishForm(prev => ({ ...prev, artist: e.target.value }))}
                                                    placeholder="Nama atau brand Anda"
                                                    className="w-full p-3 bg-white border border-blue-300 rounded-lg text-blue-900 placeholder-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Keywords */}
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
                                                    disabled={keywords.length >= 20}
                                                    className="absolute right-2 top-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Tambahkan
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

                                        {/* Education Level */}
                                        <div>
                                            <label className="block text-blue-900 text-sm font-medium mb-3">Jenjang Pendidikan</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['TK', 'SD', 'SMP', 'SMA'].map(level => (
                                                    <button
                                                        key={level}
                                                        type="button"
                                                        onClick={() => {
                                                            const isSelected = publishForm.educationLevels.includes(level);
                                                            setPublishForm(prev => ({
                                                                ...prev,
                                                                educationLevels: isSelected
                                                                    ? prev.educationLevels.filter(l => l !== level)
                                                                    : [...prev.educationLevels, level]
                                                            }));
                                                        }}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${publishForm.educationLevels.includes(level)
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                            }`}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Dynamic Grades */}
                                        {publishForm.educationLevels.length > 0 && (
                                            <div>
                                                <label className="block text-blue-900 text-sm font-medium mb-3">Tingkat Kelas</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {publishForm.educationLevels.includes('TK') && ['TK A', 'TK B'].map(grade => (
                                                        <button
                                                            key={grade}
                                                            type="button"
                                                            onClick={() => {
                                                                const isSelected = publishForm.grades.includes(grade);
                                                                setPublishForm(prev => ({
                                                                    ...prev,
                                                                    grades: isSelected
                                                                        ? prev.grades.filter(g => g !== grade)
                                                                        : [...prev.grades, grade]
                                                                }));
                                                            }}
                                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${publishForm.grades.includes(grade)
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                }`}
                                                        >
                                                            {grade}
                                                        </button>
                                                    ))}
                                                    {publishForm.educationLevels.includes('SD') && ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'].map(grade => (
                                                        <button
                                                            key={grade}
                                                            type="button"
                                                            onClick={() => {
                                                                const isSelected = publishForm.grades.includes(grade);
                                                                setPublishForm(prev => ({
                                                                    ...prev,
                                                                    grades: isSelected
                                                                        ? prev.grades.filter(g => g !== grade)
                                                                        : [...prev.grades, grade]
                                                                }));
                                                            }}
                                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${publishForm.grades.includes(grade)
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                }`}
                                                        >
                                                            {grade}
                                                        </button>
                                                    ))}
                                                    {publishForm.educationLevels.includes('SMP') && ['Kelas 7', 'Kelas 8', 'Kelas 9'].map(grade => (
                                                        <button
                                                            key={grade}
                                                            type="button"
                                                            onClick={() => {
                                                                const isSelected = publishForm.grades.includes(grade);
                                                                setPublishForm(prev => ({
                                                                    ...prev,
                                                                    grades: isSelected
                                                                        ? prev.grades.filter(g => g !== grade)
                                                                        : [...prev.grades, grade]
                                                                }));
                                                            }}
                                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${publishForm.grades.includes(grade)
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                }`}
                                                        >
                                                            {grade}
                                                        </button>
                                                    ))}
                                                    {publishForm.educationLevels.includes('SMA') && ['Kelas 10', 'Kelas 11', 'Kelas 12'].map(grade => (
                                                        <button
                                                            key={grade}
                                                            type="button"
                                                            onClick={() => {
                                                                const isSelected = publishForm.grades.includes(grade);
                                                                setPublishForm(prev => ({
                                                                    ...prev,
                                                                    grades: isSelected
                                                                        ? prev.grades.filter(g => g !== grade)
                                                                        : [...prev.grades, grade]
                                                                }));
                                                            }}
                                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${publishForm.grades.includes(grade)
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                }`}
                                                        >
                                                            {grade}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Subjects */}
                                        <div>
                                            <label className="block text-blue-900 text-sm font-medium mb-3">Mata Pelajaran</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Matematika', 'IPA', 'IPS', 'Bahasa Indonesia', 'Bahasa Inggris', 'PKn', 'Seni Budaya', 'Penjaskes'].map(subject => (
                                                    <button
                                                        key={subject}
                                                        type="button"
                                                        onClick={() => {
                                                            const isSelected = publishForm.subjects.includes(subject);
                                                            setPublishForm(prev => ({
                                                                ...prev,
                                                                subjects: isSelected
                                                                    ? prev.subjects.filter(s => s !== subject)
                                                                    : [...prev.subjects, subject]
                                                            }));
                                                        }}
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${publishForm.subjects.includes(subject)
                                                            ? 'bg-purple-600 text-white'
                                                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                            }`}
                                                    >
                                                        {subject}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Premium Selection - Similar to Assets Upload */}
                                {publishStep === 'publish' && (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="border-2 border-blue-500 bg-blue-100 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="pricing"
                                                        value="pro"
                                                        checked={publishForm.premiumLevel === "PRO"}
                                                        onChange={() => setPublishForm(prev => ({ ...prev, premiumLevel: "PRO" }))}
                                                        className="mt-1 w-4 h-4 text-blue-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">Pro</div>
                                                        </div>
                                                        <p className="text-blue-900 text-sm">
                                                            Template ini hanya akan tersedia bagi pengguna Pro. Anda akan mendapatkan penghasilan berdasarkan penggunaan.
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
                                                        checked={publishForm.premiumLevel === "PREMIUM"}
                                                        onChange={() => setPublishForm(prev => ({ ...prev, premiumLevel: "PREMIUM" }))}
                                                        className="mt-1 w-4 h-4 text-purple-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded font-bold">Premium</div>
                                                        </div>
                                                        <p className="text-blue-900 text-sm">
                                                            Template ini hanya akan tersedia bagi pengguna Premium. Akses eksklusif untuk subscription tertinggi.
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
                                                        checked={publishForm.premiumLevel === "FREE"}
                                                        onChange={() => setPublishForm(prev => ({ ...prev, premiumLevel: "FREE" }))}
                                                        className="mt-1 w-4 h-4 text-green-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="bg-green-200 text-green-900 text-xs px-2 py-1 rounded font-bold">Gratis</div>
                                                        </div>
                                                        <p className="text-blue-900 text-sm">
                                                            Template ini akan tersedia bagi semua pengguna secara gratis.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3 pt-4 border-t border-blue-200">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 w-4 h-4 text-blue-600 bg-white border-blue-300 rounded focus:ring-blue-500 focus:ring-2"
                                                    required
                                                />
                                                <span className="text-sm text-blue-900 leading-relaxed">
                                                    Saya adalah pemilik asli dari template ini dan memiliki hak penuh untuk mempublikasikan konten ini ke platform EduCanva
                                                </span>
                                            </label>
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 w-4 h-4 text-blue-600 bg-white border-blue-300 rounded focus:ring-blue-500 focus:ring-2"
                                                    required
                                                />
                                                <span className="text-sm text-blue-900 leading-relaxed">
                                                    Saya menyetujui <span className="text-blue-600 font-medium hover:underline cursor-pointer">Syarat dan Ketentuan</span> serta <span className="text-blue-600 font-medium hover:underline cursor-pointer">Kebijakan Kontributor</span> EduCanva
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer - Similar to Assets Upload */}
                            <div className="p-4 bg-blue-50 border-t border-blue-200">
                                {publishStep === 'basic' ? (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => setPublishStep('publish')}
                                            disabled={!publishForm.title.trim()}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Berikutnya
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-between">
                                        <button
                                            onClick={() => setPublishStep('basic')}
                                            className="flex items-center gap-2 px-4 py-2 text-blue-700 hover:text-blue-900"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Kembali
                                        </button>
                                        <button
                                            onClick={handlePublishSubmit}
                                            disabled={!publishForm.title.trim()}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            Publish Template
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Modal for New Designs */}
            {showSaveModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-600 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Save Design</h3>
                                        <p className="text-sm text-gray-500">Give your design a name</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSaveModal(false)}
                                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                                    disabled={isSaving}
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Design Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={designTitle}
                                            onChange={(e) => setDesignTitle(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                                            placeholder="Enter design name..."
                                            autoFocus
                                            disabled={isSaving}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && designTitle.trim()) {
                                                    performSave(designTitle.trim());
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-100 p-6 bg-gray-50 rounded-b-2xl">
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowSaveModal(false)}
                                        className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => performSave(designTitle.trim())}
                                        disabled={!designTitle.trim() || isSaving}
                                        className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                Save Design
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminPolotnoEditor;