export const addLoader = function () {
	const ripple = d3.select('body').addElems('div', 'lds-default')
	ripple.addElems('div', 'filler', d3.range(12));
}
export const rmLoader = function () {
	d3.select('.lds-default').remove();
}