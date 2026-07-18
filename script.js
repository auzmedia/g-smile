// ===== ТЕМА =====
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
function updateThemeIcon(theme) {
    themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}
updateThemeIcon(currentTheme);
themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
});

// ===== БУРГЕР МЕНЮ =====
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav');
burger.addEventListener('click', () => {
    nav.classList.toggle('active');
    burger.setAttribute('aria-expanded', nav.classList.contains('active'));
});
document.querySelectorAll('.nav__list a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
    });
});

// ===== АНИМАЦИИ =====
AOS.init({ duration: 800, once: true, offset: 20 });

// ===== КНОПКИ "ВЫБРАТЬ" В ПРЕЙСКУРАНТЕ =====
document.querySelectorAll('.btn--select').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const serviceValue = this.getAttribute('data-service');
        document.getElementById('service').value = serviceValue;
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    });
});

// ===== КНОПКИ "ЗАПИСАТЬСЯ" У ВРАЧЕЙ =====
document.querySelectorAll('.doctor-book-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const doctorName = this.getAttribute('data-doctor');
        document.getElementById('doctor').value = doctorName;
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
        const dateInput = document.getElementById('date');
        if (dateInput.value) {
            dateInput.dispatchEvent(new Event('change'));
        }
    });
});

// ===== СПРАВОЧНИКИ ДЛЯ ДИНАМИЧЕСКИХ SELECT =====
const doctorsList = [
    { code: 'Азиз Абдиев', ru: 'Азиз Абдиев — Хирург-имплантолог', ky: 'Азиз Абдиев — Хирург-имплантолог', uz: 'Aziz Abdiyev — Jarroh-implantolog', en: 'Aziz Abdiev — Surgeon-Implantologist' },
    { code: 'Айнура Абдылдаева', ru: 'Айнура Абдылдаева — Терапевт', ky: 'Айнура Абдылдаева — Терапевт', uz: 'Aynura Abdildayeva — Terapevt', en: 'Ainura Abdyldaeva — Therapist' },
    { code: 'Бекболот Маматов', ru: 'Бекболот Маматов — Ортодонт', ky: 'Бекболот Маматов — Ортодонт', uz: 'Bekbolot Mamatov — Ortodont', en: 'Bekbolot Mamatov — Orthodontist' },
    { code: 'Гульмира Кыдырова', ru: 'Гульмира Кыдырова — Детский стоматолог', ky: 'Гульмира Кыдырова — Балдар стоматологу', uz: 'Gulmira Kydyrova — Bolalar stomatologi', en: 'Gulmira Kydyrova — Pediatric Dentist' },
    { code: 'Жениш Осмонов', ru: 'Жениш Осмонов — Ортопед', ky: 'Жениш Осмонов — Ортопед', uz: 'Jenish Osmonov — Ortoped', en: 'Zhenish Osmonov — Orthopedist' },
    { code: 'Чолпон Садыкова', ru: 'Чолпон Садыкова — Пародонтолог', ky: 'Чолпон Садыкова — Пародонтолог', uz: 'Cholpon Sodiqova — Parodontolog', en: 'Cholpon Sadykova — Periodontist' }
];

