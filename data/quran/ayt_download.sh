#!/bin/sh
WEBFILE='http://quran.ksu.edu.sa/ayat/?pg=patches'
LOCFILE='index.html'
LINKS='husary.links'
wget -c $WEBFILE -O $LOCFILE
grep  -i --color husary $LOCFILE | grep -o download.*ayt > "$LINKS"
WEBURL=`echo $WEBFILE | sed 's:/[^/]*$::'`
while IFS='' read -r line || [[ -n "$line" ]]; do
    wget -c "$WEBURL/$line"
done < "$LINKS"
unzip \*.ayt
mkdir wav
cd audio/Husary_40kbps
for i in `ls *.mp3`; do  sox $i -c 1 -r 16k -b 16 ../../wav/`echo $i | cut -c -6`.wav ; done
cd ../../
rm -fr audio *.ayt $LOCFILE $LINKS
