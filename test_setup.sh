#!/bin/bash

echo "=================================="
echo "تست Setup تولید - Oathbreakers"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Start server
echo "🚀 راه‌اندازی سرور..."
source venv/bin/activate
USE_SQLITE=true python manage.py runserver 0.0.0.0:8000 > server.log 2>&1 &
SERVER_PID=$!
sleep 3

# Test 1: Check if server is running
echo ""
echo "📝 تست 1: بررسی وضعیت سرور..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ | grep -q "200"; then
    echo -e "${GREEN}✅ سرور در حال اجرا است${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ سرور در دسترس نیست${NC}"
    ((FAIL++))
fi

# Test 2: Check API endpoint /api/game/auth/login/
echo ""
echo "📝 تست 2: بررسی endpoint /api/game/auth/login/..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/game/auth/login/ -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}')
if [ "$STATUS" = "400" ] || [ "$STATUS" = "401" ]; then
    echo -e "${GREEN}✅ Endpoint کار می‌کند (Status: $STATUS)${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Endpoint کار نمی‌کند (Status: $STATUS)${NC}"
    ((FAIL++))
fi

# Test 3: Check API endpoint /api/game/profile/me/
echo ""
echo "📝 تست 3: بررسی endpoint /api/game/profile/me/..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/game/profile/me/)
if [ "$STATUS" = "403" ] || [ "$STATUS" = "401" ]; then
    echo -e "${GREEN}✅ Endpoint کار می‌کند (Status: $STATUS)${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Endpoint کار نمی‌کند (Status: $STATUS)${NC}"
    ((FAIL++))
fi

# Test 4: Check Tailwind CSS file
echo ""
echo "📝 تست 4: بررسی فایل Tailwind CSS..."
SIZE=$(curl -s http://localhost:8000/static/game/css/tailwind.css | wc -c)
if [ "$SIZE" -gt "10000" ]; then
    echo -e "${GREEN}✅ Tailwind CSS موجود است ($SIZE bytes)${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Tailwind CSS یافت نشد یا بسیار کوچک است${NC}"
    ((FAIL++))
fi

# Test 5: Check for CDN usage
echo ""
echo "📝 تست 5: بررسی عدم استفاده از CDN..."
if curl -s http://localhost:8000/ | grep -q "cdn.tailwindcss"; then
    echo -e "${RED}❌ CDN Tailwind یافت شد${NC}"
    ((FAIL++))
else
    echo -e "${GREEN}✅ بدون CDN${NC}"
    ((PASS++))
fi

# Test 6: Check compiled CSS content
echo ""
echo "📝 تست 6: بررسی محتوای Tailwind CSS..."
if curl -s http://localhost:8000/static/game/css/tailwind.css | grep -q "bg-game-accent"; then
    echo -e "${GREEN}✅ Custom classes موجود است${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Custom classes یافت نشد${NC}"
    ((FAIL++))
fi

# Cleanup
echo ""
echo "🧹 پاکسازی..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

# Summary
echo ""
echo "=================================="
echo "نتیجه نهایی"
echo "=================================="
echo -e "✅ موفق: ${GREEN}$PASS${NC}"
echo -e "❌ ناموفق: ${RED}$FAIL${NC}"
echo "=================================="

if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}🎉 همه تست‌ها موفق بودند!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  برخی تست‌ها ناموفق بودند${NC}"
    exit 1
fi
