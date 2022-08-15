//const express = require ('express');
const request = require('request');
//const app = express();
const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const replaceAll = require('replaceall');
const correctSiges = require('./sigesFinProblems');

//Bairros, situações e endereços
var bairrosList: any[] = [];
var enderecoList: any[] = [];
var sitList: any[] = [];
var arrLenght: number;
var numeroEnd: any[] = [];
//var bairroList = [];

var jsonraw = fs.readFileSync('Bairros.JSON');
var jsonBairros = JSON.parse(jsonraw);
var headersRef =
{
	'Content-Type': 'text/html; charset=ISO-8859-1'
}

var options = {
	uri: 'http://siges.procempa.com.br/dmae/intranet/paradas_operacionais/porealpesqqry.php',
	proxy: 'http://proxy3.pmpa.ad:3128/',
	//url :'https://www.google.com',
	encoding: 'latin1',
	//method : 'POST',
	//headersRef : headersRef,
	transform: function (body: any) {
		return cheerio.load(body);
	}
	//form:{'chave': 'br.com.procempa.sca.persistencia.ContaDOPK@1a8c30f[codigoUsuario=15,anoConta=119,numeroConta=159851859]', 'situacao':'1'}
}
//Tempo para atualização dos bairros no SIGES em minutos, Um minuto no caso
var minutes = 0.5, the_interval = minutes * 60 * 1000;

setInterval(function () {
	//console.log("Isso é um teste!")
	var bairrosRef: any[] = [];
	var enderecoRef: any[] = [];
	var sitReflist: any[] = [];
	var arrLenghtRef = -1;
	var numeroEndRef: any[] = [];

	rp(options)
		.then(($: { text: () => any; }) => {
			sigesFin = correctSiges.passtheTxt($.text());
			

			//console.log(sigesFin);

			var sit1 = "EXECUÇAO";
			var sit2 = "PENDENTE";
			var sit3 = "AUTORIZADA";


			//var words = textclean.split("");
			//var newwords = words.toString().split("\n");
			//var newwords2 = newwords.toString().split("\t");
			//var newwords3 = newwords2.toString().replace("" , "T");
			//console.log(newwords3);
			//console.log(sigesFin)
			//	console.log(typeof newwords);
			//console.log(typeof newwords2);

			//words = textclean.split("\t");
			//console.log(newwords2);
			jsonBairros.forEach(function (word: any) {
				var startcountdown = 0;
				//console.log(sigesFin)
				while (sigesFin.indexOf(word, startcountdown) >= 0) {
					var wordLocation = sigesFin.indexOf(word, startcountdown);
					startcountdown = wordLocation + 1;
					//console.log("LOOPS INFINITOS, CUIDADO")
					var dmaeLocation = sigesFin.lastIndexOf(dmaeString, wordLocation);
					console.log(wordLocation);
					console.log(word);
					var dotLocation = sigesFin.indexOf('.', dmaeLocation);
					console.log(dmaeLocation)
					var blankLocation = sigesFin.lastIndexOf(' ', dotLocation);
					console.log(dotLocation);
					console.log(blankLocation);


					var difference = dotLocation - blankLocation;
					var situacaoLocation1 = sigesFin.indexOf(sit1, dmaeLocation) - dmaeLocation;
					var situacaoLocation2 = sigesFin.indexOf(sit2, dmaeLocation) - dmaeLocation;
					var situacaoLocation3 = sigesFin.indexOf(sit3, dmaeLocation) - dmaeLocation;
					var sitRef = 0;
					var hifenlocation = sigesFin.lastIndexOf(".", wordLocation);
					var differencehifen = wordLocation - hifenlocation;
					console.log(differencehifen)
					var strEndereco = sigesFin.slice(dotLocation - difference, sigesFin.indexOf(',', dotLocation - difference));
					console.log(difference);
					//var checkDistance = wordLocation-dmaeLocation;

					if (difference >= 10 || differencehifen <= strEndereco.length) {
						console.log("Nao faz nada")

					} else {

						console.log(strEndereco);
						var numeroEndereço = sigesFin.slice(sigesFin.indexOf(',', dotLocation - difference) + 1, sigesFin.indexOf("-", sigesFin.indexOf(',', dotLocation - difference)))
						//console.log(strEndereco);
						//console.log(numeroEndereço);
						// Checando a situação do serviço
						if (situacaoLocation1 >= 0) {
							if (situacaoLocation2 >= 0) {
								if (situacaoLocation1 <= situacaoLocation2) {
									//console.log("Serviço em execução");
									sitRef = 1;
								} else {
									//console.log ("Serviço concluido em fase de normalização");
									sitRef = 2;
								}
							} else {
								//console.log ("Serviço em execução");
								sitRef = 1;
							}
						} else {
							if (situacaoLocation2 >= 0) {
								//console.log ("Serviço concluido em fase de normalização");
								sitRef = 2;
							} else {
								//console.log ("Serviço programado para execução nos próximos dias");
								sitRef = 3;
							}
						}

						var lowerRef = word;
						if (enderecoRef.indexOf(strEndereco) >= 0) {
							//possui string
							if (bairrosRef[enderecoRef.indexOf(strEndereco)].indexOf(word) < 0) {
								bairrosRef[enderecoRef.indexOf(strEndereco)] = bairrosRef[enderecoRef.indexOf(strEndereco)] + ', ' + lowerRef.charAt(0).toUpperCase() + lowerRef.substring(1);
							}


						} else {


							enderecoRef.push(strEndereco);
							numeroEndRef.push(numeroEndereço);


							bairrosRef.push(word);
							sitReflist.push(sitRef);
							arrLenghtRef = arrLenghtRef + 1;



						}
					}


				}
			})
			bairrosList = bairrosRef;
			enderecoList = enderecoRef;
			sitList = sitReflist;
			arrLenght = arrLenghtRef;
			numeroEnd = numeroEndRef;

		})
		.catch((err: any) => {
			console.log(err);
		});
}, the_interval);


module.exports.getbairros = function () {
	return bairrosList;
	console.log(bairrosList);
}

module.exports.getenderecos = function () {
	return enderecoList;
	console.log(enderecoList);
}

module.exports.getsituacao = function () {
	return sitList;
	console.log(sitList);
}

module.exports.getlenght = function () {
	return arrLenght;
	console.log(arrLenght);
}

module.exports.getnumeros = function () {
	return numeroEnd;
}
