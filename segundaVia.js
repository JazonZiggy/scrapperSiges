//const express = require ('express');
const request = require ('request');
//const app = express();
const rp = require ('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const replaceAll = require('replaceall');
const pdftotext = require('pdf-to-text');
const pdf = require('pdf-parse');

const banquinho = require('./parsingJson.js');
var sessions = './session.JSON';

//var jsonsessions = JSON.parse(jsonraw);
var headersRef =
{
	'Content-Type': 'text/html; charset=ISO-8859-1'
}


module.exports.segundaViaRamal = function(ramalref, sessionref)
{
	//Informações para eu localizar o link da segunda via
	var codigoBarrasRef;
	var options = {
	uri :'https://scainternet.procempa.com.br/scainternet/contaPesquisa.do',
	proxy :'http://lproxy:3128/',
	//url :'https://www.google.com',
	method : 'POST',
	form: {'servico':'segundaVia','criterioIdentificacaoRamal':''+ramalref},
	//headersRef : headersRef,
	transform: function(body){
		return cheerio.load(body);
	}

	//form:{'chave': 'br.com.procempa.sca.persistencia.ContaDOPK@1a8c30f[codigoUsuario=15,anoConta=119,numeroConta=159851859]', 'situacao':'1'}
}

rp(options)
.then(($) => {
	var textRef = $.html();
	//console.log(textRef);

	var ultimoEmAbertoRef = textRef.lastIndexOf('Em aberto');
	//console.log(ultimoEmAbertoRef)
	var ultimoConta = textRef.lastIndexOf('conta',ultimoEmAbertoRef);
	//console.log(ultimoConta);
	var href = textRef.lastIndexOf('href',ultimoConta);
	//console.log(href);
	var sitRef = textRef.lastIndexOf("situacao", ultimoConta);
	var linkVia = textRef.slice(href+6,sitRef+10);
	//console.log(linkVia);
	//Ler PDF
	if (ultimoEmAbertoRef>=0)
	{
		segundaViaassync(ramalref, linkVia, sessionref);
	}
	
});



//Ler segunda Via

function segundaViaassync (ramalref, link, sessionref)
{
//var vencidaRetorno = 0;
var link = ("https://scainternet.procempa.com.br/scainternet/"+link)
var textRef;

request.get(link, {
	/*form: {
		servico: 'segundaVia',
		criterioIdentificacaoRamal: ramalref
	},*/
	headers: {
		'Content-Type':'application/pdf'
	},
	proxy: 'http://lproxy:3128/',
	encoding: null

}, (error, res, body) => {
	if (error){
		console.error(error)
		//return
	}
	//console.log('statusCode: ${res.statusCode}')
	fs.writeFile(ramalref +"SegundaVia.pdf", body, {
		encoding: 'binary'
	}, (err) => {
		if (err) throw err;

		console.log("Cheguei até aqui, salvei o arquivo com código de barras");
		let dataBuffer;
		fs.readFile(ramalref +'SegundaVia.pdf', function read(err,data){
			if (err){
				throw err;
			}
			dataBuffer = data;
			pdf(dataBuffer).then(function(data)
			{
				//console.log(data.text);
		textRef = data.text.toString();
		if (textRef.includes('Emitido em'))
		{

			//Codigo de Barras
			var emitidoLocation = textRef.indexOf('Emitido em');
			var mecanLocation = textRef.lastIndexOf('MECÂNICA', emitidoLocation);
			var codigoBarras = textRef.slice(mecanLocation+8, emitidoLocation);

			//Data de Vencimento
			var dataVencimentoLocation = textRef.lastIndexOf('Data de Vencimento');
			var rsLocation = textRef.indexOf('R$', dataVencimentoLocation);
			var dataVencimento = textRef.slice(dataVencimentoLocation+19, rsLocation);
			// Valor
			var valorLocation = textRef.indexOf('Valor', rsLocation);
			var valorTotal = textRef.slice(rsLocation, valorLocation);

			console.log(dataVencimento);
			//console.log(codigoBarras);

			//codigoBarrasRef = codigoBarras;
			banquinho.setarcodigobarras(ramalref, codigoBarras, dataVencimento, valorTotal, sessionref);
		}

			
			})
			.catch(function(error){
				console.log(error);
			})
			fs.unlink(ramalref +'SegundaVia.pdf', function(err){
				if(err) throw err;
				console.log('File Deleted');
				})
			});
		});
	});
}
		


	


function segundaVia (ramalref, link)
{
//var vencidaRetorno = 0;
var link = ("http://scainternet.procempa.com.br/scainternet/"+link)
var textRef;

request.get(link, {
	/*form: {
		servico: 'segundaVia',
		criterioIdentificacaoRamal: ramalref
	},*/
	headers: {
		'Content-Type':'application/pdf'
	},
	proxy: 'http://proxy3.pmpa.ad:3128/',
	encoding: null

}, (error, res, body) => {
	if (error){
		console.error(error)
		//return
	}
	//console.log('statusCode: ${res.statusCode}')
	fs.writeFileSync(ramalref +"SegundaVia.pdf", body, {
		encoding: 'binary'
	});
	
	let dataBuffer = fs.readFileSync(ramalref +'SegundaVia.pdf')
	pdf(dataBuffer).then(function(data)
	{
		//console.log(data.text);
		textRef = data.text.toString();
		if (textRef.includes('Emitido em'))
		{

			//Codigo de Barras
			var emitidoLocation = textRef.indexOf('Emitido em');
			var mecanLocation = textRef.lastIndexOf('MECÂNICA', emitidoLocation);
			var codigoBarras = textRef.slice(mecanLocation+8, emitidoLocation);

			//Data de Vencimento
			var dataVencimentoLocation = textRef.lastIndexOf('Data de Vencimento');
			var rsLocation = textRef.indexOf('R$', dataVencimentoLocation);
			var dataVencimento = textRef.slice(dataVencimentoLocation+19, rsLocation);
			// Valor
			var valorLocation = textRef.indexOf('Valor', rsLocation);
			var valorTotal = textRef.slice(rsLocation, valorLocation);

			console.log(dataVencimento);
			//console.log(codigoBarras);

			//codigoBarrasRef = codigoBarras;
			banquinho.setarcodigobarras(ramalref, codigoBarras, dataVencimento, valorTotal);
		}

			
	})
	.catch(function(error){
		console.log(error);
	})
	fs.unlink(ramalref +'SegundaVia.pdf', function(err)
	{
		if(err) throw err;
		console.log('File Deleted');
	})


});
	//return vencidaRetorno;
	//console.log(vencidaRetorno);
}

}
