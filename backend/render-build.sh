#!/usr/bin/env bash
# Build script для Render.com

set -e

echo "🔨 Building Chess Backend..."

# Сделать gradlew исполняемым
chmod +x gradlew

# Собрать проект
./gradlew clean build -x test

echo "✅ Build complete!"
