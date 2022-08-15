const merge = require ('merge-images-v2')
const Canvas = require('canvas')
const fs = require('fs')




console.log("Leu o modulo!")

var imgloc1 = ('/Images/body.png')
var imgloc2 = ('/Images/eyes.png')
var imgloc3 = ('/Images/mouth.png')

merge(['./Images/quadras.png', './Images/Redes.png', './Images/Situacao.png'], {
  Canvas: Canvas
})
  .then(b64 => {
  	console.log("Teste");
  	var b64new = b64.replace(/^data:image\/png;base64,/, "");

  	fs.writeFile("out.png", b64new, 'base64', function(err) {
  		if (err)
  		{
  			console.log(err);
  		} else {
  			console.log("Salvo imagem TO TAO FELIZ!")
  		}
  		
	});
  })
