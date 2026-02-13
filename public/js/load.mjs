import * as render from './render/index.mjs';
import { interaction, arrays } from './helpers/index.mjs';

async function onLoad() {
  const q_params = new URL(window.location).searchParams;
  let ctrs = q_params.getAll('ctr') || q_params.getAll('CTR');

  let ecosystems_data = 'ecosystems';
  if (ctrs.length > 0) ecosystems_data = 'ecosystems_full';

  const [ network, ecosystems ] = await Promise.all(['network', ecosystems_data].map(d => {
    return fetch(`public/data/${d}.json`)
    .then(res => res.json())
    .catch(err => console.log(err));
  }))

  let { nodes, links } = ecosystems;
  console.log(nodes.filter(d => d.name?.toLowerCase() !== 'accelerator lab').length)
  
  const canvas = render.canvas('#canvas');
  const { proj } = render.map(null, countries, { ...canvas, ctrs });
  const country_features = topojson.feature(countries, countries.objects.all_countries).features;
  
  /*
  Ecosystems nodes
  */
  ecosystems.nodes.forEach(d => {
    if (d.type === 'Accelerator Lab') {
      const country_feature = country_features.find(c => c.id === d.name);
      if (!country_feature) {
        console.log(`name`)
        console.log(d)
      } else {
        const centroid = proj(turf.centroid(country_feature).geometry.coordinates);
        const { width, height } = canvas || {};
        d.fx = centroid[0] - width/ 2;
        d.fy = centroid[1] - height/ 2;
        d.fullname = country_feature.properties.ADMIN;
      }
    } else {
      if (!links.some(c => c.target === d.name)) console.log(d);
    }
  });
  /*
  Get timescales
  */
  const network_dates = network.links.map(d => d.year);
  const ecosystems_dates = ecosystems.links.map(d => {
    const { year } = d || {};
    return new Date(year).getFullYear();
  });
  const range = [
    Math.max(Math.min(...network_dates), Math.min(...ecosystems_dates)), 
    Math.min(Math.max(...network_dates), Math.max(...ecosystems_dates)),
  ];
  const steps = new Array((range[1] - range[0]) + 1).fill(0).map((d, i) => range[0] + i)


  // console.log(arrays.nest.call(nodes, { key: 'name' }).filter(d => d.count > 1))

  /*
  Render everything
  */
  // render.widgets.layer_activation('network');
  // render.widgets.layer_activation('ecosystems');
  // render.widgets.range_slider(steps, network, ecosystems, { canvas });
  if (!ctrs?.length) render.network(network, { ...canvas, ctrs });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    onLoad();
  });
} else {
  (async () => {
    await onLoad();
  })();
}
