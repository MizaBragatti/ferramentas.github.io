# Roteiro de Testes - Sistema Barbearia

## 1. Teste de Login e Permissões
- [ ] Tentar acessar o sistema sem login → Deve redirecionar para login.
- [ ] Login como Sérgio → Deve acessar painel completo.
- [ ] Login como Hélio → Deve acessar apenas o próprio painel.

## 2. Interface e Fluxo - Sérgio (Proprietário)
- [ ] Ver ambos os botões de barbeiro (Sérgio e Hélio).
- [ ] Alternar entre barbeiros e registrar serviços para ambos.
- [ ] Visualizar histórico completo (serviços de ambos).
- [ ] Excluir serviços do histórico (de qualquer barbeiro).
- [ ] Visualizar relatório completo (todos os dados).
- [ ] Visualizar relatório por barbeiro (ambos e comparação).
- [ ] Sair e garantir que sessão é encerrada.

## 3. Interface e Fluxo - Hélio (Funcionário)
- [ ] Ver apenas o botão do próprio barbeiro.
- [ ] Registrar serviços apenas para si.
- [ ] Visualizar histórico apenas dos próprios serviços.
- [ ] Excluir apenas seus próprios serviços do histórico.
- [ ] Visualizar relatório completo (apenas dados do Hélio).
- [ ] Não visualizar o botão de relatório por barbeiro.
- [ ] Sair e garantir que sessão é encerrada.

## 4. Segurança e Consistência
- [ ] Tentar manipular sessionStorage para trocar de perfil → Sistema deve respeitar as permissões.
- [ ] Após logout, tentar voltar pelo navegador → Deve exigir login novamente.
- [ ] Garantir que dados de um barbeiro não afetam o outro.
