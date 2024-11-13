const clientId = 'b21270aec1db4f7abc51422e429a216e';
const clientSecret = 'a4e8b2bd834a49dc8e0159d47cfba1ba';

let accessToken;
let currentAudio = null;
let currentSongData = null;
let db;

// 添加播放统计和推荐相关的数据结构
let playStats = {
    playCount: {},  // 记录每首歌播放次数
    genreStats: {}, // 记录流派统计
    timeStats: {},  // 记录不同时段的播放统计
    favorites: [],  // 收藏的歌曲
    recentPlays: [] // 最近播放
};

// 添加音乐列表数据
const musicLibrary = {
    "music": [
      {
        "title": "F&N",
        "artist": "Future",
        "genre": "rap",
        "year": 2019,
        "ryanStats": {
          "rating": "4 stars",
          "vibe": "getting ready"
        },
        "image_url": "https://i1.sndcdn.com/artworks-fiOir7HoOdGO-0-t1080x1080.jpg",
        "song_url": "https://open.spotify.com/track/5YP6yKgGGsXKukqxXypVAf?si=689edb55571742bd"
      },
      {
        "title": "Xenomorphgirl",
        "artist": "Arca",
        "genre": "experimental",
        "year": 2021,
        "ryanStats": {
          "rating": "4 stars",
          "vibe": "chilling"
        },
        "image_url": "https://goodrecordstogo.com/cdn/shop/files/4085705-2835118_720x.jpg?v=1712947053",
        "song_url": "https://open.spotify.com/track/7MOP5UC1eJaRFpZFFQ71dh?si=c8c7c3d4c41948ca"
      },
      {
        "title": "Mouse",
        "artist": "DMX Krew",
        "genre": "electro",
        "year": 1998,
        "ryanStats": {
          "rating": "4 stars",
          "vibe": "commuting"
        },
        "image_url": "https://i.scdn.co/image/ab67616d00001e02907f281091c73b66d4906c0e",
        "song_url": "https://open.spotify.com/track/0sijjhYQQnDWUkbKTl3SrV?si=b38623e7d2cd4260"
      },
      {
        "title": "Boudoir",
        "artist": "Titonton Duvante",
        "genre": "techno",
        "year": 1999,
        "ryanStats": {
          "rating": "5 stars",
          "vibe": "dreamy techno dancing"
        },
        "image_url": "https://i.discogs.com/_m1ZxfRXL1P4p6WVT7BbCkfeWjGhJg63MQ-jEXmvkag/rs:fit/g:sm/q:40/h:300/w:300/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTIyNDIz/MDA2LTE2NDY2NzEy/NjgtMjQ3Ni5qcGVn.jpeg",
        "song_url": "https://open.spotify.com/track/1OfmyqhQFjnt8D9Uxh6Qvu?si=4e973612d55d41a0"
      },
      {
        "title": "10000 Steps But Still Biting My Nails",
        "artist": "Bjarki",
        "genre": "experimental",
        "year": 2019,
        "ryanStats": {
          "rating": "5 stars",
          "vibe": "dreamy techno dancing"
        },
        "image_url": "https://f4.bcbits.com/img/a3137502771_10.jpg",
        "song_url": "https://open.spotify.com/track/450UurhtzSWoX9PhnsRsyV?si=6c56e0b59fdd42c5"
      },
      {
        "title": "home with you",
        "artist": "Fka twigs",
        "genre": "experimental",
        "year": 2019,
        "ryanStats": {
          "rating": "5 stars",
          "vibe": "relaxing"
        },
        "image_url": "https://i.scdn.co/image/ab67616d0000b27386011cee37f1842374d971aa",
        "song_url": "https://open.spotify.com/track/7BpykYGkewMF00FzSJLSgH?si=1b69bdf70b8548a9"
      },
      {
        "title": "Pretty Canary",
        "artist": "Tongue in the Mind",
        "genre": "experimental",
        "year": 2024,
        "ryanStats": {
          "rating": "5 stars",
          "vibe": "showering"
        },
        "image_url": "https://i.scdn.co/image/ab67616d0000b2733400a0d715e49681ba93ecbf",
        "song_url": "https://open.spotify.com/track/0heSL7aoecWPpGjUthUPJ6?si=652413d446e54bbe"
      },
      
      {
        "title": "F&N",
        "artist": "Future",
        "genre": "rap",
        "year": 2019,
        "ryanStats": {
          "rating": "4 stars",
          "vibe": "getting ready"
        },
        "image_url": "https://i1.sndcdn.com/artworks-fiOir7HoOdGO-0-t1080x1080.jpg",
        "song_url": "https://open.spotify.com/track/5YP6yKgGGsXKukqxXypVAf?si=689edb55571742bd"
      }

    ]
  }
  

// 获取 Spotify 访问令牌
async function getAccessToken() {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
            },
            body: 'grant_type=client_credentials',
        });

        const data = await response.json();
        accessToken = data.access_token;
    } catch (error) {
        console.error('获取访问令牌时出错:', error);
    }
}

// 修改获取音乐预览 URL 的函数
async function getPreviewUrl(spotifyUrl) {
    try {
        // 从 Spotify URL 中提取 track ID
        const trackId = spotifyUrl.split('/track/')[1].split('?')[0];
        
        // 使用 track ID 获取歌曲详情
        const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        const data = await response.json();
        return data.preview_url; // 返回 30 秒预览 URL
    } catch (error) {
        console.error('获取预览 URL 失败:', error);
        return null;
    }
}

// 添加音乐特征分析和 Vibe 分类函数
async function getTrackFeatures(trackId) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('获取音乐特征失败:', error);
        return null;
    }
}

