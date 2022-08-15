const request = require ('request');
const rp = require ('request-promise');
const cheerio = require('cheerio');
var parsing = require('./parsingJson.js');
var mapcreator = require('./geoDMAEmapdown.js');


var ramal = 19;

console.log("Ti abri?")

var menorX = 0;
var maiorX = 0;
var menorY = 0;
var maiorY = 0;
var passbyRef ;

var endereco = "R. I Lot Jardim Floresta"
var numero =  90
var linkCDL = "http://cdlrest.procempa.com.br/cdlrest/rest/query/endereco?q="+endereco;

//var linkget = "http://pmpa-geo-wadap.pmpa.ad/arcgis/rest/services/DMAE/TM_POA_Mapa_Base_de_Porto_Alegre_DMAE_Comercial/MapServer/1/query";
//var linkget2 = "http://pmpa-geo-wadap.pmpa.ad/arcgis/rest/services/DMAE/TM_POA_Mapa_Base_de_Porto_Alegre_DMAE_Apoio/MapServer/8/query"

var findAdressCoord = "http://pmpa-geo-wadap.pmpa.ad/arcgis/rest/services/GEOCODE/TM_POA_COD_NOME_COMPOSITE/GeocodeServer/findAddressCandidates"

var findredesLink = "http://pmpa-geo-wadap.pmpa.ad/arcgis/rest/services/DMAE/TM_POA_Mapa_Base_de_Porto_Alegre_DMAE_Redes/MapServer/identify"

///////////////////////////////////////////////////////////////////////////////////////////
//Primeiramente passo a solicitação para o CDL finder da prefeitura para localizar o CDL///
///////////////////////////////////////////////////////////////////////////////////////////
var ListOfIDS = [];
var ListOfObjectsIS = [];

const options = {
    url: linkCDL,
    method: 'GET',
    headers: {
        'Content-Type' : 'application/x-www-form-urlencoded'
    },
    proxy : 'http://proxy3.pmpa.ad:3128/',
    json: true
};

findcdl(endereco, numero);

function findcdl (endereco, numero)

{
	console.log("Comecei a ti rodar?")
	request(options, function(err, res, body) {
		if (err)
		{
			console.log(err)
		} else
		{
			console.log("Cheguei Aqui")
			console.log(body[0].codigoLogradouro);
			var cdl = body[0].codigoLogradouro;
			/////Descobri o CDL////////////////////////////////////////////////////////////////////////////////////////
			/////Agora preciso chamar uma função junto ao APi Rest do ARCGIS para então achar a rede e seus pathlines./
			/////Aqui existe a possibilidade de eu achar mais de uma rede./////////////////////////////////////////////
			findCoord(cdl, numero);
		}
		
	})
}

function findCoord(endereco, numero)
{

	console.log(endereco)
	console.log(numero)
	request.post(findAdressCoord, {
		form: {
			street : endereco,
			number : numero,
			outSR: 102100,
			f: "pjson"
		},
		headers: {
			'Content-Type':'text/plain;charset=utf-8'
		},
		json: true,
		proxy: 'http://proxy3.pmpa.ad:3128/'
		//encoding: null

	}, (error, res, body) => {
		if (error){
			console.error(error)
			//return
		} else 
		{
			//console.log(res);
			console.log(body);
			console.log(typeof body);
			console.log(body.candidates[0].location);
			findrede(body.candidates[0].location.x, body.candidates[0].location.y)
			//secondCall(ramalref, body.features[0].geometry);
			
		}
		//console.log('statusCode: ${res.statusCode}')
		//Lendo Synchronous, vou trocar para Asynchronous e comentar
		
	});
}