const servicesList = [
    { code: 'service_consult', ru: 'Консультация с составлением плана лечения', ky: 'Дарылоо планын түзүү менен консультация', uz: 'Davolash rejasini tuzish bilan konsultatsiya', en: 'Consultation with treatment plan' },
    { code: 'service_xray', ru: 'Рентген 1 зуба', ky: '1 тиштин рентгени', uz: '1 ta tish rentgeni', en: 'X-ray of 1 tooth' },
    { code: 'service_hygiene_basic', ru: 'Проф. гигиена (без Air Flow)', ky: 'Проф. гигиена (Air Flowсуз)', uz: 'Prof. gigiena (Air Flowsiz)', en: 'Prof. hygiene (w/o Air Flow)' },
    { code: 'service_hygiene_airflow', ru: 'Проф. гигиена (с Air Flow)', ky: 'Проф. гигиена (Air Flow менен)', uz: 'Prof. gigiena (Air Flow bilan)', en: 'Prof. hygiene (with Air Flow)' },
    { code: 'service_extraction', ru: 'Удаление зуба', ky: 'Тишти жулуу', uz: 'Tishni olib tashlash', en: 'Tooth extraction' },
    { code: 'service_filling', ru: 'Пломба (лечение кариеса)', ky: 'Пломба (кариести дарылоо)', uz: 'Plomba (kariesni davolash)', en: 'Filling (caries)' },
    { code: 'service_restoration', ru: 'Художественная реставрация зуба', ky: 'Көркөм реставрация', uz: 'Badiiy restavratsiya', en: 'Artistic restoration' },
    { code: 'service_1canal', ru: 'Лечение 1 корневого канала', ky: '1 тамыр каналын дарылоо', uz: '1 ildiz kanalini davolash', en: '1 root canal' },
    { code: 'service_2canals', ru: 'Лечение 2 корневых каналов', ky: '2 тамыр каналын дарылоо', uz: '2 ildiz kanalini davolash', en: '2 root canals' },
    { code: 'service_3canals', ru: 'Лечение 3 корневых каналов', ky: '3 тамыр каналын дарылоо', uz: '3 ildiz kanalini davolash', en: '3 root canals' },
    { code: 'service_extra_canal', ru: 'Лечение дополнительного канала', ky: 'Кошумча каналды дарылоо', uz: 'Qo‘shimcha kanalni davolash', en: 'Additional canal' },
    { code: 'service_remove_instrument', ru: 'Извлечение обломка инструмента', ky: 'Сынган аспапты алуу', uz: 'Singan asbobni olish', en: 'Remove broken instrument' },
    { code: 'service_post', ru: 'Установка штифта', ky: 'Штифт коюу', uz: 'Shtift o‘rnatish', en: 'Post placement' },
    { code: 'service_temp_crown', ru: 'Временная коронка (1 шт.)', ky: 'Убактылуу таажы (1 даана)', uz: 'Vaqtinchalik toj (1 dona)', en: 'Temporary crown (1 pc.)' },
    { code: 'service_emax_crown', ru: 'Керамическая коронка (e-max, 1 шт.)', ky: 'Керамикалык таажы (e-max)', uz: 'Keramik toj (e-max)', en: 'Ceramic crown (e-max)' },
    { code: 'service_mc_crown', ru: 'Металлокерамическая коронка (1 шт.)', ky: 'Металл-керамикалык таажы', uz: 'Metallokeramik toj', en: 'PFM crown' },
    { code: 'service_mc_implant_crown', ru: 'Металлокерамическая коронка на имплантате', ky: 'Имплантаттагы металл-керамикалык таажы', uz: 'Implantatdagi metallokeramik toj', en: 'PFM crown on implant' },
    { code: 'service_zirconia_crown', ru: 'Цирконовая коронка (1 шт.)', ky: 'Циркон таажы', uz: 'Sirkon toj', en: 'Zirconia crown' },
    { code: 'service_full_denture', ru: 'Полный съёмный протез (1 челюсть)', ky: 'Толук алмалышып туруучу протез', uz: 'To‘liq olinadigan protez', en: 'Complete removable denture' },
    { code: 'service_zirconia_implant_crown', ru: 'Цирконовая коронка на имплантате', ky: 'Имплантаттагы циркон таажы', uz: 'Implantatdagi sirkon toj', en: 'Zirconia crown on implant' }
];

function updateDoctorOptions(lang) {
    const select = document.getElementById('doctor');
    const currentValue = select.value;
    select.innerHTML = `<option value="">${translations[lang].select_doctor}</option>`;
    doctorsList.forEach(doc => {
        const opt = document.createElement('option');
        opt.value = doc.code;
        opt.textContent = doc[lang] || doc.ru;
        select.appendChild(opt);
    });
    select.value = currentValue;
}

function updateServiceOptions(lang) {
    const select = document.getElementById('service');
    const currentValue = select.value;
    select.innerHTML = `<option value="">${translations[lang].select_service}</option>`;
    servicesList.forEach(srv => {
        const opt = document.createElement('option');
        opt.value = srv.code;
        opt.textContent = srv[lang] || srv.ru;
        select.appendChild(opt);
    });
    select.value = currentValue;
}

