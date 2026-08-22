export const maskCEP = (value: string) => {
  let v = value.replace(/\D/g, '');
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length > 5) {
    v = v.replace(/^(\d{5})(\d)/, '$1-$2');
  }
  return v;
};

export const maskCurrency = (value: string | number) => {
  // If it's a number (e.g. from initial state), convert it to cents first
  let v = String(value);
  if (typeof value === 'number') {
    v = (value * 100).toFixed(0);
  }
  v = v.replace(/\D/g, '');
  if (!v) return 'R$ 0,00';
  const num = Number(v) / 100;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const getCurrencyNumber = (value: string) => {
  let v = value.replace(/\D/g, '');
  return Number(v) / 100;
};

export const maskInteger = (value: string | number) => {
  return String(value).replace(/\D/g, '');
};

export const maskCPF = (value: string) => {
  let v = value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 9) v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4');
  else if (v.length > 6) v = v.replace(/^(\d{3})(\d{3})(\d)/, '$1.$2.$3');
  else if (v.length > 3) v = v.replace(/^(\d{3})(\d)/, '$1.$2');
  return v;
};

export const maskCNPJ = (value: string) => {
  let v = value.replace(/\D/g, '');
  if (v.length > 14) v = v.slice(0, 14);
  if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d)/, '$1.$2.$3/$4-$5');
  else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d)/, '$1.$2.$3/$4');
  else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d)/, '$1.$2.$3');
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, '$1.$2');
  return v;
};
