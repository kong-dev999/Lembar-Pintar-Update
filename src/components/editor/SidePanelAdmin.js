// src/components/editor/SidePanel.js
import React from 'react';
import { observer } from 'mobx-react-lite';
import { SidePanel, DEFAULT_SECTIONS } from 'polotno/side-panel';
import { SectionTab } from 'polotno/side-panel';
import { ImagesGrid } from 'polotno/side-panel';
import { SizeSection } from 'polotno/side-panel';
import { Icon, InputGroup } from '@blueprintjs/core';
import { QrSection } from './qr-section';
import { createPortal } from 'react-dom';

// ---------- Custom Elements Panel with Unified Search ----------
const ElementsPanel = observer(({ store }) => {
    const [elements, setElements] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(true);

    // Load database elements (Grafis)
    const loadElementsData = React.useCallback(async (searchQuery = '', pageNum = 1, resetData = false) => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const params = new URLSearchParams({
                page: pageNum.toString(),
                limit: '20',
                ...(searchQuery && { search: searchQuery }),
            });

            const response = await fetch(`/api/assets/element-files?${params}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            const transformedElements = data.files?.map(file => {
                if (!file.url) return null;
                const isSvg = file.mime === 'image/svg+xml' || file.url.includes('.svg');

                return {
                    id: file.id,
                    url: file.url,
                    title: file.name,
                    isSvg: isSvg,
                    format: file.mime,
                    width: file.width || 100,
                    height: file.height || 100,
                };
            }).filter(Boolean) || [];

            if (resetData) {
                setElements(transformedElements);
            } else {
                setElements(prev => [...prev, ...transformedElements]);
            }

            setHasMore(data.pagination?.page < data.pagination?.pages);
            setPage(pageNum + 1);
        } catch (error) {
            console.error('Failed to load elements:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    // Load initial data
    React.useEffect(() => {
        setPage(1);
        setElements([]);
        setHasMore(true);
        loadElementsData(query, 1, true);
    }, [query]);

    // Filter database elements based on search
    const filteredDbElements = elements.filter(element =>
        !query || element.title.toLowerCase().includes(query.toLowerCase())
    );


    return (
        <div className="custom-elements-panel">
            {/* Unified Search Section */}
            <div className="search-section">
                <InputGroup
                    placeholder="Cari elements..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="custom-search"
                    style={{
                        width: '100%'
                    }}
                    inputProps={{
                        style: {
                            padding: '12px 16px 12px 40px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: '#ffffff',
                            fontFamily: 'Inter, sans-serif'
                        }
                    }}
                />
            </div>

            {/* Categories Sections */}
            <div className="categories-section">
                {/* Grafis Section */}
                {filteredDbElements.length > 0 && (
                    <div className="grafis-section">
                        <div className="section-header">
                            <h4 className="section-title">Grafis</h4>
                        </div>

                        <div className="elements-grid">
                            {filteredDbElements.map(element => (
                                <div
                                    key={element.id}
                                    onClick={() => {
                                        const elementProps = {
                                            width: element.width,
                                            height: element.height,
                                            name: element.title,
                                        };

                                        if (element.isSvg) {
                                            elementProps.type = 'svg';
                                            elementProps.src = element.url;
                                            elementProps.keepRatio = true;
                                            elementProps.stretchEnabled = false;
                                        } else if (element.url) {
                                            elementProps.type = 'image';
                                            elementProps.src = element.url;
                                        }

                                        store.activePage.addElement(elementProps);
                                    }}
                                    className="element-item"
                                >
                                    <img
                                        src={element.url}
                                        alt={element.title}
                                        className="element-image"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                            ))}
                        </div>

                        {hasMore && !isLoading && (
                            <div className="load-more-container">
                                <button
                                    onClick={() => loadElementsData(query, page)}
                                    className="load-more-button bp5-button"
                                >
                                    Muat lebih banyak
                                </button>
                            </div>
                        )}
                    </div>
                )}


                {/* Loading State */}
                {isLoading && (
                    <div className="loading-state">
                        Memuat elements...
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && query && filteredDbElements.length === 0 && (
                    <div className="empty-state">
                        Tidak ada element yang ditemukan untuk &quot;{query}&quot;
                    </div>
                )}
            </div>
        </div>
    );
});

// ---------- Elements Section Definition (Grafis only) ----------
const ElementsSection = {
    name: 'elements',
    Tab: (props) => (
        <SectionTab name="Elements" {...props}>
            <Icon icon="shapes" />
        </SectionTab>
    ),
    Panel: ElementsPanel,
};

// ---------- Dasar Section Definition (Bentuk & Garis) ----------
const DasarSection = {
    name: 'dasar',
    Tab: (props) => (
        <SectionTab name="Dasar" {...props}>
            <Icon icon="symbol-square" />
        </SectionTab>
    ),
    Panel: DEFAULT_SECTIONS[3].Panel, // Default Polotno shapes panel
};

// ---------- Educational Templates Panel ----------
const EducationalTemplatesPanel = observer(({ store }) => {
    const [templates, setTemplates] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(true);
    const [selectedLevel, setSelectedLevel] = React.useState('');
    const [selectedGrade, setSelectedGrade] = React.useState('');
    const [selectedSubject, setSelectedSubject] = React.useState('');
    const [levels, setLevels] = React.useState([]);
    const [grades, setGrades] = React.useState([]);
    const [subjects, setSubjects] = React.useState([]);

    const loadFilterOptions = React.useCallback(async () => {
        try {
            const response = await fetch('/api/educational/filter-options');
            if (response.ok) {
                const data = await response.json();
                setLevels(data.levels || []);
                setGrades(data.grades || []);
                setSubjects(data.subjects || []);
            }
        } catch (error) {
            console.error('Failed to load filter options:', error);
        }
    }, []);

    React.useEffect(() => {
        loadFilterOptions();
    }, []);

    const loadTemplatesData = React.useCallback(async (searchQuery = '', pageNum = 1, resetData = false) => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const params = new URLSearchParams({
                page: pageNum.toString(),
                limit: '12',
                ...(searchQuery && { search: searchQuery }),
                ...(selectedLevel && { levelSlug: selectedLevel }),
                ...(selectedGrade && { gradeId: selectedGrade }),
                ...(selectedSubject && { subjectId: selectedSubject }),
            });

            const response = await fetch(`/api/templates/educational?${params}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            const transformedTemplates = data.data?.map((item, index) => {
                const template = item.template;
                const templateTitle = item.title || `Template ${template?.id || index + 1}`;

                return {
                    id: item.id,
                    url: item.thumbnailUrl || `/api/templates/${item.template.id}/preview`,
                    name: templateTitle,
                    title: templateTitle,
                    description: item.description || '',
                    category: template?.categories?.[0]?.name || 'Education',
                    width: template?.width || 400,
                    height: template?.height || 300,
                };
            }) || [];

            if (resetData) {
                setTemplates(transformedTemplates);
            } else {
                setTemplates(prev => [...prev, ...transformedTemplates]);
            }

            setHasMore(data.pagination?.page < data.pagination?.pages);
            setPage(pageNum + 1);
        } catch (error) {
            console.error('Failed to load educational templates:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, selectedLevel, selectedGrade, selectedSubject]);

    React.useEffect(() => {
        setPage(1);
        setTemplates([]);
        setHasMore(true);
        loadTemplatesData(query, 1, true);
    }, [query, selectedLevel, selectedGrade, selectedSubject]);

    React.useEffect(() => {
        if (selectedLevel) {
            setSelectedGrade('');
        }
    }, [selectedLevel]);

    const filteredGrades = React.useMemo(() => {
        if (!selectedLevel) return grades;
        return grades.filter(grade =>
            grade.educationLevel && grade.educationLevel.slug === selectedLevel
        );
    }, [grades, selectedLevel]);

    const filteredSubjects = React.useMemo(() => {
        if (!selectedLevel) return subjects;
        return subjects.filter(subject =>
            subject.applicableLevels && subject.applicableLevels.includes(selectedLevel.toUpperCase())
        );
    }, [subjects, selectedLevel]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px', borderBottom: '1px solid #e0e0e0' }}>
                <InputGroup
                    leftIcon={<Icon icon="search" style={{ color: '#000000', fill: '#000000', fontSize: '16px' }} />}
                    placeholder="Cari template edukasi..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                        width: '100%',
                        marginBottom: 10,
                    }}
                    inputProps={{
                        style: {
                            padding: '12px 16px 12px 40px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: '#ffffff',
                            fontFamily: 'Inter, sans-serif'
                        }
                    }}
                />

                <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        fontSize: 12,
                        marginBottom: 6,
                        backgroundColor: 'white',
                    }}
                >
                    <option value="">Semua Jenjang</option>
                    {levels.map(level => (
                        <option key={level.slug} value={level.slug}>
                            {level.name}
                        </option>
                    ))}
                </select>

                {selectedLevel && (
                    <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            fontSize: 12,
                            marginBottom: 6,
                            backgroundColor: 'white',
                        }}
                    >
                        <option value="">Semua Kelas</option>
                        {filteredGrades.map(grade => (
                            <option key={grade.id} value={grade.id}>
                                {grade.displayName}
                            </option>
                        ))}
                    </select>
                )}

                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        fontSize: 12,
                        marginBottom: 6,
                        backgroundColor: 'white',
                    }}
                >
                    <option value="">Semua Mata Pelajaran</option>
                    {filteredSubjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                            {subject.name}
                        </option>
                    ))}
                </select>

                {(selectedLevel || selectedGrade || selectedSubject) && (
                    <button
                        onClick={() => {
                            setSelectedLevel('');
                            setSelectedGrade('');
                            setSelectedSubject('');
                        }}
                        style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: '1px solid #ff6b6b',
                            borderRadius: 4,
                            fontSize: 11,
                            backgroundColor: '#fff5f5',
                            color: '#ff6b6b',
                            cursor: 'pointer',
                        }}
                    >
                        🗑️ Hapus Filter
                    </button>
                )}
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
                <ImagesGrid
                    images={templates}
                    getPreview={(template) => template.url}
                    isLoading={isLoading}
                    onSelect={async (template) => {
                        try {
                            const response = await fetch(`/api/templates/${template.id}/load`);
                            if (!response.ok) {
                                throw new Error(`API Error: ${response.status}`);
                            }

                            const result = await response.json();
                            if (result.success && result.data) {
                                store.loadJSON(result.data);
                            } else {
                                alert('Gagal memuat template: ' + (result.message || 'Unknown error'));
                            }
                        } catch (error) {
                            console.error('Error loading template:', error);
                            alert('Terjadi kesalahan saat memuat template: ' + error.message);
                        }
                    }}
                    rowsNumber={2}
                    itemsPerRow={() => 2}
                    loadMore={hasMore ? () => loadTemplatesData(query, page) : undefined}
                />
            </div>
        </div>
    );
});

