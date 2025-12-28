#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install Node.js dependencies for frontend build
if [ -f "package.json" ]; then
    npm install
    npm run build:css
    npm run build:js
fi

# Collect static files
python manage.py collectstatic --no-input

# Run database migrations
python manage.py migrate
