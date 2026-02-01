// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    fetch('apps.json')
        .then(response => response.json())
        .then(appsData => {
            initStorePage(appsData);
        })
        .catch(error => console.error('Error loading apps data:', error));
});

function initStorePage(apps) {
    const grid = document.getElementById('appsGrid');
    const searchInput = document.getElementById('searchInput');
    const noResults = document.getElementById('noResults');
    
    // عناصر الفلتر
    const filterBtn = document.getElementById('filterToggleBtn');
    const filterMenu = document.getElementById('filterMenu');
    let currentFilter = 'all';

    // 1. تحديث العدادات
    updateFilterCounts(apps);

    // 2. منطق زر الفلتر (فتح/غلق)
    if (filterBtn && filterMenu) {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterMenu.classList.toggle('show');
            filterBtn.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!filterMenu.contains(e.target) && !filterBtn.contains(e.target)) {
                filterMenu.classList.remove('show');
                filterBtn.classList.remove('active');
            }
        });
    }

    // 3. دالة الرسم (Render)
    function renderApps(appsToRender) {
        grid.innerHTML = '';
        
        if (appsToRender.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        noResults.style.display = 'none';

        appsToRender.forEach((app, index) => {
            const card = document.createElement('a');
            card.style.cursor = 'pointer'; // عشان الماوس يبقى شكل يد
            card.className = 'app-card';
            
            // تحديد الرابط بناءً على الهيكلة الجديدة
            // بما أننا في index.html، ندخل مجلد html للوصول للصفحات
            const targetPage = app.type === 'desktop' ? 'html/desktop-app.html' : 'html/mobile-app.html';
            card.href = `${targetPage}?id=${app.name}`; // الرابط المخصص
            
            const isDesktop = app.type === 'desktop';
            const typeIcon = isDesktop ? '<i class="fa-brands fa-windows"></i>' : '<i class="fa-brands fa-android"></i>';
            const typeName = isDesktop ? 'Desktop' : 'Android';
            const typeClass = isDesktop ? 'type-desktop' : 'type-android';
            const downloadfile = isDesktop ? 'desktop.exe' : 'android.apk';

            // الأنيميشن
            card.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;
            card.style.opacity = '0'; 

            const downloadLink = app.downloadLink || '#';
            const imageLink = downloadLink.replace(`/${downloadfile}`, '/icon.png');

            card.innerHTML = `
                <img src="${imageLink}" class="card-icon" alt="${app.name}" onerror="this.src='https://via.placeholder.com/150/333/fff?text=App'">
                <div class="card-title">${app.name}</div>
                <div class="card-type ${typeClass}">
                    ${typeIcon} <span>${typeName}</span>
                </div>
                <div class="btn-view">عرض التفاصيل</div>
            `;

            grid.appendChild(card);
        });
    }

    // 4. دالة الفلترة
    window.selectFilter = function(type) {
        currentFilter = type;
        
        // تحديث الـ UI للقائمة
        document.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('active'));
        const index = type === 'all' ? 0 : type === 'android' ? 1 : 2;
        const options = document.querySelectorAll('.filter-option');
        if(options[index]) options[index].classList.add('active');

        // تطبيق الفلتر
        const filtered = apps.filter(app => {
            const matchesType = type === 'all' || app.type === type;
            const matchesSearch = app.name.toLowerCase().includes(searchInput.value.toLowerCase());
            return matchesType && matchesSearch;
        });

        renderApps(filtered);
        
        // إغلاق القائمة
        filterMenu.classList.remove('show');
        filterBtn.classList.remove('active');

        // تحديث النص الظاهر (اختياري)
        const label = document.getElementById('activeFilterLabel');
        const labelText = document.getElementById('currentFilterName');
        if(label && labelText) {
            label.style.display = 'block';
            labelText.textContent = type === 'all' ? 'الكل' : type === 'android' ? 'أندرويد' : 'كمبيوتر';
        }
    };

    // 5. البحث
    searchInput.addEventListener('input', () => {
        window.selectFilter(currentFilter); // إعادة استخدام نفس المنطق
    });

    // العرض الأولي
    renderApps(apps);
}

function updateFilterCounts(apps) {
    document.getElementById('count-all').textContent = apps.length;
    document.getElementById('count-android').textContent = apps.filter(a => a.type === 'android').length;
    document.getElementById('count-desktop').textContent = apps.filter(a => a.type === 'desktop').length;
}