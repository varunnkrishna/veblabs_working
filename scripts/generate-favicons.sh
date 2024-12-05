#!/bin/bash

# Create directory for favicons if it doesn't exist
cd "$(dirname "$0")/.."
mkdir -p public/favicons

# Source logo file
SOURCE_LOGO="public/images/veblabslogoblue.png"

# Generate various sizes
convert "$SOURCE_LOGO" -resize 16x16 public/favicon-16x16.png
convert "$SOURCE_LOGO" -resize 32x32 public/favicon-32x32.png
convert "$SOURCE_LOGO" -resize 180x180 public/apple-touch-icon.png
convert "$SOURCE_LOGO" -resize 192x192 public/android-chrome-192x192.png
convert "$SOURCE_LOGO" -resize 512x512 public/android-chrome-512x512.png

echo "Favicon generation complete!"
