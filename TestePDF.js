const express = require ('express');
const request = require ('request');
const app = express();
const rp = require ('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const replaceAll = require('replaceall');
const pdftotext = require('pdf-to-text');
const pdf = require('pdf-parse');

var jsonraw = fs.readFileSync('Bairros.JSON');
var jsonBairros = JSON.parse(jsonraw);
var headersRef =
{
	'Content-Type': 'text/html; charset=ISO-8859-1'
}

var textRef;


var options = {
	uri :'http://scainternet.procempa.com.br/scainternet/lancamentoPrint.do',
	proxy :'http://proxy.procempa.com.br:3128',
	//url :'https://www.google.com',
	method : 'POST',
	headers: {
      //'X-TOKEN': authToken,
      'Content-type': 'application/pdf'
    }
}

request.post('http://scainternet.procempa.com.br/scainternet/lancamentoPrint.do', {
	form: {
		servico: 'segundaVia',
		criterioIdentificacaoRamal: 19
	},
	headers: {
		'Content-Type':'application/pdf'
	},
	proxy: 'http://proxy.procempa.com.br:3128',
	encoding: null

}, (error, res, body) => {
	if (error){
		console.error(error)
		return
	}
	console.log('statusCode: ${res.statusCode}')
	fs.writeFileSync("10111.pdf", body, {
		encoding: 'binary'
	});
	
	let dataBuffer = fs.readFileSync('10111.pdf')
	pdf(dataBuffer).then(function(data)
	{
		console.log(data.text);
		textRef = data.text.toString();
		console.log(textRef);
			if (textRef.includes('GERAL')) 
		{
			var wordLocation = textRef.lastIndexOf('GERAL')
			var nominalLocation = textRef.indexOf('Nominal', wordLocation);
			var commaLocation = textRef.indexOf(',', wordLocation);

			var vencidaTotal = textRef.slice(wordLocation+6, commaLocation+3);
			var avencerTotal = textRef.slice(commaLocation+2, nominalLocation);

			console.log ("Valor Total Vencido: R$ " +vencidaTotal);
			console.log ("Valor Total a Vencer: R$: " +avencerTotal);
		}
	})
	.catch(function(error){
		console.log(error);
	})

	


	//console.log(res);
});




//const replace = require('replace');

/*
var headersRef =
{
	'Content-Type': 'application/x-www-form-urlencoded'	
}


var options ={
	url: 'http://scainternet.procempa.com.br/scainternet/contaIntranetPesquisa.do',
	method: 'POST',
	headers: headersRef,
	form:{'servico':'segundaVia', 'criterioIdentificacaoRamal': '19'}

}

request(options, function(error, response, body){
	if(!error && response.statusCode == 200)
	{
		console.log(body);
	}
})
*/
