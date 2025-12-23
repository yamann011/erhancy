// excel.js
// Handles CSV Import/Export with tablo view

const Excel = {
    exportToCSV(visitors) {
        if (!visitors || visitors.length === 0) {
            alert('Dışa aktarılacak veri yok.');
            return;
        }

        const headers = ['Ad Soyad', 'Firma', 'Tel/TC', 'Container No', 'Plaka', 'Bölüm', 'Giriş', 'Çıkış', 'Kayıt Yapan'];
        
        const rows = visitors.map(v => [
            `"${v.name}"`,
            `"${v.company || ''}"`,
            `"${v.phone || ''}"`,
            `"${v.container || ''}"`,
            `"${v.plate || ''}"`,
            `"${v.department}"`,
            new Date(v.entryTime).toLocaleString('tr-TR'),
            v.exitTime ? new Date(v.exitTime).toLocaleString('tr-TR') : 'İçeride',
            `"${v.registrar || ''}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `ziyaretci_listesi_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    // Render preview tablo şeklinde
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
        
        if (visitors.length > 10) {
            html += `<p style="text-align:center; color: var(--accent-color); margin-top: 1rem;">...ve ${visitors.length - 10} kayıt daha</p>`;
        }
        
        return html;
    },

    importFromCSV(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const lines = text.split('\n');
                const newVisitors = [];
                
                // Skip header (i=1) ve process per 50 kayıt (performance)
                for (let i = 1; i < lines.length; i += 1) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    
                    const cols = line.split(',').map(c => c.replace(/^"|"$/g, ''));
                    
                    if (cols.length < 5) continue;

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

                    if (visitor.name) {
                        newVisitors.push(visitor);
                    }
                }
                
                callback(newVisitors);
            } catch (err) {
                alert('Excel yükleme sırasında hata: ' + err.message);
                callback([]);
            }
        };
        reader.readAsText(file);
    }
};
