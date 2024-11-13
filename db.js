let db;

function setupIndexedDB() {
    const request = indexedDB.open('MusicCalendarDB', 1);

    request.onerror = (event) => {
        console.error('数据库错误:', event.target.error);
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        
        // 创建存储日历数据的对象仓库
        if (!db.objectStoreNames.contains('calendarEntries')) {
            const store = db.createObjectStore('calendarEntries', { keyPath: 'date' });
            store.createIndex('date', 'date', { unique: true });
        }
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        loadCalendarData(); // 加载保存的数据
    };
}

// 保存日历条目
async function saveDayEntry(date, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['calendarEntries'], 'readwrite');
        const store = transaction.objectStore('calendarEntries');

        const entry = {
            date: date,
            songData: data,
            diary: data.diary || '',
            lastModified: new Date().toISOString()
        };

        const request = store.put(entry);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// 加载日历数据
function loadCalendarData() {
    const transaction = db.transaction(['calendarEntries'], 'readonly');
    const store = transaction.objectStore('calendarEntries');
    const request = store.getAll();

    request.onsuccess = () => {
        const entries = request.result;
        entries.forEach(entry => {
            const dayElement = document.querySelector(`.calendar-day[data-date="${entry.date}"]`);
            if (dayElement) {
                updateDayDisplay(dayElement, entry.songData);
                // 恢复日记内容
                const diaryEntry = dayElement.querySelector('.diary-entry');
                if (diaryEntry && entry.diary) {
                    diaryEntry.textContent = entry.diary;
                }
            }
        });
    };
}

// 保存日记内容
function saveDiaryContent(date, content) {
    const transaction = db.transaction(['calendarEntries'], 'readwrite');
    const store = transaction.objectStore('calendarEntries');
    
    const request = store.get(date);
    request.onsuccess = () => {
        const entry = request.result || { date: date };
        entry.diary = content;
        entry.lastModified = new Date().toISOString();
        store.put(entry);
    };
}

// 添加删除条目的函数
async function deleteDayEntry(date) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['calendarEntries'], 'readwrite');
        const store = transaction.objectStore('calendarEntries');
        const request = store.delete(date);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
} 