function findrede(x, y)
{
	//console.log(endereco)
	//console.log(numero)
	var teste = "-5700750.2714196695,-3520070.632392434,-5700657.039145918,-3520017.036897995"
	var mapExtentxMin = x-50;
	var mapExtentxMax = x+50;
	var mapExtentyMin = y-50;
	var mapExtentyMax = y+50;
	var mapExtentFull = ""+mapExtentxMin+","+mapExtentyMin+","+mapExtentxMax+","+mapExtentyMax;

	//console.log(mapExtentFull)

	request.post(findredesLink, {
		form: {
			geometry : '{"x": '+x+',"y":'+y+'}',
			geometryType : "esriGeometryPoint",
			layers: "show:11",
			sr: 102100,
			tolerance: 50,
			mapExtent: mapExtentFull,
			imageDisplay: "1249,718,96",
			returnGeometry : true,
			returnZ: false,
			returnM: false,
			f :"pjson"
		},
		headers: {
			'Content-Type':'application/x-www-form-urlencoded'
		},
		json: true,
		proxy: 'http://proxy3.pmpa.ad:3128/'
		//encoding: null

	}, (error, res, body) => {
		if (error){
			console.error(error)
			//return
		} else 
		{
			console.log(body.results.length)
			//console.log(res);
			console.log(body.results[0].geometry.paths[0][0][0]);
			console.log(typeof body);
			//console.log(body.results[0].layerName);
			var lengtha = body.results[0].geometry.paths[0].length;
			console.log(body.results[0].geometry.paths[0].length);
			console.log(body)
			var passby = body.results[0].value;
			passbyRef = passby;
			//console.log(body.results[0].geometry.paths[0].length);
			//console.log(body.results[0].geometry.paths[0][0])
			//console.log(body.results[0].geometry.paths[0][length-1])
			findregistro(body.results[0].geometry.paths[0][0][0],body.results[0].geometry.paths[0][0][1], passby);
			findregistro(body.results[0].geometry.paths[0][lengtha-1][0],body.results[0].geometry.paths[0][lengtha-1][1], passby);
			//findregistro(body.results[0].geometry.paths[0][lengtha][0],body.results[0].geometry.pahs[0][lengtha][1]);
			//console.log(body.candidates[0].location);

			//secondCall(ramalref, body.features[0].geometry);
			
		}
		//console.log('statusCode: ${res.statusCode}')
		//Lendo Synchronous, vou trocar para Asynchronous e comentar
		
	});
	//console.log("Ti Executo quando?")
}

function includesonList(ObjectID)
{
	ListOfIDS.push(ObjectID)
	//console.log(ObjectID);
	//console.log(AVISO)
	//console.log(ListOfIDS);
}

function includesConex(ObjectID)
{
	ListOfObjectsIS.push(ObjectID)
	//console.log(ObjectID)

	//console.log(ListOfIDS);
}

function includesEmenda(ObjectID)
{
	ListOfIDS.push(ObjectID)
	//console.log(ListOfIDS);
}

