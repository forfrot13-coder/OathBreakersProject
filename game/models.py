from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.db.models import Sum

# --- مدل جدید: آواتار ---


class Avatar(models.Model):
    name = models.CharField(max_length=50, verbose_name="نام آواتار")
    image = models.ImageField(upload_to='avatars/', verbose_name="تصویر")
    is_premium = models.BooleanField(default=False, verbose_name="پولی است؟")

    def __str__(self):
        return self.name

# --- آپدیت پروفایل ---

# game/models.py

class PlayerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ForeignKey(Avatar, on_delete=models.SET_NULL, null=True, blank=True)
    coins = models.BigIntegerField(default=0, verbose_name="سکه (Gold)")
    gems = models.BigIntegerField(default=0, verbose_name="الماس (Gems)")
    vow_fragments = models.BigIntegerField(default=0, verbose_name="Vow Fragments")
    last_claim_time = models.DateTimeField(auto_now_add=True)

    # --- اسلات‌ها ---
    slot_1 = models.OneToOneField('UserCard', related_name='equipped_slot_1', on_delete=models.SET_NULL, null=True, blank=True)
    slot_2 = models.OneToOneField('UserCard', related_name='equipped_slot_2', on_delete=models.SET_NULL, null=True, blank=True)
    slot_3 = models.OneToOneField('UserCard', related_name='equipped_slot_3', on_delete=models.SET_NULL, null=True, blank=True)

    # --- فیلد جدید برای سرعت بالا (Performance) ---
    current_mining_rate = models.PositiveIntegerField(default=0, verbose_name="نرخ استخراج فعلی")

    level = models.PositiveIntegerField(default=1, verbose_name="سطح")
    xp = models.BigIntegerField(default=0, verbose_name="تجربه")

    def __str__(self):
        return self.user.username

    def get_next_level_xp(self):
        """محاسبه XP مورد نیاز برای رفتن به لول بعدی"""
        return self.level * 1000

    def update_mining_rate(self):
        """محاسبهٔ نرخ استخراج بر اساس کارت‌های تجهیزشده و level"""
        base_rate = 0
        if self.slot_1 and self.slot_1.template:
            base_rate += self.slot_1.template.mining_rate
        if self.slot_2 and self.slot_2.template:
            base_rate += self.slot_2.template.mining_rate
        if self.slot_3 and self.slot_3.template:
            base_rate += self.slot_3.template.mining_rate
        
        # ضریب: هر لول 5 درصد اضافه می‌کند
        multiplier = 1 + (self.level * 0.05)
        final_rate = int(base_rate * multiplier)
        
        self.current_mining_rate = final_rate
        self.save(update_fields=['current_mining_rate'])
        return final_rate
    
    @property
    def mining_rate_display(self):
        return self.current_mining_rate


class Pack(models.Model):
    CURRENCY_CHOICES = [
        ('GEMS', 'الماس'),
        ('VOW', 'Vow Fragments'),
        ('COINS', 'سکه'),
    ]

    name = models.CharField(max_length=100, verbose_name="نام پک")
    image = models.ImageField(upload_to='packs/', verbose_name="تصویر پک")
    price = models.PositiveIntegerField(verbose_name="قیمت")
    currency_type = models.CharField(max_length=10, choices=CURRENCY_CHOICES, default='GEMS', verbose_name="نوع ارز")
    description = models.TextField(blank=True, null=True, help_text="توضیحات پک برای نمایش به کاربر")

    # --- فیلدهای جدید ---
    card_count = models.PositiveIntegerField(default=1, verbose_name="تعداد کارت در پک")
    
    # مجموع این‌ها باید 100 شود
    chance_common = models.PositiveIntegerField(default=60, verbose_name="شانس معمولی (%)")
    chance_rare = models.PositiveIntegerField(default=30, verbose_name="شانس نادر (%)")
    chance_epic = models.PositiveIntegerField(default=9, verbose_name="شانس حماسی (%)")
    chance_legendary = models.PositiveIntegerField(default=1, verbose_name="شانس افسانه‌ای (%)")

    def __str__(self):
        return f"{self.name} ({self.card_count} Cards)"


class CardTemplate(models.Model):
    RARITY_CHOICES = [
        ('COMMON', 'معمولی'),
        ('RARE', 'نادر'),
        ('EPIC', 'حماسی'),
        ('LEGENDARY', 'افسانه‌ای'),
    ]
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='cards/')
    rarity = models.CharField(
        max_length=20, choices=RARITY_CHOICES, default='COMMON')
    mining_rate = models.PositiveIntegerField(default=1)
    max_supply = models.PositiveIntegerField()
    minted_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.minted_count}/{self.max_supply})"


class UserCard(models.Model):
    owner = models.ForeignKey(
        PlayerProfile, on_delete=models.CASCADE, related_name='cards')
    template = models.ForeignKey(
        CardTemplate, on_delete=models.PROTECT, related_name='instances')
    serial_number = models.PositiveIntegerField()
    obtained_at = models.DateTimeField(auto_now_add=True)
    is_listed_in_market = models.BooleanField(default=False, db_index=True)
    
    class Meta:
        unique_together = ('template', 'serial_number')
        indexes = [models.Index(fields=['owner', 'is_listed_in_market'])]

    def __str__(self):
        return f"{self.template.name} #{self.serial_number}"


class MarketListing(models.Model):
    """
    مدل فروش کارت‌ها در بازار سیاه
    قیمت‌گذاری فقط بر اساس Vow Fragments
    """
    seller = models.ForeignKey(
        PlayerProfile, 
        on_delete=models.PROTECT, 
        related_name='market_listings'
    )
    card_instance = models.OneToOneField(
        UserCard, 
        on_delete=models.CASCADE, 
        related_name='market_listing'
    )
    
    # ✅ فقط price برای Vow Fragments
    price = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="قیمت (Vow Fragments)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['is_active', '-created_at'])]
        verbose_name = "لیست بازار"
        verbose_name_plural = "لیست‌های بازار"
    
    def __str__(self):
        return f"{self.card_instance.template.name} - {self.price} Vow Fragments"
