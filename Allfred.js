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
/* Allert.js
 * Show styled alerts without paralizing the UI
 * 
 * @param {string,object} config
 * -if string, Allert shows the message with default configuration
 * -else, it uses this object as a configuration
*/
class Allert {
	static setConfig(newConfig){
		for(let key in newConfig){
			if (this.config.hasOwnProperty(key) && key !== 'colors') {
				if (typeof this.config[key] === 'object') {
					for(let key2 in newConfig[key]){
						if(this.config[key].hasOwnProperty(key2)){
							this.config[key][key2] = newConfig[key][key2]
						}
					}
				} else {
					this.config[key] = newConfig[key]
				}
			}
		}
	}
	static message ( config ) {
		if (typeof config === 'string') {
			Allert.displayMessage({
				message:config
			})
			return
		}
		this.displayMessage(config)
	}
	static adjustTop(){
		for (let i = 0; i < this.stack.length; i++) {
			let value = this.stack[i].getAttribute('hval')
			let top = 'calc('+value+' - '+this.stack.reduce((acum,curr,index)=>{
					if( index >= i ){
						return acum
					}else{
						return acum + 10 + curr.offsetHeight
					}
				},0)+'px )'
			this.stack[i].style.top = top
		}
	}
	static displayMessage(messageConfig){
		let div = document.createElement('div')
		if( ! this.stack ){
			this.stack = []
		}
		div.innerText = messageConfig.message
		for(let cssProperty in this.config.style){
			switch(cssProperty){
				case 'top':
					let value = messageConfig.style && messageConfig.style[ cssProperty ] || this.config.style[ cssProperty ]
					div.setAttribute('hval',value)
					break
				default:
					div.style[cssProperty] = messageConfig.style && messageConfig.style[ cssProperty ] || this.config.style[ cssProperty ]
			}
		}
		div.style.backgroundColor = this.config.colors[messageConfig.color] || messageConfig.color || this.config.colors.default
		document.body.appendChild( div )
		setTimeout( () => {
			this.stack = this.stack.filter(d=>d!==div)
			div.remove()
			this.adjustTop()
		} , messageConfig.time || this.config.time )
		setTimeout( () => {
			div.style.opacity = 0
		} , ( messageConfig.time || this.config.time ) - Number((messageConfig.style?messageConfig.style.transitionDuration:this.config.style.transitionDuration).split('').filter(c=>/\d/.test(c)).join('') ) )
		this.stack.push(div)
		this.adjustTop()
	}
}
Allert.config = {
	colors : {
		'error':'#f94d40',
		'danger':'#f94d40',
		'default':'#53f940',
		'success':'#53f940',
		'warning':'#f2fc64'
	},
	style:{
		transitionDuration : '700ms',
		borderRadius: '.3em',
		transform : 'translate(calc( -100% - .5em ),calc( -100% - .5em ))',
		position : 'fixed',
		position : 'fixed',
		maxWidth : '90vw',
		padding:'.5em',
		color : '#000',
		left : '100vw',
		top : '100vh'
	},
	time:3000
}
document.addEventListener('DOMContentLoaded',e=>{
	const validations ={
		addError:( element , error = 'error' ) => {
			let prev = element.parentNode.querySelector('span')
			if (prev) {
				element.parentNode.removeChild(prev)
			}
			let t = document.createElement( 'span' )
			t.innerText = '✗ ' + error
			element.parentNode.appendChild(t)
			element.parentNode.className = 'error'
		},
		check:(element)=> {
			let prev = element.parentNode.querySelector('span')
			if (prev) {
				element.parentNode.removeChild(prev)
			}
			if (!element.value) {
				element.parentNode.className = ''
				return
			}
			let t = document.createElement( 'span' )
			t.innerText = '✓' 
			element.parentNode.appendChild(t)
			element.parentNode.className = 'checked'
		},
		required:(element)=>{
			if (!element.value) {
				validations.addError(element,'El campo es obligatorio')
				return false
			}else{
				validations.check(element)
				return true
			}
		},
		isLink:(element)=>{
			if (!/^https?:\/\//.test(element.value)) {
				validations.addError(element,'Debe ingresar un enlace!')
				return false
			}else{
				validations.check(element)
				return true
			}
		},
		isFloat:(element)=>{
			if (element.value && !/^[0-9][0-9]*[\.[0-9][0-9]*]?$/.test(element.value)) {
				validations.addError(element,'Debe ingresar un número!')
				return false
			}else{
				validations.check(element)
				return true
			}
		},
		isInt:(element)=>{
			if (!/^[0-9]*$/.test(element.value)) {
				validations.addError(element,'Debe ingresar un número entero!')
				return false
			}else{
				validations.check(element)
				return true
			}
		},
		maxlength:(element,length)=>{
			if (element.value.length >= Number(length)) {
				validations.addError(element,'Límite de '+ length + ' caracteres')
				return false
			}else{
				validations.check(element)
				return true
			}
		},
		porcentaje:(element)=>{
			let num = Number(element.value)
			if ( 0 <= num && num <= 100 ) {
				validations.addError(element,'Debe ingresar un número entre 1 y 100')
				return false
			}else{
				validations.check(element)
				return true
			}
		},
		depends:(element)=>{}
	}
	Array.from(document.getElementsByClassName('alfred-form') || []).forEach(form=>{
		Array.from(form.querySelectorAll('input,textarea') || []).filter(i=>i.type!=='radio').forEach(input=>{
			const validate = e=>{
				let attributes = input.getAttribute('a-reqs')
				if (!attributes) {
					return
				}
				const attrs = attributes.split(' ')
				let valid = true
				if (attrs.includes('r') || attrs.includes('req') || attrs.includes('required')) {
					valid = valid && validations.required(input)
				}
				if (valid && (attrs.includes('l') || attrs.includes('link'))) {
					valid = valid && validations.isLink(input)
				}
				if (valid && (attrs.includes('f') || attrs.includes('float'))) {
					valid = valid && validations.isFloat(input)
				}
				if (valid && (attrs.includes('i') || attrs.includes('int'))) {
					valid = valid && validations.isInt(input)
				}
				let maxlength = attrs.filter(c=>/^m:/.test(c)||/^max:/.test(c)||/^maxlength:/.test(c))
				if (valid && maxlength.length) {
					valid = valid && validations.maxlength(input,maxlength[0].split(':')[1])
				}
			}
			input.addEventListener('change',validate)
			input.addEventListener('focusout',validate)
		})
		Array.from(form.querySelectorAll('select') || []).forEach(select=>{
			const validate = e=>{
				const attrs = select.getAttribute('a-reqs').split(' ')
				let valid = true
				if (attrs.includes('r') || attrs.includes('req') || attrs.includes('required')) {
					valid = valid && validations.required(select)
				}
			}
			select.addEventListener('change',validate)
			select.addEventListener('focusout',validate)
		})
		const radioInputs = Array.from(form.querySelectorAll('input[type="radio"]') || [])
		let radioNames = []
		radioInputs.forEach(i=>{
			if (!radioNames.includes(i.name)) {
				radioNames.push(i.name)
			}
		})
		let radioGroups = radioNames.map(n=>{
			return{
				name:n,
				elements:radioInputs.filter(i=>i.name===n)
			}
		})
		radioGroups.forEach(group=>{
			const validate = e=>{
				const attrs = group.elements[0].getAttribute('a-reqs').split(' ')
				if (attrs.includes('r') || attrs.includes('req') || attrs.includes('required') ) {
					let atLeastOneChecked = false
					group.elements.forEach(elem=>{
						if (elem.checked) {
							atLeastOneChecked = true
						}
					})
					if (atLeastOneChecked) {
						validations.check(group.elements[0])
					}else{
						validations.addError(group.elements[0],'El campo es obligatorio')
					}
				}
			}
			group.elements.forEach(elem=>{
				elem.addEventListener('change',validate)
				elem.addEventListener('focusout',validate)
			})
		})
		form.addEventListener('submit',e=>{
			let elements = Array.from(form.querySelectorAll('[a-reqs="r"],[a-reqs^="r "],[a-reqs$=" r"],[a-reqs*=" r "]'))
			let canSend = true
			
			elements.forEach((current)=>{
				if(current.parentNode.className !== 'checked'){
					canSend = false
				}
			})

			if (!canSend) {
				alert('Aún faltan campos por llenar')
				e.preventDefault()
				return
			}
			let divs = Array.from(form.querySelectorAll('div'))
			
			divs.forEach((current)=>{
				if(current.className === 'error'){
					canSend = false
				}
			})
			if (!canSend) {
				alert('Aún hay campos con errores')
				e.preventDefault()
			}
		})
	})
})
