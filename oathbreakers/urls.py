from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from game import views as game_views

urlpatterns = [
    path('', game_views.landing, name='landing'),
    path('login/', game_views.login_page, name='root-login'),
    path('register/', game_views.register_page, name='root-register'),
    path('admin/', admin.site.urls),
    path('api/game/', include('game.urls')),  # این خط اضافه شد
]

# این خط برای نمایش تصاویر آپلود شده لازم است
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
