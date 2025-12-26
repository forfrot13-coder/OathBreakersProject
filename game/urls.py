from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # --- صفحات اصلی (HTML) ---
    path('', views.game_index, name='game-index'),
    path('login/', views.login_page, name='login-page'),
    path('register/', views.register_page, name='register-page'),

    # --- احراز هویت (Auth API) ---
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/logout/', views.logout_user, name='logout'),

    # --- پروفایل و اطلاعات پایه ---
    path('profile/me/', views.get_my_profile, name='my-profile'),
    path('profile/update/', views.update_profile, name='update-profile'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('avatars/', views.get_avatars, name='get-avatars'),

    # --- سیستم بازی (Game Loop) ---
    path('packs/', views.get_packs, name='get-packs'),
    path('open-pack/', views.open_pack, name='open-pack'),
    path('my-cards/', views.get_my_cards, name='my-cards'),
    path('equip/', views.equip_card, name='equip-card'),
    path('claim/', views.claim_coins, name='claim-coins'),
    path('exchange/', views.exchange_coins, name='exchange'),

    # --- بازار سیاه (Black Market) ---
    # لیست تمام آگهی‌ها
    path('market/', views.market_feed, name='market-feed'), 
    # ثبت آگهی فروش جدید
    path('market/create/', views.create_listing, name='market-create'), 
    # خرید یک کارت (نیاز به ID دارد)
    path('market/buy/<int:listing_id>/', views.buy_listing, name='market-buy'), 
]

# تنظیمات فایل‌های استاتیک و مدیا در حالت دیباگ
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
