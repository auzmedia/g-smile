// ============================================================
// 1. IMPORTS VA KONFIGURATSIYA
// ============================================================
import { translations } from './lang.js';

const body = document.body;
const themeToggle = document.getElementById('theme-toggle');
const langSelect = document.getElementById('lang-select');

// Hozirgi til (localStorage dan o‘qiladi)
let currentLang = localStorage.getItem('lang') || 'ru';

// Google Apps Script URL (o‘zingizning deploy URL bilan almashtiring)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyd37nJZu8LeLR4hs3RcgbxCL7rmYLTO0IXMSm-3gGPCGpmFiGeO7hnM2y50oIRcxAZ8w/exec'; // <-- O‘ZGARTIRING

// ============================================================
// 2. TARJIMA FUNKSIYASI
// ============================================================
function t(key, params = {}) {
    const text = translations[currentLang]?.[key] || translations['ru'][key] || key;
    return text.replace(/\{(\w+)\}/g, (_, p) => params[p] || '');
}

// ============================================================
// 3. TILNI O‘ZGARTIRISH
// ============================================================
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // 1) Barcha [data-i18n] elementlarning textContent ini yangilaymiz
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // 2) Placeholder va selectlarning boshlang‘ich qiymatlarini yangilaymiz
    updatePlaceholders();

    // 3) Dinamik tarkibni (xizmatlar, narxlar, shifokorlar, vaqtlar) qayta yuklaymiz
    loadServicesWithIcons();
    loadPrices();
    loadDoctors();
    generateTimeSlots(); // async, lekin uni kutmaymiz

    // 4) Animatsiyalarni qayta ishga tushiramiz (agar kerak bo‘lsa)
    setTimeout(initAnimations, 300);
}

// Placeholder va selectlarning boshlang‘ich qiymatlarini yangilash
function updatePlaceholders() {
    const surnameInput = document.getElementById('familiya');
    const nameInput = document.getElementById('ism');
    const phoneInput = document.getElementById('nomer');
    const commentInput = document.getElementById('izoh');

    if (surnameInput) surnameInput.placeholder = t('placeholder_surname');
    if (nameInput) nameInput.placeholder = t('placeholder_name');
    if (phoneInput) phoneInput.placeholder = t('placeholder_phone');
    if (commentInput) commentInput.placeholder = t('placeholder_comment');

    // Selectlardagi default optionlarni yangilash (agar ular allaqachon yaratilgan bo‘lsa)
    const serviceSelect = document.getElementById('xizmat');
    const doctorSelect = document.getElementById('shifokor');
    const timeSelect = document.getElementById('vaqt_select');

    // Bularni to‘g‘ridan-to‘g‘ri o‘zgartirmaymiz, chunki ular dynamic tarzda 
    // loadServicesWithIcons, loadDoctors, generateTimeSlots da to‘liq qayta yaratiladi.
    // Shuning uchun bu yerda hech narsa qilmaymiz.
}

// Til tanlash eventi
langSelect.onchange = (e) => setLanguage(e.target.value);

// ============================================================
// 4. TEMA (QORONG‘U / YORUG‘)
// ============================================================
if (localStorage.getItem('theme') === 'dark') body.classList.add('dark');

themeToggle.onclick = () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
    const icon = themeToggle.querySelector('i');
    icon.className = body.classList.contains('dark') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
};

// Tema iconasini boshlang‘ich holatga o‘rnatish
const icon = themeToggle.querySelector('i');
icon.className = body.classList.contains('dark') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

// ============================================================
// 5. ANIMATSIYALAR (INTERSECTION OBSERVER)
// ============================================================
function initAnimations() {
    const animatedElements = document.querySelectorAll(`
        .animate-fade-up, 
        .animate-fade-left, 
        .animate-fade-right, 
        .animate-scale,
        .service-card,
        .card:not(.hero-card),
        .price-row,
        .mini-stat
    `);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!entry.target.classList.contains('visible')) {
                    entry.target.classList.add('visible');
                }
                if (entry.target.classList.contains('service-card') || 
                    entry.target.classList.contains('card')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => {
        if (!el.classList.contains('visible')) {
            observer.observe(el);
        }
    });
}

