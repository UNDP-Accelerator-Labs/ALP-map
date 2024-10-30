import { processData } from '../data/index.mjs';

export const processPack = function (data) {
	const contains_unclustered = data.some(d => d.clusters === -1);
	data.forEach(d => {
		d.orid = d.id
		d.split = d.split?.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
		d.id = `root.${contains_unclustered ? `${d.clusters >= 0}.` : ''}${d.keywords.replace(/\,\s/g, '-')}.${d.split}`;
		d.value = d.select_count ?? d.total_count;
	})
	data.unique('keywords').forEach(d => {
		data.push({ id: `root.${contains_unclustered ? `${d.clusters >= 0}.` : ''}${d.keywords.replace(/\,\s/g, '-')}` });
	})
	if (contains_unclustered) {
		data.push({ id: 'root.true' });
		data.push({ id: 'root.false' });
	}
	data.push({ id: 'root' });
	return data;
}