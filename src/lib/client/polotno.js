// Polotno configuration for Nextacular
export const POLOTNO_CONFIG = {
    key: process.env.NEXT_PUBLIC_POLOTNO_KEY,
    showCredits: false, // Hide watermark if licensed
};

export const initializePolotno = () => {
    if (typeof window !== 'undefined' && !window.polotno) {
        window.polotno = POLOTNO_CONFIG;
    }
};

// Helper functions for design management
export const createNewDesign = () => ({
    pages: [{
        id: 'page1',
        children: [],
        width: 800,
        height: 600,
    }]
});

export const exportDesignToJSON = (store) => {
    return store.toJSON();
};

export const loadDesignFromJSON = (store, jsonData) => {
    store.loadJSON(jsonData);
};

// Save design to localStorage (temporary)
export const saveDesignLocally = (designData, designId = 'current-design') => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(`polotno-design-${designId}`, JSON.stringify(designData));
    }
};

// Load design from localStorage
export const loadDesignLocally = (designId = 'current-design') => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`polotno-design-${designId}`);
        return saved ? JSON.parse(saved) : null;
    }
    return null;
};