// ============================================================
// 6. MA'LUMOTLARNI YUKLASH: XIZMATLAR
// ============================================================
const serviceKeys = [
    { key: 'consultation', icon: 'fa-solid fa-stethoscope' },
    { key: 'extraction', icon: 'fa-solid fa-tooth' },
    { key: 'caries', icon: 'fa-solid fa-gem' },
    { key: 'pulpitis', icon: 'fa-solid fa-microscope' },
    { key: 'cleaning', icon: 'fa-solid fa-broom' },
    { key: 'whitening', icon: 'fa-solid fa-lightbulb' },
    { key: 'crown', icon: 'fa-solid fa-crown' },
    { key: 'zirconia', icon: 'fa-solid fa-shield-halved' },
    { key: 'veneer', icon: 'fa-solid fa-star' },
    { key: 'implant', icon: 'fa-solid fa-screwdriver-wrench' },
    { key: 'braces', icon: 'fa-solid fa-link' },
    { key: 'gum', icon: 'fa-solid fa-droplet' },
    { key: 'fissure', icon: 'fa-solid fa-child' },
    { key: 'xray', icon: 'fa-solid fa-camera' },
    { key: 'nightguard', icon: 'fa-solid fa-moon' },
    { key: 'wisdom', icon: 'fa-solid fa-tooth' },
    { key: 'aligners', icon: 'fa-solid fa-wand-magic-sparkles' }
];

function getServices() {
    return serviceKeys.map(s => ({
        name: t(`service_${s.key}`),
        icon: s.icon,
        price: t(`price_${s.key}`),
        key: s.key
    }));
}

function getAllPrices() {
    return getServices();
}

function loadServicesWithIcons() {
    const servicesGrid = document.getElementById('servicesGrid');
    servicesGrid.innerHTML = '';
    const services = getServices();

    services.forEach((service, index) => {
        const card = document.createElement('div');
        card.className = 'service-card animate-fade-up';
        card.style.transitionDelay = (index * 0.08) + 's';
        card.onclick = () => selectService(service.key);
        card.innerHTML = `
            <div class="service-icon">
                <i class="${service.icon}"></i>
            </div>
            <h3>${service.name}</h3>
            <p>${t('price_title')}: <b>${service.price}</b>. ${t('service_click')}.</p>
        `;
        servicesGrid.appendChild(card);
    });

    // Xizmat selectini yangilash
    const serviceSelect = document.getElementById('xizmat');
    const currentValue = serviceSelect.value;
    serviceSelect.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = t('select_service');
    serviceSelect.appendChild(defaultOpt);

    const allPrices = getAllPrices();
    allPrices.forEach(service => {
        const option = document.createElement('option');
        option.value = service.name;
        option.textContent = `${service.name} (${service.price})`;
        serviceSelect.appendChild(option);
    });

    if (currentValue) serviceSelect.value = currentValue;
}

// Xizmatni tanlash (kartochka bosilganda)
function selectService(serviceKey) {
    const serviceName = t(`service_${serviceKey}`);
    const select = document.getElementById('xizmat');
    let found = false;
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === serviceName) {
            select.selectedIndex = i;
            found = true;
            break;
        }
    }
    if (!found) {
        const option = document.createElement('option');
        option.value = serviceName;
        option.textContent = serviceName;
        select.appendChild(option);
        select.value = serviceName;
    }
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    showNotification(t('service_selected', { service: serviceName }), 'success');
}

// ============================================================
// 7. MA'LUMOTLARNI YUKLASH: NARXLAR
// ============================================================
function loadPrices() {
    const pricesListBlock = document.getElementById('pricesList');
    pricesListBlock.innerHTML = '';
    const allPrices = getAllPrices();
    allPrices.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'price-row animate-fade-left';
        row.style.transitionDelay = (index * 0.05) + 's';
        row.innerHTML = `
            <span class="price-name">${item.name}</span>
            <span class="price-val">${item.price}</span>
        `;
        pricesListBlock.appendChild(row);
    });
}

// ============================================================
// 8. MA'LUMOTLARNI YUKLASH: SHIFOKORLAR
// ============================================================
function getDoctors() {
    const doctorKeys = ['arapov', 'ermatov', 'salieva', 'kasymov', 'mamatova', 'abdullaev'];
    const images = [
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=500&q=80'
    ];
    return doctorKeys.map((key, i) => ({
        name: t(`doctor_${key}`),
        role: t(`doctor_${key}_role`),
        exp: t(`doctor_${key}_exp`),
        image: images[i],
        edu: t(`doctor_${key}_edu`),
        key: key
    }));
}

