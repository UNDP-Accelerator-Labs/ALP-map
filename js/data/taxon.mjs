export class taxon {
	constructor (_kwargs) {
		let { id, clean, split, clusters, umap, keywords, keywords_umap, totalcount, initial_idx } = _kwargs;
		if (!Array.isArray(id)) id = [id];
		this.id = id;
		if (!Array.isArray(clean)) clean = [clean];
		this.clean = clean;
		this.split = split?.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') || clean[0]?.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
		this.clusters = clusters ?? -1;
		this.umap = umap || [];
		this.keywords = keywords ?? 'Uncategorized';
		this.keywords_umap = keywords_umap || [];
		this.totalcount = totalcount;
		this.initial_idx = initial_idx;
	}
}