// ---------- Educational Templates Section Definition ----------
const EducationalTemplatesSection = {
    name: 'educational-templates',
    Tab: (props) => (
        <SectionTab name="Edukasi" {...props}>
            <Icon icon="learning" />
        </SectionTab>
    ),
    Panel: EducationalTemplatesPanel,
};

// ---------- Other Section Definitions ----------
const TemplateUmumSection = {
    name: 'templates',
    Tab: (props) => (
        <SectionTab name="Template Umum" {...props}>
            <Icon icon="document" />
        </SectionTab>
    ),
    Panel: DEFAULT_SECTIONS[0].Panel,
};

const CustomPhotosSection = {
    name: 'photos',
    Tab: (props) => (
        <SectionTab name="Photos" {...props}>
            <Icon icon="media" />
        </SectionTab>
    ),
    Panel: DEFAULT_SECTIONS[2].Panel,
};



const CustomSizeSection = {
    name: 'size',
    Tab: (props) => (
        <SectionTab name="Ukuran" {...props}>
            <Icon icon="fullscreen" />
        </SectionTab>
    ),
    Panel: SizeSection.Panel,
};

// ---------- Admin Controls Section ----------
const AdminControlsSection = (onSave, onPublish, currentDesignId, designTitle) => ({
    name: 'admin-controls',
    Tab: (props) => (
        <SectionTab name="Admin" {...props}>
            <Icon icon="settings" />
        </SectionTab>
    ),
    Panel: observer(({ store }) => {
        // State untuk URL sharing
        const [currentUrl, setCurrentUrl] = React.useState('');
        const [copied, setCopied] = React.useState(false);

        // State untuk Save modal
        const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);
        const [saveName, setSaveName] = React.useState('');
        const [isSaving, setIsSaving] = React.useState(false);

        React.useEffect(() => {
            // Set URL saat komponen dimuat
            setCurrentUrl(window.location.href);
        }, []);

        // Fungsi untuk handle save dengan smart logic
        const handleSaveClick = () => {
            if (currentDesignId) {
                // Existing design - save directly without modal
                onSave(); // Call parent save function directly
            } else {
                // New design - show modal for input name
                setIsSaveModalOpen(true);
                setSaveName(''); // Reset nama
            }
        };

        // Fungsi untuk menyimpan design ke database
        const handleSaveToDatabase = async () => {
            if (!saveName.trim()) {
                alert('Nama design harus diisi!');
                return;
            }

            setIsSaving(true);

            // Add small delay to prevent DOM conflicts
            await new Promise(resolve => setTimeout(resolve, 100));

            try {
                const designData = store.toJSON();

                // Generate thumbnail dengan error handling
                let previewData = null;
                try {
                    // Check if store and canvas are still mounted
                    if (store && store.activePage && document.querySelector('canvas')) {
                        // Wait for canvas to be stable
                        await new Promise(resolve => setTimeout(resolve, 200));

                        previewData = await store.toDataURL({
                            pixelRatio: 1,
                            mimeType: 'image/jpeg',
                            quality: 0.8
                        });
                    }
                } catch (thumbnailError) {
                    console.warn('⚠️ Thumbnail generation failed:', thumbnailError.message);
                    previewData = null; // Continue without thumbnail
                }

                console.log('🚀 Calling parent save with title:', saveName.trim());

                // Panggil onSave callback dengan nama yang diinput user
                if (onSave) {
                    await onSave(saveName.trim());

                    // Tutup modal dan reset form setelah save berhasil
                    setIsSaveModalOpen(false);
                    setSaveName('');
                    console.log('✅ Save callback completed successfully!');
                } else {
                    console.error('❌ onSave callback not provided');
                    alert('Error: Save function not available');
                }
            } catch (error) {
                console.error('Save error:', error);
                alert('Terjadi kesalahan saat menyimpan: ' + error.message);
            } finally {
                setIsSaving(false);
            }
        };

        // Fungsi untuk menyalin teks ke clipboard
        const copyToClipboard = (text) => {
            navigator.clipboard.writeText(text).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        };

        // Fungsi untuk generate QR code URL
        const getQrCodeUrl = (url) => {
            return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
        };

        // Fungsi untuk share ke WhatsApp
        const shareToWhatsApp = (url) => {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent('Check out this design: ' + url)}`;
            window.open(whatsappUrl, '_blank');
        };

        // Fungsi untuk share via Email
        const shareViaEmail = (url) => {
            const subject = 'Check out this design';
            const body = `I thought you might like this design: ${url}`;
            const mailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailUrl;
        };

        // Fungsi untuk generate embed code
        const getEmbedCode = (url) => {
            return `<iframe src="${url}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`;
        };

        // ----------------------------------------------------------
        // REWRITE bagian Admin-Controls Panel saja
        // ----------------------------------------------------------
        // 1.  Hapus seluruh return lama
        // 2.  Ganti dengan return di bawah ini (tinggal copy-paste)

        return (
            <div style={{
                padding: 24,
                height: '100%',
                overflowY: 'auto',
                fontFamily: '"Inter", sans-serif',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: 24
            }}>

                {/* ---------- Aksi Utama ---------- */}
                <section>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px', color: '#0f172a' }}>
                        Aksi Cepat
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* CTA utama → satu-satunya gradien tema */}
                        <button
                            onClick={handleSaveClick}
                            style={{
                                width: '100%',
                                border: 'none',
                                borderRadius: 8,
                                padding: '12px 16px',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#fff',
                                background: 'linear-gradient(135deg, #003d91 0%, #4aa3e8 100%)',
                                boxShadow: '0 2px 6px rgba(0,61,145,.24)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                transition: 'all .2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,61,145,.32)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,61,145,.24)';
                            }}
                        >
                            <Icon icon="save" /> {currentDesignId ? 'Update Design' : 'Save Design'}
                        </button>

                        {/* CTA sekunder → putih + border tema */}
                        <button
                            onClick={() => onPublish?.()}
                            style={{
                                width: '100%',
                                border: '1px solid #003d91',
                                borderRadius: 8,
                                padding: '12px 16px',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#003d91',
                                background: '#ffffff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                transition: 'all .2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f0f7ff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ffffff';
                            }}
                        >
                            <Icon icon="publish" /> Terbitkan Desain
                        </button>
                    </div>
                </section>

                {/* ---------- Bagikan ---------- */}
                <section style={{ borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px', color: '#0f172a' }}>
                        <Icon icon="share" /> Bagikan Desain
                    </h2>

                    {/* Salin Tautan */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        <input
                            value={currentUrl}
                            readOnly
                            style={{
                                flex: 1,
                                padding: '10px 12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: 6,
                                fontSize: 13,
                                background: '#ffffff'
                            }}
                        />
                        <button
                            onClick={() => copyToClipboard(currentUrl)}
                            style={{
                                padding: '10px 14px',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#fff',
                                background: copied ? '#22c55e' : '#64748b',
                                cursor: 'pointer'
                            }}
                        >
                            {copied ? 'Tersalin ✓' : 'Salin'}
                        </button>
                    </div>

                    {/* QR */}
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <img
                            src={getQrCodeUrl(currentUrl)}
                            alt="QR"
                            style={{
                                width: 120,
                                height: 120,
                                border: '1px solid #e2e8f0',
                                borderRadius: 8,
                                background: '#ffffff',
                                padding: 8
                            }}
                        />
                        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b' }}>
                            Scan kode untuk membuka di perangkat lain
                        </p>
                    </div>

                    {/* Tombol Share */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                        <ShareBtn bg="#e2e8f0" color="#0f172a" icon="chat" onClick={() => shareToWhatsApp(currentUrl)}>
                            WhatsApp
                        </ShareBtn>
                        <ShareBtn bg="#e2e8f0" color="#0f172a" icon="mail" onClick={() => shareViaEmail(currentUrl)}>
                            Email
                        </ShareBtn>
                    </div>

                    {/* Embed */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#0f172a' }}>
                            Kode Embed (untuk diletakkan di blog/website)
                        </label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <textarea
                                value={getEmbedCode(currentUrl)}
                                readOnly
                                style={{
                                    flex: 1,
                                    padding: 8,
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontFamily: 'monospace',
                                    background: '#ffffff',
                                    resize: 'vertical',
                                    minHeight: 60
                                }}
                            />
                            <button
                                onClick={() => copyToClipboard(getEmbedCode(currentUrl))}
                                style={{
                                    padding: '8px 12px',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: '#fff',
                                    background: '#64748b',
                                    cursor: 'pointer'
                                }}
                            >
                                Salin
                            </button>
                        </div>
                    </div>
                </section>

                {/* ---------- Preview ---------- */}
                <section style={{ borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px', color: '#0f172a' }}>
                        <Icon icon="visibility" /> Preview
                    </h2>
                    <button
                        onClick={() => window.open(currentUrl, '_blank')}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#ffffff',
                            background: '#4aa3e8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            transition: 'all .2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#003d91';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#4aa3e8';
                        }}
                    >
                        <Icon icon="open_in_full" /> Lihat Layar Penuh
                    </button>
                </section>

                {/* ---------- Tips ---------- */}
                <section style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#e0f2fe', padding: 12, borderRadius: 8 }}>
                        <Icon icon="lightbulb" style={{ color: '#0284c7' }} />
                        <p style={{ margin: 0, fontSize: 12, color: '#0c4a6e' }}>
                            <b>Pro-tip:</b> Gunakan tombol keyboard <kbd>Ctrl + S</kbd> untuk menyimpan lebih cepat.
                        </p>
                    </div>
                </section>

                {/* Modal untuk Save Design */}
                {isSaveModalOpen && createPortal(
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}>
                        <div style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 12,
                            padding: 24,
                            width: '90%',
                            maxWidth: 400,
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08)'
                        }}>
                            <h3 style={{
                                fontSize: 18,
                                fontWeight: 700,
                                margin: '0 0 16px',
                                color: '#0f172a',
                                textAlign: 'center'
                            }}>
                                <Icon icon="save" style={{ marginRight: 8 }} />
                                Simpan Design
                            </h3>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    marginBottom: 6,
                                    color: '#374151'
                                }}>
                                    Nama Design *
                                </label>
                                <input
                                    type="text"
                                    value={saveName}
                                    onChange={(e) => setSaveName(e.target.value)}
                                    placeholder="Masukkan nama design..."
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        fontFamily: 'Inter, sans-serif',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#003d91';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                    }}
                                    disabled={isSaving}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    onClick={() => setIsSaveModalOpen(false)}
                                    disabled={isSaving}
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: '#374151',
                                        backgroundColor: '#ffffff',
                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                        opacity: isSaving ? 0.6 : 1
                                    }}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSaveToDatabase}
                                    disabled={isSaving || !saveName.trim()}
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        border: 'none',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: '#ffffff',
                                        background: (!saveName.trim() || isSaving) ? '#9ca3af' : 'linear-gradient(135deg, #003d91 0%, #4aa3e8 100%)',
                                        cursor: (!saveName.trim() || isSaving) ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8
                                    }}
                                >
                                    {isSaving ? (
                                        <>
                                            <span style={{
                                                width: 16,
                                                height: 16,
                                                border: '2px solid #ffffff',
                                                borderTop: '2px solid transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }} />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="save" />
                                            Simpan
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        );

        /* ---------- Helper components ---------- */
        function ShareBtn({ bg, color, icon, children, onClick }) {
            return (
                <button
                    onClick={onClick}
                    style={{
                        padding: '10px',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: color,
                        background: bg,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'background .2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#cbd5e1')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = bg)}
                >
                    <Icon icon={icon} />
                    {children}
                </button>
            );
        }
    }),
});