// 根据音乐特征确定 Vibe
function determineVibe(features) {
    if (!features) return 'Unknown';

    // 能量和情绪值的组合
    const energy = features.energy;
    const valence = features.valence;
    const danceability = features.danceability;
    const tempo = features.tempo;
    const acousticness = features.acousticness;

    // Vibe 分类逻辑
    if (energy > 0.8 && valence > 0.8) return 'Energetic & Happy';
    if (energy > 0.8 && danceability > 0.8) return 'Party Vibes';
    if (energy < 0.3 && valence < 0.3) return 'Melancholic';
    if (acousticness > 0.8) return 'Acoustic Chill';
    if (energy < 0.4 && valence > 0.6) return 'Peaceful & Positive';
    if (tempo > 150) return 'Upbeat';
    if (tempo < 100 && valence < 0.5) return 'Relaxing';
    if (danceability > 0.7) return 'Groovy';
    
    return 'Balanced';
}

// Spotify 流派分类
const spotifyGenres = {
    mainGenres: [
        'pop', 'hip-hop', 'rock', 'electronic', 'classical', 'jazz',
        'r-n-b', 'latin', 'metal', 'indie', 'folk', 'blues'
    ],
    subGenres: {
        electronic: [
            'house', 'techno', 'dubstep', 'trance', 'ambient',
            'drum-and-bass', 'electro', 'idm', 'synthwave'
        ],
        rock: [
            'alternative', 'indie-rock', 'punk', 'metal',
            'classic-rock', 'psychedelic', 'prog-rock'
        ],
        // ... 其他子流派
    }
};

// 修改获取歌曲信息的函数
async function getTrackInfo(trackId) {
    try {
        // 获取歌曲基本信息
        const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const trackData = await trackResponse.json();

        // 获取歌曲特征
        const features = await getTrackFeatures(trackId);
        
        // 获取艺术家流派
        const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${trackData.artists[0].id}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const artistData = await artistResponse.json();

        return {
            title: trackData.name,
            artist: trackData.artists[0].name,
            preview_url: trackData.preview_url,
            image_url: trackData.album.images[0]?.url,
            song_url: trackData.external_urls.spotify,
            genres: artistData.genres,
            vibe: determineVibe(features),
            features: {
                danceability: features.danceability,
                energy: features.energy,
                valence: features.valence,
                tempo: features.tempo,
                acousticness: features.acousticness
            }
        };
    } catch (error) {
        console.error('获取歌曲信息失败:', error);
        return null;
    }
}

// 修改播放预览函数，显示更详细的信息
async function playPreview(songData) {
    try {
        // 停止当前正在播放的音频
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.removeEventListener('timeupdate', updateProgressBar);
            currentAudio = null;
        }

        // 获取预览 URL
        const previewUrl = await getPreviewUrl(songData.song_url);
        
        if (previewUrl) {
            // 创建新的音频实例
            const audio = new Audio(previewUrl);
            
            // 添加加载完成事件监听
            audio.addEventListener('loadeddata', () => {
                currentAudio = audio; // 只在加载完成后设置 currentAudio
                audio.play();
                currentSongData = songData;

                const albumCover = document.getElementById('albumCover');
                albumCover.style.backgroundImage = `url(${songData.image_url})`;
                
                // 添加或更新收藏按钮
                let favoriteButton = albumCover.querySelector('.favorite-button');
                if (!favoriteButton) {
                    favoriteButton = document.createElement('button');
                    favoriteButton.className = 'favorite-button';
                    albumCover.appendChild(favoriteButton);
                }

                // 检查是否已收藏
                const isFavorited = playStats.favorites.some(fav => 
                    fav.title === songData.title && fav.artist === songData.artist
                );
                favoriteButton.innerHTML = isFavorited ? '❤️' : '🤍';
                favoriteButton.classList.toggle('active', isFavorited);

                // 修改点击事件
                favoriteButton.onclick = (e) => {
                    e.stopPropagation();
                    const isCurrentlyFavorited = favoriteButton.classList.contains('active');
                    
                    if (isCurrentlyFavorited) {
                        // 从收藏中移除
                        playStats.favorites = playStats.favorites.filter(fav => 
                            fav.title !== songData.title || fav.artist !== songData.artist
                        );
                        favoriteButton.innerHTML = '🤍';
                        favoriteButton.classList.remove('active');
                        // 从收藏列表中移除对应项
                        const favoriteItem = document.querySelector(`.favorite-item[data-title="${songData.title}"]`);
                        if (favoriteItem) {
                            favoriteItem.remove();
                        }
                        showFeedback(albumCover, 'Removed from favorites');
                    } else {
                        // 添加到收藏
                        addToFavorites(songData);
                        favoriteButton.innerHTML = '❤️';
                        favoriteButton.classList.add('active');
                        showFeedback(albumCover, 'Added to favorites');
                    }
                    saveFavorites();
                };

                // 更新播放按钮状态
                document.getElementById('pause-play').textContent = '⏸️ Pause';
                
                // 更新歌曲信息显示
                document.getElementById('song-info').innerHTML = `
                    <div class="song-info-container">
                        <div class="song-title">${songData.title}</div>
                        <div class="song-artist">${songData.artist}</div>
                        <div class="song-details-row">
                            <div class="song-detail-item">
                                <span class="detail-label">Genre:</span>
                                <span class="detail-value">${songData.genre || 'Unknown'}</span>
                            </div>
                            <div class="song-detail-item">
                                <span class="detail-label">Vibe:</span>
                                <span class="detail-value">${songData.ryanStats?.vibe || 'Unknown'}</span>
                            </div>
                            <div class="song-detail-item">
                                <span class="detail-label">Year:</span>
                                <span class="detail-value">${songData.year || 'Unknown'}</span>
                            </div>
                            <div class="song-detail-item">
                                <span class="detail-label">Rating:</span>
                                <span class="detail-value">${songData.ryanStats?.rating || 'N/A'}</span>
                            </div>
                        </div>
                        <button id="play-similar" class="play-similar-button">🎲 Play Similar</button>
                    </div>
                `;

                // 添加随机播放推荐音乐的事件监听
                document.getElementById('play-similar').addEventListener('click', async () => {
                    const recommendations = await getSpotifyRecommendations();
                    if (recommendations.length > 0) {
                        const randomIndex = Math.floor(Math.random() * recommendations.length);
                        playPreview(recommendations[randomIndex]);
                    }
                });

                // 添加进度条更新监听
                audio.addEventListener('timeupdate', updateProgressBar);

                // 添加播放结束事件监听器
                audio.addEventListener('ended', async () => {
                    // 获取推荐歌曲并播放下一首
                    const recommendations = await getSpotifyRecommendations();
                    if (recommendations.length > 0) {
                        const randomIndex = Math.floor(Math.random() * recommendations.length);
                        playPreview(recommendations[randomIndex]); // 自动播放推荐歌曲
                    }
                });
            });

            // 添加错误处理
            audio.addEventListener('error', (e) => {
                console.error('音频播放错误:', e);
                alert('播放出错，请稍后重试');
            });
            
            // 添加播放结束事件
            audio.addEventListener('ended', () => {
                document.getElementById('pause-play').textContent = '▶️ Play';
                // 清除进度条
                const progressBar = document.getElementById('progress');
                if (progressBar) {
                    progressBar.style.width = '0%';
                }
            });

            // 添加到历史记录
            addToHistory(songData);

            // 更新播放统计
            updatePlayStats(songData);
            
            // 显示推荐
            showRecommendations();
        } else {
            console.error('无法获取预览 URL');
            alert('抱歉，该歌曲暂时无法播放预览');
        }
    } catch (error) {
        console.error('播放失败:', error);
        alert('播放出错，请稍后重试');
    }
}

