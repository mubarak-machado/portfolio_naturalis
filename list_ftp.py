import ftplib

host = "191.252.83.237"
user = "mubarakmachado1"
password = "vgh!fnhavq9xbw9PCY"

print("Iniciando conexão FTP...")
try:
    ftp = ftplib.FTP(host)
    ftp.login(user, password)
    print("Login com sucesso!")
    
    print("Arquivos no diretório raiz:")
    ftp.dir()
    
    print("\nTendando entrar em /public_html...")
    try:
        ftp.cwd("/public_html")
        print("Entrou em /public_html. Arquivos aqui:")
        ftp.dir()
    except Exception as e:
        print(f"Não conseguiu entrar em /public_html: {e}")
        
    ftp.quit()
except Exception as e:
    print(f"Falha: {e}")
