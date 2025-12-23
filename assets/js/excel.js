// excel.js
// GERÇEK XLSX TABLO İNDİRME (CSV DEĞİL)

const Excel = {
    exportToCSV(visitors) {
        if (!visitors || visitors.length === 0) {
            alert('Dışa aktarılacak veri yok.');
            return;
        }

        // SheetJS (xlsx) kontrolü
        if (typeof XLSX === 'undefined') {
            alert('Excel kütüphanesi yüklenemedi.');
            return;
        }

        // TABLO VERİSİ
        const data = visitors.map(v => ({
            "Ad Soyad": v.name || '',
            "Firma": v.company || '',
            "Tel / TC": v.phone || '',
            "Container No": v.container || '',
            "Plaka": v.plate || '',
            "Bölüm": v.department || '',
            "Giriş": v.entryTime ? new Date(v.entryTime).toLocaleString('tr-TR') : '',
            "Çıkış": v.exitTime ? new Date(v.exitTime).toLocaleString('tr-TR') : 'İçeride',
            "Kayıt Yapan": v.registrar || ''
        }));

        // Sheet oluştur
        const worksheet = XLSX.utils.json_to_sheet(data);

        // TABLO HALİNE GETİR (Excel içi tablo)
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };

        // Sütun genişlikleri
        worksheet['!cols'] = [
            { wch: 20 }, // Ad Soyad
            { wch: 20 }, // Firma
            { wch: 15 }, // Tel/TC
            { wch: 15 }, // Container
            { wch: 12 }, // Plaka
            { wch: 15 }, // Bölüm
            { wch: 20 }, // Giriş
            { wch: 20 }, // Çıkış
            { wch: 18 }  // Kayıt Yapan
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ziyaretçi Listesi");

        const fileName = `ziyaretci_listesi_${new Date().toLocaleDateString('tr-TR')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    },

    // Excel Yükleme ve Önizleme AYNEN KALIR
    renderPreviewTable(visitors) {
        let html = '<table><thead><tr>';
        html += '<th>Ad Soyad</th><th>Firma</th><th>Tel/TC</th><th>Container No</th><th>Plaka</th><th>Bölüm</th><th>Giriş</th>';
        html += '</tr></thead><tbody>';

        visitors.slice(0, 10).forEach(v => {
            html += '<tr>';
            html += `<td>${v.name}</td>`;
            html += `<td>${v.company || ''}</td>`;
            html += `<td>${v.phone || ''}</td>`;
            html += `<td>${v.container || ''}</td>`;
            html += `<td>${v.plate || ''}</td>`;
            html += `<td>${v.department}</td>`;
            html += `<td>${new Date(v.entryTime).toLocaleString('tr-TR')}</td>`;
            html += '</tr>';
        });

        html += '</tbody></table>';
        return html;
    },

    importFromCSV(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const lines = text.split('\n');
                const newVisitors = [];

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const cols = line.split(',').map(c => c.replace(/^"|"$/g, ''));

                    const visitor = {
                        name: cols[0],
                        company: cols[1],
                        phone: cols[2],
                        container: cols[3],
                        plate: cols[4],
                        department: cols[5] || 'Diğer',
                        entryTime: new Date().toISOString(),
                        exitTime: null,
                        registrar: cols[8]
                    };

                    if (visitor.name) newVisitors.push(visitor);
                }

                callback(newVisitors);
            } catch (err) {
                alert('Excel yükleme hatası: ' + err.message);
                callback([]);
            }
        };
        reader.readAsText(file);
    }
};
