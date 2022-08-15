const express = require ('express');
const request = require ('request');
const app = express();
const rp = require ('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const replaceAll = require('replaceall');
const pdftotext = require('pdf-to-text');
const pdf = require('pdf-parse');

const cdl = require('./cdlfinder.js');
const banquinho = require('./parsingJson.js');
var sessions = './session.JSON';
var testbairro = require('./meuBairro.js');

//var jsonsessions = JSON.parse(jsonraw);
var headersRef =
{
	'Content-Type': 'text/html; charset=ISO-8859-1'
}

var textRef;

var options = {
	uri :'https://scainternet.procempa.com.br/scainternet/lancamentoPrint.do',
	proxy :'http://lproxy:3128/',
	//proxy :'http://proxy3.pmpa.ad:3128/',
	//url :'https://www.google.com',
	method : 'POST',
	headers: {
      //'X-TOKEN': authToken,
      'Content-type': 'application/pdf'
    	}
    //form: {
    //	servico: segunda,
    //	ramal: 19
    //}
	//headersRef : headersRef,
	//transform: function(body){
		//return cheerio.load(body);
//	}
	//form:{'chave': 'br.com.procempa.sca.persistencia.ContaDOPK@1a8c30f[codigoUsuario=15,anoConta=119,numeroConta=159851859]', 'situacao':'1'}
}

module.exports.dividaramalassync = function(ramalref, session)
{
//var vencidaRetorno = 0;

request.post('https://scainternet.procempa.com.br/scainternet/lancamentoPrint.do', {
	form: {
		servico: 'segundaVia',
		criterioIdentificacaoRamal: ramalref
	},
	headers: {
		'Content-Type':'application/pdf'
	},
	proxy: 'http://lproxy:3128/',
	encoding: null

}, (error, res, body) => {
	if (error){
		console.error(error)
		//return
	} else 
	{
		fs.writeFile(ramalref +".pdf", body, {
		encoding: 'binary'
	}, (err) => {
		if (err) throw err;

		//success, Leia o arquivo e faz que ta aqui embaixo
		console.log("Funcionou e salvou o arquivo, agora quero ler ele por favor!");
		lerarquivoporfavor(ramalref,session);


	});
	}
	//console.log('statusCode: ${res.statusCode}')
	//Lendo Synchronous, vou trocar para Asynchronous e comentar
	
});

}

function lerarquivoporfavor(ramalref2, session2)
{
	let dataBuffer;
	fs.readFile(ramalref2 +'.pdf', function read(err,data){
		if (err) {
			throw err;
		}
		dataBuffer = data
		pdf(dataBuffer).then(function(data)
		{
		console.log(dataBuffer);
		textRef = data.text.toString();
			if (textRef.includes('GERAL')) 
			{
			var wordLocation = textRef.lastIndexOf('GERAL')
			var nominalLocation = textRef.indexOf('Nominal', wordLocation);
			var commaLocation = textRef.indexOf(',', wordLocation);
			// Informações sobre o array para o while e posição de inicio
			var allIndex = [];
			var startIndex = 0;
			// Localizar Situação e Prefeitura
			var sitLocation = textRef.indexOf('Situação');
			var prefLocation = textRef.indexOf('Prefeitura', sitLocation);
			//Localizar Endereço e Numero 
			var grupoLocation = textRef.indexOf('Grupo');
			var enderecoLocation = textRef.indexOf('Endereço');
			//Rua acima, numero abaixo
			var subnumLocation = textRef.indexOf('Sub-num');
			var predioLocation = textRef.indexOf('Prédio');

			//console.log(textRef)


			//Variaveis que vão ser passadas para banquinho depois
			var situacaoRamal = textRef.slice(sitLocation+9, prefLocation-1);
			var vencidaTotal = textRef.slice(wordLocation+6, commaLocation+3);
			var avencerTotal = textRef.slice(commaLocation+3, nominalLocation-1);
			var enderecoRamal = textRef.slice(grupoLocation+6, enderecoLocation-1);
			enderecoRamal = enderecoRamal.replace(" ", ". ");
			//console.log(enderecoRamal);
			var numeroRamal = textRef.slice(subnumLocation+8, predioLocation-1);
			//var bairroRamal = testbairro.getmyzone(ramalref2);
			var competenciaslenght = [];
			//console.log(numeroRamal);
			//var bairroRamal = cdl.cdlfinder(enderecoRamal,numeroRamal,ramalref);
			//console.log("A situação atual deste ramal é: " +situacaoRamal);
			//Esse While vai localizar os lançamentos vencidos e atualizar o index para procurar novos
			//Preciso achar Competência, tipo lançamento, Agua/Serviços, Esgoto, Correção, Juros, Multa como um objeto só
			//console.log(textRef.includes('vencido',startIndex));
			while (textRef.includes('vencido', startIndex))
			{
				//Localização de vencido e depois salva o splice da situação data
				//Locations Variaveis
				var vencidoLocation = textRef.indexOf('vencido', startIndex);
				var aguacommaLocation = textRef.lastIndexOf(',', vencidoLocation);
				var multacommaLocation = textRef.lastIndexOf(',', aguacommaLocation-1);
				var juroscommaLocation = textRef.lastIndexOf(',', multacommaLocation-1);
				var correcaocommaLocation = textRef.lastIndexOf(',', juroscommaLocation-1);
				var esgotocommaLocation = textRef.lastIndexOf(',', correcaocommaLocation-1);
				var compbarLocation = textRef.lastIndexOf('/', esgotocommaLocation-1);
				var spaceLocation = textRef.lastIndexOf('\n', compbarLocation-1);
				var nextspace = textRef.indexOf(' ', aguacommaLocation+3);
				//console.log(spaceLocation);
				//console.log ("VIRGULAS POSITIONS:" +aguacommaLocation )
				//console.log (multacommaLocation);
				//Dados Variaveis
				var tipoLanc;
				var situacaoData = textRef.slice(vencidoLocation+7, vencidoLocation+17)
				if (nextspace>=vencidoLocation)
				{
					tipoLanc = textRef.slice(aguacommaLocation+3, vencidoLocation);
				} else
				{
					tipoLanc = textRef.slice(aguacommaLocation+3, nextspace);
				}
				
				var aguaValue = textRef.slice(multacommaLocation+3, aguacommaLocation+3);
				var multaValue = textRef.slice(juroscommaLocation+4, multacommaLocation+3);
				var jurosValue = textRef.slice(correcaocommaLocation+3, juroscommaLocation+3);
				var correcaoValue = textRef.slice(esgotocommaLocation+3, correcaocommaLocation+3);
				var esgotoValue = textRef.slice(compbarLocation+4, esgotocommaLocation+3);
				var competenciaValue = textRef.slice(spaceLocation+1, spaceLocation+7);
				console.log(tipoLanc);
				console.log(competenciaValue);
				if (competenciaslenght.includes(competenciaValue))
				{
					console.log("Do nothing")
					console.log(competenciaslenght.length);
				}else {
					console.log("Adiciona no array")
					competenciaslenght.push(competenciaValue);
					console.log(competenciaslenght.length);
				}

 
				//console.log("Posição do vencido é:" +startIndex);
				//console.log("A data da situação é:" +situacaoData);
				//console.log("O tipo do lançamento é:" +tipoLanc);
				startIndex = vencidoLocation+1;
				allIndex.push({"competencia": ""+competenciaValue,"datasit": "" +situacaoData,"tipo": ""+tipoLanc, "aguaserv": ""+aguaValue, "esgoto": ""+esgotoValue,"correcao": ""+correcaoValue, "juros": ""+jurosValue,"multa": ""+multaValue})
				//console.log("Aqui está as informações de competências")
				//console.log(allIndex.competencia);				
				//console.log(typeof allIndex);
			}
			/*console.log(textRef.indexOf('vencido'));
			var teste1 = textRef.indexOf('vencido');
			console.log(textRef.indexOf('vencido', teste1+1));
			teste1 = textRef.indexOf('vencido', teste1+1);
			console.log(textRef.includes('vencido', teste1+1));*/



			//console.log ("Valor Total Vencido: R$ " +vencidaTotal);
			//console.log ("Valor Total a Vencer: R$: " +avencerTotal);
			banquinho.pushingRamal(session2, ramalref2, vencidaTotal, avencerTotal, situacaoRamal, competenciaslenght.length, allIndex, enderecoRamal, numeroRamal, '');
			console.log('LE TODAS INFORMAÇÕES NA NEGATIVA DE DEBITOS');

			//parse_obj["sessions"].push({"sessionID":""+session,"ramal": ""+ramalref, "dividavencida":""+vencidaTotal, "dividavencer":""+avencerTotal});
			
			}	
	})
	.catch(function(error){
		console.log("Ramal invalido");
	})
	//return vencidaTotal;
	fs.unlink(ramalref2 +'.pdf', function(err)
	{
		if(err) throw err;
		testbairro.getmyzone(ramalref2);
		console.log('File Deleted');
	})
	})
	
}



module.exports.dividaramal = function(ramalref, session)
{
//var vencidaRetorno = 0;

request.post('http://scainternet.procempa.com.br/scainternet/lancamentoPrint.do', {
	form: {
		servico: 'segundaVia',
		criterioIdentificacaoRamal: ramalref
	},
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
	//Lendo Synchronous, vou trocar para Asynchronous e comentar
	fs.writeFileSync(ramalref +".pdf", body, {
		encoding: 'binary'
	});


	
	let dataBuffer = fs.readFileSync(ramalref +'.pdf')
	pdf(dataBuffer).then(function(data)
	{
		//console.log(data.text);
		textRef = data.text.toString();
			if (textRef.includes('GERAL')) 
			{
			var wordLocation = textRef.lastIndexOf('GERAL')
			var nominalLocation = textRef.indexOf('Nominal', wordLocation);
			var commaLocation = textRef.indexOf(',', wordLocation);
			// Informações sobre o array para o while e posição de inicio
			var allIndex = [];
			var startIndex = 0;
			// Localizar Situação e Prefeitura
			var sitLocation = textRef.indexOf('Situação');
			var prefLocation = textRef.indexOf('Prefeitura', sitLocation);
			//Localizar Endereço e Numero 
			var grupoLocation = textRef.indexOf('Grupo');
			var enderecoLocation = textRef.indexOf('Endereço');
			//Rua acima, numero abaixo
			var subnumLocation = textRef.indexOf('Sub-num');
			var predioLocation = textRef.indexOf('Prédio');




			//Variaveis que vão ser passadas para banquinho depois
			var situacaoRamal = textRef.slice(sitLocation+9, prefLocation-1);
			var vencidaTotal = textRef.slice(wordLocation+6, commaLocation+3);
			var avencerTotal = textRef.slice(commaLocation+3, nominalLocation-1);
			var enderecoRamal = textRef.slice(grupoLocation+6, enderecoLocation-1);
			enderecoRamal = enderecoRamal.replace(" ", ". ");
			//console.log(enderecoRamal);
			var numeroRamal = textRef.slice(subnumLocation+8, predioLocation-1);
			var competenciaslenght = [];
			//console.log(numeroRamal);
			//var bairroRamal = cdl.cdlfinder(enderecoRamal,numeroRamal,ramalref);
			//console.log("A situação atual deste ramal é: " +situacaoRamal);
			//Esse While vai localizar os lançamentos vencidos e atualizar o index para procurar novos
			//Preciso achar Competência, tipo lançamento, Agua/Serviços, Esgoto, Correção, Juros, Multa como um objeto só
			//console.log(textRef.includes('vencido',startIndex));
			while (textRef.includes('vencido', startIndex))
			{
				//Localização de vencido e depois salva o splice da situação data
				//Locations Variaveis
				var vencidoLocation = textRef.indexOf('vencido', startIndex);
				var aguacommaLocation = textRef.lastIndexOf(',', vencidoLocation);
				var multacommaLocation = textRef.lastIndexOf(',', aguacommaLocation-1);
				var juroscommaLocation = textRef.lastIndexOf(',', multacommaLocation-1);
				var correcaocommaLocation = textRef.lastIndexOf(',', juroscommaLocation-1);
				var esgotocommaLocation = textRef.lastIndexOf(',', correcaocommaLocation-1);
				var compbarLocation = textRef.lastIndexOf('/', esgotocommaLocation-1);
				var spaceLocation = textRef.lastIndexOf('\n', compbarLocation-1);
				//console.log(spaceLocation);
				//console.log ("VIRGULAS POSITIONS:" +aguacommaLocation )
				//console.log (multacommaLocation);
				//Dados Variaveis
				var situacaoData = textRef.slice(vencidoLocation+7, vencidoLocation+17)
				var tipoLanc = textRef.slice(aguacommaLocation+3, vencidoLocation);
				var aguaValue = textRef.slice(multacommaLocation+3, aguacommaLocation+3);
				var multaValue = textRef.slice(juroscommaLocation+4, multacommaLocation+3);
				var jurosValue = textRef.slice(correcaocommaLocation+3, juroscommaLocation+3);
				var correcaoValue = textRef.slice(esgotocommaLocation+3, correcaocommaLocation+3);
				var esgotoValue = textRef.slice(compbarLocation+3, esgotocommaLocation+3);
				var competenciaValue = textRef.slice(spaceLocation+1, spaceLocation+7);
				console.log(competenciaValue);
				if (competenciaslenght.includes(competenciaValue))
				{
					console.log("Do nothing")
					console.log(competenciaslenght.length);
				}else {
					console.log("Adiciona no array")
					competenciaslenght.push(competenciaValue);
					console.log(competenciaslenght.length);
				}

 
				//console.log("Posição do vencido é:" +startIndex);
				//console.log("A data da situação é:" +situacaoData);
				//console.log("O tipo do lançamento é:" +tipoLanc);
				startIndex = vencidoLocation+1;
				allIndex.push({"competencia": ""+competenciaValue,"datasit": "" +situacaoData,"tipo": ""+tipoLanc, "aguaserv": ""+aguaValue, "esgoto": ""+esgotoValue,"correcao": ""+correcaoValue, "juros": ""+jurosValue,"multa": ""+multaValue})
				//console.log("Aqui está as informações de competências")
				//console.log(allIndex.competencia);				
				//console.log(typeof allIndex);
			}
			/*console.log(textRef.indexOf('vencido'));
			var teste1 = textRef.indexOf('vencido');
			console.log(textRef.indexOf('vencido', teste1+1));
			teste1 = textRef.indexOf('vencido', teste1+1);
			console.log(textRef.includes('vencido', teste1+1));*/



			//console.log ("Valor Total Vencido: R$ " +vencidaTotal);
			//console.log ("Valor Total a Vencer: R$: " +avencerTotal);
			banquinho.pushingRamal(session, ramalref, vencidaTotal, avencerTotal, situacaoRamal, competenciaslenght.length, allIndex, enderecoRamal, numeroRamal, '');
			

			//parse_obj["sessions"].push({"sessionID":""+session,"ramal": ""+ramalref, "dividavencida":""+vencidaTotal, "dividavencer":""+avencerTotal});
			
			}	
	})
	.catch(function(error){
		console.log(error);
	})
	//return vencidaTotal;
	fs.unlink(ramalref +'.pdf', function(err)
	{
		if(err) throw err;
		console.log('File Deleted');
	})
	


	//console.log(res);
});
	//return vencidaRetorno;
	//console.log(vencidaRetorno);
}

module.exports.getvencidaTotal = function(ramal)
{
	banquinho.searchRamal(ramal);
}



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
