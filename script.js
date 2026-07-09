import { translations } from './lang.js';

const body = document.body;
const themeToggle = document.getElementById('theme-toggle');
const langSelect = document.getElementById('lang-select');

// Hozirgi til
let currentLang = localStorage.getItem('lang') || 'ru';

// Tarjima olish funksiyasi
function t(key, params = {}) {
    const text = translations[currentLang]?.[key] || translations['ru'][key] || key;
    return text.replace(/\{(\w+)\}/g, (_, p) => params[p] || '');
}

// ===== INTERSECTION OBSERVER - Animatsiyalar =====
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
                // Agar elementda 'visible' class bo'lmasa qo'shish
                if (!entry.target.classList.contains('visible')) {
                    entry.target.classList.add('visible');
                }
                
                // Service-card va card lar uchun
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
        // Agar elementda 'visible' class bo'lmasa observer qo'shish
        if (!el.classList.contains('visible')) {
            observer.observe(el);
        }
    });

    /* Scroll bo'yicha topbar animatsiyasi
    window.addEventListener('scroll', function() {
        const topbar = document.querySelector('.topbar');
        if (window.scrollY > 50) {
            topbar.classList.add('scrolled');
        } else {
            topbar.classList.remove('scrolled');
        }
    }); */
}

// Tema logikasi
if (localStorage.getItem('theme') === 'dark') body.classList.add('dark');

themeToggle.onclick = () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
    const icon = themeToggle.querySelector('i');
    if (body.classList.contains('dark')) {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
};

// Iconani boshlang'ich holatga o'rnatish
const icon = themeToggle.querySelector('i');
if (body.classList.contains('dark')) {
    icon.className = 'fa-solid fa-sun';
} else {
    icon.className = 'fa-solid fa-moon';
}

// Tarjima logikasi
function setLanguage(lang) {
    currentLang = lang;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    
    localStorage.setItem('lang', lang);
    updateTranslations();
}

langSelect.onchange = (e) => setLanguage(e.target.value);

const savedLang = localStorage.getItem('lang') || 'ru';
langSelect.value = savedLang;

function init() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[savedLang] && translations[savedLang][key]) {
            el.textContent = translations[savedLang][key];
        }
    });
    
    document.getElementById('familiya').placeholder = t('placeholder_surname');
    document.getElementById('ism').placeholder = t('placeholder_name');
    document.getElementById('nomer').placeholder = t('placeholder_phone');
    document.getElementById('izoh').placeholder = t('placeholder_comment');
    
    loadServicesWithIcons();
    loadPrices();
    loadDoctors();
    generateTimeSlots();
    initSlider();
    
    // Animatsiyalarni ishga tushirish
    setTimeout(initAnimations, 100);
}

function updateTranslations() {
    document.getElementById('familiya').placeholder = t('placeholder_surname');
    document.getElementById('ism').placeholder = t('placeholder_name');
    document.getElementById('nomer').placeholder = t('placeholder_phone');
    document.getElementById('izoh').placeholder = t('placeholder_comment');
    
    loadServicesWithIcons();
    loadPrices();
    loadDoctors();
    generateTimeSlots();
    
    // Animatsiyalarni qayta ishga tushirish
    setTimeout(initAnimations, 300);
}

// Ссылка на Google Apps Script
const SCRIPT_URL = '#';

