import { translations } from './lang.js';

const body = document.body;
const themeToggle = document.getElementById('theme-toggle');
const langSelect = document.getElementById('lang-select');
let currentLang = localStorage.getItem('lang') || 'ru';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw_bYCP4deZddGObiRbyh46kTPKGFofCDcCIU8bOXp-2jx6M4QAcRIszBdWCuuafrVjKA/exec';

function t(key, params = {}) {
    const text = translations[currentLang]?.[key] || translations['ru'][key] || key;
    return text.replace(/\{(\w+)\}/g, (_, p) => params[p] || '');
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang]?.[key]) el.innerHTML = translations[lang][key];
    });
    updatePlaceholders(); loadServicesWithIcons(); loadPrices(); loadDoctors(); generateTimeSlots();
}

function updatePlaceholders() {
    document.getElementById('familiya').placeholder = t('placeholder_surname');
    document.getElementById('ism').placeholder = t('placeholder_name');
}

langSelect.onchange = (e) => setLanguage(e.target.value);

if (localStorage.getItem('theme') === 'dark') body.classList.add('dark');
themeToggle.onclick = () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
    themeToggle.querySelector('i').className = body.classList.contains('dark') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
};
themeToggle.querySelector('i').className = body.classList.contains('dark') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.animate-fade-up, .animate-scale, .feature-card, .price-row').forEach(el => observer.observe(el));
}

// Data Loaders
const serviceKeys = [
    { key: 'consultation', icon: 'fa-user-doctor' }, { key: 'extraction', icon: 'fa-tooth' },
    { key: 'caries', icon: 'fa-bacterium' }, { key: 'pulpitis', icon: 'fa-disease' },
    { key: 'cleaning', icon: 'fa-hands-bubbles' }, { key: 'whitening', icon: 'fa-wand-magic-sparkles' },
    { key: 'crown', icon: 'fa-crown' }, { key: 'implant', icon: 'fa-screwdriver-wrench' }
];

function loadServicesWithIcons() {
    const servicesGrid = document.getElementById('servicesGrid');
    servicesGrid.innerHTML = '';
    const select = document.getElementById('xizmat');
    select.innerHTML = `<option value="">${t('select_service')}</option>`;
    
    serviceKeys.forEach((s, index) => {
        const name = t(`service_${s.key}`), price = t(`price_${s.key}`);
        servicesGrid.innerHTML += `
            <div class="service-card animate-fade-up" style="transition-delay: ${index * 0.05}s" onclick="selectService('${s.key}')">
                <div class="service-icon"><i class="fa-solid ${s.icon}"></i></div>
                <h3>${name}</h3>
                <span class="service-price">${price}</span>
            </div>`;
        select.innerHTML += `<option value="${s.key}">${name} (${price})</option>`;
    });
}

function selectService(key) {
    document.getElementById('xizmat').value = key;
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    showNotification(t('service_selected', { service: t(`service_${key}`) }), 'success');
}

function loadPrices() {
    const list = document.getElementById('pricesList');
    list.innerHTML = '';
    serviceKeys.forEach((s, i) => {
        list.innerHTML += `<div class="price-row animate-fade-up" style="transition-delay:${i*0.05}s"><span>${t(`service_${s.key}`)}</span><b>${t(`price_${s.key}`)}</b></div>`;
    });
}

function loadDoctors() {
    const grid = document.getElementById('doctorsGrid');
    const select = document.getElementById('shifokor');
    grid.innerHTML = ''; select.innerHTML = `<option value="">${t('select_doctor')}</option>`;
    const docs = ['arapov', 'ermatov', 'salieva', 'kasymov', 'mamatova', 'abdullaev'];
    const imgs = [
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500',
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500',
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500', 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=500'
    ];
    
    docs.forEach((key, i) => {
        const name = t(`doctor_${key}`), role = t(`doctor_${key}_role`), exp = t(`doctor_${key}_exp`), edu = t(`doctor_${key}_edu`);
        grid.innerHTML += `
            <div class="doc-card animate-fade-up" style="transition-delay:${i*0.1}s">
                <div class="doc-img" style="background-image:url(${imgs[i]})"></div>
                <div class="doc-info">
                    <span class="role">${role}</span>
                    <h3>${name}</h3>
                    <p class="exp"><i class="fa-solid fa-briefcase-medical"></i> ${exp}</p>
                    <p class="edu">${edu}</p>
                </div>
            </div>`;
        select.innerHTML += `<option value="${name}">${name} (${role.split(',')[0]})</option>`;
    });
}