function loadDoctors() {
    const doctorsGrid = document.getElementById('doctorsGrid');
    doctorsGrid.innerHTML = '';
    const doctors = getDoctors();
    doctors.forEach((doc, index) => {
        const card = document.createElement('div');
        card.className = 'card animate-scale';
        card.style.transitionDelay = (index * 0.1) + 's';
        card.innerHTML = `
            <img src="${doc.image}" alt="${doc.name}" class="doc-card-img">
            <div style="padding:22px">
                <span style="font-size:12px; font-weight:800; color:var(--blue); text-transform:uppercase">${doc.role}</span>
                <h3 style="margin:4px 0 6px; font-size:22px">${doc.name}</h3>
                <p style="color:var(--text); font-weight:700; font-size:14px; margin-bottom:12px">${doc.exp}</p>
                <p style="color:var(--muted); line-height:1.6; font-size:13px; border-top:1px solid var(--line); padding-top:10px">${doc.edu}</p>
            </div>
        `;
        doctorsGrid.appendChild(card);
    });

    // Shifokor selectini yangilash
    const docSelect = document.getElementById('shifokor');
    const currentValue = docSelect.value;
    docSelect.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = t('select_doctor');
    docSelect.appendChild(defaultOpt);

    doctors.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.name;
        option.textContent = `${doc.name} (${doc.role.split(',')[0]})`;
        docSelect.appendChild(option);
    });

    if (currentValue) docSelect.value = currentValue;
}

