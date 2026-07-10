// ============================================================
// 1. IMPORTS VA KONFIGURATSIYA
// ============================================================
import { translations } from './lang.js';

const body = document.body;
const themeToggle = document.getElementById('theme-toggle');
const langSelect = document.getElementById('lang-select');

let currentLang = localStorage.getItem('lang') || 'ru';

// Google Apps Script URL – o‘zingizning deploy manzilingiz bilan almashtiring
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwY3AvxwsOc9dRq9LENAwoqkbw3HPoY2odDze05SybHOYSBkH73X6z4dIN5lbQ0lVo98g/exec';

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

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    updatePlaceholders();
    loadServicesWithIcons();
    loadPrices();
    loadDoctors();
    generateTimeSlots();
    setTimeout(initAnimations, 300);
}

function updatePlaceholders() {
    document.getElementById('familiya').placeholder = t('placeholder_surname');
    document.getElementById('ism').placeholder = t('placeholder_name');
    document.getElementById('nomer').placeholder = t('placeholder_phone');
    document.getElementById('izoh').placeholder = t('placeholder_comment');
}

langSelect.onchange = (e) => setLanguage(e.target.value);

// ============================================================
// 4. TEMA
// ============================================================
if (localStorage.getItem('theme') === 'dark') body.classList.add('dark');

themeToggle.onclick = () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
    const icon = themeToggle.querySelector('i');
    icon.className = body.classList.contains('dark') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
};

const icon = themeToggle.querySelector('i');
icon.className = body.classList.contains('dark') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

// ============================================================
// 5. ANIMATSIYALAR
// ============================================================
function initAnimations() {
    const animatedElements = document.querySelectorAll(`
        .animate-fade-up, .animate-fade-left, .animate-fade-right, 
        .animate-scale, .service-card, .card:not(.hero-card), 
        .price-row, .mini-stat
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
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    animatedElements.forEach(el => {
        if (!el.classList.contains('visible')) {
            observer.observe(el);
        }
    });
}

// ============================================================
// 6. XIZMATLAR, NARXLAR, SHIFOKORLAR
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

function getAllPrices() { return getServices(); }

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
            <div class="service-icon"><i class="${service.icon}"></i></div>
            <h3>${service.name}</h3>
            <p>${t('price_title')}: <b>${service.price}</b>. ${t('service_click')}.</p>
        `;
        servicesGrid.appendChild(card);
    });

    const serviceSelect = document.getElementById('xizmat');
    const currentValue = serviceSelect.value;
    serviceSelect.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = t('select_service');
    serviceSelect.appendChild(defaultOpt);

    getAllPrices().forEach(service => {
        const option = document.createElement('option');
        option.value = service.key; // 🔥 value sifatida key saqlanadi
        option.textContent = `${service.name} (${service.price})`;
        serviceSelect.appendChild(option);
    });

    if (currentValue) serviceSelect.value = currentValue;
}

function selectService(serviceKey) {
    const serviceName = t(`service_${serviceKey}`);
    const select = document.getElementById('xizmat');
    let found = false;
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === serviceKey) {
            select.selectedIndex = i;
            found = true;
            break;
        }
    }
    if (!found) {
        const option = document.createElement('option');
        option.value = serviceKey;
        option.textContent = serviceName;
        select.appendChild(option);
        select.value = serviceKey;
    }
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    showNotification(t('service_selected', { service: serviceName }), 'success');
}

