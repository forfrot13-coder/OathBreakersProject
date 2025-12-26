from django.db import models, transaction
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
import random
import math

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

from .models import MarketListing, CardTemplate, UserCard, PlayerProfile, Avatar, Pack
from .serializers import (
    UserCardSerializer,
    PlayerProfileSerializer,
    AvatarSerializer,
    PackSerializer,
    MarketListingSerializer
)

# 1. دریافت لیست آواتارها


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_avatars(request):
    avatars = Avatar.objects.all()
    serializer = AvatarSerializer(avatars, many=True)
    return Response(serializer.data)

# 2. آپدیت پروفایل


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    profile = user.profile

    new_username = request.data.get('username')
    new_password = request.data.get('password')
    avatar_id = request.data.get('avatar_id')

    # تغییر نام کاربری
    if new_username and new_username != user.username:
        if User.objects.filter(username=new_username).exists():
            return Response({'error': 'این نام کاربری قبلاً گرفته شده است.'}, status=400)
        user.username = new_username
        user.save()

    # تغییر رمز عبور
    if new_password:
        if len(new_password) < 6:
            return Response({'error': 'رمز عبور باید حداقل ۶ کاراکتر باشد.'}, status=400)
        user.set_password(new_password)
        user.save()
        # نکته: بعد از تغییر رمز، سشن کاربر ممکن است منقضی شود که باید دوباره لاگین کند
        # اما فعلاً برای سادگی لاگین را نگه می‌داریم:
        login(request, user)

    # تغییر آواتار
    if avatar_id:
        try:
            avatar = Avatar.objects.get(id=avatar_id)
            profile.avatar = avatar
            profile.save()
        except Avatar.DoesNotExist:
            return Response({'error': 'آواتار نامعتبر است.'}, status=400)

    return Response({'message': 'پروفایل با موفقیت بروزرسانی شد.'})


# قیمت باز کردن هر پک (مثلاً 100 الماس)
PACK_PRICE = 100


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_profile(request):
    serializer = PlayerProfileSerializer(request.user.profile)
    return Response(serializer.data)


