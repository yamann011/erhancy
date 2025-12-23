// app.js
// Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
    const state = {
        currentPage: 'dashboard',
        visitors: [],
        filteredVisitors: [],
        itemsPerPage: 25,
        page: 1
    };

    // Navigation
    const navLinks = document.querySelectorAll('.nav-links li');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const target = link.dataset.page;
            switchPage(target);
        });
    });

    function switchPage(pageName) {
        state.currentPage = pageName;
        
        navLinks.forEach(l => l.classList.remove('active'));
        document.querySelector(`.nav-links li[data-page="${pageName}"]`)?.classList.add('active');

        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(pageName).classList.add('active');

        loadData();
        renderCurrentView();
    }

    function loadData() {
        state.visitors = Storage.getVisitors();
    }

    function renderCurrentView() {
        switch (state.currentPage) {
            case 'dashboard':
                renderDashboard();
                break;
            case 'register':
                renderRegister();
                break;
            case 'visitors':
                renderVisitors();
                break;
            case 'settings':
                renderSettings();
                break;
        }
    }

    // === DASHBOARD ===
    function renderDashboard() {
        const visitors = state.visitors;
        const inside = visitors.filter(v => !v.exitTime);
        
        document.getElementById('stat-inside').textContent = inside.length;
        document.getElementById('stat-yanici').textContent = inside.filter(v => v.department === 'Yanıcı Depo').length;
        document.getElementById('stat-hammadde').textContent = inside.filter(v => v.department === 'Hammadde').length;
        document.getElementById('stat-diger').textContent = inside.filter(v => v.department === 'Diğer').length;

        const insideListEl = document.getElementById('dashboard-inside-list');
        const displayInside = inside.slice(0, 10);
        
        let html = displayInside.map(v => `
            <tr>
                <td>${v.name}</td>
                <td>${v.company || '-'}</td>
                <td>${v.department}</td>
                <td>${formatTime(v.entryTime)}</td>
            </tr>
        `).join('');

        if (inside.length > 10) {
            html += `<tr><td colspan="4" style="text-align:center; color: var(--accent-color);">...ve ${inside.length - 10} kişi daha</td></tr>`;
        }
        
        if (inside.length === 0) {
            html = '<tr><td colspan="4">İçeride kimse yok.</td></tr>';
        }

        insideListEl.innerHTML = html;

        const recent = visitors.slice(0, 5);
        const recentListEl = document.getElementById('dashboard-recent-list');
        recentListEl.innerHTML = recent.map(v => `
            <tr>
                <td>${v.name}</td>
                <td><span style="color: ${v.exitTime ? 'var(--text-color)' : 'var(--success-color)'}">${v.exitTime ? 'Çıktı' : 'İçeride'}</span></td>
                <td>${formatDate(v.entryTime)}</td>
            </tr>
        `).join('');
    }

    // === REGISTER with AUTOCOMPLETE ===
    const regTimeInput = document.getElementById('reg-time');
    const regNameInput = document.getElementById('reg-name');
    const regPlateInput = document.getElementById('reg-plate');
    const plateWarning = document.getElementById('plate-warning');
    const suggestionsNameBox = document.getElementById('suggestions-name');
    const suggestionsPlateBox = document.getElementById('suggestions-plate');

    function renderRegister() {
        updateTime();
        if (!window.regTimer) {
            window.regTimer = setInterval(updateTime, 1000);
        }
    }

    function updateTime() {
        if (state.currentPage === 'register') {
            regTimeInput.value = new Date().toLocaleString('tr-TR');
        } else {
            clearInterval(window.regTimer);
            window.regTimer = null;
        }
    }

    // Auto-suggestions for Name
    regNameInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().toLowerCase();
        suggestionsNameBox.innerHTML = '';
        
        if (val.length < 2) {
            suggestionsNameBox.classList.remove('active');
            return;
        }

        const matches = state.visitors.filter(v => 
            v.name.toLowerCase().includes(val)
        ).slice(0, 5);

        if (matches.length === 0) {
            suggestionsNameBox.classList.remove('active');
            return;
        }

        matches.forEach(v => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = `${v.name}${v.plate ? ` (${v.plate})` : ''}`;
            item.addEventListener('click', () => {
                fillFormFromVisitor(v);
                suggestionsNameBox.classList.remove('active');
            });
            suggestionsNameBox.appendChild(item);
        });

        suggestionsNameBox.classList.add('active');
    });

    // Auto-suggestions for Plate
    regPlateInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().toUpperCase();
        suggestionsPlateBox.innerHTML = '';
        
        if (val.length < 2) {
            suggestionsPlateBox.classList.remove('active');
            plateWarning.textContent = '';
            return;
        }

        // Check if plate is already inside
        const insideMatch = state.visitors.find(v => !v.exitTime && v.plate === val);
        if (insideMatch) {
            plateWarning.textContent = '⚠ Dikkat: Bu plaka şu an içeride görünüyor!';
        } else {
            plateWarning.textContent = '';
        }

        const matches = state.visitors.filter(v => 
            v.plate && v.plate.toUpperCase().includes(val)
        ).slice(0, 5);

        if (matches.length === 0) {
            suggestionsPlateBox.classList.remove('active');
            return;
        }

        matches.forEach(v => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = `${v.plate} - ${v.name}`;
            item.addEventListener('click', () => {
                fillFormFromVisitor(v);
                suggestionsPlateBox.classList.remove('active');
            });
            suggestionsPlateBox.appendChild(item);
        });

        suggestionsPlateBox.classList.add('active');
    });

    // Fill form with visitor data
    function fillFormFromVisitor(visitor) {
        document.getElementById('reg-name').value = visitor.name;
        document.getElementById('reg-company').value = visitor.company || '';
        document.getElementById('reg-phone').value = visitor.phone || '';
        document.getElementById('reg-container').value = visitor.container || '';
        document.getElementById('reg-plate').value = visitor.plate || '';
        document.getElementById('reg-department').value = visitor.department || 'Diğer';
        document.getElementById('reg-registrar').value = visitor.registrar || '';
        
        suggestionsNameBox.classList.remove('active');
        suggestionsPlateBox.classList.remove('active');
        plateWarning.textContent = '';
    }

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.form-group-with-suggestions')) {
            suggestionsNameBox.classList.remove('active');
            suggestionsPlateBox.classList.remove('active');
        }
    });

    document.getElementById('visitor-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newVisitor = {
            name: document.getElementById('reg-name').value.trim(),
            company: document.getElementById('reg-company').value.trim(),
            phone: document.getElementById('reg-phone').value.trim(),
            container: document.getElementById('reg-container').value.trim(),
            plate: document.getElementById('reg-plate').value.trim().toUpperCase(),
            department: document.getElementById('reg-department').value,
            registrar: document.getElementById('reg-registrar').value.trim()
        };

        if (!newVisitor.name) {
            alert('Ad Soyad zorunlu alandır.');
            return;
        }

        Storage.addVisitor(newVisitor);
        alert('Giriş kaydedildi.');
        e.target.reset();
        switchPage('dashboard');
    });

    // === VISITORS LIST ===
    const searchInput = document.getElementById('search-input');
    const filterToday = document.getElementById('filter-today');
    const filterInside = document.getElementById('filter-inside');
    const btnNext = document.getElementById('next-page');
    const btnPrev = document.getElementById('prev-page');

    function renderVisitors() {
        let list = state.visitors;
        
        const term = searchInput.value.toLowerCase();
        if (term) {
            list = list.filter(v => 
                v.name.toLowerCase().includes(term) || 
                (v.plate && v.plate.toLowerCase().includes(term)) ||
                (v.company && v.company.toLowerCase().includes(term)) ||
                (v.phone && v.phone.toLowerCase().includes(term)) ||
                (v.container && v.container.toLowerCase().includes(term))
            );
        }

        if (filterToday.checked) {
            const today = new Date().toDateString();
            list = list.filter(v => new Date(v.entryTime).toDateString() === today);
        }

        if (filterInside.checked) {
            list = list.filter(v => !v.exitTime);
        }

        state.filteredVisitors = list;
        
        const totalPages = Math.ceil(list.length / state.itemsPerPage) || 1;
        if (state.page > totalPages) state.page = totalPages;
        if (state.page < 1) state.page = 1;

        document.getElementById('page-info').textContent = `Sayfa ${state.page} / ${totalPages}`;
        
        const start = (state.page - 1) * state.itemsPerPage;
        const end = start + state.itemsPerPage;
        const pageData = list.slice(start, end);

        const tbody = document.getElementById('visitors-table-body');
        tbody.innerHTML = pageData.map(v => `
            <tr>
                <td>${v.name}</td>
                <td>${v.company || ''}</td>
                <td>${v.phone || ''}</td>
                <td>${v.container || ''}</td>
                <td>${v.plate || ''}</td>
                <td>${v.department}</td>
                <td>${formatTime(v.entryTime)}</td>
                <td>${v.exitTime ? formatTime(v.exitTime) : '<button class="btn-sm btn-danger btn-exit" data-id="'+v.id+'">Çıkış</button>'}</td>
                <td>${v.registrar || ''}</td>
                <td>
                    <button class="btn-sm btn-secondary btn-mail" data-id="${v.id}">Mail</button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.btn-exit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                if (confirm('Çıkış işlemi yapılsın mı? Geri alınamaz.')) {
                    Storage.updateVisitor(id, { exitTime: new Date().toISOString() });
                    loadData();
                    renderVisitors();
                }
            });
        });

        document.querySelectorAll('.btn-mail').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const v = state.visitors.find(x => x.id === id);
                if (v) Mail.sendMail(v);
            });
        });
    }

    let timeout = null;
    searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            state.page = 1;
            renderVisitors();
        }, 300);
    });

    filterToday.addEventListener('change', () => { state.page = 1; renderVisitors(); });
    filterInside.addEventListener('change', () => { state.page = 1; renderVisitors(); });

    btnNext.addEventListener('click', () => {
        const totalPages = Math.ceil(state.filteredVisitors.length / state.itemsPerPage);
        if (state.page < totalPages) {
            state.page++;
            renderVisitors();
        }
    });

    btnPrev.addEventListener('click', () => {
        if (state.page > 1) {
            state.page--;
            renderVisitors();
        }
    });

    // Excel Export
    document.getElementById('btn-excel-export').addEventListener('click', () => {
        Excel.exportToCSV(state.filteredVisitors);
        alert('Excel dosyası indirildi.');
    });

    // Excel Import
    document.getElementById('excel-import').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            if(confirm("Excel verisi yüklenecek ve tablo şeklinde gösterilecektir. Kabul ediyor musunuz?")) {
                showLoading(true);
                
                setTimeout(() => {
                    Excel.importFromCSV(e.target.files[0], (newVisitors) => {
                        showLoading(false);
                        
                        if (newVisitors.length === 0) {
                            alert('Geçerli veri bulunamadı.');
                            return;
                        }

                        const previewDiv = document.getElementById('excel-preview');
                        const previewContainer = document.getElementById('excel-preview-container');
                        previewContainer.innerHTML = Excel.renderPreviewTable(newVisitors);
                        previewDiv.style.display = 'block';

                        if (confirm(`${newVisitors.length} kayıt içeri aktarılacak. Onaylıyor musunuz?`)) {
                            newVisitors.forEach(v => Storage.addVisitor(v));
                            alert(`${newVisitors.length} kayıt başarıyla eklendi.`);
                            loadData();
                            renderVisitors();
                            previewDiv.style.display = 'none';
                        }
                    });
                }, 100);
            }
            e.target.value = '';
        }
    });

    // === SETTINGS ===
    function renderSettings() {
        const settings = Storage.getSettings();
        
        // Announcement settings
        document.getElementById('setting-announcement-enabled').checked = settings.announcementEnabled || false;
        document.getElementById('setting-announcement-text').value = settings.announcementText || 'Hoş geldiniz!';
        document.getElementById('setting-announcement-speed').value = settings.announcementSpeed || 15;
        updateAnnouncementStatus();
        
        // Mail settings
        document.getElementById('setting-mail-recipients').value = settings.mailRecipients || '';
        document.getElementById('setting-mail-subject').value = settings.mailSubject || 'Sevkiyat Bilgisi';
        document.getElementById('setting-mail-body').value = settings.mailBody || '';
    }

    // Announcement toggle
    document.getElementById('setting-announcement-enabled').addEventListener('change', () => {
        updateAnnouncementStatus();
    });

    function updateAnnouncementStatus() {
        const enabled = document.getElementById('setting-announcement-enabled').checked;
        const status = document.getElementById('announcement-status');
        status.textContent = enabled ? 'Açık' : 'Kapalı';
        status.style.color = enabled ? 'var(--success-color)' : '#bbb';
    }

    document.getElementById('save-announcement-settings').addEventListener('click', () => {
        const settings = Storage.getSettings();
        settings.announcementEnabled = document.getElementById('setting-announcement-enabled').checked;
        settings.announcementText = document.getElementById('setting-announcement-text').value;
        settings.announcementSpeed = parseInt(document.getElementById('setting-announcement-speed').value);
        Storage.saveSettings(settings);
        updateAnnouncement();
        alert('Duyuru ayarları kaydedildi.');
    });

    document.getElementById('save-settings').addEventListener('click', () => {
        const settings = Storage.getSettings();
        settings.mailRecipients = document.getElementById('setting-mail-recipients').value;
        settings.mailSubject = document.getElementById('setting-mail-subject').value;
        settings.mailBody = document.getElementById('setting-mail-body').value;
        Storage.saveSettings(settings);
        alert('Mail ayarları kaydedildi.');
    });

    document.getElementById('clear-all-data').addEventListener('click', () => {
        Storage.clearAll();
    });

    // Announcement management
    function updateAnnouncement() {
        const settings = Storage.getSettings();
        const banner = document.getElementById('announcement-banner');
        const announcementText = document.getElementById('announcement-text');
        
        if (settings.announcementEnabled) {
            banner.style.display = 'block';
            announcementText.textContent = settings.announcementText || 'Hoş geldiniz!';
            const speed = (settings.announcementSpeed || 15);
            announcementText.style.animationDuration = speed + 's';
            announcementText.classList.remove('paused');
        } else {
            banner.style.display = 'none';
            announcementText.classList.add('paused');
        }
    }

    // Helpers
    function formatTime(isoStr) {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    
    function formatDate(isoStr) {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        return d.toLocaleDateString('tr-TR');
    }

    function showLoading(show) {
        const indicator = document.getElementById('loading-indicator');
        if (show) {
            indicator.style.display = 'flex';
        } else {
            indicator.style.display = 'none';
        }
    }

    // Initial Load
    loadData();
    updateAnnouncement();
    switchPage('dashboard');
});
