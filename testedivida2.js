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

var tgmail = require('./triggermail.js'); 
var text = "";
//const cdl = require('./cdlfinder.js');
//const banquinho = require('./parsingJson.js');

var linha =1 ;
var limite;

//excelread();


excelread();


function excelread()
{
	readXlsxFile('Clubes.xlsx').then((rows) => {
  // `rows` is an array of rows
  	console.log(rows.length)
  	limite = rows.length;
  	
  	console.log(rows[linha][0]);
  	dividaramal(rows[linha][0], linha, rows);
  		
  	
  //	console.log(1049259);
  //	dividaramal(19);

  	
  		
})
}

function dividaramal(ramalref, index, rows)
{
//var vencidaRetorno = 0;
// Modifiquei isso no dia 19/02 devido a problemas no site
//Form tipoRelatorio eh igual a servico e Lancamento eh igual a segundaVia
if(linha<limite)
{
	linha = linha+1
}


request.post('https://scainternet.procempa.com.br/scainternet/lancamentoPrint.do', {
	form: {
		tipoRelatorio: 'Lancamento',
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
		//text = text+'\nerror';
		//return
		console.log("ERRROOOOOOOO")
		//lerarquivoporfavor(ramalref, index, rows);

	} else {
		fs.writeFileSync(ramalref +".pdf", body, {
		encoding: 'binary'
		});
	
		//success, Leia o arquivo e faz que ta aqui embaixo
		console.log("Funcionou e salvou o arquivo, agora quero ler ele por favor!");
		lerarquivoporfavor(ramalref, index, rows);
	}
	//console.log('statusCode: ${res.statusCode}')

	


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

			var valortotal = 0;
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
			//Localizar Grupo
			var calculoLocation = textRef.lastIndexOf('Cálculo',grupoLocation);
			//console.log(textRef)



			//Variaveis que vão ser passadas para banquinho depois
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
			//console.log(numeroRamal);
			//var bairroRamal = cdl.cdlfinder(enderecoRamal,numeroRamal,ramalref);
			//console.log("A situação atual deste ramal é: " +situacaoRamal);
			//Esse While vai localizar os lançamentos vencidos e atualizar o index para procurar novos
			//Preciso achar Competência, tipo lançamento, Agua/Serviços, Esgoto, Correção, Juros, Multa como um objeto só
			//console.log(textRef.includes('vencido',startIndex));
			/*while (textRef.includes(pagoref, startIndex))
			{
				//Localização de vencido e depois salva o splice da situação data
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

          		//console.log("A data da situação "+situacaoData);
          		var dia = parseFloat(situacaoData.slice(situacaoData.indexOf('/')-2, situacaoData.indexOf('/')));
          		//console.log("O dia que foi pago é "+dia);
          		var mes = parseFloat(situacaoData.slice(situacaoData.indexOf('/')+1, situacaoData.indexOf('/')+3));
          		//console.log("O mês que foi pago é "+mes);
          		var ano = parseFloat(situacaoData.slice(situacaoData.indexOf('/')+4, situacaoData.indexOf('/')+8));
          		//console.log("O ano que foi pago é "+ano);
          		var grupoRef = parseFloat(grupoRamal);
          		//console.log(competenciaValue);

          		if (competenciaValue== 'Ago/19')
          		{
          		//	console.log("Não checar");
          		}else

          		{
          			if (ano ==2019)
          			{
          			//console.log("Ano é 2019");
          				if (mes>=8)
          				{
          				//console.log ("Mês é 8 ou 9, isso tem que ser variavel depois com o mês atual");
          					if (mes == 9)
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
          						if (competenciaValue== 'Jul/19')
          						{
          							if (dia>=grupoRef || mes==9)
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
				//console.log("Posição do vencido é:" +startIndex);
				//console.log("A data da situação é:" +situacaoData);
				//console.log("O tipo do lançamento é:" +tipoLanc);
				startIndex = pagoLocation+1;
				//allIndex.push({"competencia": ""+competenciaValue,"datasit": "" +situacaoData,"tipo": ""+tipoLanc, "aguaserv": ""+aguaValue, "esgoto": ""+esgotoValue,"correcao": ""+correcaoValue, "juros": ""+jurosValue,"multa": ""+multaValue})
				//console.log("Aqui está as informações de competências")
				//console.log(allIndex.competencia);				
				//console.log(typeof allIndex);
			}*/

			//text = text+"\nRamal: "+ramalref2+" Arrecadado: "+ valortotal.toString();
			text = text+'\nRamal:'+ramalref2+";Arrecadado: "+vencidaTotal+";Grupo: "+grupoRamal+";Situação"+situacaoRamal+";Endereço: "+enderecoRamal+";Numero: "+numeroRamal;
			//text = text+'\n'+valortotal.toString().replace('.',',');
			
  			
  			
  				fs.writeFileSync('./Consumo.txt', text)

  				if (linha == limite)
  				{
  					console.log("Linha == Limite, Manda e-mail")
  					tgmail.triggerarrecadado("jeison.molina@dmae.prefpoa.com.br");
  				}
  			
  		//	
  			
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
		console.log('File Deleted');
		console.log("Linha ="+linha+" Limite = "+limite)
		if (linha<limite)
		{
			dividaramal(rows2[linha][0], linha, rows2)
		}

	})
}
	
