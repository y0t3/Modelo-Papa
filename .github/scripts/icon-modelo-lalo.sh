#!/usr/bin/env bash
# Icono ilustrado de La posta de Lalo. Azul y oro, sin alterar colores de rutas.
set -euo pipefail
sudo apt-get update -qq
sudo apt-get install -y -qq imagemagick librsvg2-bin
mkdir -p /tmp/modelo-lalo-icon
# Emblema ilustrado de bolillas (no letras ni escudo oficial de un club).
rsvg-convert --width 1024 --height 1024 assets/la-posta-de-lalo.svg \
  --output /tmp/modelo-lalo-icon/icon.png
for spec in 'mipmap-mdpi 48' 'mipmap-hdpi 72' 'mipmap-xhdpi 96' 'mipmap-xxhdpi 144' 'mipmap-xxxhdpi 192'; do
  set -- $spec
  dir=$1
  size=$2
  mkdir -p android/app/src/main/res/$dir
  rm -f android/app/src/main/res/$dir/ic_launcher.webp android/app/src/main/res/$dir/ic_launcher_round.webp android/app/src/main/res/$dir/ic_launcher.png android/app/src/main/res/$dir/ic_launcher_round.png
  convert /tmp/modelo-lalo-icon/icon.png -resize ${size}x${size} PNG24:android/app/src/main/res/$dir/ic_launcher.png
  cp android/app/src/main/res/$dir/ic_launcher.png android/app/src/main/res/$dir/ic_launcher_round.png
done
