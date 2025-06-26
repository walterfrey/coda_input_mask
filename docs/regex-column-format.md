# Coda Pack: Formatação de Campos com Regex

Este guia mostra como criar um Pack para o [Coda.io](https://coda.io) que permite formatar colunas automaticamente usando expressões regulares (regex). O objetivo é detectar padrões específicos em campos de texto e aplicar formatação customizada.

## Exemplo de Uso

Você pode usar este Pack para:
- Detectar e formatar URLs específicas
- Validar padrões de texto (como e-mails, códigos, etc.)
- Aplicar formatação condicional baseada em regex

## Estrutura Básica do Pack

```typescript
import * as coda from "@codahq/packs-sdk";
export const pack = coda.newPack();

// Adiciona um formato de coluna customizado
pack.addColumnFormat({
  name: "Regex Format",
  instructions: "Formata o campo se corresponder ao padrão regex.",
  formulaName: "RegexFormat",
  matchers: [
    new RegExp("^\\d{4}-[A-Z]{3}$"), // Exemplo: 2023-ABC
    // Adicione outros padrões conforme necessário
  ],
});

// Fórmula associada ao formato de coluna
pack.addFormula({
  name: "RegexFormat",
  description: "Formata o campo se corresponder ao regex.",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "input",
      description: "Texto a ser validado e formatado.",
    }),
  ],
  resultType: coda.ValueType.String,
  execute: async function ([input], context) {
    // Exemplo: retorna o texto em maiúsculas se corresponder ao padrão
    if (/^\d{4}-[A-Z]{3}$/.test(input)) {
      return input.toUpperCase();
    }
    return input;
  },
});
```

## Como Funciona
- O método `addColumnFormat` registra um novo formato de coluna, com um ou mais `matchers` (regex).
- Quando o valor de uma célula corresponder a um dos padrões, o formato será sugerido/aplicado automaticamente.
- A fórmula associada (`RegexFormat`) pode transformar, validar ou destacar o valor conforme desejado.

## Personalização
- Adicione quantos padrões regex quiser no array `matchers`.
- Modifique a lógica da fórmula para aplicar a transformação desejada (ex: mascarar, colorir, validar, etc).

## Referências
- [Documentação oficial do Coda Packs SDK](https://coda.io/packs/build/latest/)
- Exemplos de uso de regex em Packs: [context7/coda/packs-sdk](https://github.com/coda/packs-sdk)

---

Sinta-se livre para adaptar este template para os padrões e necessidades do seu projeto! 