function finderede2(x, y, passby)
{
	var mapExtentxMin = x-50;
	var mapExtentxMax = x+50;
	var mapExtentyMin = y-50;
	var mapExtentyMax = y+50;
	var mapExtentFull = ""+mapExtentxMin+","+mapExtentyMin+","+mapExtentxMax+","+mapExtentyMax;
	
		request.post(findredesLink, {
		form: {
			geometry : '{"x": '+x+',"y":'+y+'}',
			geometryType : "esriGeometryPoint",
			layers: "show:11",
			sr: 102100,
			tolerance: 5,
			mapExtent: mapExtentFull,
			imageDisplay: "1249,718,96",
			returnGeometry : true,
			returnZ: false,
			returnM: false,
			f :"pjson"
		},
		headers: {
			'Content-Type':'application/x-www-form-urlencoded'
		},
		json: true,
		proxy: 'http://proxy3.pmpa.ad:3128/'
		//encoding: null

	}, (error, res, body) => {
		if (error){
			console.error(error)
			//return
		} else 
		{
			//console.log(res);
			if (body.results.length == 0)
			{
				console.log("nem roda")

			} else
			{
				/*console.log("************************************************************");
				console.log("*******AQUI EU POSSO LOCALIZAR REDES DE AGUA****************");
				console.log("************************************************************")*/
				var lengthfor = body.results.length;
				//console.log(lengthfor)
				//console.log(length);
				//console.log(body);
				//console.log(typeof body);

				//console.log(body.results[0].layerName);
				//console.log(body.results[0].geometry.paths)
				//console.log(body.results[0].value)
				
				
				var what;



				for (var j = 0; j<lengthfor; j++)
				{
					//console.log(body.results[j].layerName);
					//console.log("Achei rede de agua e não registro, continue");
					//console.log("COM AS COORDENADAS"+x+" E"+y+" ESTOU ACHANDO AS REDES de OBJECTID")
					//console.log(body.results[j].value)
					
					
					what = body.results[j].geometry.paths[0].length;
					console.log(body.results[j].geometry.paths[0].length)
					//console.log(what)
					if (ListOfIDS.includes(body.results[j].value))
					{
						//console.log("Do nothing")
					} else {
						var xInicio = body.results[j].geometry.paths[0][0][0];
						var yInicio = body.results[j].geometry.paths[0][0][1];
						var xFim = body.results[j].geometry.paths[0][what-1][0];
						var yFim = body.results[j].geometry.paths[0][what-1][1];

						var xRefMenor;
						var yRefMenor;
						var xRefMaior;
						var yRefMaior;

						if (xInicio<xFim)
						{
							xRefMenor = xInicio;
							xRefMaior = xFim;
						} else {
							xRefMenor = xFim;
							xRefMaior = xInicio;
						}
						if (yInicio<yFim)
						{
							yRefMenor = yInicio;
							yRefMaior = yFim;
						} else {
							yRefMenor = yFim;
							yRefMaior = yInicio;
						}

						if (menorX ==0)
						{
							menorX = xRefMenor;
							maiorX = xRefMaior;
							menorY = yRefMenor;
							maiorY = yRefMaior;
						} else {
							if (parseFloat(x)<parseFloat(menorX))
							{
								menorX = x;
							} else if (parseFloat(x)>parseFloat(maiorX)) {
								maiorX = x;
							}
							if (parseFloat(y)<parseFloat(menorY))
							{
								menorY = y;
							} else if (parseFloat(y)>parseFloat(maiorY))
							{
								maiorY = y;
							}
							
						}


						//Aqui procura o registro no inicio da rede
						findregistro(xInicio, yInicio, passby);
						//Aqui procura no fim
						findregistro(xFim, yFim, passby);

						//Aqui inclui a rede como já Analisada, impedindo a ser verificada de novo caso outra rede retorne aqui.
						includesonList(body.results[j].value);
					}
					
						

					
					
				}
				//includesonList("x:"+x+" y:"+y);
			}
			
			
		}
	});


	
}

function findregistro(x, y, passby)
{
	//console.log(AVISO);
	//console.log(y);
	if (ListOfObjectsIS.includes("x:"+x+" y:"+y))
	{
		//console.log("Ja pesquisado");
	} else {
		includesConex("x:"+x+" y:"+y)

		var mapExtentxMin = x-50;
		var mapExtentxMax = x+50;
		var mapExtentyMin = y-50;
		var mapExtentyMax = y+50;
		var mapExtentFull = ""+mapExtentxMin+","+mapExtentyMin+","+mapExtentxMax+","+mapExtentyMax;
		
			request.post(findredesLink, {
			form: {
				geometry : '{"x": '+x+',"y":'+y+'}',
				geometryType : "esriGeometryPoint",
				layers: "visible:4",
				sr: 102100,
				tolerance: 10,
				mapExtent: mapExtentFull,
				imageDisplay: "1249,718,96",
				returnGeometry : true,
				returnZ: false,
				returnM: false,
				f :"pjson"
			},
			headers: {
				'Content-Type':'application/x-www-form-urlencoded'
			},
			json: true,
			proxy: 'http://proxy3.pmpa.ad:3128/'
			//encoding: null

		}, (error, res, body) => {
			if (error){
				console.error(error)
				//return
			} else 
			{
					
				/*console.log("************************************************************");
				console.log("*******AQUI EU POSSO LOCALIZAR  REGISTROS*******************");
				console.log("************************************************************");*/
				
					
					
					if (body.results.length > 0)
					{
						console.log("AQUI EH PRA TER REGISTRO");
						timerreset();
						console.log("Achei ele usando o x:"+x+"y:"+y+"da rede de obj id: "+passby)
						console.log(body);
						if (menorX ==0)
						{
							menorX = x;
							maiorX = x;
							menorY = y;
							maiorY = y;
						} else {
							if (parseFloat(x)<parseFloat(menorX))
							{
								menorX = x;
							} else if (parseFloat(x)>parseFloat(maiorX)) {
								maiorX = x;
							}
							if (parseFloat(y)<parseFloat(menorY))
							{
								menorY = y;
							} else if (parseFloat(y)>parseFloat(maiorY))
							{
								maiorY = y;
							}
							
						}
						//console.log(typeof x)
						if (menorX !==maiorX && menorY!==maiorY)
						{
							parsing.updateCoordinates(passby, menorX, maiorX, menorY, maiorY);
							console.log(menorX);
							console.log(maiorX);
							console.log(menorY);
							console.log(maiorY);
						} 
						


					} else {
						finderede2(x,y, passby);
					}
					//console.log("ACHEI O REGISTRO E AGORA?");
				

			}
		});
	}

	
}