@api_view(['GET'])
def leaderboard(request):
    # مرتب‌سازی ترکیبی: اول بر اساس قدرت ماینینگ، بعد سکه
    top_players = PlayerProfile.objects.select_related('user', 'avatar') \
        .order_by('-current_mining_rate', '-coins')[:10]  # <--- بهینه شد

    data = []
    for rank, player in enumerate(top_players, 1):
        data.append({
            'rank': rank,
            'username': player.user.username,
            'coins': player.coins,
            'power': player.current_mining_rate,  # خواندن مستقیم و سریع
            'avatar': player.avatar.image.url if player.avatar else None
        })

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_cards(request):
    profile = request.user.profile
    # کارت‌هایی که در مارکت نیستند
    cards = UserCard.objects.filter(owner=profile, is_listed_in_market=False)
    serializer = UserCardSerializer(cards, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def open_pack(request):
    user = request.user
    profile = user.profile
    pack_id = request.data.get('pack_id')

    # 1. پیدا کردن پک
    if not pack_id:
        return Response({'error': 'شناسه پک الزامی است.'}, status=400)

    try:
        pack = Pack.objects.get(id=pack_id)
    except Pack.DoesNotExist:
        return Response({'error': 'پک یافت نشد.'}, status=404)

    # 2. بررسی موجودی
    if pack.currency_type == 'GEMS' and profile.gems < pack.price:
        return Response({'error': 'الماس کافی ندارید!'}, status=400)
    elif pack.currency_type == 'COINS' and profile.coins < pack.price:
        return Response({'error': 'سکه کافی ندارید!'}, status=400)
    elif pack.currency_type == 'VOW' and profile.vow_fragments < pack.price:
        return Response({'error': 'فرگمنت کافی ندارید!'}, status=400)

    # شروع تراکنش
    with transaction.atomic():
        # کسر هزینه
        if pack.currency_type == 'GEMS':
            profile.gems -= pack.price
        elif pack.currency_type == 'COINS':
            profile.coins -= pack.price
        elif pack.currency_type == 'VOW':
            profile.vow_fragments -= pack.price
        profile.save()

        created_cards = []

        # 3. حلقه تولید کارت به تعداد مشخص شده در پک
        for _ in range(pack.card_count):
            roll = random.randint(1, 100)

            # منطق تجمعی (Cumulative Probability) بر اساس تنظیمات پک
            cumulative = 0
            selected_rarity = 'COMMON'  # پیش‌فرض

            # چک کردن Common
            cumulative += pack.chance_common
            if roll <= cumulative:
                selected_rarity = 'COMMON'
            else:
                # چک کردن Rare
                cumulative += pack.chance_rare
                if roll <= cumulative:
                    selected_rarity = 'RARE'
                else:
                    # چک کردن Epic
                    cumulative += pack.chance_epic
                    if roll <= cumulative:
                        selected_rarity = 'EPIC'
                    else:
                        # باقی‌مانده می‌شود Legendary
                        selected_rarity = 'LEGENDARY'

            # انتخاب تمپلیت
            available_cards = CardTemplate.objects.select_for_update().filter(
                rarity=selected_rarity,
                minted_count__lt=models.F('max_supply')
            )

            # فال‌بک (اگر کارت نایاب تمام شده بود، معمولی بده)
            if not available_cards.exists():
                available_cards = CardTemplate.objects.select_for_update().filter(
                    rarity='COMMON',
                    minted_count__lt=models.F('max_supply')
                )

            # اگر کلاً کارتی نبود (خیلی بعید)
            if not available_cards.exists():
                continue  # این دور را رد کن (یا ارور بده)

            card_template = random.choice(list(available_cards))
            card_template.minted_count += 1
            card_template.save()

            new_card = UserCard.objects.create(
                owner=profile,
                template=card_template,
                serial_number=card_template.minted_count
            )
            created_cards.append(new_card)

        # سریالایز کردن لیست کارت‌ها
        serializer = UserCardSerializer(created_cards, many=True)

        return Response({
            'message': f'{len(created_cards)} کارت دریافت شد!',
            'cards': serializer.data,  # <-- دقت کنید: اینجا آرایه است
            'remaining_gems': profile.gems,
            'remaining_coins': profile.coins,
            'remaining_vow': profile.vow_fragments
        })

# ==========================================


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_coins(request):
    MAX_HOURS_CAP = 8.0  # حداکثر ظرفیت ذخیره (ساعت)

    with transaction.atomic():
        # قفل کردن پروفایل برای جلوگیری از دابل کلیک
        profile = PlayerProfile.objects.select_for_update().get(user=request.user)

        mining_rate_per_hour = profile.current_mining_rate  # خواندن از فیلد ذخیره شده

        if mining_rate_per_hour == 0:
            return Response({'message': 'شما کارتی برای استخراج ندارید!', 'coins_earned': 0})

        now = timezone.now()
        time_diff = now - profile.last_claim_time
        hours_passed = time_diff.total_seconds() / 3600

        # اگر کمتر از 1 دقیقه گذشته، خطا بده (جلوگیری از اسپم ریکوئست)
        if hours_passed < (1/60):
            return Response({'error': 'مخزن هنوز خالی است. لطفاً صبر کنید.'}, status=400)

        # اعمال محدودیت ظرفیت (Cap)
        effective_hours = min(hours_passed, MAX_HOURS_CAP)

        coins_earned = math.floor(effective_hours * mining_rate_per_hour)

        if coins_earned > 0:
            profile.coins += coins_earned

            # --- منطق لول آپ ---
            profile.xp += coins_earned

            # حلقه چک کردن لول (ممکن است یکجا آنقدر XP بگیرد که 2 لول بالا برود)
            leveled_up = False
            while profile.xp >= profile.get_next_level_xp():
                profile.xp -= profile.get_next_level_xp()  # کسر XP مصرف شده
                profile.level += 1
                leveled_up = True

            profile.last_claim_time = now

            # اگر لول آپ شد، باید ریت استخراج دوباره محاسبه شود (چون ضریب عوض شده)
            if leveled_up:
                profile.update_mining_rate()
            else:
                profile.save()

            message = f'{coins_earned} سکه جمع‌آوری شد!'
            if leveled_up:
                message += f' تبریک! به لول {profile.level} رسیدید! 🎉'

            return Response({
                'message': message,
                'new_balance': profile.coins,
                'time_elapsed_hours': round(hours_passed, 2)
            })
        else:
            return Response({'message': 'هنوز سکه‌ای تولید نشده است.'})

# ---------------------------------------------------------
# 1. فروش کارت (Listing)
# ---------------------------------------------------------


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def list_card_for_sale(request):
    user = request.user
    profile = user.profile

    # گرفتن آی‌دی کارت و قیمت از ورودی کاربر
    card_id = request.data.get('card_id')
    price = request.data.get('price')

    if not card_id or not price:
        return Response({'error': 'شناسه کارت و قیمت الزامی است.'}, status=400)

    try:
        price = int(price)
        if price <= 0:
            raise ValueError
    except ValueError:
        return Response({'error': 'قیمت باید عدد مثبت باشد.'}, status=400)

    # پیدا کردن کارت
    try:
        # کارت باید مال خود کاربر باشد و قبلاً در مارکت نباشد
        card = UserCard.objects.get(
            id=card_id, owner=profile, is_listed_in_market=False)
    except UserCard.DoesNotExist:
        return Response({'error': 'کارت یافت نشد یا قبلاً در مارکت لیست شده است.'}, status=404)

    with transaction.atomic():
        # تغییر وضعیت کارت به "در حال فروش"
        card.is_listed_in_market = True
        card.save()

        # ایجاد آگهی فروش
        MarketListing.objects.create(
            seller=profile,
            card_instance=card,
            price_gems=price
        )

    return Response({'message': 'کارت شما در مارکت قرار گرفت.'})

# ---------------------------------------------------------
# 2. خرید کارت (Buying)
# ---------------------------------------------------------


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_card(request):
    buyer_user = request.user
    buyer_profile = buyer_user.profile

    listing_id = request.data.get('listing_id')

    if not listing_id:
        return Response({'error': 'شناسه آگهی الزامی است.'}, status=400)

    # استفاده از select_for_update برای قفل کردن رکورد هنگام خرید (جلوگیری از خرید همزمان دو نفر)
    with transaction.atomic():
        try:
            listing = MarketListing.objects.select_for_update().get(
                id=listing_id,
                is_active=True
            )
        except MarketListing.DoesNotExist:
            return Response({'error': 'آگهی یافت نشد یا فروخته شده است.'}, status=404)

        # جلوگیری از خرید کارت خودمان
        if listing.seller == buyer_profile:
            return Response({'error': 'شما نمی‌توانید کارت خودتان را بخرید!'}, status=400)

        # چک کردن موجودی خریدار
        if buyer_profile.gems < listing.price_gems:
            return Response({'error': 'الماس کافی ندارید.'}, status=400)

        # --- انجام تراکنش مالی ---

        # 1. کسر پول از خریدار
        buyer_profile.gems -= listing.price_gems
        buyer_profile.save()

        # 2. واریز پول به فروشنده
        seller_profile = listing.seller
        seller_profile.gems += listing.price_gems
        seller_profile.save()

        # 3. انتقال مالکیت کارت
        card = listing.card_instance
        card.owner = buyer_profile
        # کارت از حالت مارکت خارج می‌شود و مال خریدار می‌شود
        card.is_listed_in_market = False
        card.save()

        # 4. غیرفعال کردن آگهی
        listing.is_active = False
        listing.save()

    return Response({
        'message': f'تبریک! کارت {card.template.name} خریداری شد.',
        'remaining_gems': buyer_profile.gems
    })

# ---------------------------------------------------------
# 3. مشاهده مارکت (Market Feed)
# ---------------------------------------------------------


@api_view(['GET'])
@permission_classes([AllowAny])
def market_feed(request):
    # فقط آگهی‌های فعال را نشان بده
    listings = MarketListing.objects.filter(
        is_active=True).select_related('card_instance__template')

    data = []
    for item in listings:
        data.append({
            'listing_id': item.id,
            'card_name': item.card_instance.template.name,
            'rarity': item.card_instance.template.rarity,
            'serial': item.card_instance.serial_number,
            'price': item.price_gems,
            'seller': item.seller.user.username
        })

    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_packs(request):
    packs = Pack.objects.all()
    serializer = PackSerializer(packs, many=True, context={'request': request})
    return Response(serializer.data)


def game_index(request):
    return render(request, 'game/index.html')

# ==========================================


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def equip_card(request):
    profile = request.user.profile
    card_id = request.data.get('card_id')
    slot_number = request.data.get('slot_number')

    try:
        slot_number = int(slot_number)
        if slot_number not in [1, 2, 3]:
            raise ValueError
    except (TypeError, ValueError):
        return Response({'error': 'شماره اسلات باید ۱، ۲ یا ۳ باشد.'}, status=400)

    with transaction.atomic():
        # 1. قفل کردن رکورد کارت برای جلوگیری از تغییر همزمان
        try:
            card = UserCard.objects.select_for_update().get(
                id=card_id,
                owner=profile
            )
        except UserCard.DoesNotExist:
            return Response({'error': 'کارت نامعتبر است.'}, status=404)

        # 2. چک کردن وضعیت مارکت
        if card.is_listed_in_market:
            return Response({'error': 'این کارت در مارکت برای فروش است و نمی‌تواند تجهیز شود.'}, status=400)

        # 3. چک کردن اینکه کارت قبلاً در اسلات دیگری نباشد
        # اگر کارت الان در اسلات 1 است و کاربر می‌خواهد بگذارد در اسلات 2، باید اسلات 1 خالی شود.
        if profile.slot_1 == card:
            profile.slot_1 = None
        if profile.slot_2 == card:
            profile.slot_2 = None
        if profile.slot_3 == card:
            profile.slot_3 = None

        # 4. قرار دادن در اسلات جدید
        if slot_number == 1:
            profile.slot_1 = card
        elif slot_number == 2:
            profile.slot_2 = card
        elif slot_number == 3:
            profile.slot_3 = card

        # 5. ذخیره پروفایل و محاسبه مجدد
        profile.save()
        new_rate = profile.update_mining_rate()

    return Response({
        'message': f'کارت با موفقیت در اسلات {slot_number} قرار گرفت.',
        'mining_rate': new_rate,
        # برگرداندن وضعیت جدید اسلات‌ها برای آپدیت فرانت
        'slots': {
            '1': getattr(profile.slot_1, 'id', None),
            '2': getattr(profile.slot_2, 'id', None),
            '3': getattr(profile.slot_3, 'id', None),
        }
    })


# --- API ثبت نام ---
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        return Response({'error': 'نام کاربری و رمز عبور الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 6:
        return Response({'error': 'رمز عبور باید حداقل ۶ کاراکتر باشد.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=username, password=password)
            # Starter resources: 1000 coins, 500 gems
            profile = PlayerProfile.objects.create(
                user=user, coins=1000, gems=500)

            # Grant one free starter card (simulate opening a pack)
            # Rarity roll: COMMON 60%, RARE 30%, EPIC 9%, LEGENDARY 1%
            roll = random.randint(1, 100)
            if roll <= 60:
                selected_rarity = 'COMMON'
            elif roll <= 90:
                selected_rarity = 'RARE'
            elif roll <= 99:
                selected_rarity = 'EPIC'
            else:
                selected_rarity = 'LEGENDARY'

            available_cards = CardTemplate.objects.select_for_update().filter(
                rarity=selected_rarity,
                minted_count__lt=models.F('max_supply')
            )
            if not available_cards.exists():
                available_cards = CardTemplate.objects.select_for_update().filter(
                    rarity='COMMON',
                    minted_count__lt=models.F('max_supply')
                )

            starter_card = None
            if available_cards.exists():
                template = random.choice(list(available_cards))
                template.minted_count += 1
                template.save()
                starter_card = UserCard.objects.create(
                    owner=profile,
                    template=template,
                    serial_number=template.minted_count
                )
    except IntegrityError:
        return Response({'error': 'این نام کاربری قبلاً گرفته شده است.'}, status=status.HTTP_400_BAD_REQUEST)

    # لاگین خودکار بعد از ثبت نام
    user = authenticate(request, username=username, password=password)
    if user is None:
        # fallback: set backend and login
        user.backend = 'django.contrib.auth.backends.ModelBackend'
    login(request, user)

    serializer = PlayerProfileSerializer(user.profile)
    result = {'message': 'ثبت‌نام با موفقیت انجام شد! خوش آمدید.',
              'profile': serializer.data}
    if starter_card:
        result['starter_card'] = UserCardSerializer(starter_card).data
    return Response(result, status=status.HTTP_201_CREATED)

# --- API ورود ---


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        return Response({'error': 'نام کاربری و رمز عبور الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)

    if user is not None:
        if not user.is_active:
            return Response({'error': 'حساب کاربری غیرفعال است.'}, status=status.HTTP_403_FORBIDDEN)
        login(request, user)
        # create or get token for the user
        token, _ = Token.objects.get_or_create(user=user)
        serializer = PlayerProfileSerializer(user.profile)
        return Response({'message': 'ورود موفقیت‌آمیز بود.', 'profile': serializer.data, 'token': token.key})
    else:
        return Response({'error': 'نام کاربری یا رمز عبور اشتباه است.'}, status=status.HTTP_400_BAD_REQUEST)

# --- API خروج ---


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    logout(request)
    return Response({'message': 'خارج شدید.'})


# Exchange coins -> gems: 1000 coins -> 25 gems
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def exchange_coins(request):
    profile = request.user.profile
    try:
        coins = int(request.data.get('coins', 0))
    except (TypeError, ValueError):
        return Response({'error': 'مقدار سکه نامعتبر است.'}, status=400)

    if coins < 1000:
        return Response({'error': 'حداقل مقدار 1000 سکه است.'}, status=400)

    if coins > profile.coins:
        return Response({'error': 'سکه کافی ندارید.'}, status=400)

    # compute bundles of 1000
    bundles = coins // 1000
    if bundles <= 0:
        return Response({'error': 'مقدار سکه برای تبدیل کافی نیست.'}, status=400)

    coins_to_deduct = bundles * 1000
    gems_to_add = bundles * 25

    with transaction.atomic():
        profile.coins -= coins_to_deduct
        profile.gems += gems_to_add
        profile.save()

    return Response({
        'message': f'{coins_to_deduct} سکه تبدیل شد به {gems_to_add} الماس.',
        'coins': profile.coins,
        'gems': profile.gems,
        'converted_coins': coins_to_deduct,
        'added_gems': gems_to_add
    })


def login_page(request):
    # اگر کاربر لاگین است، مستقیم برود به بازی
    if request.user.is_authenticated:
        # فرض بر اینکه اسم صفحه بازی game-index است
        return redirect('game-index')
    # allow preselecting mode via query param ?mode=register
    mode = request.GET.get('mode', 'login')
    return render(request, 'game/login.html', {'mode': mode})


def landing(request):
    # Simple landing page: if authenticated redirect to game index, else show welcome with instructions
    if request.user.is_authenticated:
        return redirect('game-index')
    return render(request, 'game/welcome.html')


def register_page(request):
    if request.user.is_authenticated:
        return redirect('game-index')
    return render(request, 'game/register.html')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_listing(request):
    """ایجاد آگهی فروش جدید"""
    card_id = request.data.get('card_id')
    price = int(request.data.get('price', 0))
    currency = request.data.get('currency', 'COINS')

    try:
        # کارت باید مال خود کاربر باشد و الان در حال استفاده نباشد
        card = UserCard.objects.get(id=card_id, user=request.user)

        if card.is_listed:
            return Response({'error': 'این کارت قبلاً لیست شده است.'}, status=400)

        # چک کنیم که کارت Equip نشده باشد (اگر سیستم اسلات دارید)
        # فرض: اگر کارت در اسلات باشد، باید خطا بدهیم یا خودکار برداریم
        profile = request.user.profile
        if card == profile.slot_1 or card == profile.slot_2 or card == profile.slot_3:
            return Response({'error': 'ابتدا کارت را از اسلات ماینینگ خارج کنید.'}, status=400)

        with transaction.atomic():
            card.is_listed = True
            card.save()

            MarketListing.objects.create(
                seller=request.user,
                card=card,
                price=price,
                currency=currency
            )

        return Response({'message': 'کارت با موفقیت در بازار سیاه قرار گرفت.'})

    except UserCard.DoesNotExist:
        return Response({'error': 'کارت یافت نشد.'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_listing(request, listing_id):
    """خرید کارت از دیگران"""
    try:
        with transaction.atomic():
            # قفل کردن رکورد برای جلوگیری از خرید همزمان دو نفر (Race Condition)
            listing = MarketListing.objects.select_for_update().get(id=listing_id)
            buyer_profile = PlayerProfile.objects.select_for_update().get(user=request.user)

            if listing.seller == request.user:
                return Response({'error': 'نمیتوانید کارت خودتان را بخرید!'}, status=400)

            # بررسی موجودی خریدار
            cost = listing.price
            if listing.currency == 'COINS':
                if buyer_profile.coins < cost:
                    return Response({'error': 'سکه کافی ندارید.'}, status=400)
                buyer_profile.coins -= cost
                # واریز به فروشنده
                seller_profile = PlayerProfile.objects.select_for_update().get(user=listing.seller)
                seller_profile.coins += cost
                seller_profile.save()

            elif listing.currency == 'GEMS':
                if buyer_profile.gems < cost:
                    return Response({'error': 'الماس کافی ندارید.'}, status=400)
                buyer_profile.gems -= cost
                seller_profile = PlayerProfile.objects.select_for_update().get(user=listing.seller)
                seller_profile.gems += cost
                seller_profile.save()

            # انتقال مالکیت کارت
            card = listing.card
            card.user = request.user
            card.is_listed = False  # آزاد کردن کارت
            card.save()

            # ذخیره تغییرات خریدار
            buyer_profile.save()

            # حذف آگهی
            listing.delete()

            return Response({'message': f'کارت {card.template.name} خریداری شد!'})

    except MarketListing.DoesNotExist:
        return Response({'error': 'این آگهی وجود ندارد یا فروخته شده است.'}, status=404)
