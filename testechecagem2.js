const express = require ('express');
const request = require ('request');
const app = express();
const rp = require ('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const replaceAll = require('replaceall');
const pdftotext = require('pdf-to-text');
const pdf = require('pdf-parse');
const readXlsxFile = require('read-excel-file/node');
const mestonum = require('./mestonumber.js')
var tgmail = require('./triggermail.js'); 

var text = "";
//const cdl = require('./cdlfinder.js');
//const banquinho = require('./parsingJson.js');
var linha = 1;
var limite;

module.exports.ler = function ()
{
	excelread();
}

//excelread();


function excelread()
{
	readXlsxFile('Clubes.xlsx').then((rows) => {
  // `rows` is an array of rows
  	console.log(rows.length)
  	limite = rows.length;


  	/*for (var i=1; i<rows.length; i++)
  	{
  		console.log(rows[i][0]);
  		dividaramal(rows[i][0], i, rows.length);
  		
  	}*/

  	dividaramal(rows[linha][0], linha, rows);
  //	console.log(1049259);
  	//dividaramal(45829);

  	
  		
})
}

function dividaramal(ramalref, index, rows)
{
//var vencidaRetorno = 0;

linha = linha+1;

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
		console.log(body)
		//text = text+'\nerror';
		//return
		console.log("ERRROOOOOOOO")


	}

	fs.writeFile(ramalref +".pdf", body, {
		encoding: 'binary'
	}, (err) => {
		if (err) 
		{
			console.log(err);
		}

		//success, Leia o arquivo e faz que ta aqui embaixo
		console.log("Funcionou e salvou o arquivo, agora quero ler ele por favor!");
		lerarquivoporfavor(ramalref, index, rows);


	});
	//console.log('statusCode: ${res.statusCode}')

	/*fs.writeFileSync(ramalref +".pdf", body, {
		encoding: 'binary'
	});
	
		//success, Leia o arquivo e faz que ta aqui embaixo
		console.log("Funcionou e salvou o arquivo, agora quero ler ele por favor!");
		lerarquivoporfavor(ramalref, index, rows);

*/


	});
}



