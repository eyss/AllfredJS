const fs = require('fs')

const forbiddenNames = [
	'.git',
	'node_modules',
	'Allfred.js',
	'Allfred.min.js',
	'LICENSE',
	'unite.js'
]

const modules = fs.readdirSync('.').filter(f=>!forbiddenNames.includes(f))

let Allfred = '',
	Allfredmin = ''

modules.forEach(mod=>{
	Allfred += fs.readFileSync(`${mod}/${mod}.js`) + '\n'
	Allfredmin += fs.readFileSync(`${mod}/${mod}.min.js`) + '\n'
})

fs.writeFile('Allfred.js',Allfred,err=>{
	if (err) {
		console.log(err)
	}else{
		console.log('Allfred.js done')
	}
})
fs.writeFile('Allfred.min.js',Allfredmin,err=>{
	if (err) {
		console.log(err)
	}else{
		console.log('Allfred.min.js done')
	}
})