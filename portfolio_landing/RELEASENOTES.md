## Revert e Versionamento

O script em Python estava transferindo os arquivos convertendo eles incorretamente, o que quebrou os minificados na nuvem. Agimos rapidamente:

1. **Revertemos os Arquivos**: Voltamos o `index.html` e `script.js` exatamente para a versão estável e perfeita (com o código decorativo de volta e sem o bug visual).
2. **Mandamos Pro Ar de Graça**: Executamos o espelhamento do `lftp` que apaga os arquivos danificados antigos e joga os estáveis limpos pro `public_html`. **O site já voltou ao normal no ar.**
3. **Trava de Segurança (Git)**: Para nunca mais perdermos um estado que está bom, inicializei um repositório Git local. Todo esse código estável agora é o nosso ponto de partida seguro (commit: `chore: initial commit (reverted to stable)`).
