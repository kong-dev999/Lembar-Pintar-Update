
// // src/components/editor/poltnoeditor.js
// import React, { useEffect, useState } from 'react';
// import { observer } from 'mobx-react-lite';
// import { createStore } from 'polotno/model/store';
// import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
// import CustomSidePanel from './SidePanel';
// import { Workspace } from 'polotno/canvas/workspace';
// import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
// import { PagesTimeline } from 'polotno/pages-timeline';
// import Toolbar from './Toolbar';
// import Topbar from './Topbar';
// import { useRouter } from 'next/router';


// // Loading Screen Component (same as AdminPolotnoEditor)
// const LoadingScreen = ({ image }) => (
//     <div className="flex items-center justify-center h-screen bg-gray-100">
//         <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//             <p className="text-gray-600">Memuat editor Polotno...</p>
//             {image && (
//                 <p className="text-sm text-gray-500 mt-2">
//                     Memuat gambar: {image.split('/').pop()}
//                 </p>
//             )}
//         </div>
//     </div>
// );

// const PolotnoEditor = observer(({ userSession, designId, initialData, image: propImage }) => {
//     const [store, setStore] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [currentDesignId, setCurrentDesignId] = useState(designId);
//     const [designTitle, setDesignTitle] = useState('Draft Design');
//     const router = useRouter();
//     const { image: queryImage } = router.query;

//     // Use prop image first, fallback to query image
//     const image = propImage || queryImage;

//     // Debug props received (same as AdminPolotnoEditor)
//     console.log('🎯 PolotnoEditor props received:');
//     console.log('- designId:', designId);
//     console.log('- initialData:', initialData);
//     console.log('- initialData type:', typeof initialData);
//     console.log('- userSession:', userSession);
//     console.log('- image:', image);

