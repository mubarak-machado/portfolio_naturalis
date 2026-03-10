#!/bin/bash
source ~/.gemini/antigravity/brain/.mubarak_ftp_env

echo "Iniciando upload reverso com lftp..."
# Disable SSL verification if it causes issues on Locaweb, and use mirror to exactly sync the folders
lftp -u ${FTP_USER},"${FTP_PASS}" ftp://${FTP_HOST} -e "set ftp:ssl-allow no; mirror -R -v -e --ignore-time -x '\.env' -x '.*\.py$' -x '.*\.sh$' -x '\.git' /Users/mubarak/dev/ro_naturalis/web_app/portfolio_landing/ /public_html/; quit"
