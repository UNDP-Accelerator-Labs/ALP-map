import { loadData, processData, getCounts } from '../data/index.mjs';
import { render } from './render.mjs';

async function onLoad () {
	// hidepacks: [130, 118]
	const data2022 = await loadData('/data/taxonomy_latest.json', { mobilizations: [23] });
	const counts2022 = getCounts(Object.assign(processData(data2022, [-1]), {}));

	const data2023 = await loadData('/data/taxonomy_latest.json', { mobilizations: [30] });
	const counts2023 = getCounts(Object.assign(processData(data2023, [-1]), {}));

	const data2024 = await loadData('/data/taxonomy_latest.json', { mobilizations: [38, 37] });
	const counts2024 = getCounts(Object.assign(processData(data2024, [-1]), {}));

	render([counts2022.slice(0, 20), counts2023.slice(0, 20), counts2024.slice(0, 20)])
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', onLoad);
} else {
	(async () => { await onLoad() })();
}