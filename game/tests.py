from django.test import TestCase
from django.contrib.auth.models import User
from .models import PlayerProfile, CardTemplate, UserCard, MarketListing

class MarketplaceVowFragmentsTest(TestCase):
    """Test that marketplace only uses Vow Fragments"""
    
    def setUp(self):
        # Create test user and profile
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.profile = PlayerProfile.objects.create(user=self.user, vow_fragments=1000)
        
        # Create a card template
        self.card_template = CardTemplate.objects.create(
            name='Test Card',
            rarity='COMMON',
            mining_rate=1,
            max_supply=100
        )
        
        # Create a user card
        self.user_card = UserCard.objects.create(
            owner=self.profile,
            template=self.card_template,
            serial_number=1
        )
    
    def test_market_listing_only_vow_fragments(self):
        """Test that MarketListing model only has price field (no currency)"""
        # Create a market listing
        listing = MarketListing.objects.create(
            seller=self.profile,
            card_instance=self.user_card,
            price=500
        )
        
        # Verify the listing was created with only price (no currency field)
        self.assertEqual(listing.price, 500)
        
        # Verify that currency field doesn't exist
        with self.assertRaises(AttributeError):
            _ = listing.currency
        
        # Verify string representation includes Vow Fragments
        self.assertIn('Vow Fragments', str(listing))
    
    def test_create_listing_api(self):
        """Test the create_listing API endpoint"""
        self.client.login(username='testuser', password='testpass')
        
        # Test creating a listing
        response = self.client.post('/api/game/market/create/', {
            'card_id': self.user_card.id,
            'price': 300
        }, content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('Vow Fragments', response.json()['message'])
        
        # Verify the listing was created
        listing = MarketListing.objects.get(card_instance=self.user_card)
        self.assertEqual(listing.price, 300)
        
        # Verify the card is marked as listed
        self.user_card.refresh_from_db()
        self.assertTrue(self.user_card.is_listed_in_market)
    
    def test_buy_listing_api(self):
        """Test the buy_listing API endpoint"""
        # Create a listing first
        listing = MarketListing.objects.create(
            seller=self.profile,
            card_instance=self.user_card,
            price=200
        )
        
        # Create a buyer
        buyer_user = User.objects.create_user(username='buyer', password='buyerpass')
        buyer_profile = PlayerProfile.objects.create(user=buyer_user, vow_fragments=1000)
        
        self.client.login(username='buyer', password='buyerpass')
        
        # Test buying the listing
        response = self.client.post(f'/api/game/market/buy/{listing.id}/', {
            'listing_id': listing.id
        }, content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        # Verify the transaction
        buyer_profile.refresh_from_db()
        self.profile.refresh_from_db()
        
        # Buyer should have 800 Vow Fragments (1000 - 200)
        self.assertEqual(buyer_profile.vow_fragments, 800)
        
        # Seller should have 1200 Vow Fragments (1000 + 200)
        self.assertEqual(self.profile.vow_fragments, 1200)
        
        # Listing should be inactive
        listing.refresh_from_db()
        self.assertFalse(listing.is_active)
        
        # Card should belong to buyer
        self.user_card.refresh_from_db()
        self.assertEqual(self.user_card.owner, buyer_profile)
        self.assertFalse(self.user_card.is_listed_in_market)
