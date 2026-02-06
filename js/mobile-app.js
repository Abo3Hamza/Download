// js/mobile-app.js

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const appId = params.get('id');

    if (!appId) {
        // لو مفيش ID في الرابط، رجعه للرئيسية
        window.location.href = '../index.html';
        return;
    }

    fetch('../apps.json')
        .then(response => response.json())
        .then(apps => {
            const currentApp = apps.find(app => app.name === appId);
            if (currentApp) {
                initMobilePage(currentApp); // لقيناه! اعرض بياناته
            } else {
                document.body.innerHTML = "<h2 style='text-align:center; color:white; margin-top:50px;'>عفواً، التطبيق غير موجود</h2>";
            }
        })
        .catch(error => console.error('Error:', error));
});

function initMobilePage(currentApp) {
    // تعيين اللون الأساسي
    const primaryColor = currentApp.primaryColor || '#4c98ca';
    document.documentElement.style.setProperty('--primary-color', primaryColor);

    // 1. تعبئة البيانات
    document.title = `تحميل ${currentApp.name}`;
    document.getElementById('app-title').textContent = currentApp.name;
    document.getElementById('app-desc').textContent = currentApp.description;
    
    const iconImg = document.getElementById('appIcon');
    if(iconImg) iconImg.src = currentApp.downloadLink.replace('android.apk', 'icon.jpg');
    
    // رابط التحميل
    const downloadBtn = document.querySelector('.btn-download');
    if(downloadBtn) {
        downloadBtn.href = currentApp.downloadLink;
    }

    // 2. إعداد السلايدر
    const sliderWrapper = document.getElementById('slider');
    let slidesCount = currentApp.screenshotsCount || 3;
    

    function buildSlides(isTabletMode = false) {
        sliderWrapper.innerHTML = '';
        const suffix = isTabletMode ? '-tablet' : ''; 
        
        // تعريف عناصر التحكم لإخفائها عند الخطأ
        const dotsContainer = document.getElementById('dots-container');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        // إعادة إظهار الأزرار افتراضياً عند كل تشغيل
        if(dotsContainer) dotsContainer.style.display = 'flex';
        if(prevBtn) prevBtn.style.display = 'block';
        if(nextBtn) nextBtn.style.display = 'block';

        let errorShown = false; // متغير لمنع تكرار الرسالة

        for (let i = 1; i <= slidesCount; i++) {
            const img = document.createElement('img');
            
            img.src = currentApp.downloadLink.replace('android.apk', `screen${suffix}${i}.jpg`);
            img.className = `slide ${i === 1 ? 'active' : ''}`;
            
            if(isTabletMode) {
                img.onerror = function() { 
                    if (!errorShown) {
                        errorShown = true;

                        sliderWrapper.innerHTML = ''; // إزالة الصور الفاشلة
                                                const msgDiv = document.createElement('div');
                        msgDiv.className = 'no-preview-msg';
                        msgDiv.innerHTML = `
                            <i class="fa-solid fa-tablet-screen-button"></i>
                            <p>عفواً، المعاينة غير متاحة</p>
                            <p style="font-size: 0.9rem; margin-top:5px;">هذا التطبيق غير مصمم للعرض في وضع التابلت</p>
                        `;
                        sliderWrapper.appendChild(msgDiv);

                        // 3. إخفاء أزرار التحكم والنقاط للحفاظ على الشكل
                        if(dotsContainer) dotsContainer.style.display = 'none';
                        if(prevBtn) prevBtn.style.display = 'none';
                        if(nextBtn) nextBtn.style.display = 'none';
                    }
                };
            }
            
            sliderWrapper.appendChild(img);
        }
        
        // تهيئة النقاط فقط إذا لم يحدث خطأ
        if (!errorShown) initDots();
    }

    buildSlides(false); // البداية وضع الموبايل

    // 3. منطق السويتش (موبايل / تابلت)
    const switchBtn = document.getElementById('deviceSwitch');
    const frameContainer = document.getElementById('frameContainer');
    const mobileIcon = document.getElementById('mobileIcon');
    const tabletIcon = document.getElementById('tabletIcon');

    if (switchBtn) {
        switchBtn.addEventListener('change', (e) => {
            const isTablet = e.target.checked;
            if (isTablet) {
                frameContainer.classList.add('tablet-mode');
                tabletIcon.classList.add('active');
                mobileIcon.classList.remove('active');
                buildSlides(true);
            } else {
                frameContainer.classList.remove('tablet-mode');
                tabletIcon.classList.remove('active');
                mobileIcon.classList.add('active');
                buildSlides(false);
            }
        });
    }

    setupSliderControls();

    // 4. تعبئة مميزات التطبيق 
    const featuresGrid = document.getElementById('featuresGrid');
    const featuresCount = currentApp.featuresCount || 3;
    featuresGrid.innerHTML = '';
    for (let i = 0; i < featuresCount; i++) {
        const feature = currentApp.features[i];
        const featureDiv = document.createElement('div');
        featureDiv.className = 'feature-card';
        if (feature) {
            
            featureDiv.innerHTML = `
                <h3><i class="${feature.icon} feature-icon"></i>${feature.title}</h3>
                <p>${feature.desc}</p>
            `;
        }
        else {
            featureDiv.innerHTML = `
                <h3><i class="fa-solid fa-star feature-icon"></i>ميزة قادمة</h3>
                <p>سيتم إضافة المزيد من الميزات قريباً.</p>
            `;
        }
        featuresGrid.appendChild(featureDiv);
    }
}

// دوال التحكم بالسلايدر (مشتركة)
function setupSliderControls() {
    let currentSlide = 0;
    
    window.moveSlide = function(n) {
        const slides = document.querySelectorAll('.slide');
        if(slides.length === 0) return;
        
        slides[currentSlide].classList.remove('active');
        updateDots(currentSlide, false);

        currentSlide = (currentSlide + n + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        updateDots(currentSlide, true);
    };

    window.setSlide = function(n) {
        const slides = document.querySelectorAll('.slide');
        if(slides.length === 0) return;

        slides[currentSlide].classList.remove('active');
        updateDots(currentSlide, false);
        currentSlide = n;
        slides[currentSlide].classList.add('active');
        updateDots(currentSlide, true);
    };
}

function initDots() {
    const dotsContainer = document.getElementById('dots-container');
    const slides = document.querySelectorAll('.slide');
    if(!dotsContainer) return;
    dotsContainer.innerHTML = ''; 

    slides.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => window.setSlide(idx));
        dotsContainer.appendChild(dot);
    });
}

function updateDots(index, isActive) {
    const dots = document.querySelectorAll('.dot');
    if(dots[index]) {
        isActive ? dots[index].classList.add('active') : dots[index].classList.remove('active');
    }
}