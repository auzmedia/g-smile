// ===== ТЕМА (Тёмная/Светлая) =====
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

// ===== АНИМАЦИИ ПРИ СКРОЛЛЕ =====
AOS.init({ duration: 800, once: true, offset: 20 });

// ===== ВЫБОР УСЛУГИ/ВРАЧА ПО КНОПКЕ =====
document.querySelectorAll('.btn--select').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const serviceValue = this.getAttribute('data-service');
        document.getElementById('service').value = serviceValue;
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    });
});

document.querySelectorAll('.doctor-book-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const doctorName = this.getAttribute('data-doctor');
        document.getElementById('doctor').value = doctorName;
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
        // Провоцируем обновление времени, если дата уже выбрана
        const dateInput = document.getElementById('date');
        if (dateInput.value) {
            dateInput.dispatchEvent(new Event('change'));
        }
    });
});

// ===== ЛОГИКА ФОРМЫ (Google Apps Script API) =====
(function() {
    const form = document.getElementById('bookingForm');
    const doctorSelect = document.getElementById('doctor');
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const msgDiv = document.getElementById('formMessage');
    
    // ВСТАВЬТЕ СЮДА ВАШУ ССЫЛКУ ИЗ GOOGLE APPS SCRIPT!
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwmxrGA68GgQnK1FEAsuDcAjKbGgTZoPkC2Xy0Mc-BQpCV5agne5hUbCYgHtW9RBFuh1A/exec'; 

    // Ограничение даты: нельзя выбрать прошедший день
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

        timeSelect.innerHTML = '<option value="">Загрузка времени...</option>';
        timeSelect.disabled = true;

        try {
            const url = `${SCRIPT_URL}?doctor=${encodeURIComponent(doctor)}&date=${encodeURIComponent(date)}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Network error');
            
            const data = await response.json();
            const bookedTimes = data.bookedTimes || [];
            
            const allSlots = generateTimeSlots();
            
            // Если выбран сегодняшний день, убираем прошедшее время
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
            console.error('Ошибка загрузки времени:', error);
            timeSelect.innerHTML = '<option value="">Ошибка загрузки, попробуйте позже</option>';
        }
    };

    doctorSelect.addEventListener('change', updateAvailableTimes);
    dateInput.addEventListener('change', updateAvailableTimes);

    // Обработка отправки формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        msgDiv.className = 'form-message loading';
        msgDiv.textContent = 'Отправка данных...';
        msgDiv.style.display = 'block';
        
        const currentLang = localStorage.getItem('lang') || 'ru';
        
        const doctorOpt = doctorSelect.options[doctorSelect.selectedIndex];
        const doctorText = doctorOpt ? doctorOpt.text : '';
        
        const serviceOpt = document.getElementById('service').options[document.getElementById('service').selectedIndex];
        const serviceText = serviceOpt ? serviceOpt.text : '';

        const formData = {
            lastName: document.getElementById('lastName').value,
            firstName: document.getElementById('firstName').value,
            phone: '+996' + document.getElementById('phone').value.replace(/\D/g, ''),
            doctor: doctorSelect.value, // DoctorCode для базы
            doctorText: doctorText,     // Текст для телеграма
            service: document.getElementById('service').value,
            serviceText: serviceText,
            date: dateInput.value,
            time: timeSelect.value,
            comment: document.getElementById('comment').value,
            lang: currentLang
        };

        // Создаем невидимый iframe для обхода CORS
        const iframeName = 'hidden_iframe_' + new Date().getTime();
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

        // Слушаем ответ через postMessage от iframe
        const handleMessage = function(event) {
            if (event.data && event.data.type === 'BOOKING_SUCCESS') {
                msgDiv.className = 'form-message success';
                msgDiv.textContent = event.data.message;
                form.reset();
                updateAvailableTimes();
                cleanup();
            } else if (event.data && event.data.type === 'BOOKING_ERROR') {
                msgDiv.className = 'form-message error';
                msgDiv.textContent = event.data.error;
                cleanup();
            }
        };

        window.addEventListener('message', handleMessage);

        const cleanup = () => {
            window.removeEventListener('message', handleMessage);
            setTimeout(() => {
                document.body.removeChild(iframe);
                document.body.removeChild(formNode);
                msgDiv.style.display = 'none';
            }, 5000);
        };
        
        // Фолбэк на случай если iframe не вернет ответ
        setTimeout(() => {
            if(document.body.contains(iframe)) {
                msgDiv.className = 'form-message success';
                msgDiv.textContent = 'Заявка отправлена!';
                form.reset();
                cleanup();
            }
        }, 8000);
    });
})();