//     // ✅ Fungsi translasi Indonesia (tetap pertahankan)
//     const translateToIndonesian = () => {
//         setTimeout(() => {
//             const translations = {
//                 'Templates': 'Template',
//                 'Template': 'Template',
//                 'Text': 'Teks',
//                 'Teks': 'Teks',
//                 'Photos': 'Foto',
//                 'Foto': 'Foto',
//                 'Elements': 'Elemen',
//                 'Elemen': 'Elemen',
//                 'Upload': 'Unggah',
//                 'Background': 'Latar Belakang',
//                 'Layers': 'Lapisan',
//                 'Resize': 'Ubah Ukuran',
//                 'Search...': 'Cari...',
//                 'Search': 'Cari',
//                 'Flip': 'Balik',
//                 'Efek': 'Efek',
//                 'Save': 'Simpan',
//                 'Download': 'Unduh',
//                 'Unduh': 'Unduh',
//                 'Simpan': 'Simpan',
//                 'Undo': 'Batalkan',
//                 'Redo': 'Ulangi',
//                 'Copy': 'Salin',
//                 'Paste': 'Tempel',
//                 'Delete': 'Hapus',
//                 'Duplicate': 'Gandakan',
//                 'Layering': 'Lapisan',
//                 'Forward': 'Maju',
//                 'Backward': 'Mundur',
//                 'To Front': 'Ke Depan',
//                 'To back': 'Ke Belakang',
//                 'Posisi': 'Posisi',
//                 'Position': 'Posisi',
//                 'Align left': 'Rata Kiri',
//                 'Align center': 'Rata Tengah',
//                 'Align right': 'Rata Kanan',
//                 'Align top': 'Rata Atas',
//                 'Align middle': 'Rata Tengah',
//                 'Align bottom': 'Rata Bawah',
//                 'Size': 'Ukuran',
//                 'Width': 'Lebar',
//                 'Height': 'Tinggi',
//                 'Rotation': 'Rotasi',
//                 'Opacity': 'Transparansi',
//                 'Color': 'Warna',
//                 'Font': 'Font',
//                 'Font size': 'Ukuran Font',
//                 'Bold': 'Tebal',
//                 'Italic': 'Miring',
//                 'Underline': 'Garis Bawah',
//                 'Left': 'Kiri',
//                 'Center': 'Tengah',
//                 'Right': 'Kanan',
//                 'Top': 'Atas',
//                 'Middle': 'Tengah',
//                 'Bottom': 'Bawah',
//                 'Show templates with the same size': 'Tampilkan template dengan ukuran yang sama',
//                 'Pages': 'Halaman',
//                 'Add page': 'Tambah Halaman',
//                 'Delete page': 'Hapus Halaman',
//                 'Duplicate page': 'Gandakan Halaman',
//                 'Zoom in': 'Perbesar',
//                 'Zoom out': 'Perkecil',
//                 'Fit to page': 'Sesuaikan Halaman',
//                 'Actual size': 'Ukuran Sebenarnya',
//                 'Fit': 'Sesuaikan',
//                 'My uploads': 'Unggahan Saya',
//                 'Stock photos': 'Foto Stok',
//                 'Graphics': 'Grafik',
//                 'Shapes': 'Bentuk',
//                 'Icons': 'Ikon',
//                 'Lines': 'Garis',
//                 'Frames': 'Bingkai',
//                 'Stickers': 'Stiker',
//                 'Loading...': 'Memuat...',
//                 'Search photos': 'Cari foto',
//                 'Search graphics': 'Cari grafik',
//                 'Add text': 'Tambah Teks',
//                 'Add heading': 'Tambah Judul',
//                 'Add subheading': 'Tambah Sub-judul',
//                 'Add body text': 'Tambah Teks Isi',
//                 'Upload an image': 'Unggah gambar',
//                 'Drop image here': 'Letakkan gambar di sini',
//                 'Browse files': 'Jelajahi file',
//                 'Or drag and drop files': 'Atau seret dan lepas file',
//                 'Solid colors': 'Warna solid',
//                 'Gradients': 'Gradien',
//                 'Images': 'Gambar',
//                 'Blur': 'Blur',
//                 'Brightness': 'Kecerahan',
//                 'Contrast': 'Kontras',
//                 'Saturation': 'Saturasi',
//                 'Filters': 'Filter',
//                 'Effects': 'Efek',
//                 'Shadow': 'Bayangan',
//                 'Stroke': 'Garis tepi',
//                 'Fill': 'Isi',
//                 'Transparency': 'Transparansi',
//                 'Arrange': 'Atur',
//                 'Group': 'Kelompokkan',
//                 'Ungroup': 'Pisahkan grup',
//                 'Lock': 'Kunci',
//                 'Unlock': 'Buka kunci',
//                 'Flip horizontal': 'Balik horizontal',
//                 'Flip vertical': 'Balik vertikal',
//                 'Crop': 'Potong',
//                 'Replace image': 'Ganti gambar',
//                 'Reset image': 'Reset gambar',
//                 'Bring forward': 'Maju ke Depan',
//                 'Send backward': 'Kirim ke Belakang',
//                 'Bring to front': 'Paling Depan',
//                 'Send to back': 'Paling Belakang',
//                 'loading': 'Memuat...',
//                 'error': 'Terjadi kesalahan',
//                 'ok': 'OK',
//                 'OK': 'OK',
//                 'cancel': 'Batal',
//                 'Cancel': 'Batal',
//                 'apply': 'Terapkan',
//                 'Apply': 'Terapkan',
//                 'reset': 'Reset',
//                 'Reset': 'Reset',
//                 'Close': 'Tutup',
//                 'Done': 'Selesai',
//                 'Edit': 'Edit',
//                 'Select': 'Pilih',
//                 'None': 'Tidak ada'
//             };

//             const replaceTextInElement = (element) => {
//                 if (element.nodeType === Node.TEXT_NODE) {
//                     const text = element.textContent.trim();
//                     if (translations[text]) {
//                         element.textContent = translations[text];
//                     }
//                 } else if (element.nodeType === Node.ELEMENT_NODE) {
//                     if (element.title && translations[element.title]) {
//                         element.title = translations[element.title];
//                     }
//                     if (element.placeholder && translations[element.placeholder]) {
//                         element.placeholder = translations[element.placeholder];
//                     }
//                     if (element.getAttribute('aria-label')) {
//                         const ariaLabel = element.getAttribute('aria-label');
//                         if (translations[ariaLabel]) {
//                             element.setAttribute('aria-label', translations[ariaLabel]);
//                         }
//                     }

//                     for (let child of element.childNodes) {
//                         replaceTextInElement(child);
//                     }
//                 }
//             };

//             replaceTextInElement(document.body);

