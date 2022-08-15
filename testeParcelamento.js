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


var totaltotal;
testsimulaparc(2020513)


function testsimulaparc(ramalzito){
	console.log("Verificando os valores do ramal: "+ramalzito);
	dividaramal(ramalzito);
}

function dividaramal(ramalref)
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
		lerarquivoporfavor(ramalref);


	});
	//console.log('statusCode: ${res.statusCode}'

	});
}

function lerarquivoporfavor(ramalref2)
{

		let dataBuffer = fs.readFileSync(ramalref2 +'.pdf')
		pdf(dataBuffer).then(function(data)
		{

		//console.log(data);

		textRef = data.text.toString();
		console.log(textRef);
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
			//Multa localização
			var multaLocation = textRef.lastIndexOf('Multa');
			//Valores localização
			var valoresvencerLocation = textRef.lastIndexOf('Valores a Vencer');
			var valoresvencidosLocation = textRef.lastIndexOf('Valores Vencidos');
			var valorescommaLocation = textRef.lastIndexOf(',', valoresvencerLocation);
			var valorescommaLocation2 = textRef.lastIndexOf(',', valorescommaLocation-2);
			var multacommaLocation = textRef.indexOf(',', multaLocation)


			//Variaveis que vão ser passadas para banquinho depois
			var situacaoRamal = textRef.slice(sitLocation+9, prefLocation-1);
			var vencidaTotal = textRef.slice(wordLocation+6, commaLocation+3);
			var avencerTotal = textRef.slice(commaLocation+3, nominalLocation-1);
			var jurostotal = textRef.slice(multaLocation+6, textRef.indexOf(',', multaLocation)+3);
			var correcaototal = textRef.slice(valorescommaLocation2+4, valorescommaLocation+3);
			var valorNominal = textRef.slice(valoresvencidosLocation+17, textRef.indexOf(',', valoresvencidosLocation)+3)
			var multatotal = textRef.slice(multacommaLocation+4, textRef.indexOf(',', multacommaLocation+1)+3)

			console.log("Valores referentes a juros......\n"+jurostotal);
			console.log("Valores referentes a correção....\n"+correcaototal);
			console.log("Valores referentes a Divida nominal....\n"+valorNominal);
			console.log("Valores referentes a Multa....\n"+multatotal);

			var jurostotalfloat = jurostotal.replace('.', '');
      		jurostotalfloat =  parseFloat(jurostotalfloat.replace(',','.'));
          	var correcaototalfloat = correcaototal.replace('.', '');
          	correcaototalfloat = parseFloat(correcaototalfloat.replace(',','.'));
          	var valorNominalfloat = valorNominal.replace('.', '');
          	valorNominalfloat =  parseFloat(valorNominalfloat.replace(',','.'));
          	var multatotalfloat = multatotal.replace('.', '');
          	multatotalfloat = parseFloat(multatotalfloat.replace(',','.'));

          	console.log(jurostotalfloat)
          	console.log(correcaototalfloat)
          	console.log(valorNominalfloat)
          	console.log(multatotalfloat)
          	console.log(jurostotalfloat+correcaototalfloat+valorNominalfloat+multatotalfloat)

          	totaltotal = jurostotalfloat+correcaototalfloat+valorNominalfloat+multatotalfloat;
          	

			var enderecoRamal = textRef.slice(grupoLocation+6, enderecoLocation-1);
			enderecoRamal = enderecoRamal.replace(" ", ". ");
			var grupoRamal = textRef.slice(calculoLocation+8,grupoLocation-1);
			//console.log(grupoRamal);
			//console.log(enderecoRamal);
			var numeroRamal = textRef.slice(subnumLocation+8, predioLocation-1);
			//var competenciaslenght = [];
			var pagoref = 'pago';
			//console.log(numeroRamal);
			//var bairroRamal = cdl.cdlfinder(enderecoRamal,numeroRamal,ramalref);
			//console.log("A situação atual deste ramal é: " +situacaoRamal);
			//Esse While vai localizar os lançamentos vencidos e atualizar o index para procurar novos
			//Preciso achar Competência, tipo lançamento, Agua/Serviços, Esgoto, Correção, Juros, Multa como um objeto só
			//console.log(textRef.includes('vencido',startIndex));
			/*
			while (textRef.includes(pagoref, startIndex))
			{
				//Localização de vencido e depois salva o splice da situação data
				//Locations Variaveis
				var pagoLocation = textRef.indexOf('vencido', startIndex);
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
				console.log(aguaValue);
				console.log(esgotoValue);
				console.log(multaValue);
				console.log(jurosValue);
				console.log(correcaoValue);				
				console.log(competenciaValue);
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
          		console.log(multaValue)

          		multaRef = parseFloat(multaRef.replace(',','.'));



          		var totalRef;

          		if (tipoLanc=='Multa')
          		{
          			totalRef = aguaservRef+esgotoRef;
          			valortotal = valortotal+totalRef;
          			correcaototal = correcaototal+correcaoRef;
          			jurostotal = jurostotal+jurosRef+multaRef;
          			//correcaototal = correcaototal+correcaoRef;
          		} else 
          		{
          			//console.log("Não é só multa")
          			totalRef = aguaservRef+esgotoRef;
          			valortotal = valortotal+totalRef;
          			correcaototal = correcaototal+correcaoRef;
          			jurostotal = jurostotal+jurosRef+multaRef;
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

          		//var mescompetenciaRevisado = mestonum.checkcomp(mescompetencia);

          		//distancia tambem
          		///Adicionei meses a mais para nao serem checados pois a cobrança não ocorre desde de Abril

				startIndex = pagoLocation+1;
				
			}*/

			//text = text+"\nRamal: "+ramalref2+" Arrecadado: "+ valortotal.toString();
			//text = text+'\nRamal:'+ramalref2+" Arrecadado: "+valortotal.toString().replace('.',',')+" Data Pago: "+diaRef+" DividaRestante: "+vencidaTotal;
			//text = text+'\n'+valortotal.toString().replace('.',',');
			/*console.log("Valor de Agua/Servico e Esgoto: "+valortotal);
			console.log("Valor de Correção Monetaria: "+correcaototal);
			console.log("Valor de Juros e Multa: "+jurostotal);
			var vencidototal = valortotal+correcaototal+jurostotal;
			console.log("Valor Total: "+vencidototal);*/

			
  			simulacaoRefis(valorNominalfloat, correcaototalfloat, jurostotalfloat, multatotalfloat);
			
			}	
	})
	.catch(function(error){
		console.log(error);
	})
	//return vencidaTotal;
	//lerarquivoporfavor2(ramalref2, index2, rows2);
	fs.unlink(ramalref2 +'.pdf', function(err)
	{
		if(err) throw err;
		console.log('File Deleted Ramal'+ramalref2);
		simulacaoParcelamento(totaltotal);
		//simulacaoRefis(nomina)

	})

}

function simulacaoParcelamento(total){
	var totalref = total;
	var valorminimo = 81.80;
	var maxparcelas = totalref/81.80;
	console.log(Math.floor(maxparcelas));
	var maxparcelasarredondado = Math.floor(maxparcelas)

	if (maxparcelasarredondado<=2)
	{
		console.log("Ramal informado não cabe parcelamento, ou 2 parcelas apenas")
	}
	if (maxparcelasarredondado==3){
		console.log("Ramal informado em 3 parcelas");
	}
	if (maxparcelasarredondado>3 && maxparcelasarredondado<=6)
	{
		console.log("Efetuar 2 propostas, maxparcelas/2 e maxparcelas")
	}
	if (maxparcelasarredondado>6 && maxparcelasarredondado<=16){
		console.log("Efetuar 3 propostas, maxparcelas/2, maxparcelas/4 e max parcelas")
	}	
	if (maxparcelasarredondado>16)
	{
		console.log("Efetuar 3 propostas fixas, 6, 12 e maxparcelas")
	}



}

function simulacaoRefis(nominal, correcao, juros, multa){
	console.log(nominal, correcao,juros, multa)
	var correcaopos99 = correcao-(correcao*0.99);
	console.log(correcaopos99);

}