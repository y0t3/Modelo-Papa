#!/usr/bin/env bash
# Icono final de La posta de Lalo: escudo y bolillas azul/oro.
# Fuente: imagen aprobada del usuario, no la ilustración SVG anterior.
set -euo pipefail
sudo apt-get update -qq
sudo apt-get install -y -qq imagemagick
mkdir -p /tmp/modelo-lalo-icon

test -s assets/la-posta-launcher-icon.png
test -s assets/la-posta-launcher-foreground.png

# Launcher clásico: imagen completa. Launcher redondo/adaptativo: márgenes
# seguros para que el recorte de Android no coma escudo ni bolillas.
convert assets/la-posta-launcher-icon.png -resize 1024x1024 \
  PNG32:/tmp/modelo-lalo-icon/icon.png
convert -size 1024x1024 xc:'#07142D' \
  \( assets/la-posta-launcher-foreground.png -resize 1024x1024 \) \
  -gravity center -compose over -composite \
  PNG32:/tmp/modelo-lalo-icon/icon_round.png

for spec in 'mipmap-mdpi 48' 'mipmap-hdpi 72' 'mipmap-xhdpi 96' 'mipmap-xxhdpi 144' 'mipmap-xxxhdpi 192'; do
  set -- $spec
  dir=$1
  size=$2
  mkdir -p android/app/src/main/res/$dir
  rm -f android/app/src/main/res/$dir/ic_launcher.webp \
    android/app/src/main/res/$dir/ic_launcher_round.webp \
    android/app/src/main/res/$dir/ic_launcher.png \
    android/app/src/main/res/$dir/ic_launcher_round.png
  convert /tmp/modelo-lalo-icon/icon.png -resize ${size}x${size} \
    PNG32:android/app/src/main/res/$dir/ic_launcher.png
  convert /tmp/modelo-lalo-icon/icon_round.png -resize ${size}x${size} \
    PNG32:android/app/src/main/res/$dir/ic_launcher_round.png
done

echo 'Icono final azul/oro instalado (clásico, redondo y adaptive de Expo).'