// JSONP & Time slots
window.bookedSlotsCallback = (data) => {
    window._bookedSlots = data.status === 'ok' ? data.booked : [];
    if(window._timeoutId) clearTimeout(window._timeoutId);
    populateTimeSelect();
};

function generateTimeSlots() {
    const sana = document.getElementById('sana').value;
    if (!sana) return;
    const script = document.createElement('script');
    script.src = `${SCRIPT_URL}?action=getBookedSlots&callback=bookedSlotsCallback&t=${Date.now()}`;
    document.head.appendChild(script);
    window._timeoutId = setTimeout(() => { window._bookedSlots = []; populateTimeSelect(); }, 5000);
}

function populateTimeSelect() {
    const select = document.getElementById('vaqt_select');
    const sana = document.getElementById('sana').value;
    select.innerHTML = `<option value="">${t('select_time_available')}</option>`;
    const booked = (window._bookedSlots || []).filter(i => i.date === sana).map(i => i.time);
    for (let h = 8; h < 21; h++) {
        ['00', '30'].forEach(m => {
            const time = `${String(h).padStart(2, '0')}:${m}`;
            if (!booked.includes(time)) select.innerHTML += `<option value="${time}">${time}</option>`;
        });
    }
}

// UI Elements
function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
        item.querySelector('.faq-q').onclick = () => {
            const active = document.querySelector('.faq-item.active');
            if(active && active !== item) active.classList.remove('active');
            item.classList.toggle('active');
        };
    });
}

function showNotification(msg, type) {
    const box = document.querySelector('.success-message');
    box.innerHTML = msg; box.className = `success-message ${type}`; box.style.display = 'block';
    setTimeout(() => box.style.display = 'none', 5000);
}

// Form Submit
document.getElementById('orderForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]'), loading = document.querySelector('.loading');
    const data = {
        ism: document.getElementById('ism').value, familiya: document.getElementById('familiya').value,
        nomer: '+996 ' + document.getElementById('nomer').value, serviceKey: document.getElementById('xizmat').value,
        serviceNameTelegram: t(`service_${document.getElementById('xizmat').value}`),
        shifokor: document.getElementById('shifokor').value, vaqt: document.getElementById('vaqt_select').value,
        sana: document.getElementById('sana').value, izoh: document.getElementById('izoh').value, lang: currentLang,
        timestamp: new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' })
    };

    if(data.nomer.replace(/\D/g,'').length !== 9) return showNotification(t('phone_9_digits'), 'error');
    
    btn.disabled = true; loading.classList.remove('hidden');
    try {
        const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(data) }).then(r => r.json());
        if (res.status === 'ok') {
            showNotification(t('booking_success', { name: data.ism, time: data.vaqt }), 'success');
            e.target.reset(); generateTimeSlots();
        } else showNotification(t('booking_error'), 'error');
    } catch { showNotification(t('booking_error'), 'error'); }
    btn.disabled = false; loading.classList.add('hidden');
};

// Topbar Scroll & Menu
window.onscroll = () => document.querySelector('.topbar').classList.toggle('scrolled', window.scrollY > 50);
document.getElementById('menuToggle').onclick = () => document.getElementById('navLinks').classList.toggle('active');
document.getElementById('nomer').oninput = function() {
    this.value = this.value.replace(/\D/g,'').slice(0,9).replace(/(\d{3})(?=\d)/g, '$1 ').trim();
};

window.onload = () => {
    setLanguage(langSelect.value = localStorage.getItem('lang') || 'ru');
    const sana = document.getElementById('sana');
    sana.value = sana.min = new Date().toISOString().split('T')[0];
    sana.onchange = generateTimeSlots;
    generateTimeSlots(); initAnimations(); initFAQ();
    
    // Slider
    const slides = document.querySelectorAll('.slide'), dotsWrap = document.getElementById('dots');
    let active = 0;
    slides.forEach((_, i) => {
        const dot = document.createElement('div'); dot.className = `dot ${i===0?'active':''}`;
        dot.onclick = () => { slides[active].classList.remove('active'); dotsWrap.children[active].classList.remove('active'); active = i; slides[active].classList.add('active'); dotsWrap.children[active].classList.add('active'); };
        dotsWrap.appendChild(dot);
    });
    setInterval(() => dotsWrap.children[(active + 1) % slides.length].click(), 4500);
};
window.addEventListener('DOMContentLoaded', init);
window.addEventListener('DOMContentLoaded', init);