// 修改进度条更新函数
function updateProgressBar() {
    if (!currentAudio) return;
    
    const progressBar = document.getElementById('progress');
    if (progressBar && currentAudio.duration) {
        const percentage = (currentAudio.currentTime / currentAudio.duration) * 100;
        progressBar.style.width = `${percentage}%`;
    }
}

// 添加到历史记录
function addToHistory(song) {
    const historyContainer = document.getElementById('historyContainer');
    const songItem = document.createElement('div');
    songItem.className = 'song-item';
    songItem.style.backgroundImage = `url(${song.image_url})`;
    songItem.dataset.previewUrl = song.preview_url;
    songItem.innerHTML = `
        <p><strong>${song.title}</strong> - ${song.artist}</p>
    `;

    songItem.onclick = () => playPreview(song);
    historyContainer.prepend(songItem);
}

// 加载收藏列表
function loadFavorites() {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
        playStats.favorites = JSON.parse(savedFavorites);
        playStats.favorites.forEach(song => addFavoriteItem(song));
    }
}

// 保存收藏列表
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(playStats.favorites));
}

// 添加收藏项
function addFavoriteItem(song) {
    const favoritesContainer = document.getElementById('favoritesContainer');
    let favoritesSection = favoritesContainer.querySelector('.favorites-section');
    if (!favoritesSection) {
        favoritesSection = document.createElement('div');
        favoritesSection.className = 'favorites-section';
        favoritesSection.innerHTML = `
            <div class="section-header">
                <h3>Favorites</h3>
                <div class="divider"></div>
            </div>
            <div class="favorites-list"></div>
        `;
        favoritesContainer.appendChild(favoritesSection);
    }

    const favoritesList = favoritesSection.querySelector('.favorites-list');
    const favoriteItem = document.createElement('div');
    favoriteItem.className = 'favorite-item';
    favoriteItem.innerHTML = `
        <img src="${song.image_url}" alt="${song.title}" class="song-cover">
        <div class="song-info">
            <p><strong>${song.title}</strong></p>
            <p>${song.artist}</p>
        </div>
        <button class="delete-favorite">×</button>
    `;

    // 添加点击播放功能
    favoriteItem.addEventListener('click', () => playPreview(song));

    // 添加删除按钮功能
    const deleteButton = favoriteItem.querySelector('.delete-favorite');
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡，防止触发播放
        // 从收藏列表中移除
        playStats.favorites = playStats.favorites.filter(fav => 
            fav.title !== song.title || fav.artist !== song.artist
        );
        // 保存到本地存储
        saveFavorites();
        // 移除 DOM 元素
        favoriteItem.remove();
        
        // 显示删除成功提示
        showFeedback(favoriteItem, '已从收藏中移除');
    });

    favoritesList.appendChild(favoriteItem);
}

// 修改 addToFavorites 函数，添加查重功能
function addToFavorites(song) {
    // 检查是否已经收藏
    const isAlreadyFavorited = playStats.favorites.some(fav => 
        fav.title === song.title && fav.artist === song.artist
    );

    if (!isAlreadyFavorited) {
        playStats.favorites.push(song);
        saveFavorites();
        addFavoriteItem(song);
        return true;
    } else {
        // 显示已收藏提示
        const existingItem = document.querySelector(`.favorite-item:has(strong:contains("${song.title}"))`);
        if (existingItem) {
            showFeedback(existingItem, '已收藏过了');
        }
        return false;
    }
}

// 显示歌
function showDetails(song) {
    document.getElementById('modal-info').innerHTML = `
        <h3>${song.title} - ${song.artist}</h3>
        <p>${song.details}</p>
    `;
    document.getElementById('song-detail-modal').style.display = 'flex';
}

// 隐藏详情弹窗
document.getElementById('close-modal').onclick = function() {
    document.getElementById('song-detail-modal').style.display = 'none';
};