// Xizmatlar ma'lumotlari
const serviceKeys = [
    { key: 'consultation', icon: 'fa-solid fa-stethoscope' },
    { key: 'extraction', icon: 'fa-solid fa-tooth' },
    { key: 'caries', icon: 'fa-solid fa-gem' },
    { key: 'pulpitis', icon: 'fa-solid fa-microscope' },
    { key: 'cleaning', icon: 'fa-solid fa-sparkles' }, // Yoki fa-solid fa-broom
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

// Imitatsiya qilingan band vaqtlar
let occupiedTimes = ["09:00", "11:30", "14:00", "16:30"];

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

function loadServicesWithIcons() {
    const servicesGrid = document.getElementById('servicesGrid');
    servicesGrid.innerHTML = '';
    const services = getServices();
    
    services.forEach((service, index) => {
        const card = document.createElement('div');
        card.className = 'service-card animate-fade-up';
        card.style.transitionDelay = (index * 0.08) + 's';
        card.onclick = () => selectService(service.key);
        
        // BU YER O'ZGARTIRILDI: 
        // ${service.icon} endi klass nomini beradi va <i> tegi ichiga olinadi
        card.innerHTML = `
            <div class="service-icon">
                <i class="${service.icon}"></i>
            </div>
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
    
    const allPrices = getAllPrices();
    allPrices.forEach(service => {
        const option = document.createElement('option');
        option.value = service.name;
        option.textContent = `${service.name} (${service.price})`;
        serviceSelect.appendChild(option);
    });
    
    if (currentValue) {
        serviceSelect.value = currentValue;
    }
}

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
    
    if (currentValue) {
        docSelect.value = currentValue;
    }
}

function generateTimeSlots() {
    const timeSelect = document.getElementById('vaqt_select');
    const currentValue = timeSelect.value;
    timeSelect.innerHTML = '';
    
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = t('select_time_available');
    timeSelect.appendChild(defaultOpt);

    let start = 8;
    let end = 21;

    for (let hour = start; hour < end; hour++) {
        let slots = [`${hour}:00`, `${hour}:30`];
        slots.forEach(slot => {
            let formatted = slot.split(':')[0].padStart(2, '0') + ':' + slot.split(':')[1];
            if (!occupiedTimes.includes(formatted)) {
                let opt = document.createElement('option');
                opt.value = formatted;
                opt.textContent = formatted;
                timeSelect.appendChild(opt);
            }
        });
    }
    
    if (currentValue && !occupiedTimes.includes(currentValue)) {
        timeSelect.value = currentValue;
    }
}

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

// Mobil menyu
document.getElementById('menuToggle').addEventListener('click', function() {
    document.getElementById('navLinks').classList.toggle('active');
});

// Telefon raqam maskasi
document.getElementById('nomer').addEventListener('input', function() {
    let digits = this.value.replace(/\D/g, '').slice(0, 9);
    let parts = [
        digits.slice(0, 3),
        digits.slice(3, 6),
        digits.slice(6, 9)
    ].filter(Boolean);
    this.value = parts.join(' ');
});

// Formani yuborish
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const ism = document.getElementById('ism').value.trim();
    const familiya = document.getElementById('familiya').value.trim();
    const nomer = document.getElementById('nomer').value.trim();
    const xizmat = document.getElementById('xizmat').value;
    const shifokor = document.getElementById('shifokor').value;
    const selectedTime = document.getElementById('vaqt_select').value;
    const izoh = document.getElementById('izoh').value.trim();

    if (!ism || !familiya || !nomer || !xizmat || !shifokor || !selectedTime) {
        showNotification(t('fill_all_fields'), 'error');
        return;
    }

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
        xizmat,
        shifokor,
        vaqt: selectedTime,
        izoh,
        timestamp: new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' })
    };

    try {
        occupiedTimes.push(selectedTime);
        generateTimeSlots();

        if (SCRIPT_URL !== '#') {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
        }

        showNotification(t('booking_success', { name: ism, doctor: shifokor, time: selectedTime }), 'success');
        document.getElementById('orderForm').reset();
        generateTimeSlots();
    } catch (error) {
        showNotification(t('booking_error'), 'error');
        console.error(error);
    } finally {
        submitBtn.style.opacity = '1';
        submitBtn.disabled = false;
        loading.style.display = 'none';
    }
});

// Sahifa yuklanganda ishga tushirish
window.addEventListener('DOMContentLoaded', init);
