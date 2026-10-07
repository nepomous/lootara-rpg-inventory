# Retro — 0001 Componente morto editado no lugar da tela real

- Date: desconhecida (anterior à v0.1; registrada a partir do CLAUDE.md legado)
- Task / run id: n/a
- Tier: n/a (T1 em retrospecto)

## What the agent got wrong

O agente atualizou `AddCharacterSheet.tsx` (bottom sheet nunca usado) em vez de `app/character/new.tsx` (tela real aberta pelo FAB via `router.push("/character/new")`). Resultado: código duplicado e a feature não funcionou.

## Cause

- [x] missing rule (não havia rastreio obrigatório do fluxo real)
- [x] insufficient context (o agente não sabia que o componente estava morto)

## Fix applied (and where)

Regras CORE-003/CORE-004 e policy POL-UI (global): rastrear navegação real, busca de referências antes de editar, confirmar o arquivo-alvo, não criar duplicata. Origem: "Checklist pré-implementação de UI" do CLAUDE.md legado.

## Promote to global?

Já promovida (POL-UI / CORE-004), por ser independente do domínio.

## Cost note (optional)

n/a
