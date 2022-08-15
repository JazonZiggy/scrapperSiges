var request = require('request')
var banquinho = require('./parsingJson.js')
//var bairroList = require('./FaltaBairros.js');
//var username = 'fooUsername'
//var password = 'fooPassword'

function myBairro(ramalRef)
{
	{
		var options = {
	 	url: 'http://156poa-hom.procempa.com.br/sistemas/externo/wdmae.php?ramal='+ramalRef,
	 	proxy : "http://lproxy:3128"
	  
	}

	request(options, function (err, res, body) {
	  if (err) {
	    	console.log(err)
	   	// return
	  	}
	  	console.log(body);

		});
	}
}

//myBairro(19);

module.exports.getmyzone = function (ramalRef)
{
		var options = {
	 	url: 'http://156poa-hom.procempa.com.br/sistemas/externo/wdmae.php?ramal='+ramalRef,
	 	proxy : "http://lproxy:3128"
	  
	}



	request(options, function (err, res, body) {
	  if (err) {
	    console.log(err)
	   // return
	  }
	  var startlocation = 0;
	  //console.log('headers', res.headers)
	 // console.log('status code', res.statusCode)
	  //console.log(body)
	  var text = body;
	  var bodylocation = text.indexOf("<body>");
	  var bodyendlocation = text.indexOf("</body>")
	  var enderecoslice = text.slice(bodylocation+7, bodyendlocation);
	 // console.log(enderecoslice)
	  var consertonumero = 0;
	  var textToUser = "";
	  //console.log(enderecoslice.includes("<br>"), startlocation )
	  while (enderecoslice.includes("<br>",  startlocation))
	  {
	  	var barlocation
	  	console.log("OLA");
	  	var logtipo = enderecoslice.slice(startlocation, enderecoslice.indexOf('/', startlocation));
	  	barlocation = enderecoslice.indexOf('/', startlocation);
	  	console.log(logtipo);
	  	var log = enderecoslice.slice(enderecoslice.indexOf('/', barlocation)+1, enderecoslice.indexOf('/', barlocation+1));
	  	barlocation = enderecoslice.indexOf('/', barlocation+1);
	  	console.log(log);
	  	var lognum = enderecoslice.slice(enderecoslice.indexOf('/', barlocation)+1, enderecoslice.indexOf('/', barlocation+1));
	  	barlocation = enderecoslice.indexOf('/', barlocation+1);
	  	console.log(lognum);
	  	var bairro = enderecoslice.slice(enderecoslice.indexOf('/', barlocation)+1, enderecoslice.indexOf('/', barlocation+1));
	  	barlocation = enderecoslice.indexOf('/', barlocation+1);
	  	console.log(bairro);
	  	var situac = enderecoslice.slice(enderecoslice.indexOf('/', barlocation)+1, enderecoslice.indexOf('<br>', barlocation));
	  	console.log(situac);
	  	//barlocation = enderecoslice.indexOf('/', barlocation+1);
	  	startlocation = enderecoslice.indexOf("<br>", startlocation)+4;
	  	console.log(startlocation);
	  	consertonumero = consertonumero+1;
	  	console.log(consertonumero);
	  	textToUser = textToUser+"Bairro afetado: "+bairro+"\nLocal do Conserto: "+logtipo+". "+log+", "+lognum+"\n"+/*"Bairro desabastecido: "+bairro*/"Situação do Conserto: "+situac+"\n";
	  	console.log(textToUser);

	  }
	  


	  
	//  var logradouro = 
	  //banquinho.setarbairro(ramalRef, textToUser);
	})
}

