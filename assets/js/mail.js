// mail.js
// Handles email generation with professional format

const Mail = {
    generateMailBody(visitor) {
        // Plain text formatted email with structured data
        let body = `Merhaba\n\nAşağıda şoför bilgileri bulunmaktadır\n\n`;
        
        body += `Ad Soyad: ${visitor.name || 'Belirtilmedi'}\n`;
        body += `Firma: ${visitor.company || 'Belirtilmedi'}\n`;
        body += `Tel / TC: ${visitor.phone || 'Belirtilmedi'}\n`;
        body += `Plaka: ${visitor.plate || 'Belirtilmedi'}\n`;
        body += `Container No: ${visitor.container || 'Belirtilmedi'}\n`;
        
        return body;
    },

    sendMail(visitor) {
        const settings = Storage.getSettings();
        const recipients = settings.mailRecipients || '';
        
        if (!recipients.trim()) {
            alert('Lütfen önce Ayarlar sayfasından mail alıcılarını belirleyiniz.');
            return;
        }

        const subject = 'Sevkiyat Bilgisi';
        const body = this.generateMailBody(visitor);
        
        // Enkode et ve mailto linki oluştur
        const mailtoLink = `mailto:${encodeURIComponent(recipients)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Mail istemcisini aç
        window.location.href = mailtoLink;
    }
};