//             const commonSelectors = [
//                 'button', 'span', 'div[role="button"]', 'div[tabindex]',
//                 '.bp4-button', '.bp4-tab', '.bp4-menu-item',
//                 '[data-testid]', '.polotno-side-panel button',
//                 'input[placeholder]',
//                 '.side-panel button', '.side-panel span',
//                 '.polotno-toolbar button', '.polotno-toolbar span',
//                 '[aria-label]',
//                 '.bp4-popover-content button', '.bp4-popover-content span',
//                 '.layering-panel span', '.position-panel span',
//                 '.bp4-control .bp4-control-indicator + span',
//                 '.bp4-tab-list .bp4-tab',
//                 '.polotno-workspace button', '.zoom-buttons button',
//                 '.pages-timeline button'
//             ];

//             commonSelectors.forEach(selector => {
//                 const elements = document.querySelectorAll(selector);
//                 elements.forEach(element => {
//                     if (element.placeholder && translations[element.placeholder]) {
//                         element.placeholder = translations[element.placeholder];
//                     }

//                     if (element.getAttribute('aria-label')) {
//                         const ariaLabel = element.getAttribute('aria-label');
//                         if (translations[ariaLabel]) {
//                             element.setAttribute('aria-label', translations[ariaLabel]);
//                         }
//                     }

//                     if (element.childNodes.length === 1 && element.firstChild.nodeType === Node.TEXT_NODE) {
//                         const text = element.textContent.trim();
//                         if (translations[text]) {
//                             element.textContent = translations[text];
//                         }
//                     }

//                     if (element.tagName === 'BUTTON' && element.textContent.trim() && translations[element.textContent.trim()]) {
//                         element.textContent = translations[element.textContent.trim()];
//                     }
//                 });
//             });

//             const checkboxLabels = document.querySelectorAll('.bp4-control .bp4-control-indicator + span');
//             checkboxLabels.forEach(label => {
//                 const text = label.textContent.trim();
//                 if (translations[text]) {
//                     label.textContent = translations[text];
//                 }
//             });

//         }, 200);
//     };

//     // ✅ Initialize native keyboard support
//     useEffect(() => {
//         if (typeof window !== 'undefined') {
//             // Native keyboard support initialized
//         }
//     }, []);

//     // ✅ Inisialisasi store
//     useEffect(() => {
//         const newStore = createStore({
//             key: process.env.NEXT_PUBLIC_POLOTNO_KEY,
//             showCredit: false,
//             translations: {
//                 id: {
//                     'sidePanel.templates': 'Template',
//                     'sidePanel.text': 'Teks',
//                     'sidePanel.photos': 'Foto',
//                     'sidePanel.elements': 'Elemen',
//                     'sidePanel.upload': 'Unggah',
//                     'sidePanel.background': 'Latar Belakang',
//                     'sidePanel.layers': 'Lapisan',
//                     'sidePanel.resize': 'Ubah Ukuran',
//                     'templates': 'Template',
//                     'text': 'Teks',
//                     'photos': 'Foto',
//                     'elements': 'Elemen',
//                     'upload': 'Unggah',
//                     'background': 'Latar Belakang',
//                     'layers': 'Lapisan',
//                     'resize': 'Ubah Ukuran',
//                     'save': 'Simpan',
//                     'download': 'Unduh',
//                     'undo': 'Batalkan',
//                     'redo': 'Ulangi',
//                     'copy': 'Salin',
//                     'paste': 'Tempel',
//                     'delete': 'Hapus',
//                     'duplicate': 'Gandakan',
//                     'position': 'Posisi',
//                     'size': 'Ukuran',
//                     'rotation': 'Rotasi',
//                     'opacity': 'Transparansi',
//                     'color': 'Warna',
//                     'font': 'Font',
//                     'fontSize': 'Ukuran Font',
//                     'fontWeight': 'Ketebalan Font',
//                     'textAlign': 'Perataan Teks',
//                     'lineHeight': 'Tinggi Baris',
//                     'bringForward': 'Maju ke Depan',
//                     'sendBackward': 'Kirim ke Belakang',
//                     'bringToFront': 'Paling Depan',
//                     'sendToBack': 'Paling Belakang',
//                     'pages': 'Halaman',
//                     'addPage': 'Tambah Halaman',
//                     'deletePage': 'Hapus Halaman',
//                     'duplicatePage': 'Gandakan Halaman',
//                     'zoomIn': 'Perbesar',
//                     'zoomOut': 'Perkecil',
//                     'fitToPage': 'Sesuaikan Halaman',
//                     'actualSize': 'Ukuran Sebenarnya',
//                     'width': 'Lebar',
//                     'height': 'Tinggi',
//                     'loading': 'Memuat...',
//                     'error': 'Terjadi kesalahan',
//                     'ok': 'OK',
//                     'cancel': 'Batal',
//                     'apply': 'Terapkan',
//                     'reset': 'Reset'
//                 }
//             },
//             language: 'id'
//         });

