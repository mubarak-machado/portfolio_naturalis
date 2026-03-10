#!/bin/bash
source ~/.gemini/antigravity/brain/.mubarak_ftp_env
HOST=$FTP_HOST
USER=$FTP_USER
PASS=$FTP_PASS

lftp -u $USER,"$PASS" $HOST -e "set ftp:ssl-allow no; set net:timeout 10; mirror -R -v -x \.env /Users/mubarak/dev/ro_naturalis/web_app/portfolio_landing/ /public_html/; quit"