// 修改随机播放函数
async function playRandomSong() {
    const randomIndex = Math.floor(Math.random() * musicLibrary.music.length);
    const song = musicLibrary.music[randomIndex];
    await playPreview(song);
}

// 修改暂停/播放按钮的处理
document.getElementById('pause-play').addEventListener('click', () => {
    if (currentAudio) {
        if (currentAudio.paused) {
            currentAudio.play();
            document.getElementById('pause-play').textContent = '⏸️ Pause';
        } else {
            currentAudio.pause();
            document.getElementById('pause-play').textContent = '▶️ Play';
        }
    }
});

// 改搜索功能，使用 Spotify API
async function searchSpotify(query) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        const data = await response.json();
        return data.tracks.items.map(track => ({
            title: track.name,
            artist: track.artists[0].name,
            preview_url: track.preview_url,
            image_url: track.album.images[0]?.url,
            song_url: track.external_urls.spotify,
            genre: track.album.genres?.[0] || 'Unknown',
            year: track.album.release_date?.split('-')[0],
            details: `专辑：${track.album.name}，发布时间：${track.album.release_date}`,
            ryanStats: {
                rating: "N/A",
                vibe: "Custom"
            }
        }));
    } catch (error) {
        console.error('搜索失败:', error);
        return [];
    }
}

// 修改搜索按钮事件监听器
document.getElementById('search-button').addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    if (!query) return;

    const searchResults = await searchSpotify(query);
    
    // 清空之前的搜索结果
    const favoritesContainer = document.getElementById('favoritesContainer');
    const oldResults = favoritesContainer.querySelector('.search-results');
    if (oldResults) {
        oldResults.remove();
    }

    // 创建搜索结果容器
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';
    resultsContainer.innerHTML = `
        <div class="section-header">
            <h3>Search Results</h3>
            <div class="divider"></div>
        </div>
    `;
    
    // 添加搜索结果
    const resultsListContainer = document.createElement('div');
    resultsListContainer.className = 'results-list';
    
    searchResults.forEach(song => {
        const resultItem = document.createElement('div');
        resultItem.className = 'favorite-item';
        resultItem.innerHTML = `
            <img src="${song.image_url}" alt="${song.title}" class="song-cover">
            <div class="song-info">
                <p><strong>${song.title}</strong></p>
                <p>${song.artist}</p>
            </div>
        `;

        // 添加单击和双击事件处理
        let clickTimer = null;
        resultItem.addEventListener('click', (e) => {
            if (clickTimer === null) {
                clickTimer = setTimeout(() => {
                    playPreview(song);
                    clickTimer = null;
                }, 200);
            }
        });

        resultItem.addEventListener('dblclick', (e) => {
            clearTimeout(clickTimer);
            clickTimer = null;
            addToFavorites(song);
            showFeedback(resultItem, '已添加到收藏');
        });

        resultsListContainer.appendChild(resultItem);
    });

    resultsContainer.appendChild(resultsListContainer);
    favoritesContainer.insertBefore(resultsContainer, favoritesContainer.firstChild);
});

// 添加视觉反馈函数
function showFeedback(element, message) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-message';
    feedback.textContent = message === '已添加到收藏' ? 'Added to favorites' :
                          message === '已从收藏中移除' ? 'Removed from favorites' :
                          message === '已经收藏过了' ? 'Already in favorites' :
                          message;
    element.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
}

// 添加相关的 CSS 样式
const sidebarStyles = `
    .section-header {
        margin: 20px 0 10px 0;
    }

    .section-header h3 {
        color: #1db954;
        font-size: 16px;
        margin-bottom: 5px;
    }

    .divider {
        height: 1px;
        background: #444;
        margin: 10px 0;
    }

    .search-results,
    .favorites-section,
    .recommendations {
        margin-bottom: 20px;
    }

    .results-list,
    .favorites-list {
        max-height: 300px;
        overflow-y: auto;
    }

    .feedback-message {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(29, 185, 84, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        animation: fadeInOut 2s ease-in-out;
        pointer-events: none;
        z-index: 1000;
    }

    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
`;

// 将样式添加到文档中
const sidebarStyleSheet = document.createElement('style');
sidebarStyleSheet.textContent = sidebarStyles;
document.head.appendChild(sidebarStyleSheet);

// 初始化
document.addEventListener("DOMContentLoaded", async () => {
    await getAccessToken();
    setupIndexedDB();
    loadFavorites(); // 加载收藏列表
    document.getElementById('play-random').addEventListener('click', () => playRandomSong());
    generateCalendar();
    setupDragAndDrop();
    makeDraggable(document.getElementById('musicPlayer'));
    addExportButton();
    addHelpButton();
});

// 添加当前显示的年月变量
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

// 修改 generateCalendar 函，添加月份切换功能
function generateCalendar() {
    const calendarContainer = document.getElementById('calendar');
    calendarContainer.innerHTML = ''; // 清空日历容器
    
    // 添加日历头部
    const headerDiv = document.createElement('div');
    headerDiv.className = 'calendar-header';
    headerDiv.innerHTML = `
        <button class="prev-month">◀</button>
        <h2>${currentYear} ${getMonthName(currentMonth)}</h2>
        <button class="next-month">▶</button>
    `;
    calendarContainer.appendChild(headerDiv);

    // 添加月份切换事件监听
    headerDiv.querySelector('.prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar();
        loadCalendarData(); // 加载新月份的数据
    });

    headerDiv.querySelector('.next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar();
        loadCalendarData(); // 加载新月份的数据
    });

    // 添加星期标题
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekDays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-weekday';
        dayHeader.textContent = day;
        calendarContainer.appendChild(dayHeader);
    });

    // 生成日期子
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 添加个月的剩余天数
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarContainer.appendChild(emptyDay);
    }

    // 添加当月的天数
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        // 使用 YYYY-MM-DD 格式存储日期
        const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        day.dataset.date = dateStr;
        day.innerHTML = `
            <span class="date-number">${i}</span>
            <div class="diary-entry" contenteditable="true" placeholder="Write your mood here..."></div>
        `;
        setupDayDragAndDrop(day);
        calendarContainer.appendChild(day);
    }
}

