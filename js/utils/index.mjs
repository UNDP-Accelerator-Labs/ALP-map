const { origin, pathname } = new URL(window.location);
const params = pathname.split('/').filter(d => d.length);

export const platform = origin.includes('localhost') ? params[0] : params[1];
export const baseurl = new URL(`https://${platform}.sdg-innovation-commons.org`);
export const islocal = new URL(window.location).origin.includes('localhost');