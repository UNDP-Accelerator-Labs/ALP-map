import { taxon } from './taxon.mjs';

export const processData = function (data, hidepacks) {
	// PRE-PROCESS
	let [ sourcetags, pads, taxonomy ] = data;
	pads = pads.flat();

	const usedtags = pads.map(d => {
		return d.tags.filter(c => c.type === 'thematic_areas').map(c => c.tag_id)
	}).flat().unique();
	
	const tags = sourcetags.filter(d => {
		return usedtags.includes(d.id) && d.id !== 4340;
	});

	let idsInTaxonomy = taxonomy.map(d => d.id).flat().unique();
	let missingTags = tags.filter(d => !idsInTaxonomy.includes(d.id));

	if (missingTags.length) {
		console.log('some ids are missing in the taxonomy')
		console.log(missingTags)

		missingTags.forEach(d => {
			const { id, name: clean } = d;
			const newTaxon = new taxon({ id, clean });
			taxonomy.push(newTaxon);
		});
	}

	if (usedtags.length) taxonomy = taxonomy.filter(d => d.id.some(c => usedtags.includes(c)));

	taxonomy.forEach((d, i) => {
		d.selfId = i;
		if (d.clusters === -1) d.keywords = 'Uncategorized';
	});

	if (hidepacks?.length) {
		taxonomy = taxonomy.filter(d => !hidepacks.includes(d.clusters));
	}

	return { tags, pads, taxonomy };
}

export const getCounts = function (_kwargs) {
	let { tags, pads, taxonomy, hidepacks } = _kwargs;
	const clusters = tags.map(d => {
		const { clusters, keywords } = taxonomy?.find(c => c.id.includes(d.id)) || {};
		d.cluster = clusters;
		d.keyword = keywords;
		return d;
	}).filter(d => hidepacks?.length ? !hidepacks.includes(d.cluster) : true)
	.nest('cluster', 'keyword')
	.map(d => {
		const { key, keyword, values } = d;
		const ids = values.map(c => c.id)
		const obj = {};
		obj.id = key;
		obj.key = keyword;
		obj.count = values.sum('count');
		obj.pads = pads.filter(c => c.status >= 2 && c.tags.some(b => b.type === 'thematic_areas' && ids.includes(b.tag_id)));
		obj.padcount = obj.pads.length;
		obj.countrycount = obj.pads.unique('country', true).length;
		obj.values = values;
		return obj;
	}).sort((a, b) => b.padcount - a.padcount);
	return clusters;
}