// ===== ЛОГИКА ФОРМЫ =====
(function() {
    const form = document.getElementById('bookingForm');
    const doctorSelect = document.getElementById('doctor');
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const msgDiv = document.getElementById('formMessage');

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzzzFHQ6UVk5t3M2BUzbyF3HD8TNETrqoV1m4woS1U0aPsXIxXG0gv7I-cxAuLYtRIS9A/exec';

    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today - tzOffset)).toISOString().split('T')[0];
    dateInput.setAttribute('min', localISOTime);

    const generateTimeSlots = () => {
        const slots = [];
        for (let h = 9; h <= 17; h++) {
            slots.push(`${h.toString().padStart(2, '0')}:00`);
            slots.push(`${h.toString().padStart(2, '0')}:30`);
        }
        return slots;
    };

    const updateAvailableTimes = async () => {
        const doctor = doctorSelect.value;
        const date = dateInput.value;
        const currentLang = localStorage.getItem('lang') || 'ru';
        if (!doctor || !date) {
            timeSelect.innerHTML = `<option value="">${translations[currentLang].select_time_first}</option>`;
            timeSelect.disabled = true;
            return;
        }
        timeSelect.innerHTML = '<option value="">Загрузка...</option>';
        timeSelect.disabled = true;
        try {
            const url = `${SCRIPT_URL}?doctor=${encodeURIComponent(doctor)}&date=${encodeURIComponent(date)}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            const bookedTimes = data.bookedTimes || [];
            const allSlots = generateTimeSlots();
            let validSlots = allSlots;
            if (date === localISOTime) {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMin = now.getMinutes();
                validSlots = allSlots.filter(slot => {
                    const [h, m] = slot.split(':').map(Number);
                    if (h > currentHour) return true;
                    if (h === currentHour && m > currentMin) return true;
                    return false;
                });
            }
            const availableSlots = validSlots.filter(slot => !bookedTimes.includes(slot));
            timeSelect.innerHTML = '<option value="">Выберите время</option>';
            if (availableSlots.length > 0) {
                availableSlots.forEach(slot => {
                    const opt = document.createElement('option');
                    opt.value = slot;
                    opt.textContent = slot;
                    timeSelect.appendChild(opt);
                });
                timeSelect.disabled = false;
            } else {
                timeSelect.innerHTML = '<option value="">Нет свободного времени</option>';
            }
        } catch (error) {
            console.error(error);
            timeSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
        }
    };

    doctorSelect.addEventListener('change', updateAvailableTimes);
    dateInput.addEventListener('change', updateAvailableTimes);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        msgDiv.className = 'form-message loading';
        msgDiv.textContent = 'Отправка...';
        msgDiv.style.display = 'block';

        const currentLang = localStorage.getItem('lang') || 'ru';
        const formData = {
            lastName: document.getElementById('lastName').value,
            firstName: document.getElementById('firstName').value,
            phone: '+996' + document.getElementById('phone').value.replace(/\D/g, ''),
            doctor: doctorSelect.value,
            service: document.getElementById('service').value,
            date: dateInput.value,
            time: timeSelect.value,
            comment: document.getElementById('comment').value,
            lang: currentLang
        };

        const iframeName = 'hidden_iframe_' + Date.now();
        const iframe = document.createElement('iframe');
        iframe.name = iframeName;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const formNode = document.createElement('form');
        formNode.method = 'POST';
        formNode.action = SCRIPT_URL;
        formNode.target = iframeName;
        for (const key in formData) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = formData[key];
            formNode.appendChild(input);
        }
        document.body.appendChild(formNode);
        formNode.submit();

        const handler = (event) => {
            if (event.data?.type === 'BOOKING_SUCCESS') {
                msgDiv.className = 'form-message success';
                msgDiv.textContent = event.data.message;
                form.reset();
                updateAvailableTimes();
                cleanup();
            } else if (event.data?.type === 'BOOKING_ERROR') {
                msgDiv.className = 'form-message error';
                msgDiv.textContent = event.data.error;
                cleanup();
            }
        };
        window.addEventListener('message', handler);
        const cleanup = () => {
            window.removeEventListener('message', handler);
            setTimeout(() => {
                document.body.removeChild(iframe);
                document.body.removeChild(formNode);
                msgDiv.style.display = 'none';
            }, 5000);
        };
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                msgDiv.className = 'form-message success';
                msgDiv.textContent = 'Заявка отправлена!';
                form.reset();
                cleanup();
            }
        }, 8000);
    });

    // Инициализация списков при загрузке
    const initLang = localStorage.getItem('lang') || 'ru';
    updateDoctorOptions(initLang);
    updateServiceOptions(initLang);
})();
