import ftplib
import os
import sys

host = "191.252.83.237"
user = "mubarakmachado1"
password = "vgh!fnhavq9xbw9PCY"

print("Iniciando conexão FTP...")
try:
    ftp = ftplib.FTP(host, timeout=30)
    ftp.login(user, password)
    print("Login com sucesso!")
    
    # Mudar para a pasta public_html
    ftp.cwd("/public_html")
    print("Entrou em /public_html")
    
    # Lista de arquivos locais a enviar
    base_dir = "/Users/mubarak/dev/ro_naturalis/web_app/portfolio_landing"
    files_to_upload = ["index.html", "style.css", "script.js"]
    
    for filename in files_to_upload:
        local_path = os.path.join(base_dir, filename)
        if os.path.exists(local_path):
            with open(local_path, "rb") as file:
                ftp.storbinary(f"STOR {filename}", file)
            print(f"Enviado com sucesso: {filename}")
        else:
            print(f"Arquivo não encontrado: {local_path}")
            
    # Criar e entrar na pasta images
    try:
        ftp.mkd("images")
    except ftplib.error_perm:
        pass # A pasta já deve existir
        
    ftp.cwd("images")
    print("Entrou em /public_html/images")
    
    images_dir = os.path.join(base_dir, "images")
    if os.path.exists(images_dir):
        for img in os.listdir(images_dir):
            if img.endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp')):
                img_path = os.path.join(images_dir, img)
                with open(img_path, "rb") as file:
                    ftp.storbinary(f"STOR {img}", file)
                print(f"Imagem enviada: {img}")
                
    ftp.quit()
    print("Deploy finalizado com sucesso!")
except Exception as e:
    print(f"Erro fatal: {e}")
    sys.exit(1)
