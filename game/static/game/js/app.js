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
        avatarList: [],
        settings: { username: '', password: '' },
        exchangeAmount: 1000,
        leaderboard: [],

        // --- Init (شروع برنامه) ---
        init() {
            this.fetchProfile();

            // اگر در تب مارکت یا اینونتوری بود، دیتا را بگیرد
            this.$watch('currentTab', (value) => {
                if (value === 'market') this.fetchPacks();
                if (value === 'inventory') this.fetchMyCards();
                if (value === 'blackmarket') this.fetchMarketListings();
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
                .then(res => res.json())
                .then(data => {
                    this.profile = data;
                    this.loading.update = false;
                })
                .catch(err => {
                    console.error('Error fetching profile:', err);
                    this.loading.update = false;
                });
        },

        claimMining() {
            fetch('/api/game/claim/', {
                method: 'POST',
                headers: { 'X-CSRFToken': this.getCsrfToken() }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.message) alert(data.message);
                    this.fetchProfile(); // آپدیت سکه‌ها
                });
        },

        loadSettings() {
            // فعلاً همان پروفایل را رفرش می‌کنیم
            this.fetchProfile();
            console.log("Settings loaded");
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

            fetch('/api/game/open-pack/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({ pack_id: packId })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                    } else {
                        alert(`تبریک! شما کارت ${data.card_name} را دریافت کردید!`);
                        this.fetchProfile(); // کسر پول
                        this.fetchMyCards(); // اضافه شدن کارت
                    }
                });
        },

        // --- Inventory & Cards Methods ---
        fetchMyCards() {
            fetch('/api/game/my-cards/')
                .then(res => res.json())
                .then(data => {
                    this.myCards = data;
                }).catch(err => console.error(err));
        },

        equipCard(cardId, slotNumber) {
            fetch('/api/game/equip/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({ card_id: cardId, slot: slotNumber })
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
                        card_name: item.card_details.template.name,
                        card_image: item.card_details.template.image, // فرض بر این است که سریالایزر این را برمی‌گرداند
                        card_rarity: item.card_details.template.rarity,
                        mining_rate: item.card_details.template.mining_rate,
                        time_ago: this.formatTimeAgo(item.created_at) // تابع کمکی زمان
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
        }

    }));
});