//         setStore(newStore);
//         newStore.addPage();

//         if (newStore.setLanguage) {
//             newStore.setLanguage('id');
//         }

//         // Initialize history tracking
//         setTimeout(() => {
//             if (newStore.activePage) {
//                 newStore.activePage.set({ name: newStore.activePage.name || 'Page 1' });
//             }
//         }, 100);

//         setLoading(false);
//     }, []);

//     // ✅ Add initialData loading (same as AdminPolotnoEditor)
//     useEffect(() => {
//         if (!store) return;

//         const loadDesign = async () => {
//             console.log('=== PolotnoEditor loadDesign START ===');
//             console.log('initialData received:', initialData);
//             console.log('initialData type:', typeof initialData);

//             if (initialData) {
//                 try {
//                     console.log('Processing initialData...');

//                     // Check if initialData is valid Polotno JSON
//                     if (initialData && typeof initialData === 'object') {
//                         if (initialData.pages && Array.isArray(initialData.pages)) {
//                             console.log('Valid Polotno JSON structure detected');
//                             console.log('Pages count:', initialData.pages.length);

//                             // Load JSON into store
//                             store.loadJSON(initialData);
//                             await store.waitLoading();

//                             console.log('✅ Design loaded successfully into Polotno!');
//                         } else {
//                             console.error('❌ Invalid Polotno JSON structure - missing pages array');
//                             console.log('Expected: { pages: [...] }');
//                             console.log('Received:', Object.keys(initialData));
//                             store.addPage();
//                         }
//                     } else {
//                         console.error('❌ initialData is not a valid object');
//                         store.addPage();
//                     }
//                 } catch (error) {
//                     console.error('❌ Error loading design into Polotno:', error);
//                     console.error('Error details:', error.message);
//                     store.addPage();
//                 }
//             } else {
//                 console.log('No initialData provided, creating blank page');
//                 store.addPage();
//             }

//             if (image) {
//                 console.log('Loading additional image:', image);
//                 loadImageToCanvas(image);
//             }

//             console.log('=== PolotnoEditor loadDesign END ===');
//         };

//         loadDesign();
//     }, [store, initialData, image]);

//     // ✅ Image loading function (same as AdminPolotnoEditor)
//     const loadImageToCanvas = async (src) => {
//         try {
//             const url = decodeURIComponent(src);
//             await new Promise((res, rej) => {
//                 const img = new Image();
//                 img.crossOrigin = 'anonymous';
//                 img.onload = res;
//                 img.onerror = rej;
//                 img.src = url;
//             });
//             store.activePage.addElement({ type: 'image', src: url, x: 50, y: 50, width: 200, height: 200 });
//         } catch {
//             store.activePage.addElement({ type: 'text', text: 'Gagal memuat gambar.', x: 50, y: 50, fontSize: 14, fill: '#ff4757' });
//         }
//     };
//     // ✅ Replace Photos by text function
//     const replacePhotosText = () => {
//         setTimeout(() => {
//             // Find and replace "Photos by" text in photos section
//             const photosElements = document.querySelectorAll('.side-panel [role="tabpanel"] *');
//             photosElements.forEach(element => {
//                 if (element.textContent && element.textContent.includes('Photos by')) {
//                     element.textContent = element.textContent.replace(/Photos by.*/g, 'Semua Foto');
//                 }
//             });
//         }, 100);
//     };

//     // ✅ Terapkan translasi Indonesia
//     useEffect(() => {
//         if (!store) return;

//         translateToIndonesian();
//         replacePhotosText();

//         const intervalId = setInterval(() => {
//             translateToIndonesian();
//             replacePhotosText();
//         }, 1000);

