Array.prototype.unique = function (key, onkey) {
	const arr = []
	this.forEach(d => {
		if (!key) {
			if (arr.indexOf(d) === -1) arr.push(d)
		}
		else {
			if (onkey) { if (arr.map(c => c).indexOf(d[key]) === -1) arr.push(d[key]) }
			else { 
				if (typeof key === 'function') { if (arr.map(c => key(c)).indexOf(key(d)) === -1) arr.push(d) }
				else { if (arr.map(c => c[key]).indexOf(d[key]) === -1) arr.push(d) }
			}
		}
	})
	return arr
}
Array.prototype.nest = function (key, keep) {
	const arr = []
	this.forEach(d => {
		const groupby = typeof key === 'function' ? key(d) : d[key]
		if (!arr.find(c => c.key === groupby)) {
			if (keep) {
				const obj = {}
				obj.key = groupby
				obj.values = [d]
				obj.count = 1
				if (Array.isArray(keep)) keep.forEach(k => obj[k] = d[k])
				else obj[keep] = d[keep]
				arr.push(obj)
			} else arr.push({ key: groupby, values: [d], count: 1 })
		} else { 
			arr.find(c => c.key === groupby).values.push(d)
			arr.find(c => c.key === groupby).count ++
		}
	})
	return arr
}

d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this)
	})
}
d3.selection.prototype.findAncestor = function (_target) {
	if (!this.node().classList || this.node().nodeName === 'BODY') return null
	if (this.classed(_target) || this.node().nodeName === _target?.toUpperCase()) return this
	return d3.select(this.node().parentNode)?.findAncestor(_target);
}
const jsonQueryHeader = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
function POST (_uri, _q, _expectJSON = true) {
	return new Promise(resolve => 
		fetch(_uri, { method: 'POST', headers: jsonQueryHeader, body: JSON.stringify(_q) })
			.then(response => {
				if (_expectJSON) return response.json()
				else return response
			})
			.then(results => resolve(results))
			.catch(err => { if (err) throw (err) })
	)
}
function GET (_uri, _expectJSON = true) {
	return new Promise(async resolve => {
		fetch(_uri, { method: 'GET', headers: jsonQueryHeader })
			.then(response => {
				if (_expectJSON) return response.json()
				else return response
			})
			.then(results => resolve(results))
			.catch(err => { if (err) throw (err) })
	})
}
Array.prototype.intersection = function (V2) {
	const intersection = []
	this.sort()
	V2.sort()
	for (let i = 0; i < this.length; i += 1) {
		if(V2.indexOf(this[i]) !== -1){
			intersection.push(this[i])
		}
	}
	return intersection
}
String.prototype.simplify = function () {
	return this.valueOf().trim().replace(/[^\w\s]/gi, '').replace(/\s/g, '').toLowerCase()
}