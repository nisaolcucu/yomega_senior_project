const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// HTML template'i oku ve değişkenleri değiştir
// HTML template'i oku ve değişkenleri değiştir
const fillTemplate = (userData) => {
    const templatePath = path.join(__dirname, '../templates/membership-form-template.html');
    let html = fs.readFileSync(templatePath, 'utf-8');

    // Değişkenleri değiştir
    html = html.replace(/{{name}}/g, userData.name || '');
    html = html.replace(/{{surname}}/g, userData.surname || '');
    html = html.replace(/{{fatherName}}/g, userData.fatherName || '');
    html = html.replace(/{{motherName}}/g, userData.motherName || '');
    html = html.replace(/{{birthPlace}}/g, userData.birthPlace || '');
    html = html.replace(/{{birthDate}}/g, userData.birthDate ? new Date(userData.birthDate).toLocaleDateString('tr-TR') : '');
    html = html.replace(/{{tcNo}}/g, userData.tcNo || '');
    html = html.replace(/{{profession}}/g, userData.profession || userData.department || '');
    html = html.replace(/{{bloodType}}/g, userData.bloodType || '');
    html = html.replace(/{{homePhone}}/g, userData.homePhone || '');
    html = html.replace(/{{workPhone}}/g, userData.workPhone || '');
    html = html.replace(/{{phone}}/g, userData.phone || '');
    html = html.replace(/{{email}}/g, userData.email || '');
    html = html.replace(/{{educationLevel}}/g, userData.educationLevel || userData.university || '');
    html = html.replace(/{{registeredAddress}}/g,
        [userData.registeredCity, userData.registeredDistrict, userData.registeredNeighborhood]
            .filter(x => x).join(' / ') || ''
    );
    html = html.replace(/{{residenceAddress}}/g, userData.residenceAddress || '');
    html = html.replace(/{{workAddress}}/g, userData.workAddress || '');

    return html;
};
// PDF oluştur
const generateMembershipPDF = async (userData) => {
    let browser;

    try {
        console.log('📄 PDF oluşturuluyor:', userData.name);

        // HTML template'i hazırla
        const html = fillTemplate(userData);

        // Puppeteer başlat
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // PDF ayarları
        const filename = `uyelik-formu-${userData._id}.pdf`;
        const filepath = path.join(__dirname, '../uploads/forms', filename);

        // uploads/forms klasörü yoksa oluştur
        const uploadsDir = path.join(__dirname, '../uploads/forms');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // PDF oluştur
        await page.pdf({
            path: filepath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        console.log('✅ PDF oluşturuldu:', filename);

        return `/uploads/forms/${filename}`;

    } catch (error) {
        console.error('❌ PDF oluşturma hatası:', error);
        throw new Error('PDF oluşturulamadı: ' + error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

module.exports = {
    generateMembershipPDF
};