// ============================================================
// 9. BAND VAQTLARNI OLISH VA VAQT SELECTINI YANGILASH
// ============================================================
async function generateTimeSlots() {
    const timeSelect = document.getElementById('vaqt_select');
    const sana = document.getElementById('sana').value;
    if (!sana) {
        timeSelect.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = t('select_time_available');
        timeSelect.appendChild(opt);
        return;
    }

    // Serverdan band vaqtlarni olish
    let bookedTimes = [];
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getBookedSlots`);
        const result = await response.json();
        if (result.status === 'ok' && Array.isArray(result.booked)) {
            // Faqat tanlangan kun uchun band vaqtlarni filtrlaymiz
            bookedTimes = result.booked
                .filter(item => item.date === sana)
                .map(item => item.time);
        }
    } catch (err) {
        console.error('Band vaqtlarni olishda xatolik:', err);
        // Xatolik bo‘lsa ham, davom etamiz (hech qanday vaqt band emas deb hisoblaymiz)
    }

    // Vaqt selectini to‘ldirish
    timeSelect.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = t('select_time_available');
    timeSelect.appendChild(defaultOpt);

    // 8:00 dan 21:00 gacha barcha vaqtlar
    const allSlots = [];
    for (let hour = 8; hour < 21; hour++) {
        allSlots.push(`${String(hour).padStart(2, '0')}:00`);
        allSlots.push(`${String(hour).padStart(2, '0')}:30`);
    }

    allSlots.forEach(slot => {
        if (!bookedTimes.includes(slot)) {
            const opt = document.createElement('option');
            opt.value = slot;
            opt.textContent = slot;
            timeSelect.appendChild(opt);
        } else {
            // Band vaqtni ko‘rsatmaslik (yoki 'band' deb belgilash mumkin)
            // Agar ko‘rsatmoqchi bo‘lsangiz, quyidagi qatorni izohdan chiqaring:
            // const opt = document.createElement('option');
            // opt.value = slot;
            // opt.textContent = slot + ' (band)';
            // opt.disabled = true;
            // timeSelect.appendChild(opt);
        }
    });
}

// ============================================================
// 10. SLIDER
// ============================================================
function initSlider() {
    const slides = document.querySelectorAll('.hero-bg .slide');
    const dotsWrap = document.getElementById('dots');
    let active = 0;

    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => {
            slides[active].classList.remove('active');
            dotsWrap.children[active].classList.remove('active');
            active = i;
            slides[active].classList.add('active');
            dotsWrap.children[active].classList.add('active');
        };
        dotsWrap.appendChild(dot);
    });

    setInterval(() => {
        slides[active].classList.remove('active');
        dotsWrap.children[active].classList.remove('active');
        active = (active + 1) % slides.length;
        slides[active].classList.add('active');
        dotsWrap.children[active].classList.add('active');
    }, 4500);
}

// ============================================================
// 11. NOTIFICATION
// ============================================================
function showNotification(message, type) {
    const box = document.querySelector('.success-message');
    const span = document.getElementById('successMessage');
    span.textContent = message;
    box.style.display = 'block';
    if (type === 'error') {
        box.style.backgroundColor = '#fee2e2';
        box.style.borderColor = '#ef4444';
        box.style.color = '#dc2626';
    } else {
        box.style.backgroundColor = '#dbeafe';
        box.style.borderColor = '#60a5fa';
        box.style.color = '#1d4ed8';
    }
    setTimeout(() => box.style.display = 'none', 5000);
}

// ============================================================
// 12. FORMA YUBORISH
// ============================================================
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const ism = document.getElementById('ism').value.trim();
    const familiya = document.getElementById('familiya').value.trim();
    const nomer = document.getElementById('nomer').value.trim();
    const xizmat = document.getElementById('xizmat').value;
    const shifokor = document.getElementById('shifokor').value;
    const selectedTime = document.getElementById('vaqt_select').value;
    const sana = document.getElementById('sana').value;
    const izoh = document.getElementById('izoh').value.trim();

    // Barcha majburiy maydonlarni tekshirish
    if (!ism || !familiya || !nomer || !xizmat || !shifokor || !selectedTime || !sana) {
        showNotification(t('fill_all_fields'), 'error');
        return;
    }

    // Telefon raqamini tekshirish (9 ta raqam)
    const digits = nomer.replace(/\D/g, '');
    if (digits.length !== 9) {
        showNotification(t('phone_9_digits'), 'error');
        return;
    }

    const submitBtn = document.querySelector('.submit-btn');
    const loading = document.querySelector('.loading');
    submitBtn.style.opacity = '0.5';
    submitBtn.disabled = true;
    loading.style.display = 'block';
    loading.textContent = t('sending');

    const orderData = {
        fio: familiya + ' ' + ism,
        nomer: '+996 ' + nomer,
        xizmat: xizmat,
        shifokor: shifokor,
        vaqt: selectedTime,
        sana: sana,
        izoh: izoh,
        timestamp: new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' })
    };

    try {
        // Ma'lumotni Google Apps Script ga yuborish
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // CORS muammosini oldini olish uchun
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        // no-cors rejimida response ma'lumotlarini o‘qib bo‘lmaydi, lekin so‘rov muvaffaqiyatli bo‘lsa, server ishlaydi.
        // Shuning uchun biz faqat xatolik bo‘lmagan holatda muvaffaqiyat deb hisoblaymiz.
        showNotification(t('booking_success', { name: ism, doctor: shifokor, time: selectedTime }), 'success');

        // Formani tozalash va vaqtlarni qayta yuklash
        document.getElementById('orderForm').reset();
        // Kunni bugungi sanaga qayta o‘rnatamiz
        document.getElementById('sana').value = new Date().toISOString().split('T')[0];
        await generateTimeSlots(); // band vaqtlarni qayta yuklash
    } catch (error) {
        showNotification(t('booking_error'), 'error');
        console.error(error);
    } finally {
        submitBtn.style.opacity = '1';
        submitBtn.disabled = false;
        loading.style.display = 'none';
    }
});

// ============================================================
// 13. TELEFON RAQAM MASKASI
// ============================================================
document.getElementById('nomer').addEventListener('input', function() {
    let digits = this.value.replace(/\D/g, '').slice(0, 9);
    let parts = [
        digits.slice(0, 3),
        digits.slice(3, 6),
        digits.slice(6, 9)
    ].filter(Boolean);
    this.value = parts.join(' ');
});

// ============================================================
// 14. MOBIL MENYU
// ============================================================
document.getElementById('menuToggle').addEventListener('click', function() {
    document.getElementById('navLinks').classList.toggle('active');
});

// ============================================================
// 15. BOSHLANG‘ICH ISHGA TUSHIRISH
// ============================================================
function init() {
    // 1) Tilni o‘rnatish (localStorage dan)
    const savedLang = localStorage.getItem('lang') || 'ru';
    langSelect.value = savedLang;
    setLanguage(savedLang); // Barcha matnlarni yuklaydi

    // 2) Kun maydonini bugungi sanaga o‘rnatish
    const sanaInput = document.getElementById('sana');
    const today = new Date().toISOString().split('T')[0];
    sanaInput.value = today;
    sanaInput.min = today; // O‘tgan kunlarni tanlashni cheklash (ixtiyoriy)

    // 3) Kun o‘zgarganda vaqtlarni qayta yuklash
    sanaInput.addEventListener('change', generateTimeSlots);

    // 4) Vaqtlarni yuklash (birinchi marta)
    generateTimeSlots();

    // 5) Slider
    initSlider();

    // 6) Animatsiyalarni ishga tushirish
    setTimeout(initAnimations, 200);
}

// Sahifa to‘liq yuklanganda ishga tushirish
window.addEventListener('DOMContentLoaded', init);