//         const observer = new MutationObserver((mutations) => {
//             let shouldTranslate = false;
//             mutations.forEach((mutation) => {
//                 if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
//                     shouldTranslate = true;
//                 }
//                 if (mutation.type === 'characterData') {
//                     shouldTranslate = true;
//                 }
//             });

//             if (shouldTranslate) {
//                 setTimeout(() => {
//                     translateToIndonesian();
//                     replacePhotosText();
//                 }, 100);
//             }
//         });

//         observer.observe(document.body, {
//             childList: true,
//             subtree: true,
//             characterData: true
//         });

//         return () => {
//             clearInterval(intervalId);
//             observer.disconnect();
//         };
//     }, [store]);


//     // ✅ Add handleSave function (exactly same as AdminPolotnoEditor)
//     const handleSave = async () => {
//         try {
//             const designData = store.toJSON();
//             const previewData = await store.toDataURL(); // Generate preview for thumbnail
//             const title = designTitle || `Design ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

//             const response = await fetch('/api/designs/save', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     data: designData,
//                     title: title,
//                     description: 'User draft design',
//                     designId: currentDesignId,
//                     workspaceId: null, // Will use default in API
//                     preview: previewData // Add preview for thumbnail
//                 }),
//             });

//             const result = await response.json();

//             if (result.success) {
//                 if (!currentDesignId) {
//                     setCurrentDesignId(result.design.id);
//                 }
//                 alert(`Design berhasil ${currentDesignId ? 'diperbarui' : 'disimpan'} sebagai draft.`);
//             } else {
//                 alert(`Gagal menyimpan design: ${result.message}`);
//             }
//         } catch (error) {
//             console.error('Error saving design:', error);
//             alert('Gagal menyimpan design.');
//         }
//     };

//     // Polotno native keyboard shortcuts handling (same as AdminPolotnoEditor)
//     useEffect(() => {
//         if (!store) return;

//         // Setting up keyboard shortcuts for store

//         // Let Polotno handle its own keyboard shortcuts natively
//         // Just ensure the workspace can receive focus
//         const ensureFocus = () => {
//             setTimeout(() => {
//                 const canvas = document.querySelector('canvas');
//                 const workspace = document.querySelector('.polotno-workspace') ||
//                     document.querySelector('[data-polotno="workspace"]') ||
//                     canvas;

//                 if (workspace && workspace.tabIndex === undefined) {
//                     workspace.tabIndex = 0;
//                     workspace.focus();
//                 }
//             }, 100);
//         };

//         ensureFocus();

//         // Listen for store changes to monitor keyboard shortcuts
//         const handleStoreChange = () => {
//             // Store changed - shortcuts should be active
//         };

//         // Monitor store for changes
//         if (store.on) {
//             store.on('change', handleStoreChange);
//         }

//         return () => {
//             if (store.off) {
//                 store.off('change', handleStoreChange);
//             }
//         };
//     }, [store]);

//     if (loading) return <LoadingScreen image={image} />;

//     return (
//         <>
//             <link
//                 rel="stylesheet"
//                 href="https://unpkg.com/@blueprintjs/core@5/lib/css/blueprint.css"
//             />
//             <link
//                 href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
//                 rel="stylesheet"
//             />

//             <div className="polotno-editor-container flex flex-col h-screen w-screen overflow-hidden">
//                 <Topbar />
//                 <PolotnoContainer className="flex flex-grow overflow-hidden">
//                     <SidePanelWrap>
//                         <CustomSidePanel store={store} onSave={handleSave} userSession={userSession} />
//                     </SidePanelWrap>
//                     <WorkspaceWrap>
//                         <Toolbar store={store} />
//                         <Workspace
//                             store={store}
//                         />
//                         <div className="zoom">
//                             <ZoomButtons store={store} />
//                         </div>
//                         <div className="pages">
//                             <PagesTimeline store={store} />
//                         </div>
//                     </WorkspaceWrap>
//                 </PolotnoContainer>
//             </div>
//         </>
//     );
// });

// export default PolotnoEditor;

// src/components/editor/PolotnoEditor.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { createStore } from 'polotno/model/store';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import CustomSidePanel from './SidePanel';
import { Workspace } from 'polotno/canvas/workspace';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { PagesTimeline } from 'polotno/pages-timeline';
import Toolbar from './Toolbar';
import Topbar from './Topbar';
import { useRouter } from 'next/router';