function timerteste ()
{
	console.log("Finaliza o Timer e a conexão com o banco");
	parsing.closeconnection();
	clearTimeout(timer);
	//process.exit();
	mapcreator.createmaps(menorX,maiorX,menorY,maiorY,passbyRef);
	//Tenho que iniciar agora a segunda parte da função, baixar as imagens e fazer o merge delas
}


var timer = setTimeout(timerteste, 10000);



function timerreset ()
{
	clearTimeout(timer);
	console.log("Reseta o timer e inicia de novo");
	timer = setTimeout(timerteste, 10000);
}


////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
///////////////////DAQUI PRA BAIXO É GEODMAE ANTES COM O NODEJS/////////////////////////


module.exports.getBairro = function  (ramalref)
{
	request.post(linkget, {
		form: {
			where: "RAMAL = "+ramalref,
			returnGeometry : true,
			outSR: 102100,
			f: "pjson"
		},
		headers: {
			'Content-Type':'text/plain;charset=utf-8'
		},
		json: true,
		proxy: 'http://proxy3.pmpa.ad:3128/'
		//encoding: null

	}, (error, res, body) => {
		if (error){
			console.error(error)
			//return
		} else 
		{
			//console.log(res);
			console.log(body);
			console.log(typeof body);
			console.log(body.features[0].geometry);

			secondCall(ramalref, body.features[0].geometry);
			
		}
		//console.log('statusCode: ${res.statusCode}')
		//Lendo Synchronous, vou trocar para Asynchronous e comentar
		
	});
}



function secondCall(ramalref, query)
{
	console.log(query);
	request.post(linkget2, {
	form: {
		//where: "RAMAL = 19",
		geometry : "{ x: "+query.x+", y: "+query.y+" }",
		geometryType : "esriGeometryPoint",
		inSR : 102100,
		spatialRel: "esriSpatialRelIntersects",
		outFields : "NOME",
		returnGeometry : false,
		returnTrueCurves: false,
		outSR: 102100,
		returnIdsOnly: false,
		returnCountOnly: false,
		returnZ: false,
		returnM: false,
		returnDistinctValues: false,
		f: "pjson"
	},
	headers: {
		'Content-Type':'text/plain;charset=utf-8'
	},
	json: true,
	proxy: 'http://proxy3.pmpa.ad:3128/'
	//encoding: null

}, (error, res, body) => {
	if (error){
		console.error(error)
		//return
	} else 
	{
		//console.log(res);
		//console.log(body);
		//console.log(typeof body);
		console.log(body.features[0].attributes.NOME);
		console.log(typeof body.features[0].attributes.NOME);
		parsing.setarbairro(ramalref, body.features[0].attributes.NOME);
		//secondCall(body.features[0].geometry);
	}
	//console.log('statusCode: ${res.statusCode}')
	//Lendo Synchronous, vou trocar para Asynchronous e comentar
	
});
}