function loadPrices() {
    const pricesListBlock = document.getElementById('pricesList');
    pricesListBlock.innerHTML = '';
    getAllPrices().forEach((item, index) => {
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

function getDoctors() {
    const doctorKeys = ['arapov', 'ermatov', 'salieva', 'kasymov', 'mamatova', 'abdullaev'];
    const images = [
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80',
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
// 7. BAND VAQTLARNI JSONP ORQALI OLISH
// ============================================================
window.bookedSlotsCallback = function(data) {
    if (data.status === 'ok' && Array.isArray(data.booked)) {
        window._bookedSlots = data.booked;
    } else {
        window._bookedSlots = [];
    }
    populateTimeSelect();
};

function generateTimeSlots() {
    const sana = document.getElementById('sana').value;
    if (!sana) {
        const timeSelect = document.getElementById('vaqt_select');
        timeSelect.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = t('select_time_available');
        timeSelect.appendChild(opt);
        return;
    }

    const script = document.createElement('script');
    script.src = `${SCRIPT_URL}?action=getBookedSlots&callback=bookedSlotsCallback&t=${Date.now()}`;
    document.head.appendChild(script);
    script.onload = () => script.remove();
}

function populateTimeSelect() {
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

    const booked = window._bookedSlots || [];
    const bookedTimes = booked
        .filter(item => item.date === sana)
        .map(item => item.time);

    timeSelect.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = t('select_time_available');
    timeSelect.appendChild(defaultOpt);

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
        }
    });
}

// ============================================================
// 8. SLIDER
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
// 9. NOTIFICATION
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
// FORMA YUBORISH (POST) – TO‘LIQ KOD
// ============================================================
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    // 1. Formaning default yuborilishini to‘xtatamiz
    e.preventDefault();

    // 2. Barcha maydonlarni o‘qiymiz
    const ism = document.getElementById('ism').value.trim();
    const familiya = document.getElementById('familiya').value.trim();
    const nomer = document.getElementById('nomer').value.trim();
    const serviceKey = document.getElementById('xizmat').value;
    const shifokor = document.getElementById('shifokor').value;
    const selectedTime = document.getElementById('vaqt_select').value;
    const sana = document.getElementById('sana').value;
    const izoh = document.getElementById('izoh').value.trim();

    // 3. Majburiy maydonlarni tekshiramiz
    if (!ism || !familiya || !nomer || !serviceKey || !shifokor || !selectedTime || !sana) {
        showNotification(t('fill_all_fields'), 'error');
        return;
    }

    // 4. Telefon raqami 9 ta raqamdan iboratligini tekshiramiz
    const digits = nomer.replace(/\D/g, '');
    if (digits.length !== 9) {
        showNotification(t('phone_9_digits'), 'error');
        return;
    }

    // 5. Yuborish tugmasi va loading holatini boshqaramiz
    const submitBtn = document.querySelector('.submit-btn');
    const loading = document.querySelector('.loading');
    submitBtn.style.opacity = '0.5';
    submitBtn.disabled = true;
    loading.style.display = 'block';
    loading.textContent = t('sending');

    // 6. Serverga yuboriladigan maʼlumotlarni tayyorlaymiz
    const orderData = {
        fio: familiya + ' ' + ism,           // "Familiya Ism"
        nomer: '+996 ' + nomer,               // "+996 557 702 270"
        serviceKey: serviceKey,               // "caries", "consultation" va h.k.
        shifokor: shifokor,                   // "Arapov Islambek"
        vaqt: selectedTime,                   // "14:30"
        sana: sana,                           // "2026-07-12"
        izoh: izoh,                           // "Og'riq bor"
        timestamp: new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' })
    };

    // 7. So‘rovni yuboramiz
    try {
        // Google Apps Script ga POST so‘rov yuboramiz
        // 'no-cors' rejimi CORS muammosini oldini oladi
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        // 'no-cors' da response body o‘qilmaydi, lekin so‘rov ketadi.
        // Shuning uchun muvaffaqiyat deb hisoblaymiz.
        showNotification(t('booking_success', { name: ism, doctor: shifokor, time: selectedTime }), 'success');

        // 8. Formani tozalaymiz
        document.getElementById('orderForm').reset();
        document.getElementById('sana').value = new Date().toISOString().split('T')[0];

        // 9. Band vaqtlarni qayta yuklaymiz (yangi bandliklar uchun)
        generateTimeSlots();

    } catch (error) {
        // 10. Xatolik bo‘lsa foydalanuvchiga ko‘rsatamiz
        showNotification(t('booking_error'), 'error');
        console.error('Fetch error:', error);
    } finally {
        // 11. Tugma va loading holatini tiklaymiz
        submitBtn.style.opacity = '1';
        submitBtn.disabled = false;
        loading.style.display = 'none';
    }
});

// ============================================================
// 11. TELEFON RAQAM MASKASI
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
// 12. MOBIL MENYU
// ============================================================
document.getElementById('menuToggle').addEventListener('click', function() {
    document.getElementById('navLinks').classList.toggle('active');
});

// ============================================================
// 13. BOSHLANG‘ICH ISHGA TUSHIRISH
// ============================================================
function init() {
    const savedLang = localStorage.getItem('lang') || 'ru';
    langSelect.value = savedLang;
    setLanguage(savedLang);

    const sanaInput = document.getElementById('sana');
    const today = new Date().toISOString().split('T')[0];
    sanaInput.value = today;
    sanaInput.min = today;
    sanaInput.addEventListener('change', generateTimeSlots);

    generateTimeSlots();
    initSlider();
    setTimeout(initAnimations, 200);
}

window.addEventListener('DOMContentLoaded', init);
