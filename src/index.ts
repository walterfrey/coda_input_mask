import * as coda from "@codahq/packs-sdk";
export const pack = coda.newPack();

/**
 * Aplica máscara de CNPJ, CPF, número, monetário, formato customizado ou regex, conforme o tipo e formato informado.
 *
 * @param {string} tipo Tipo de máscara: 'cpf', 'cnpj', 'numero', 'monetario' ou 'regex'.
 * @param {string} campo Valor a ser formatado (apenas números ou com pontuação).
 * @param {string} [formato] Formato customizado (ex: '9.999,99', '99/99/9999', 'R$ 9.999,99') ou expressão regular. Opcional.
 * @returns {string} Valor formatado conforme o tipo e formato.
 *
 * @example // CPF
 * InputMask('cpf', '12345678901') // '123.456.789-01'
 *
 * @example // CNPJ
 * InputMask('cnpj', '12345678000199') // '12.345.678/0001-99'
 *
 * @example // Número customizado
 * InputMask('numero', '1234567', '9.999.999') // '1.234.567'
 *
 * @example // Monetário customizado
 * InputMask('monetario', '123456', 'R$ 9.999,99') // 'R$ 1.234,56'
 *
 * @example // Regex
 * InputMask('regex', '2023-ABC', '^\\d{4}-[A-Z]{3}$') // '2023-ABC'
 */
pack.addFormula({
  name: "InputMask",
  description: "Aplica máscara de CNPJ, CPF, número, monetário, formato customizado ou regex, conforme o tipo e formato informado.",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "tipo",
      description: "Tipo de máscara: 'cpf', 'cnpj', 'numero', 'monetario' ou 'regex'.",
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "campo",
      description: "Valor a ser formatado (apenas números ou com pontuação).",
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "formato",
      description: "Formato customizado (ex: '9.999,99', '99/99/9999', 'R$ 9.999,99') ou expressão regular. Opcional.",
      optional: true,
    }),
  ],
  resultType: coda.ValueType.String,
  execute: async function ([tipo, campo, formato], context) {
    const digits = campo.replace(/\D/g, "");
    /**
     * Aplica uma máscara customizada a um valor numérico.
     * @param {string} mask Máscara no formato '9.999,99', '99/99/9999', etc.
     * @param {string} value Dígitos a serem aplicados na máscara.
     * @returns {string} Valor formatado.
     * @example
     * applyMask('9.999,99', '123456') // '1.234,56'
     */
    function applyMask(mask: string, value: string): string {
      let result = '';
      let vi = 0;
      for (let mi = 0; mi < mask.length && vi < value.length; mi++) {
        if (mask[mi] === '9') {
          result += value[vi++];
        } else {
          result += mask[mi];
        }
      }
      return result;
    }
    /**
     * Aplica uma máscara monetária a um valor numérico.
     * @param {string} mask Máscara no formato 'R$ 9.999,99'.
     * @param {string} value Dígitos a serem aplicados na máscara.
     * @returns {string} Valor monetário formatado.
     * @example
     * applyMonetaryMask('R$ 9.999,99', '123456') // 'R$ 1.234,56'
     */
    function applyMonetaryMask(mask: string, value: string): string {
      // Garante pelo menos 3 dígitos para centavos
      value = value.padStart(3, '0');
      let intPart = value.slice(0, -2);
      let decPart = value.slice(-2);
      let maskedInt = applyMask(mask.replace(/[^9.]/g, ''), intPart);
      let result = mask.replace(/9+,[9]+/, maskedInt + ',' + decPart);
      // Adiciona símbolo de moeda se existir
      if (mask.includes('R$')) result = 'R$ ' + result;
      if (mask.includes('$') && !mask.includes('R$')) result = '$' + result;
      return result;
    }
    /**
     * Aplica uma máscara numérica customizada.
     * @param {string} mask Máscara no formato '9.999.999'.
     * @param {string} value Dígitos a serem aplicados na máscara.
     * @returns {string} Valor numérico formatado.
     * @example
     * applyNumericMask('9.999.999', '1234567') // '1.234.567'
     */
    function applyNumericMask(mask: string, value: string): string {
      return applyMask(mask, value);
    }
    // Se tipo for regex
    if (tipo === 'regex') {
      let regexStr = formato || '';
      try {
        const re = new RegExp(regexStr);
        if (re.test(campo)) {
          return campo;
        } else {
          return '';
        }
      } catch {
        return campo;
      }
    }
    if (tipo === "cpf" || (tipo === "auto" && digits.length === 11)) {
      if (digits.length !== 11) return campo;
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    if (tipo === "cnpj" || (tipo === "auto" && digits.length === 14)) {
      if (digits.length !== 14) return campo;
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    // Numérico explícito
    if (tipo === "numero" && typeof formato === 'string' && /^[9.\/,\-]+$/.test(formato)) {
      return applyNumericMask(formato, digits);
    }
    // Monetário explícito
    if (tipo === "monetario" && typeof formato === 'string' && /[R$]/.test(formato)) {
      return applyMonetaryMask(formato, digits);
    }
    return campo;
  },
}); 