function lerarquivoporfavor(ramalref2, index2, rows2)
{

		let dataBuffer = fs.readFileSync(ramalref2 +'.pdf')
		pdf(dataBuffer).then(function(data)
		{

		//console.log(data);
		textRef = data.text.toString();
			if (textRef.includes('GERAL')) 
			{
			var parcela = false;
			var valortotal = 0;
			var wordLocation = textRef.lastIndexOf('GERAL')
			var nominalLocation = textRef.indexOf('Nominal', wordLocation);
			var commaLocation = textRef.indexOf(',', wordLocation);
			// Informa????es sobre o array para o while e posi????o de inicio
			var allIndex = [];
			var startIndex = 0;
			// Localizar Situa????o e Prefeitura
			var sitLocation = textRef.indexOf('Situa????o');
			var prefLocation = textRef.indexOf('Prefeitura', sitLocation);
			//Localizar Endere??o e Numero 
			var grupoLocation = textRef.indexOf('Grupo');
			var enderecoLocation = textRef.indexOf('Endere??o');
			//Rua acima, numero abaixo
			var subnumLocation = textRef.indexOf('Sub-num');
			var predioLocation = textRef.indexOf('Pr??dio');
			//Localizar Grupo
			var calculoLocation = textRef.lastIndexOf('C??lculo',grupoLocation);
			//console.log(textRef)



			//Variaveis que v??o ser passadas para banquinho depois
			var situacaoRamal = textRef.slice(sitLocation+9, prefLocation-1);
			var vencidaTotal = textRef.slice(wordLocation+6, commaLocation+3);
			var avencerTotal = textRef.slice(commaLocation+3, nominalLocation-1);
			var enderecoRamal = textRef.slice(grupoLocation+6, enderecoLocation-1);
			enderecoRamal = enderecoRamal.replace(" ", ". ");
			var grupoRamal = textRef.slice(calculoLocation+8,grupoLocation-1);
			console.log(grupoRamal);
			//console.log(enderecoRamal);
			var numeroRamal = textRef.slice(subnumLocation+8, predioLocation-1);
			var competenciaslenght = [];
			var pagoref = 'pago';
			var pendencref = 'pendenci';
			var mesparcela = 0;
			var anoparcela = 0;
			var geralparcela;
			var diaRef;
			//console.log(numeroRamal);
			//var bairroRamal = cdl.cdlfinder(enderecoRamal,numeroRamal,ramalref);
			//console.log("A situa????o atual deste ramal ??: " +situacaoRamal);
			//Esse While vai localizar os lan??amentos vencidos e atualizar o index para procurar novos
			//Preciso achar Compet??ncia, tipo lan??amento, Agua/Servi??os, Esgoto, Corre????o, Juros, Multa como um objeto s??
			//console.log(textRef.includes('vencido',startIndex));
			while (textRef.includes(pagoref, startIndex))
			{
				//Localiza????o de vencido e depois salva o splice da situa????o data
				//Locations Variaveis
				var pagoLocation = textRef.indexOf('pago', startIndex);
				var aguacommaLocation = textRef.lastIndexOf(',', pagoLocation);
				var multacommaLocation = textRef.lastIndexOf(',', aguacommaLocation-1);
				var juroscommaLocation = textRef.lastIndexOf(',', multacommaLocation-1);
				var correcaocommaLocation = textRef.lastIndexOf(',', juroscommaLocation-1);
				var esgotocommaLocation = textRef.lastIndexOf(',', correcaocommaLocation-1);
				var compbarLocation = textRef.lastIndexOf('/', esgotocommaLocation-1);
				var spaceLocation = textRef.lastIndexOf('\n', compbarLocation-1);
				var nextspace = textRef.indexOf(' ', aguacommaLocation+3);
				var distancia = spaceLocation-pagoLocation;


				//console.log(spaceLocation);
				//console.log ("VIRGULAS POSITIONS:" +aguacommaLocation )
				//console.log (multacommaLocation);
				//Dados Variaveis
				var tipoLanc;
				var situacaoData = textRef.slice(pagoLocation+4, pagoLocation+14)
				//console.log(situacaoData);

				if (nextspace>=pagoLocation)
				{
					tipoLanc = textRef.slice(aguacommaLocation+3, pagoLocation);
				} else
				{
					tipoLanc = textRef.slice(aguacommaLocation+3, nextspace);
				}
				
				var aguaValue = textRef.slice(multacommaLocation+3, aguacommaLocation+3);
				var multaValue = textRef.slice(juroscommaLocation+3, multacommaLocation+3);
				var jurosValue = textRef.slice(correcaocommaLocation+3, juroscommaLocation+3);
				var correcaoValue = textRef.slice(esgotocommaLocation+3, correcaocommaLocation+3);
				var esgotoValue = textRef.slice(compbarLocation+3, esgotocommaLocation+3);
				var competenciaValue = textRef.slice(spaceLocation+1, spaceLocation+7);
				var parc = textRef.slice(spaceLocation+7, compbarLocation+3);
				var mesparc = textRef.slice(spaceLocation+7, compbarLocation);

				//Quebrando a competenciaVALUES
				var mescompetencia = competenciaValue.slice(0,3);
				var anocompetencia = competenciaValue.slice(4,6);
				//console.log(mescompetencia);
				//console.log(anocompetencia);


				//console.log(tipoLanc);
			//	console.log(competenciaValue);
				if (competenciaslenght.includes(competenciaValue))
				{
					//console.log("Do nothing")
					//console.log(competenciaslenght.length);
				}else {
					//console.log("Adiciona no array")
					competenciaslenght.push(competenciaValue);
					//console.log(competenciaslenght.length);
				}

				var aguaservRef = aguaValue.replace('.', '');
      		    aguaservRef =  parseFloat(aguaservRef.replace(',','.'));
          		var esgotoRef = esgotoValue.replace('.', '');
          		esgotoRef = parseFloat(esgotoRef.replace(',','.'));
          		var correcaoRef = correcaoValue.replace('.', '');
          		correcaoRef =  parseFloat(correcaoRef.replace(',','.'));
          		var jurosRef = jurosValue.replace('.', '');
          		jurosRef = parseFloat(jurosRef.replace(',','.'));
          		var multaRef = multaValue.replace('.','');
          		multaRef = parseFloat(multaRef.replace(',','.'));



          		var totalRef;

          		if (tipoLanc=='multa')
          		{
          			totalRef = multaRef;
          		} else 
          		{
          			totalRef = aguaservRef+esgotoRef+correcaoRef+jurosRef+multaRef;
          		}

          		//console.log("A data da situa????o "+situacaoData);
          		var dia = parseFloat(situacaoData.slice(situacaoData.indexOf('/')-2, situacaoData.indexOf('/')));
          		//console.log("O dia que foi pago ?? "+dia);
          		var mes = parseFloat(situacaoData.slice(situacaoData.indexOf('/')+1, situacaoData.indexOf('/')+3));
          		//console.log("O m??s que foi pago ?? "+mes);
          		var ano = parseFloat(situacaoData.slice(situacaoData.indexOf('/')+4, situacaoData.indexOf('/')+8));
          		//console.log("O ano que foi pago ?? "+ano);
          		var grupoRef = parseFloat(grupoRamal);
          		//console.log(competenciaValue);

          		var mescompetenciaRevisado = mestonum.checkcomp(mescompetencia);

          		//distancia tambem
          		//Adicionei meses a mais para nao serem checados pois a cobran??a n??o ocorre desde de Abril
          		if (competenciaValue== 'Out/21' || competenciaValue == '0,000,' || distancia <=-65 ||  anocompetencia<anoparcela || (mescompetenciaRevisado<mesparcela && anocompetencia==anoparcela ))
          		{
          			//console.log("N??o checar");
          			/*if (anocompetencia==anoparcela && mescompetenciaRevisado<mesparcela)
          			{
          				console.log("ano igual")
          			}*/
          	
          		}else

          		{
          			if (ano ==2021)
          			{
          			//console.log("Ano ?? 2019");
          				if (mes>=10)
          				{
          				//console.log ("M??s ?? 8 ou 9, isso tem que ser variavel depois com o m??s atual");
          					if (mes ==11 && ano == 2021)
          					{
          					//valortotal = valortotal+totalRef;
          					/*console.log(aguaservRef);
          					console.log(esgotoRef);
          					console.log(correcaoRef);
          					console.log(jurosRef);
          					console.log(multaRef);
          					console.log(distancia);
          					console.log(competenciaValue);*/
          					console.log("Pago em 2021");
          					} else if(dia>=1)
          					{
          						if (competenciaValue== 'Set/21')
          						{
          							if (dia>grupoRef+9)
          							{
          								valortotal = valortotal+totalRef;
          								if (diaRef== undefined || dia>diaRef)
          								{
          									diaRef = dia;
          								}
          								
			          					/*console.log(aguaservRef);
			          					console.log(esgotoRef);
			          					console.log(correcaoRef);
			          					console.log(jurosRef);
			          					console.log(multaRef);
			          					console.log(distancia);
			          					console.log(competenciaValue);
			          					console.log(tipoLanc);
			          					console.log(parc)
			          					console.log(mesparc)*/
			          					if (parc == "")
			          					{
			          						//console.log("N??o h?? parcela")
			          					} else {
			          						//console.log("H?? parcela")
			          						//console.log(parcela)
			          						if (!parcela)
			          						{
			          							//console.log ("Primeira parcela localizada")
			          							parcela = true;
			          							geralparcela = mestonum.returnlimit(mescompetenciaRevisado, anocompetencia, mesparc)
			          							mesparcela = geralparcela.slice(0,geralparcela.indexOf('/'));
			          							anoparcela = geralparcela.slice(geralparcela.indexOf('/')+1,geralparcela.length);
			          							//console.log ("O Parcelamento foi feito em "+geralparcela);
			          						}
			          					}
          							}
          						} else
          						{
          							valortotal = valortotal+totalRef;
          							if (diaRef== undefined || dia>diaRef)
          								{
          									diaRef = dia;
          								}
			          				/*console.log(aguaservRef);
			          				console.log(esgotoRef);
			          				console.log(correcaoRef);
			          				console.log(jurosRef);
			        				console.log(multaRef);
			        				console.log(distancia);
			         				console.log(competenciaValue);
			         				console.log(tipoLanc);
			         				console.log(parc);
			         				console.log(mesparc);
			         				console.log(anocompetencia);
			         				console.log(anoparcela);
			         				console.log(geralparcela)*/
			         				if (parc == "")
			          				{
			          					//console.log("N??o h?? parcela")
			          				} else 
			          				{
			          					//console.log("H?? parcela")
			          					console.log(parcela)
			          					if (!parcela)
			          					{
			          						//console.log ("Primeira parcela localizada")
			          						parcela = true;
			          						geralparcela = mestonum.returnlimit(mescompetenciaRevisado, anocompetencia, mesparc)
			          						mesparcela = geralparcela.slice(0,geralparcela.indexOf('/'));
			          						anoparcela = geralparcela.slice(geralparcela.indexOf('/')+1,geralparcela.length);
			          						//console.log ("O Parcelamento foi feito em "+geralparcela);
			          					}
			          				}
          						}
          					
          					}
          				}
          			}
          		}
          		
				//console.log(valortotal);
 				//console.log(valortotal);
				//console.log("Posi????o do vencido ??:" +startIndex);
				//console.log("A data da situa????o ??:" +situacaoData);
				//console.log("O tipo do lan??amento ??:" +tipoLanc);
				startIndex = pagoLocation+1;
				//allIndex.push({"competencia": ""+competenciaValue,"datasit": "" +situacaoData,"tipo": ""+tipoLanc, "aguaserv": ""+aguaValue, "esgoto": ""+esgotoValue,"correcao": ""+correcaoValue, "juros": ""+jurosValue,"multa": ""+multaValue})
				//console.log("Aqui est?? as informa????es de compet??ncias")
				//console.log(allIndex.competencia);				
				//console.log(typeof allIndex);
			}

			//text = text+"\nRamal: "+ramalref2+" Arrecadado: "+ valortotal.toString();
			text = text+'\nRamal:'+ramalref2+" Arrecadado: "+valortotal.toString().replace('.',',')+" Data Pago: "+diaRef+" DividaRestante: "+vencidaTotal;
			//text = text+'\n'+valortotal.toString().replace('.',',');
			
  			
  			//fs.writeFileSync('./Academias0819.txt', text)
  			
  			
  			
			//console.log(text);
			/*console.log(textRef.indexOf('vencido'));
			var teste1 = textRef.indexOf('vencido');
			console.log(textRef.indexOf('vencido', teste1+1));
			teste1 = textRef.indexOf('vencido', teste1+1);
			console.log(textRef.includes('vencido', teste1+1));*/



			//console.log ("Valor Total Vencido: R$ " +vencidaTotal);
			//console.log ("Valor Total a Vencer: R$: " +avencerTotal);
			//banquinho.pushingRamal(session2, ramalref2, vencidaTotal, avencerTotal, situacaoRamal, competenciaslenght.length, allIndex, enderecoRamal, numeroRamal, '');
			

			//parse_obj["sessions"].push({"sessionID":""+session,"ramal": ""+ramalref, "dividavencida":""+vencidaTotal, "dividavencer":""+avencerTotal});
			
			}	
	})
	.catch(function(error){
		console.log(error);
	})
	//return vencidaTotal;
	lerarquivoporfavor2(ramalref2, index2, rows2);


}

