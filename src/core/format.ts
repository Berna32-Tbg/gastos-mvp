const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
export const money = (n: number) => fmt.format(n);
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString('es-MX');