function setupDayDragAndDrop(dayElement) {
    dayElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        dayElement.classList.add('drag-over');
    });

    dayElement.addEventListener('dragleave', () => {
        dayElement.classList.remove('drag-over');
    });

    dayElement.addEventListener('drop', async (e) => {
        e.preventDefault();
        dayElement.classList.remove('drag-over');
        
        const songData = JSON.parse(e.dataTransfer.getData('application/json'));
        if (songData) {
            await saveDayEntry(dayElement.dataset.date, songData);
            updateDayDisplay(dayElement, songData);
        }
    });
}

function updateDayDisplay(dayElement, songData) {
    const dateNumber = dayElement.querySelector('.date-number').textContent;
    dayElement.innerHTML = '';
    
    const dateSpan = document.createElement('span');
    dateSpan.className = 'date-number';
    dateSpan.textContent = dateNumber;
    dayElement.appendChild(dateSpan);
    
    const coverWrapper = document.createElement('div');
    coverWrapper.className = 'cover-wrapper';
    
    const cover = document.createElement('img');
    cover.className = 'music-cover';
    cover.src = songData.image_url;
    cover.alt = 'Album Cover';
    
    // 添加单击和双击事件
    let clickTimer = null;
    coverWrapper.addEventListener('click', (e) => {
        if (clickTimer === null) {
            clickTimer = setTimeout(() => {
                playPreview(songData); // 单击播放
                clickTimer = null;
            }, 200);
        }
    });
    
    coverWrapper.addEventListener('dblclick', (e) => {
        clearTimeout(clickTimer);
        clickTimer = null;
        if (songData.song_url) {
            window.open(songData.song_url, '_blank'); // 双击打开 Spotify
        }
    });
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerHTML = '×';
    deleteButton.onclick = async (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        await deleteDayEntry(dayElement.dataset.date);
        dayElement.innerHTML = `
            <span class="date-number">${dateNumber}</span>
            <div class="diary-entry" contenteditable="true" placeholder="Write your mood here..."></div>
        `;
    };
    
    coverWrapper.appendChild(cover);
    coverWrapper.appendChild(deleteButton);
    dayElement.appendChild(coverWrapper);
    
    const diary = document.createElement('div');
    diary.className = 'diary-entry';
    diary.contentEditable = true;
    
    // 只有当有日记内容时才显示
    if (songData.diary) {
        diary.textContent = songData.diary;
        diary.classList.add('has-content'); // 添加一个标识类
    }
    
    // 添加焦点事件监听器
    diary.addEventListener('focus', () => {
        if (!diary.textContent.trim()) {
            diary.setAttribute('placeholder', 'Write your mood here...');
        }
    });
    
    diary.addEventListener('blur', () => {
        if (!diary.textContent.trim()) {
            diary.removeAttribute('placeholder');
        }
    });
    
    diary.addEventListener('input', () => {
        if (diary.textContent.trim()) {
            diary.classList.add('has-content');
        } else {
            diary.classList.remove('has-content');
        }
        saveDiaryContent(dayElement.dataset.date, diary.textContent);
    });
    
    dayElement.appendChild(diary);
}

function setupDragAndDrop() {
    const albumCover = document.getElementById('albumCover');
    albumCover.draggable = true;

    albumCover.addEventListener('dragstart', (e) => {
        e.stopPropagation();
        const songData = {
            ...currentSongData,
            song_url: currentSongData?.song_url
        };
        e.dataTransfer.setData('application/json', JSON.stringify(songData));
    });

    const draggableItems = document.querySelectorAll('.favorite-item, .song-item');
    draggableItems.forEach(item => {
        item.draggable = true;
        item.addEventListener('dragstart', (e) => {
            const songData = {
                image_url: item.querySelector('img').src,
                preview_url: item.dataset.previewUrl
            };
            e.dataTransfer.setData('application/json', JSON.stringify(songData));
        });
    });

    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
        day.addEventListener('dragover', (e) => {
            e.preventDefault();
            day.classList.add('highlight');
        });

        day.addEventListener('dragleave', () => {
            day.classList.remove('highlight');
        });

        day.addEventListener('drop', (e) => {
            e.preventDefault();
            day.classList.remove('highlight');
            const songData = JSON.parse(e.dataTransfer.getData('application/json'));
            if (songData) {
                saveToIndexedDB(day.dataset.date, songData);
                updateDayDisplay(day, songData);
            }
        });
    });
}

function displayAlbumCover(dayElement, albumCover) {
    const img = document.createElement('img');
    img.src = 'path/to/album/cover.jpg'; // 替为实际的专辑封面路径
    img.className = 'album-cover';
    dayElement.appendChild(img);

    const diaryEntry = document.createElement('div');
    diaryEntry.className = 'diary-entry';
    diaryEntry.contentEditable = true;
    diaryEntry.textContent = '点击写日记...';
    dayElement.appendChild(diaryEntry);
}