function lerarquivoporfavor2(ramalref2, index2, rows2)
{

		let dataBuffer = fs.readFileSync(ramalref2 +'.pdf')
		pdf(dataBuffer).then(function(data)
		{
		//console.log(data);
		textRef = data.text.toString();
			if (textRef.includes('GERAL')) 
			{

			var valortotal = 0;
			var wordLocation = textRef.lastIndexOf('GERAL')
			var nominalLocation = textRef.indexOf('Nominal', wordLocation);
			var commaLocation = textRef.indexOf(',', wordLocation);
			// Informa????es sobre o array para o while e posi????o de inicio
			var allIndex = [];
			var startIndex = 0;
			// Localizar Situa????o e Prefeitura
			var sitLocation = textRef.indexOf('Situa????o');
			var prefLocation = textRef.indexOf('Prefeitura', sitLocation);
			//Localizar Endere??o e Numero 
			var grupoLocation = textRef.indexOf('Grupo');
			var enderecoLocation = textRef.indexOf('Endere??o');
			//Rua acima, numero abaixo
			var subnumLocation = textRef.indexOf('Sub-num');
			var predioLocation = textRef.indexOf('Pr??dio');
			//Localizar Grupo
			var calculoLocation = textRef.lastIndexOf('C??lculo',grupoLocation);
			//console.log(textRef)



			//Variaveis que v??o ser passadas para banquinho depois
			var situacaoRamal = textRef.slice(sitLocation+9, prefLocation-1);
			var vencidaTotal = textRef.slice(wordLocation+6, commaLocation+3);
			var avencerTotal = textRef.slice(commaLocation+3, nominalLocation-1);
			var enderecoRamal = textRef.slice(grupoLocation+6, enderecoLocation-1);
			enderecoRamal = enderecoRamal.replace(" ", ". ");
			var grupoRamal = textRef.slice(calculoLocation+8,grupoLocation-1);
			console.log(grupoRamal);
			//console.log(enderecoRamal);
			var numeroRamal = textRef.slice(subnumLocation+8, predioLocation-1);
			var competenciaslenght = [];
			var pagoref = 'pendenci';
			var lancref = 'lan??.pa...';
			//var pendencref = 'pendenci';
			//console.log(numeroRamal);
			//var bairroRamal = cdl.cdlfinder(enderecoRamal,numeroRamal,ramalref);
			//console.log("A situa????o atual deste ramal ??: " +situacaoRamal);
			//Esse While vai localizar os lan??amentos vencidos e atualizar o index para procurar novos
			//Preciso achar Compet??ncia, tipo lan??amento, Agua/Servi??os, Esgoto, Corre????o, Juros, Multa como um objeto s??
			//console.log(textRef.includes('vencido',startIndex));
			/*
			while (textRef.includes(pagoref, startIndex))
			{
				//Localiza????o de vencido e depois salva o splice da situa????o data
				//Locations Variaveis
				console.log("POSSUI PENDENCIADAS")
				var pagoLocation = textRef.indexOf('pendenci', startIndex);
				var aguacommaLocation = textRef.lastIndexOf(',', pagoLocation);
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
				var situacaoData = textRef.slice(pagoLocation+8, pagoLocation+18)
				//console.log(situacaoData);

				if (nextspace>=pagoLocation)
				{
					tipoLanc = textRef.slice(aguacommaLocation+3, pagoLocation);
				} else
				{
					tipoLanc = textRef.slice(aguacommaLocation+3, nextspace);
				}
				
				var aguaValue = textRef.slice(multacommaLocation+3, aguacommaLocation+3);
				
				var multaValue = textRef.slice(juroscommaLocation+4, multacommaLocation+3);
				
				var jurosValue = textRef.slice(correcaocommaLocation+3, juroscommaLocation+3);
				
				var correcaoValue = textRef.slice(esgotocommaLocation+3, correcaocommaLocation+3);
				
				var esgotoValue = textRef.slice(compbarLocation+3, esgotocommaLocation+3);
				
				var competenciaValue = textRef.slice(spaceLocation+1, spaceLocation+7);


				//console.log(tipoLanc);
			//	console.log(competenciaValue);
				if (competenciaslenght.includes(competenciaValue))
				{
					//console.log("Do nothing")
					//console.log(competenciaslenght.length);
				}else {
					//console.log("Adiciona no array")
					competenciaslenght.push(competenciaValue);
					//console.log(competenciaslenght.length);
				}

				var aguaservRef = aguaValue.replace('.', '');
      		    aguaservRef =  parseFloat(aguaservRef.replace(',','.'));
          		var esgotoRef = esgotoValue.replace('.', '');
          		esgotoRef = parseFloat(esgotoRef.replace(',','.'));
          		var correcaoRef = correcaoValue.replace('.', '');
          		correcaoRef =  parseFloat(correcaoRef.replace(',','.'));
          		var jurosRef = jurosValue.replace('.', '');
          		jurosRef = parseFloat(jurosRef.replace(',','.'));
          		var multaRef = multaValue.replace('.','');
          		multaRef = parseFloat(multaRef.replace(',','.'));



          		var totalRef;

          		if (tipoLanc=='multa')
          		{
          			totalRef = multaRef;
          		} else 
          		{
          			totalRef = aguaservRef+esgotoRef+correcaoRef+jurosRef+multaRef;
          		}

          		console.log("A data da situa????o "+situacaoData);
          		var dia = parseFloat(situacaoData.slice(situacaoData.indexOf('/')-2, situacaoData.indexOf('/')));
          		console.log("O dia que foi pago ?? "+dia);
          		var mes = parseFloat(situacaoData.slice(situacaoData.indexOf('/')+1, situacaoData.indexOf('/')+3));
          		console.log("O m??s que foi pago ?? "+mes);
          		var ano = parseFloat(situacaoData.slice(situacaoData.indexOf('/')+4, situacaoData.indexOf('/')+8));
          		console.log("O ano que foi pago ?? "+ano);
          		var grupoRef = parseFloat(grupoRamal);
          		console.log(competenciaValue);

          		if (competenciaValue== 'Nov/19' || competenciaValue== '0,000,')
          		{
          		//	console.log("N??o checar");
          		}else

          		{
          			if (ano ==2019)
          			{
          			//console.log("Ano ?? 2019");
          				if (mes>=11)
          				{
          				//console.log ("M??s ?? 8 ou 9, isso tem que ser variavel depois com o m??s atual");
          					if (mes == 12)
          					{
          					valortotal = valortotal+totalRef;
          					console.log(aguaservRef);
          					console.log(esgotoRef);
          					console.log(correcaoRef);
          					console.log(jurosRef);
          					console.log(multaRef);
          					console.log(competenciaValue);
          					} else if(dia>=7)
          					{
          						if (competenciaValue== 'Out/19')
          						{
          							if (dia>grupoRef || mes==12)
          							{
          								valortotal = valortotal+totalRef;
			          					console.log(aguaservRef);
			          					console.log(esgotoRef);
			          					console.log(correcaoRef);
			          					console.log(jurosRef);
			          					console.log(multaRef);
			          					console.log(competenciaValue);
          							}
          						} else
          						{
          							valortotal = valortotal+totalRef;
			          				console.log(aguaservRef);
			          				console.log(esgotoRef);
			          				console.log(correcaoRef);
			          				console.log(jurosRef);
			        				console.log(multaRef);
			         				console.log(competenciaValue);
          						}
          					
          					}
          				}
          			}
          		}
          		
				//console.log(valortotal);
 				//console.log(valortotal);
				//console.log("Posi????o do vencido ??:" +startIndex);
				//console.log("A data da situa????o ??:" +situacaoData);
				//console.log("O tipo do lan??amento ??:" +tipoLanc);
				startIndex = pagoLocation+1;
				//allIndex.push({"competencia": ""+competenciaValue,"datasit": "" +situacaoData,"tipo": ""+tipoLanc, "aguaserv": ""+aguaValue, "esgoto": ""+esgotoValue,"correcao": ""+correcaoValue, "juros": ""+jurosValue,"multa": ""+multaValue})
				//console.log("Aqui est?? as informa????es de compet??ncias")
				//console.log(allIndex.competencia);				
				//console.log(typeof allIndex);
			}*/

			while (textRef.includes(lancref, startIndex))
			{
				//Localiza????o de vencido e depois salva o splice da situa????o data
				//Locations Variaveis
				console.log("POSSUI PARCELAS" +ramalref2);
				var pagoLocation = textRef.indexOf(lancref, startIndex);
				var aguacommaLocation = textRef.lastIndexOf(',', pagoLocation);
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
				var situacaoData = textRef.slice(pagoLocation+10, pagoLocation+20)
				//console.log(situacaoData);

				if (nextspace>=pagoLocation)
				{
					tipoLanc = textRef.slice(aguacommaLocation+3, pagoLocation);
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


				//console.log(tipoLanc);
			//	console.log(competenciaValue);
				if (competenciaslenght.includes(competenciaValue))
				{
					//console.log("Do nothing")
					//console.log(competenciaslenght.length);
				}else {
					//console.log("Adiciona no array")
					competenciaslenght.push(competenciaValue);
					//console.log(competenciaslenght.length);
				}

				var aguaservRef = aguaValue.replace('.', '');
      		    aguaservRef =  parseFloat(aguaservRef.replace(',','.'));
          		var esgotoRef = esgotoValue.replace('.', '');
          		esgotoRef = parseFloat(esgotoRef.replace(',','.'));
          		var correcaoRef = correcaoValue.replace('.', '');
          		correcaoRef =  parseFloat(correcaoRef.replace(',','.'));
          		var jurosRef = jurosValue.replace('.', '');
          		jurosRef = parseFloat(jurosRef.replace(',','.'));
          		var multaRef = multaValue.replace('.','');
          		multaRef = parseFloat(multaRef.replace(',','.'));



          		var totalRef;

          		if (tipoLanc=='multa')
          		{
          			totalRef = multaRef;
          		} else 
          		{
          			totalRef = aguaservRef+esgotoRef+correcaoRef+jurosRef+multaRef;
          		}

          		console.log("A data da situa????o "+situacaoData);
          		var dia = parseFloat(situacaoData.slice(situacaoData.indexOf('/')-2, situacaoData.indexOf('/')));
          		console.log("O dia que foi pago ?? "+dia);
          		var mes = parseFloat(situacaoData.slice(situacaoData.indexOf('/')+1, situacaoData.indexOf('/')+3));
          		console.log("O m??s que foi pago ?? "+mes);
          		var ano = parseFloat(situacaoData.slice(situacaoData.indexOf('/')+4, situacaoData.indexOf('/')+8));
          		console.log("O ano que foi pago ?? "+ano);
          		var grupoRef = parseFloat(grupoRamal);
          		console.log(competenciaValue);

          		if (competenciaValue== 'Set/21')
          		{
          		//	console.log("N??o checar");
          		}else

          		{
          			if (ano ==2021)
          			{
          			//console.log("Ano ?? 2019");
          				if (mes>=10)
          				{
          				//console.log ("M??s ?? 8 ou 9, isso tem que ser variavel depois com o m??s atual");
          					if (mes == 11)
          					{
          					valortotal = valortotal+totalRef;
          					console.log(aguaservRef);
          					console.log(esgotoRef);
          					console.log(correcaoRef);
          					console.log(jurosRef);
          					console.log(multaRef);
          					console.log(competenciaValue);
          					} else if(dia>=1)
          					{
          						if (competenciaValue== 'Set/21')
          						{
          							if (dia>=grupoRef || mes==1)
          							{
          								valortotal = valortotal+totalRef;
			          					console.log(aguaservRef);
			          					console.log(esgotoRef);
			          					console.log(correcaoRef);
			          					console.log(jurosRef);
			          					console.log(multaRef);
			          					console.log(competenciaValue);
          							}
          						} else
          						{
          							valortotal = valortotal+totalRef;
			          				console.log(aguaservRef);
			          				console.log(esgotoRef);
			          				console.log(correcaoRef);
			          				console.log(jurosRef);
			        				console.log(multaRef);
			         				console.log(competenciaValue);
          						}
          					
          					}
          				}
          			}
          		}
          		
				//console.log(valortotal);
 				//console.log(valortotal);
				//console.log("Posi????o do vencido ??:" +startIndex);
				//console.log("A data da situa????o ??:" +situacaoData);
				//console.log("O tipo do lan??amento ??:" +tipoLanc);
				startIndex = pagoLocation+1;
				//allIndex.push({"competencia": ""+competenciaValue,"datasit": "" +situacaoData,"tipo": ""+tipoLanc, "aguaserv": ""+aguaValue, "esgoto": ""+esgotoValue,"correcao": ""+correcaoValue, "juros": ""+jurosValue,"multa": ""+multaValue})
				//console.log("Aqui est?? as informa????es de compet??ncias")
				//console.log(allIndex.competencia);				
				//console.log(typeof allIndex);
			}

			//text = text+"\nRamal: "+ramalref2+" Arrecadado: "+ valortotal.toString();
			text = text+" Negociado: "+valortotal.toString().replace('.',',');
			//text = text+'\n'+valortotal.toString().replace('.',',');
			
  			
  			fs.writeFileSync('./Academias0819.txt', text)
  			
  			if (linha == limite)
  				{
  					console.log("Linha == Limite, Manda e-mail")
  					tgmail.triggerarrecadado("jeison.molina@dmae.prefpoa.com.br");
  					//return text;
  				}
  			
  			
			//console.log(text);
			/*console.log(textRef.indexOf('vencido'));
			var teste1 = textRef.indexOf('vencido');
			console.log(textRef.indexOf('vencido', teste1+1));
			teste1 = textRef.indexOf('vencido', teste1+1);
			console.log(textRef.includes('vencido', teste1+1));*/



			//console.log ("Valor Total Vencido: R$ " +vencidaTotal);
			//console.log ("Valor Total a Vencer: R$: " +avencerTotal);
			//banquinho.pushingRamal(session2, ramalref2, vencidaTotal, avencerTotal, situacaoRamal, competenciaslenght.length, allIndex, enderecoRamal, numeroRamal, '');
			

			//parse_obj["sessions"].push({"sessionID":""+session,"ramal": ""+ramalref, "dividavencida":""+vencidaTotal, "dividavencer":""+avencerTotal});
			
			}	
	})
	.catch(function(error){
		console.log(error);
	})
	//return vencidaTotal;
	fs.unlink(ramalref2 +'.pdf', function(err)
	{
		if(err) throw err;
		console.log('File Deleted Ramal'+ramalref2);
		if (linha<limite)
		{
			dividaramal(rows2[linha][0], linha, rows2)
		}

	})
}
	
