#!/usr/bin/env bash
# Icono de Modelo Lalo: azul oscuro + dorado, conservado para futuras compilaciones.
set -euo pipefail
sudo apt-get update -qq
sudo apt-get install -y -qq imagemagick
mkdir -p /tmp/modelo-lalo-icon
icon_label="${MODELO_LALO_ICON_LABEL:-PRUEBA}"
convert -size 1024x1024 xc:'#10274A' -gravity center \
  -fill '#F6D36D' -font DejaVu-Sans-Bold -pointsize 285 \
  -annotate +0-60 'ML' -pointsize 93 -annotate +0+265 "$icon_label" \
  /tmp/modelo-lalo-icon/icon.png
for spec in 'mipmap-mdpi 48' 'mipmap-hdpi 72' 'mipmap-xhdpi 96' 'mipmap-xxhdpi 144' 'mipmap-xxxhdpi 192'; do
  set -- $spec
  dir=$1
  size=$2
  mkdir -p android/app/src/main/res/$dir
  rm -f android/app/src/main/res/$dir/ic_launcher.webp android/app/src/main/res/$dir/ic_launcher_round.webp android/app/src/main/res/$dir/ic_launcher.png android/app/src/main/res/$dir/ic_launcher_round.png
  convert /tmp/modelo-lalo-icon/icon.png -resize ${size}x${size} PNG24:android/app/src/main/res/$dir/ic_launcher.png
  cp android/app/src/main/res/$dir/ic_launcher.png android/app/src/main/res/$dir/ic_launcher_round.png
done