// 初始化 IndexedDB
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
        if (!db) {
            reject(new Error('数据库未初始化'));
            return;
        }

        const transaction = db.transaction(['calendarEntries'], 'readwrite');
        const store = transaction.objectStore('calendarEntries');

        const entry = {
            date: date,
            songData: data,
            diary: data.diary || '',
            lastModified: new Date().toISOString()
        };

        const request = store.put(entry);

        request.onsuccess = () => {
            console.log(`成功保存日期 ${date} 的条目`);
            resolve();
        };

        request.onerror = () => {
            console.error(`存日期 ${date} 的条目时出错:`, request.error);
            reject(request.error);
        };
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
            // 检查日期是属于当前显示的月份
            const entryDate = new Date(entry.date);
            if (entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonth) {
                const dayElement = document.querySelector(`.calendar-day[data-date="${entry.date}"]`);
                if (dayElement) {
                    updateDayDisplay(dayElement, entry.songData);
                    // 恢复日记内容
                    const diaryEntry = dayElement.querySelector('.diary-entry');
                    if (diaryEntry && entry.diary) {
                        diaryEntry.textContent = entry.diary;
                    }
                }
            }
        });
    };
}

// 保存日记内
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

function makeDraggable(element) {
    let isDragging = false;
    let isResizing = false;
    let currentHandle = null;
    let offsetX, offsetY;
    let originalWidth, originalHeight, originalX, originalY;

    // 添加标题栏
    const titleBar = document.createElement('div');
    titleBar.className = 'title-bar';
    titleBar.innerHTML = '🎵 Music Player';
    element.insertBefore(titleBar, element.firstChild);

    // 添加调整大小的手柄
    const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    handles.forEach(position => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${position}`;
        element.appendChild(handle);

        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            currentHandle = position;
            e.stopPropagation();

            originalWidth = element.offsetWidth;
            originalHeight = element.offsetHeight;
            originalX = element.offsetLeft;
            originalY = element.offsetTop;
            offsetX = e.clientX;
            offsetY = e.clientY;
        });
    });

    // 拖动标题栏
    titleBar.addEventListener('mousedown', (e) => {
        if (!isResizing) {
            isDragging = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            titleBar.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            element.style.left = `${e.clientX - offsetX}px`;
            element.style.top = `${e.clientY - offsetY}px`;
        }
        else if (isResizing) {
            e.preventDefault();
            
            const deltaX = e.clientX - offsetX;
            const deltaY = e.clientY - offsetY;

            switch(currentHandle) {
                case 'bottom-right':
                    element.style.width = `${originalWidth + deltaX}px`;
                    element.style.height = `${originalHeight + deltaY}px`;
                    break;
                case 'bottom-left':
                    element.style.width = `${originalWidth - deltaX}px`;
                    element.style.left = `${originalX + deltaX}px`;
                    element.style.height = `${originalHeight + deltaY}px`;
                    break;
                case 'top-right':
                    element.style.width = `${originalWidth + deltaX}px`;
                    element.style.height = `${originalHeight - deltaY}px`;
                    element.style.top = `${originalY + deltaY}px`;
                    break;
                case 'top-left':
                    element.style.width = `${originalWidth - deltaX}px`;
                    element.style.height = `${originalHeight - deltaY}px`;
                    element.style.top = `${originalY + deltaY}px`;
                    element.style.left = `${originalX + deltaX}px`;
                    break;
            }
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
        titleBar.style.cursor = 'grab';
    });
}

// 添加音乐推荐功能
function getRecommendations() {
    // 基于播放历史和用户偏好生成推荐
    const recommendations = [];
    
    // 1. 基于最常听的流派推荐
    const favoriteGenre = Object.entries(playStats.genreStats)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
        
    const genreRecommendations = musicLibrary.music
        .filter(song => song.genre === favoriteGenre && !playStats.playCount[song.title])
        .slice(0, 3);
    
    recommendations.push(...genreRecommendations);
    
    // 2. 基于相似艺术家推荐
    const recentArtists = [...new Set(playStats.recentPlays
        .slice(0, 5)
        .map(song => song.artist))];
        
    const artistRecommendations = musicLibrary.music
        .filter(song => recentArtists.includes(song.artist) && 
                       !playStats.playCount[song.title])
        .slice(0, 2);
        
    recommendations.push(...artistRecommendations);
    
    return recommendations;
}

// 更新播放统计
function updatePlayStats(songData) {
    // 更新播放次数
    playStats.playCount[songData.title] = (playStats.playCount[songData.title] || 0) + 1;
    
    // 更新流派统计
    playStats.genreStats[songData.genre] = (playStats.genreStats[songData.genre] || 0) + 1;
    
    // 更新时统计
    const hour = new Date().getHours();
    const timeSlot = `${hour}-${hour + 1}`;
    playStats.timeStats[timeSlot] = (playStats.timeStats[timeSlot] || 0) + 1;
    
    // 更新最近播放
    playStats.recentPlays.unshift(songData);
    playStats.recentPlays = playStats.recentPlays.slice(0, 20); // 保留最近20首
    
    // 保存统计数据
    localStorage.setItem('playStats', JSON.stringify(playStats));
    
    // 更新统计显示
    updateStatsDisplay();
}

// 修改 getSpotifyRecommendations 函数
async function getSpotifyRecommendations() {
    try {
        // 检查是否有当前播放的歌曲
        if (!currentSongData) {
            console.log('No current song playing');
            return [];
        }

        // 从当前歌曲 URL 获取 track ID
        const trackId = currentSongData.song_url.split('/track/')[1].split('?')[0];

        // 获取当前歌曲的音频特征
        const featuresResponse = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
            headers: {
                'Authorization': 'Bearer BQA2rG_EWR13wr0yDYHMiTvikvVfsVbgZyHGEWuB-ahtdTZ3U-X2lAk4t-18m9A_gUEHxt7dS-yIoKK_mAhU1Nk8vR69RoogfCVpHi5SJybgmDwT_9h1DXh3e-BZXDVIMC7Sbw5MyT_UTbsUgY993y_FecQpJjWjInHbhDKnZS6KyMJZGa41h0NF0JtMXdo0i2I1I0qPI-e8YPDGfeF1WfmRT6xrmq5E9YRevATF'
            }
        });
        const features = await featuresResponse.json();

        // 构建推荐请求参数
        const params = new URLSearchParams({
            limit: 10,
            seed_tracks: trackId,
            target_danceability: features.danceability,
            target_energy: features.energy,
            target_valence: features.valence,
            target_tempo: features.tempo,
            min_popularity: 20 // 确保推荐的歌曲有一定热度
        });

        // 获取推荐
        const response = await fetch(`https://api.spotify.com/v1/recommendations?${params}`, {
            headers: {
                'Authorization': 'Bearer BQA2rG_EWR13wr0yDYHMiTvikvVfsVbgZyHGEWuB-ahtdTZ3U-X2lAk4t-18m9A_gUEHxt7dS-yIoKK_mAhU1Nk8vR69RoogfCVpHi5SJybgmDwT_9h1DXh3e-BZXDVIMC7Sbw5MyT_UTbsUgY993y_FecQpJjWjInHbhDKnZS6KyMJZGa41h0NF0JtMXdo0i2I1I0qPI-e8YPDGfeF1WfmRT6xrmq5E9YRevATF'
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        // 转换推荐结果格式
        return data.tracks.map(track => ({
            title: track.name,
            artist: track.artists[0].name,
            preview_url: track.preview_url,
            image_url: track.album.images[0]?.url,
            song_url: track.external_urls.spotify,
            genre: currentSongData.genre, // 使用当前歌曲的类型
            year: track.album.release_date?.split('-')[0],
            ryanStats: {
                rating: "Similar to current",
                vibe: currentSongData.ryanStats?.vibe || "Similar vibe" // 使用当前歌曲的风格
            }
        }));
    } catch (error) {
        console.error('Failed to get Spotify recommendations:', error);
        return [];
    }
}

// 修改 showRecommendations 函数的显���部分
async function showRecommendations() {
    try {
        const recommendations = await getSpotifyRecommendations();
        
        if (recommendations.length === 0) {
            console.log('No recommendations available');
            return;
        }

        const recommendContainer = document.createElement('div');
        recommendContainer.className = 'recommendations';
        recommendContainer.innerHTML = `
            <h3>Similar to "${currentSongData?.title}"</h3>
            <div class="recommendations-list">
                ${recommendations.map(song => `
                    <div class="recommendation-item">
                        <img src="${song.image_url}" alt="${song.title}">
                        <div class="song-info">
                            <p><strong>${song.title}</strong></p>
                            <p>${song.artist}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // 添加点击事件
        recommendContainer.querySelectorAll('.recommendation-item').forEach((item, index) => {
            const song = recommendations[index];
            item.addEventListener('click', () => playPreview(song));
            item.addEventListener('dblclick', () => {
                addToFavorites(song);
                showFeedback(item, 'Added to favorites');
            });
        });

        // 更新显示
        const oldRecommend = document.querySelector('.recommendations');
        if (oldRecommend) {
            oldRecommend.remove();
        }
        document.querySelector('.sidebar-left').appendChild(recommendContainer);

    } catch (error) {
        console.error('Failed to show recommendations:', error);
    }
}

// 添加相关的 CSS 样式
const recommendationStyles = `
    .recommendation-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
    }

    .tab {
        background: #333;
        border: none;
        padding: 5px 10px;
        border-radius: 15px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .tab.active {
        background: #1db954;
    }

    .recommendation-source {
        font-size: 10px;
        color: #1db954;
        margin-left: 5px;
    }

    .favorite-feedback {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(29, 185, 84, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        animation: fadeInOut 2s ease-in-out;
        pointer-events: none;
    }

    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }

    .recommendation-item {
        position: relative;
        // ... 其他现有样式保持不变 ...
    }
`;

// 将样式添加到文档中
const styleSheet = document.createElement('style');
styleSheet.textContent = recommendationStyles;
document.head.appendChild(styleSheet);

// 更统计显示
function updateStatsDisplay() {
    const statsHtml = `
        <div class="stats-container">
            <h3>Play Statistics</h3>
            <div class="stats-section">
                <h4>Most Played Genres</h4>
                <ul>
                    ${Object.entries(playStats.genreStats)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([genre, count]) => `
                            <li>${genre}: ${count} plays</li>
                        `).join('')}
                </ul>
            </div>
            <div class="stats-section">
                <h4>Recently Played</h4>
                <ul>
                    ${playStats.recentPlays
                        .slice(0, 3)
                        .map(song => `
                            <li>${song.title} - ${song.artist}</li>
                        `).join('')}
                </ul>
            </div>
        </div>
    `;
    
    // 更新统计显示
    const oldStats = document.querySelector('.stats-container');
    if (oldStats) {
        oldStats.remove();
    }
    document.querySelector('.history-container').insertAdjacentHTML('afterbegin', statsHtml);
}

// 在页面加载时初始化统计数据
document.addEventListener('DOMContentLoaded', () => {
    // 加保存的统计数据
    const savedStats = localStorage.getItem('playStats');
    if (savedStats) {
        playStats = JSON.parse(savedStats);
        updateStatsDisplay();
    }
});

// 添加删除条目的函数
async function deleteDayEntry(date) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('数据库未初始化'));
            return;
        }

        const transaction = db.transaction(['calendarEntries'], 'readwrite');
        const store = transaction.objectStore('calendarEntries');
        const request = store.delete(date);

        request.onsuccess = () => {
            console.log(`成功删除日期 ${date} 的条目`);
            resolve();
        };

        request.onerror = () => {
            console.error(`删除日期 ${date} 的条目时出错:`, request.error);
            reject(request.error);
        };
    });
}

