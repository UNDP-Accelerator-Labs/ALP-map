const { pathname } = new URL(window.location);
const params = pathname.split('/').filter(d => d.length);

export const platform = params[0];
export const baseurl = new URL(`https://${platform}.sdg-innovation-commons.org`);
export const islocal = new URL(window.location).origin.includes('localhost');