// ---------- Back Section ----------
const BackTab = ({ name, isActive, onClick, ...props }) => (
    <div
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Direct navigation without opening panel
            window.location.href = '/admin';
        }}
        className="cursor-pointer flex items-center justify-center transition-all duration-200"
        style={{
            minWidth: '70px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: 'transparent',
            color: '#ffffff',
            borderBottom: '2px solid transparent',
            padding: '8px 12px',
            margin: '4px 8px'
        }}
        onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.borderBottomColor = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.borderBottomColor = 'transparent';
        }}
    >
        <div className="flex flex-col items-center gap-1">
            <Icon icon="arrow-left" style={{ color: '#ffffff' }} />
            <span style={{ color: '#ffffff' }}>Kembali</span>
        </div>
    </div>
);

const BackSection = {
    name: 'back',
    Tab: BackTab,
    Panel: () => null, // This won't be called due to custom Tab behavior
};

// ---------- Main SidePanel Component ----------
const CustomSidePanel = observer(({ store, onSave, onPublish, currentDesignId, designTitle }) => {
    return (
        <div className="side-panel h-full">
            <SidePanel
                store={store}
                sections={[
                    BackSection,
                    EducationalTemplatesSection,
                    TemplateUmumSection,
                    DEFAULT_SECTIONS[1], // Text
                    CustomPhotosSection,
                    ElementsSection, // Grafis only
                    DasarSection, // Bentuk & Garis
                    DEFAULT_SECTIONS[4], // Upload
                    DEFAULT_SECTIONS[5], // Background
                    DEFAULT_SECTIONS[6], // Layers
                    CustomSizeSection,
                    QrSection,
                    AdminControlsSection(onSave, onPublish, currentDesignId, designTitle)
                ].filter(Boolean)}
            />
        </div>
    );
});

export default CustomSidePanel;