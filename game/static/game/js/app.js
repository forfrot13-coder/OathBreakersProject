document.addEventListener('alpine:init', () => {
    Alpine.data('gameApp', () => ({
        // --- State Variables (وضعیت‌ها) ---
        currentTab: 'home',

        // اطلاعات بازیکن — قالب از `profile` استفاده می‌کند
        profile: {
            username: '',
            coins: 0,
            gems: 0,
            vow_fragments: 0,
            xp: 0,
            next_level_xp: 100,
            level: 1,
            mining_multiplier: 1,
            total_mining_rate: 0,
            avatar_url: null,
            // در صورت وجود اسلات‌ها
            slots: [],
        },

        // لیست‌ها
        myCards: [],
        packList: [],
        marketListings: [], // لیست آیتم‌های بازار سیاه

        // وضعیت‌های UI در قالب یک شی `loading` که قالب انتظار دارد
        loading: {
            claim: false,
            update: false,
        },

        // وضعیت‌های مودال فروش (Black Market Sell)
        sellModalOpen: false,
        selectedCardForSell: null,
        sellPrice: '',
        sellCurrency: 'COINS', // یا 'GEMS'

        // سایر متغیرهای مورد انتظار در قالب
        showSlotSelector: false,
        selectedCardIdForEquip: null,
        avatarList: [],
        settings: { username: '', password: '' },
        exchangeAmount: 1000,
        leaderboard: [],
        
        // Pack Opening Modal
        openingModal: false,
        animationStage: 'shaking',
        openedCard: null,
        cardsQueue: [],
        currentCardIndex: 0,

        // --- Init (شروع برنامه) ---
        init() {
            this.fetchProfile();

            // اگر در تب مارکت یا اینونتوری بود، دیتا را بگیرد
            this.$watch('currentTab', (value) => {
                if (value === 'market') this.fetchPacks();
                if (value === 'inventory') this.fetchMyCards();
                if (value === 'blackmarket') this.fetchMarketListings();
                if (value === 'leaderboard') this.fetchLeaderboard();
                if (value === 'profile') {
                    this.fetchAvatars();
                    // تنظیمات اولیه از پروفایل
                    this.settings.username = this.profile.username || '';
                    this.settings.avatar_id = this.profile.avatar_id ?? null;
                    this.settings.password = '';
                }
            });

            // تایمر برای بروزرسانی خودکار پروفایل (هر 60 ثانیه)
            setInterval(() => {
                this.fetchProfile();
            }, 60000);
        },

        // --- API Helpers ---
        getCsrfToken() {
            return document.cookie.split('; ')
                .find(row => row.startsWith('csrftoken='))
                ?.split('=')[1];
        },

        // --- Profile Methods ---
        fetchProfile() {
            this.loading.update = true;
            fetch('/api/game/profile/me/')
                .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) throw data;
                    return data;
                })
                .then(data => {
                    this.profile = {
                        ...this.profile,
                        ...data,
                        slots: Array.isArray(data.slots) ? data.slots : [],
                    };

                    if (this.currentTab === 'profile') {
                        this.settings.username = data.username || '';
                        this.settings.avatar_id = data.avatar_id ?? null;
                    }

                    this.loading.update = false;
                })
                .catch(err => {
                    console.error('Error fetching profile:', err);
                    this.loading.update = false;
                });
        },

        claimMining() {
            if (this.loading.claim) return;
            this.loading.claim = true;

            fetch('/api/game/claim/', {
                method: 'POST',
                headers: { 'X-CSRFToken': this.getCsrfToken() }
            })
                .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) throw data;
                    return data;
                })
                .then(data => {
                    if (data.message) alert(data.message);
                    this.fetchProfile();
                })
                .catch(err => {
                    alert(err?.error || 'خطایی رخ داد.');
                })
                .finally(() => {
                    this.loading.claim = false;
                });
        },

        loadSettings() {
            this.fetchAvatars();
            this.fetchProfile();
            this.settings.username = this.profile.username || '';
            this.settings.avatar_id = this.profile.avatar_id ?? null;
            this.settings.password = '';
        },

        // --- Pack & Shop Methods ---
        fetchPacks() {
            this.loading.update = true;
            fetch('/api/game/packs/')
                .then(res => res.json())
                .then(data => {
                    this.packList = data;
                    this.loading.update = false;
                })
                .catch(err => { console.error(err); this.loading.update = false; });
        },

        openPack(packId) {
            if (!confirm("آیا مطمئن هستید که می‌خواهید این پک را باز کنید؟")) return;

            this.openingModal = true;
            this.animationStage = 'shaking';
            this.openedCard = null;
            this.cardsQueue = [];
            this.currentCardIndex = 0;

            fetch('/api/game/open-pack/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({ pack_id: packId })
            })
                .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) throw data;
                    return data;
                })
                .then(data => {
                    if (!Array.isArray(data.cards) || data.cards.length === 0) {
                        throw { error: 'کارت دریافت نشد. لطفاً دوباره تلاش کنید.' };
                    }

                    this.cardsQueue = data.cards;
                    this.currentCardIndex = 0;

                    setTimeout(() => {
                        this.openedCard = this.cardsQueue[0];
                        this.animationStage = 'flipped';
                    }, 1200);

                    this.fetchProfile();
                    this.fetchMyCards();
                })
                .catch(err => {
                    this.closeOpeningModal();
                    alert(err?.error || 'خطایی رخ داد.');
                });
        },

        // --- Inventory & Cards Methods ---
        fetchMyCards() {
            fetch('/api/game/my-cards/')
                .then(res => res.json())
                .then(data => {
                    const equippedIds = new Set(
                        (this.profile?.slots || []).map(s => s.id)
                    );
                    this.myCards = (Array.isArray(data) ? data : []).map(card => ({
                        ...card,
                        is_equipped: equippedIds.has(card.id),
                    }));
                })
                .catch(err => console.error(err));
        },

        equipCard(cardId, slotNumber) {
            fetch('/api/game/equip/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({ card_id: cardId, slot_number: slotNumber })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) alert(data.error);
                    else {
                        this.fetchProfile(); // آپدیت نرخ ماینینگ
                        this.fetchMyCards(); // آپدیت وضعیت Equip
                    }
                });
        },

        // ==========================================
        //        بخش جدید: بازار سیاه (Black Market)
        // ==========================================

        // 1. دریافت لیست آگهی‌ها
        fetchMarketListings() {
            this.loading.update = true;
            fetch('/api/game/market/')
                .then(res => res.json())
                .then(data => {
                    // مپ کردن دیتا برای اطمینان از ساختار درست در HTML
                    this.marketListings = data.map(item => ({
                        id: item.id,
                        seller_name: item.seller_name,
                        price: item.price,
                        currency: item.currency,
                        card_name: item.card_details?.card_name || 'Unknown',
                        card_image: item.card_details?.image || null,
                        card_rarity: item.card_details?.rarity || 'COMMON',
                        mining_rate: item.card_details?.mining_rate || 0,
                        time_ago: this.formatTimeAgo(item.created_at)
                    }));
                    this.loading.update = false;
                })
                .catch(err => {
                    console.error(err);
                    this.loading.update = false;
                });
        },

        // 2. خرید آیتم
        buyListing(listingId) {
            if (!confirm("آیا از خرید این کارت اطمینان دارید؟")) return;

            fetch(`/api/game/market/buy/${listingId}/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': this.getCsrfToken() }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        alert('خطا: ' + data.error);
                    } else {
                        alert('خرید با موفقیت انجام شد!');
                        this.fetchProfile();        // آپدیت موجودی کاربر
                        this.fetchMarketListings(); // رفرش لیست بازار
                        this.fetchMyCards();        // اگر کاربر سریع رفت توی اینونتوری، کارت جدید اونجا باشه
                    }
                });
        },

        // 3. باز کردن مودال فروش (از داخل اینونتوری صدا زده می‌شود)
        openSellModal(card) {
            // چک کردن اینکه کارت Equip نباشه
            if (card.is_equipped) {
                alert("نمی‌توانید کارت در حال استفاده (Equipped) را بفروشید. ابتدا آن را خارج کنید.");
                return;
            }
            this.selectedCardForSell = card;
            this.sellPrice = '';
            this.sellCurrency = 'COINS';
            this.sellModalOpen = true;
        },

        // 4. ثبت آگهی فروش (Create Listing)
        createListing() {
            if (!this.sellPrice || this.sellPrice <= 0) {
                alert("لطفاً یک قیمت معتبر وارد کنید.");
                return;
            }

            fetch('/api/game/market/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({
                    card_id: this.selectedCardForSell.id,
                    price: this.sellPrice,
                    currency: this.sellCurrency
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        alert('خطا: ' + data.error);
                    } else {
                        alert('کارت شما با موفقیت در بازار سیاه قرار گرفت.');
                        this.sellModalOpen = false; // بستن مودال
                        this.fetchMyCards();        // رفرش اینونتوری (کارت باید از لیست حذف یا غیرفعال شه)
                        if (this.currentTab === 'blackmarket') {
                            this.fetchMarketListings(); // اگر الان توی تب مارکت بود، رفرش کنه
                        }
                    }
                });
        },

        // --- توابع کمکی ---
        // --- توابع کمکی عمومی ---
        formatNumber(n) {
            if (n === null || n === undefined) return '0';
            if (typeof n === 'number') return n.toLocaleString();
            const parsed = Number(n);
            return isNaN(parsed) ? String(n) : parsed.toLocaleString();
        },

        getSlot(slotIndex) {
            if (!this.profile || !Array.isArray(this.profile.slots)) return null;
            const s = this.profile.slots.find(s => Number(s.slot) === Number(slotIndex));
            return s || null;
        },

        openInventory() {
            this.currentTab = 'inventory';
            this.fetchMyCards();
        },

        openMarket() {
            this.currentTab = 'market';
            this.fetchPacks();
        },

        formatTimeAgo(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);

            if (diffInSeconds < 60) return 'همین الان';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقیقه پیش`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعت پیش`;
            return `${Math.floor(diffInSeconds / 86400)} روز پیش`;
        },

        // --- Inventory Card Actions ---
        selectCardAction(cardId) {
            const card = this.myCards.find(c => c.id === cardId);
            if (!card) return;

            // اگر کارت لیست شده در بازار است
            if (card.is_listed_in_market) {
                alert('این کارت در بازار سیاه لیست شده است و قابل استفاده نیست.');
                return;
            }

            // نمایش منوی انتخاب عملیات
            const action = confirm('آیا می‌خواهید این کارت را تجهیز کنید؟\n\nOK = تجهیز\nCancel = فروش');
            
            if (action) {
                // تجهیز کارت
                this.selectedCardIdForEquip = cardId;
                this.showSlotSelector = true;
            } else {
                // فروش کارت
                this.openSellModal(card);
            }
        },

        equipToSlot(slotNumber) {
            if (!this.selectedCardIdForEquip) {
                alert('لطفاً ابتدا یک کارت انتخاب کنید.');
                return;
            }

            this.equipCard(this.selectedCardIdForEquip, slotNumber);
            this.showSlotSelector = false;
            this.selectedCardIdForEquip = null;
        },

        // --- Pack Opening Modal Functions ---
        closeOpeningModal() {
            this.openingModal = false;
            this.animationStage = 'shaking';
            this.openedCard = null;
            this.cardsQueue = [];
            this.currentCardIndex = 0;
        },

        nextCard() {
            if (this.currentCardIndex < this.cardsQueue.length - 1) {
                this.currentCardIndex++;
                this.animationStage = 'shaking';
                setTimeout(() => {
                    this.openedCard = this.cardsQueue[this.currentCardIndex];
                    this.animationStage = 'flipped';
                }, 1000);
            } else {
                this.closeOpeningModal();
            }
        },

        // --- Profile & Settings Methods ---
        updateProfile() {
            this.loading.update = true;
            fetch('/api/game/profile/update/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({
                    username: this.settings.username,
                    password: this.settings.password,
                    avatar_id: this.settings.avatar_id
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        alert('خطا: ' + data.error);
                    } else {
                        alert('پروفایل با موفقیت بروزرسانی شد!');
                        this.fetchProfile();
                        this.settings.password = ''; // پاک کردن فیلد پسورد
                    }
                    this.loading.update = false;
                })
                .catch(err => {
                    console.error(err);
                    alert('خطایی رخ داد.');
                    this.loading.update = false;
                });
        },

        fetchAvatars() {
            fetch('/api/game/avatars/')
                .then(res => res.json())
                .then(data => {
                    this.avatarList = data;
                })
                .catch(err => console.error(err));
        },

        // --- Exchange Methods ---
        convertCoins() {
            if (!this.exchangeAmount || this.exchangeAmount < 1000) {
                alert('حداقل مقدار 1000 سکه است.');
                return;
            }

            fetch('/api/game/exchange/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({ coins: this.exchangeAmount })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        alert('خطا: ' + data.error);
                    } else {
                        alert(data.message);
                        this.fetchProfile(); // آپدیت موجودی
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('خطایی رخ داد.');
                });
        },

        useMaxExchange() {
            // محاسبه حداکثر مقدار قابل تبدیل (به مضرب 1000)
            const maxCoins = Math.floor(this.profile.coins / 1000) * 1000;
            if (maxCoins < 1000) {
                alert('شما حداقل 1000 سکه ندارید.');
                return;
            }
            this.exchangeAmount = maxCoins;
            this.convertCoins();
        },

        // --- Leaderboard Methods ---
        fetchLeaderboard() {
            fetch('/api/game/leaderboard/')
                .then(res => res.json())
                .then(data => {
                    this.leaderboard = data;
                })
                .catch(err => console.error(err));
        },

        // --- Logout Method ---
        logout() {
            if (!confirm('آیا می‌خواهید از حساب خود خارج شوید؟')) return;

            fetch('/api/game/auth/logout/', {
                method: 'POST',
                headers: { 'X-CSRFToken': this.getCsrfToken() }
            })
                .then(() => {
                    window.location.href = '/';
                })
                .catch(err => {
                    console.error(err);
                    window.location.href = '/';
                });
        }

    }));
});
