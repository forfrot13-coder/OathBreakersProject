# game/admin.py
from django.contrib import admin
from django.db.models import F
from django.contrib import messages
from .models import PlayerProfile, CardTemplate, UserCard, MarketListing, Pack, Avatar

# --- Actions (عملیات‌های گروهی) ---

@admin.action(description='💎 واریز 1000 الماس هدیه')
def give_1000_gems(modeladmin, request, queryset):
    updated = queryset.update(gems=F('gems') + 1000)
    modeladmin.message_user(request, f"{updated} کاربر 1000 الماس دریافت کردند.", messages.SUCCESS)

@admin.action(description='💰 واریز 5000 سکه هدیه')
def give_5000_coins(modeladmin, request, queryset):
    updated = queryset.update(coins=F('coins') + 5000)
    modeladmin.message_user(request, f"{updated} کاربر 5000 سکه دریافت کردند.", messages.SUCCESS)

@admin.action(description='⚡ محاسبه مجدد نرخ استخراج (Fix Rates)')
def recalculate_mining_rates(modeladmin, request, queryset):
    count = 0
    for profile in queryset:
        # فرض بر این است که متد update_mining_rate در مدل PlayerProfile وجود دارد
        if hasattr(profile, 'update_mining_rate'):
            profile.update_mining_rate()
            count += 1
    modeladmin.message_user(request, f"نرخ استخراج {count} کاربر بروزرسانی شد.", messages.INFO)

# --- Admin Classes ---

@admin.register(PlayerProfile)
class PlayerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'coins', 'gems', 'current_mining_rate', 'last_claim_time')
    list_filter = ('last_claim_time',) # level را اگر در مدل ندارید از اینجا حذف کنید
    search_fields = ('user__username',)
    ordering = ('-coins',)
    actions = [give_1000_gems, give_5000_coins, recalculate_mining_rates]
    
    fieldsets = (
        ('اطلاعات کاربری', {
            'fields': ('user', 'avatar') # level و xp را اگر ندارید حذف کنید
        }),
        ('دارایی‌ها', {
            'fields': ('coins', 'gems', 'vow_fragments')
        }),
        ('ماینینگ', {
            'fields': ('slot_1', 'slot_2', 'slot_3', 'current_mining_rate', 'last_claim_time')
        }),
    )
    readonly_fields = ('current_mining_rate',)

@admin.register(CardTemplate)
class CardTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'rarity', 'mining_rate', 'minted_count', 'max_supply', 'supply_percentage')
    list_filter = ('rarity',)
    search_fields = ('name',)
    list_editable = ('mining_rate', 'max_supply')
    
    def supply_percentage(self, obj):
        if obj.max_supply > 0:
            return f"{int((obj.minted_count / obj.max_supply) * 100)}%"
        return "0%"
    supply_percentage.short_description = "درصد استخراج"


@admin.register(UserCard)
class UserCardAdmin(admin.ModelAdmin):
    # اصلاح نام فیلد: user -> owner
    list_display = ('id', 'template', 'serial_number', 'owner', 'is_listed_in_market') 
    
    # اصلاح جستجو: user__username -> owner__user__username
    search_fields = ('template__name', 'owner__user__username')
    
    # اصلاح فیلتر: استفاده از فیلد صحیح
    list_filter = ('is_listed_in_market', 'template__rarity') 
    
    # اصلاح raw_id: user -> owner
    raw_id_fields = ('owner', 'template') 

@admin.register(MarketListing)
class MarketListingAdmin(admin.ModelAdmin):
    # فیلدهای جدید: price, currency به جای price_gems
    list_display = ('seller', 'get_card_name', 'price', 'currency', 'created_at', 'is_active')
    list_filter = ('currency', 'created_at', 'is_active')
    actions = ['cancel_listings']
    search_fields = ('seller__user__username', 'card_instance__template__name')
    
    def get_card_name(self, obj):
        return obj.card_instance.template.name if obj.card_instance else '-'
    get_card_name.short_description = 'کارت'

    @admin.action(description='❌ لغو آگهی‌های انتخاب شده')
    def cancel_listings(self, request, queryset):
        for listing in queryset:
            # آزاد کردن کارت
            card = listing.card_instance
            card.is_listed_in_market = False
            card.save()
            # غیرفعال کردن آگهی
            listing.is_active = False
            listing.save()
        self.message_user(request, "آگهی‌ها لغو شدند و کارت‌ها به مالکان برگشت.", messages.SUCCESS)

@admin.register(Pack)
class PackAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'price', 'currency_type', 'card_count'
    )
    list_editable = ('price', 'card_count')
    
    # فیلدهای شانس (drop rates) اگر در مدل دارید اینجا اضافه کنید.
    # من ساده‌سازی کردم تا ارور ندهد. اگر فیلدهای chance_* را دارید، آنکامنت کنید.
    fieldsets = (
        ('اطلاعات عمومی', {
            'fields': ('name', 'image', 'description', 'price', 'currency_type', 'card_count')
        }),
        # ('تنظیمات شانس', {
        #    'fields': ('chance_common', 'chance_rare', 'chance_epic', 'chance_legendary')
        # }),
    )

@admin.register(Avatar)
class AvatarAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_premium')