// 添加日期格式化辅助函数
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 添加导出功能
function addExportButton() {
    const exportButton = document.createElement('button');
    exportButton.id = 'export-button';
    exportButton.innerHTML = '📷 Export Calendar';
    exportButton.className = 'export-button';
    document.body.appendChild(exportButton);

    exportButton.addEventListener('click', async () => {
        // 加载 html2canvas 库
        if (!window.html2canvas) {
            const script = document.createElement('script');
            script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            script.onload = () => exportCalendar();
            document.head.appendChild(script);
        } else {
            exportCalendar();
        }
    });
}

// 修改导出函数
async function exportCalendar() {
    const calendarElement = document.getElementById('calendar');
    
    // 显示加载提示
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading-message';
    loadingMessage.textContent = 'Generating image...';
    document.body.appendChild(loadingMessage);

    try {
        // 在导前确保所有日记内容可见
        const diaryEntries = calendarElement.querySelectorAll('.diary-entry');
        diaryEntries.forEach(entry => {
            if (entry.textContent.trim()) {
                entry.style.opacity = '1'; // 临时显示所有日记内容
            }
        });

        const canvas = await html2canvas(calendarElement, {
            backgroundColor: '#2d2d2d',
            scale: 2, // 提高导出图片质量
            useCORS: true, // 允许加载跨域图片
            logging: false,
            onclone: (clonedDoc) => {
                // 在克隆的文档中也确保日记可见
                const clonedDiaries = clonedDoc.querySelectorAll('.diary-entry');
                clonedDiaries.forEach(diary => {
                    if (diary.textContent.trim()) {
                        diary.style.opacity = '1';
                        diary.style.background = 'rgba(0, 0, 0, 0.8)'; // 确保背景色正确
                        diary.style.color = 'white'; // 确保文字颜色正确
                    }
                });

                // 确保所有图片加载完成
                const images = clonedDoc.getElementsByTagName('img');
                return Promise.all(Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                }));
            }
        });

        // 恢复原始样式
        diaryEntries.forEach(entry => {
            entry.style.opacity = ''; // 恢复原始透明度
        });

        // 创建下载链接
        const link = document.createElement('a');
        link.download = `Music-Calendar-${currentYear}-${currentMonth + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败，请稍后重试');
    } finally {
        // 移除加载提示
        loadingMessage.remove();
    }
}

// 添加帮助按钮和说明弹窗
function addHelpButton() {
    const helpButton = document.createElement('button');
    helpButton.id = 'help-button';
    helpButton.innerHTML = '❓ Help';
    helpButton.className = 'help-button';
    document.body.appendChild(helpButton);

    // 创建说明弹窗
    const helpModal = document.createElement('div');
    helpModal.className = 'help-modal';
    helpModal.innerHTML = `
        <div class="help-content">
            <span class="close-help">&times;</span>
            <h2>🎵 Music Calendar Guide</h2>
            
            <div class="help-section">
                <h3>Music Player Features</h3>
                <ul>
                    <li>🎲 Random Play: Click to play a random song</li>
                    <li>⏸️ Pause/Play: Control current playback</li>
                    <li>❤️ Heart Button: Click to add/remove from favorites</li>
                    <li>🎲 Play Similar: Auto-plays similar songs based on current track</li>
                    <li>🎵 Progress Bar: Shows current playback progress</li>
                    <li>🖱️ Draggable Window: Drag title bar to move player</li>
                    <li>↔️ Resizable: Drag corners to resize player window</li>
                </ul>
            </div>

            <div class="help-section">
                <h3>Calendar Features</h3>
                <ul>
                    <li>📅 Month Navigation: Use arrows to switch months</li>
                    <li>🖱️ Drag & Drop: Drag songs from player/lists to calendar</li>
                    <li>✏️ Diary: Click calendar cell to write mood notes</li>
                    <li>❌ Delete: Remove songs/notes using the × button</li>
                    <li>💾 Auto-Save: All entries automatically saved</li>
                    <li>📸 Export: Use bottom-right button to save as image</li>
                </ul>
            </div>

            <div class="help-section">
                <h3>Music Management</h3>
                <ul>
                    <li>🔍 Search: Find songs using the search bar</li>
                    <li>👆 Single Click: Play the selected song</li>
                    <li>👆👆 Double Click: Open in Spotify</li>
                    <li>❤️ Favorites: Double click search results to add</li>
                    <li>🗑️ Remove: Click × to remove from favorites</li>
                    <li>🎵 History: Recently played tracks shown on right</li>
                </ul>
            </div>

            <div class="help-section">
                <h3>Smart Features</h3>
                <ul>
                    <li>🎯 Recommendations: Similar songs based on your current track</li>
                    <li>📊 Statistics: Track your most played genres</li>
                    <li>🔄 Auto-Play: Automatically plays similar songs</li>
                    <li>📝 Diary Integration: Combine music with your daily thoughts</li>
                    <li>🌈 Genre Colors: Different colors for different music types</li>
                    <li>💫 Visual Feedback: Animations for all interactions</li>
                </ul>
            </div>

            <div class="help-section">
                <h3>Tips & Tricks</h3>
                <ul>
                    <li>💡 Hover over album covers to see song details</li>
                    <li>🎨 Customize player size for better viewing</li>
                    <li>📱 All features work on mobile devices</li>
                    <li>🔄 Regular updates save your progress</li>
                    <li>📦 Data stored locally in your browser</li>
                    <li>🎵 Supports all Spotify preview tracks</li>
                </ul>
            </div>
        </div>
    `;
    document.body.appendChild(helpModal);

    // 添加事件监听
    helpButton.addEventListener('click', () => {
        helpModal.style.display = 'flex';
    });

    helpModal.querySelector('.close-help').addEventListener('click', () => {
        helpModal.style.display = 'none';
    });

    // 点击弹窗外部关闭
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
}

// 添加月份名称函数
function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];
    return months[month];
}
