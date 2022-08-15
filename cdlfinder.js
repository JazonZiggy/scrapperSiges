const request = require ('request');
const fs = require('fs');
const rp = require ('request-promise');
const cheerio = require('cheerio');
const parsing = require('./parsingJson.js')



var link = "http://pmpa-geo-wadap.pmpa.ad/arcgis/rest/services/DMAE/TM_POA_Mapa_Base_de_Porto_Alegre_DMAE_Comercial/MapServer/1/query?f=json&where=(RAMAL = "
var link2= ")&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*&outSR=102100"
/*var logradouro= 'Av. Ipiranga';
var numero= '1200';*/
module.exports.cdlfinder = function(logradouro,numero)
{



request.get('https://cdlrest.procempa.com.br/cdlrest/rest/query/endereco?q='+logradouro+'&numero='+numero, {
	/*form: {
		servico: 'segundaVia',
		criterioIdentificacaoRamal: ramalref
	},*/
	headers: {
		'Content-Type':'application/json;charset=utf-8'
	},
	proxy: 'http://proxy.procempa.com.br:3128',
	encoding: 'binary'

}, (error, res, body) => {
	if (error){
		console.error(error)
		//return
	}
	console.log('statusCode: ${res.statusCode}')
	/*fs.writeFileSync("Logradouro.JSON", body, {
		encoding: 'binary'
	});*/
	var jsonRef = JSON.parse(body);
	console.log(jsonRef);
	console.log(typeof jsonRef);
	console.log(jsonRef[0].nomeBairro)
	return jsonRef[0].nomeBairro;
	//console.log(res);
});
}