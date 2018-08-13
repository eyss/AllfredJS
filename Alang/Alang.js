function Alang( language , config = {} ) {
	const getData = (key,json)=>{
		if (!key || !json) {
			return ''
		}
		let index = key.indexOf('.')
		if ( index === -1 ) {
			return json[key]
		}else{
			return getData( key.slice(index + 1) , json[ key.slice( 0 , index ) ] )
		}
	}
	fetch('/Alang/' + language + '.json')
		.then(res=>res.json())
		.then(json=>{
			Array.from(document.getElementsByClassName('a-lang')).forEach(element=>{
				element.innerText = getData(element.getAttribute('a-key'),json)
			})
			if (config.success) {
				config.success()
			}
		})
		.catch(err=>{
			if (config.error) {
				config.error(err)
			} else {
				console.log(err)
			}
		})
}