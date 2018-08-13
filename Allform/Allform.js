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