# POL-MON — Monetização / Premium (projeto)

- **TRIGGER:** A tarefa toca Premium, entitlements, anúncios, compras, "Restaurar compras", doação, `ProUpsellSheet`, `AdBanner`, `usePremium`, `premiumStore`. **Tier T2.**
- **ORIGIN:** legacy "Regras de Negócio > Monetização".

## Regras

### BR-MON-001 — Modelo híbrido

- RULE: Versão grátis com anúncios (AdMob) + compra única **"Lootara Premium"** (RevenueCat, não-consumível) que remove anúncios e destrava recursos Pro.
- REASON: não documentado. VALIDATION: nenhuma assinatura/consumível introduzido.

### BR-MON-002 — Identifier do entitlement

- RULE: O entitlement do RevenueCat usa o identifier exato **"Lootara Premium"**.
- REASON: o SDK resolve o entitlement por identifier. VALIDATION: grep do identifier; sem variações.

### BR-MON-003 — Recursos Pro

- RULE: Personagens ilimitados, sem anúncios, exportação de backup.

### BR-MON-004 — Upsell

- RULE: Upsell via `ProUpsellSheet` (não via `Alert`), com CTA mostrando o preço e reforço de **"compra única, sem assinatura"** (via i18n).
- VALIDATION: nenhum `Alert` de upsell; texto nos 5 locales.

### BR-MON-005 — Sem login próprio

- RULE: O app não tem login. A recuperação de compra é via **"Restaurar compras"** (`Purchases.restorePurchases()`), atrelada à conta da App Store / Google Play; é o mecanismo que substitui o login.
- VALIDATION: nenhum fluxo de conta/login criado.

### BR-MON-006 — Restaurar compras obrigatório

- RULE: O botão **"Restaurar compras"** é obrigatório na tela de configurações.
- REASON: Apple Guideline 3.1.1 (compra não-consumível de remoção de anúncios).
- VALIDATION: botão presente e funcional em `settings.tsx`.

### BR-MON-007 — Estado premium reativo

- RULE: O estado premium é **reativo** via `Purchases.addCustomerInfoUpdateListener` (fonte de verdade na sessão). O valor no `SecureStore` é só **cache inicial provisório** no boot, para evitar flash de anúncio; `SecureStore` vazio = não-premium provisório, nunca definitivo.
- VALIDATION: listener registrado; cache nunca trata "vazio" como definitivo.

### BR-MON-008 — usePremium

- RULE: `usePremium()` lê do store Zustand, inicializado com o valor do `SecureStore` no boot.

### BR-MON-009 — AdBanner

- RULE: `<AdBanner />` retorna `null` se `isPremium` — sem lógica adicional.

### BR-MON-010 — Doação somente no Android

- RULE: Doação renderizada **somente no Android** (`Platform.OS === 'android'`).
- REASON: no iOS a permissão de link externo da Apple vale apenas na storefront dos EUA; em build global, link externo de doação no iOS viola a Guideline 3.1.1. Se um dia quiser doação no iOS, usar IAP consumível via RevenueCat.
- VALIDATION: nenhum link de doação renderizado no iOS.

## VERIFY

1. Identifier exato "Lootara Premium" (BR-MON-002).
2. Fonte do estado: listener RevenueCat → Zustand; `SecureStore` apenas cache provisório (BR-MON-007/008).
3. "Restaurar compras" presente e funcional (BR-MON-006).
4. Comportamento grátis × premium para cada feature tocada (anúncios, limite de personagens, export).
5. Offline: boot sem rede com cache premium; boot sem rede com cache vazio; sem flash de anúncio para premium.
6. Upsell via `ProUpsellSheet` com preço e "compra única, sem assinatura" (BR-MON-004).
7. Doação apenas Android (BR-MON-010).
8. Chaves RevenueCat/AdMob via env/app config, nada commitado (SEC-001, EXPO-003). (novo) Usar IDs de teste do AdMob em desenvolvimento.

- **EVIDENCE:** referências `file:line` por item + testes/roteiro manual para o item 5.
- **OWNER:** Developer executa · QA testa cenários grátis/premium/offline · Reviewer confirma (lente Security).
