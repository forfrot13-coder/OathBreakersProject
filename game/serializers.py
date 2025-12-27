from rest_framework import serializers
from .models import CardTemplate, UserCard, PlayerProfile, Avatar
from rest_framework.authtoken.models import Token
from .models import MarketListing
from .models import Pack


class AvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avatar
        fields = ['id', 'name', 'image', 'is_premium']


class UserCardSerializer(serializers.ModelSerializer):
    # این فیلدها را از مدل Template می‌کشیم بیرون تا مستقیم در دسترس باشند
    card_name = serializers.CharField(source='template.name', read_only=True)
    image = serializers.ImageField(source='template.image', read_only=True)
    mining_rate = serializers.IntegerField(
        source='template.mining_rate', read_only=True)
    rarity = serializers.CharField(source='template.rarity', read_only=True)
    max_supply = serializers.IntegerField(
        source='template.max_supply', read_only=True)

    class Meta:
        model = UserCard
        fields = ['id', 'serial_number', 'card_name', 'image',
                  'mining_rate', 'rarity', 'is_listed_in_market', 'max_supply']


class PlayerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    # آواتار را به صورت کامل می‌فرستیم تا عکسش را داشته باشیم
    avatar_url = serializers.SerializerMethodField()

    # اطلاعات اسلات‌ها
    slot_1 = UserCardSerializer(read_only=True)
    slot_2 = UserCardSerializer(read_only=True)
    slot_3 = UserCardSerializer(read_only=True)

    total_mining_rate = serializers.SerializerMethodField()
    next_level_xp = serializers.SerializerMethodField()
    mining_multiplier = serializers.SerializerMethodField()

    class Meta:
        model = PlayerProfile
        fields = [
            'username', 'coins', 'gems', 'vow_fragments', 'avatar_url',
            'slot_1', 'slot_2', 'slot_3', 'total_mining_rate',
            'level', 'xp', 'next_level_xp', 'mining_multiplier'
        ]

    def get_total_mining_rate(self, obj):
        return obj.calculate_mining_rate()

    def get_avatar_url(self, obj):
        if obj.avatar and obj.avatar.image:
            return obj.avatar.image.url
        return None

    def get_next_level_xp(self, obj):
        return obj.get_next_level_xp()

    def get_mining_multiplier(self, obj):
        return round(1 + (obj.level * 0.05), 2)


class AuthSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Token
        fields = ['key']


class MarketListingSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(
        source='seller.user.username', read_only=True)
    card = UserCardSerializer(source='card_instance', read_only=True)

    class Meta:
        model = MarketListing
        fields = ['id', 'seller_username', 'card', 'price', 'currency', 'is_active', 'created_at']


class PackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pack
        fields = ['id', 'name', 'price', 'currency_type', 'image', 'description']


