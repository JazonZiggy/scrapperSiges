const request = require ('request');
const rp = require ('request-promise');
const cheerio = require('cheerio');
var parsing = require('./parsingJson.js');

var ramal = 19;
var linkget = "http://pmpa-geo-wadap.pmpa.ad/arcgis/rest/services/DMAE/TM_POA_Mapa_Base_de_Porto_Alegre_DMAE_Comercial/MapServer/1/query";
var linkget2 = "http://pmpa-geo-wadap.pmpa.ad/arcgis/rest/services/DMAE/TM_POA_Mapa_Base_de_Porto_Alegre_DMAE_Apoio/MapServer/8/query"
//getBairro(ramal);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Primeiro request é para localizar o x e o y do ramal, segundo query é para localizar o bairro onde o mesmo se localiza.////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
		//console.log(body.features[0].geometry);

		//secondCall(ramalref, body.features[0].geometry);
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