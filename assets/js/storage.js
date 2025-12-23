// storage.js
// LocalStorage wrapper with optimized handling for large datasets

const STORE_KEY = 'visitor_app_data';
const SETTINGS_KEY = 'visitor_app_settings';

const Storage = {
    init() {
        if (!localStorage.getItem(STORE_KEY)) {
            localStorage.setItem(STORE_KEY, JSON.stringify([]));
        }
        if (!localStorage.getItem(SETTINGS_KEY)) {
            const defaultSettings = {
                announcementEnabled: false,
                announcementText: 'Hoş geldiniz!',
                announcementSpeed: 15,
                mailRecipients: '',
                mailSubject: 'Sevkiyat Bilgisi',
                mailBody: ''
            };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
        }
    },

    getVisitors() {
        try {
            return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
        } catch (e) {
            console.error('Data corrupted, resetting...', e);
            return [];
        }
    },

    saveVisitors(visitors) {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(visitors));
            return true;
        } catch (e) {
            alert('Depolama alanı doldu veya hata oluştu!');
            console.error(e);
            return false;
        }
    },

    addVisitor(visitor) {
        const visitors = this.getVisitors();
        visitor.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        visitor.entryTime = new Date().toISOString();
        visitor.exitTime = null;
        
        visitors.unshift(visitor);
        this.saveVisitors(visitors);
        return visitor;
    },

    updateVisitor(id, updates) {
        const visitors = this.getVisitors();
        const index = visitors.findIndex(v => v.id === id);
        if (index !== -1) {
            visitors[index] = { ...visitors[index], ...updates };
            this.saveVisitors(visitors);
            return true;
        }
        return false;
    },

    getSettings() {
        try {
            return JSON.parse(localStorage.getItem(SETTINGS_KEY));
        } catch (e) {
            return {};
        }
    },

    saveSettings(settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    },

    clearAll() {
        if (confirm('Tüm kayıtlar silinecek. Emin misiniz?')) {
            localStorage.removeItem(STORE_KEY);
            this.init();
            location.reload();
        }
    }
};

Storage.init();
