#!/bin/bash
# usage: sheet.sh prefix tag  -> sheets/prefix-tag-sheetN.jpg (4 shots 2x2 desktop, 6 shots 6x1 mobile)
cd "$(dirname "$0")/.."
p=$1; t=$2
files=($(ls ${p}-${t}-[0-9][0-9].jpg 2>/dev/null))
n=0; per=4; geo="720x450+4+4"; til="2x2"
if [ "$t" = "m" ]; then per=6; geo="260x562+4+4"; til="6x1"; fi
for ((i=0;i<${#files[@]};i+=per)); do
  montage "${files[@]:i:per}" -tile $til -geometry $geo -background '#888' sheets/${p}-${t}-sheet$n.jpg
  n=$((n+1))
done