const LoadingScreen = ({ image }) => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Memuat editor Polotno...</p>
            {image && <p className="text-sm text-gray-500 mt-2">Memuat gambar: {image.split('/').pop()}</p>}
        </div>
    </div>
);

const PolotnoEditor = observer(({ userSession, designId, initialData, image: propImage, workspaceId }) => {
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentDesignId, setCurrentDesignId] = useState(designId);
    const [designTitle] = useState('Draft Design');
    const [workspaceReady, setWorkspaceReady] = useState(false);

    const router = useRouter();
    const { image: queryImage } = router.query;
    const image = propImage || queryImage;

    const isMounted = useRef(false);
    const isSavingRef = useRef(false);

    // ---------- inisialisasi store ----------
    useEffect(() => {
        const newStore = createStore({
            key: process.env.NEXT_PUBLIC_POLOTNO_KEY,
            showCredit: false,
            language: 'id',
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
            }
        });

        setStore(newStore);
        if (newStore.setLanguage) newStore.setLanguage('id');
        setLoading(false);
    }, []);

    // ---------- load data & image ----------
    useEffect(() => {
        if (!store) return;

        const loadDesign = async () => {
            if (initialData?.pages?.length) {
                try {
                    store.loadJSON(initialData);
                    await store.waitLoading();
                } catch {
                    store.addPage();
                }
            } else {
                store.addPage();
            }

            if (image) {
                try {
                    const url = decodeURIComponent(image);
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
                    store.activePage.addElement({ type: 'image', src: url, x: 50, y: 50, width: 200, height: 200 });
                } catch {
                    store.activePage.addElement({ type: 'text', text: 'Gagal memuat gambar.', x: 50, y: 50, fontSize: 14, fill: '#ff4757' });
                }
            }
        };

        loadDesign();

        // bersihkan store saat unmount (hindari canvas ganda)
        return () => {
            if (store) {
                store.clear();
                store.history.clear();
            }
        };
    }, [store, initialData, image]);

    // ---------- siapkan workspace ----------
    useEffect(() => {
        if (!store) return;
        const t = setTimeout(() => setWorkspaceReady(true), 600);
        return () => clearTimeout(t);
    }, [store]);

    // ---------- hot-key ----------
    useEffect(() => {
        const onKey = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); } };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // ---------- handleSave ----------
    const handleSave = useCallback(async () => {
        if (!store || !workspaceReady || isSavingRef.current) return;
        isSavingRef.current = true;
        try {
            const designData = store.toJSON();
            let previewData = null;
            if (document.querySelector('canvas')) {
                try {
                    previewData = await store.toDataURL({ pixelRatio: 1, mimeType: 'image/jpeg', quality: 0.8 });
                } catch (e) {
                    console.warn('thumbnail gagal', e.message);
                }
            }
            const title = designTitle || `Design ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
            const body = JSON.stringify({
                data: designData,
                title,
                description: 'User draft design',
                designId: currentDesignId,
                workspaceId: workspaceId || null,
                preview: previewData
            });
            const res = await fetch('/api/designs/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
            const result = await res.json();
            if (result.success) {
                if (!currentDesignId) setCurrentDesignId(result.design.id);
                alert('Design berhasil disimpan!');
            } else {
                alert(`Gagal menyimpan: ${result.message}`);
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan saat menyimpan.');
        } finally {
            isSavingRef.current = false;
        }
    }, [store, workspaceReady, currentDesignId, workspaceId, designTitle]);

    if (loading || !store) return <LoadingScreen image={image} />;

    return (
        <>
            <link rel="stylesheet" href="https://unpkg.com/@blueprintjs/core@5/lib/css/blueprint.css" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            <div className="polotno-editor-container flex flex-col h-screen w-screen overflow-hidden">
                <Topbar />
                <PolotnoContainer className="flex flex-grow overflow-hidden">
                    <SidePanelWrap>
                        <CustomSidePanel store={store} onSave={handleSave} userSession={userSession} />
                    </SidePanelWrap>
                    <WorkspaceWrap>
                        <Toolbar store={store} />
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
        </>
    );
});

export default PolotnoEditor;