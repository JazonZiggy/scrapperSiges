const request = require ('request');
const rp = require ('request-promise');
const cheerio = require('cheerio');
var parsing = require('./parsingJson.js');

var ramal = 19;

//console.log("Ti abri?")



//Preciso baxar 3 mapas, primeir url é o post do mapa das redes
var redesmap = "http://webadaptorgis.procempa.com.br/arcgis/rest/services/DMAE/TM_POA_Mapa_Base_de_Porto_Alegre_DMAE_Redes/MapServer/export"
//Segunda Variavael é o post do mapa dos ramais
var ramaismap = "http://webadaptorgis.procempa.com.br/arcgis/rest/services/DMAE/TM_POA_Mapa_Base_de_Porto_Alegre_DMAE_Comercial/MapServer/export"
//Terceiro mapa é o mapa dos logradouros.
var eixomap = "http://webadaptorgis.procempa.com.br/arcgis/rest/services/DMAE/TM_POA_Mapa_Base_de_Porto_Alegre_DMAE_Apoio/MapServer/export"


var findredesLink = "http://pmpa-geo-wadap.pmpa.ad/arcgis/rest/services/DMAE/TM_POA_Mapa_Base_de_Porto_Alegre_DMAE_Redes/MapServer/identify"



/*const options = {
    url: linkCDL,
    method: 'GET',
    headers: {
        'Content-Type' : 'application/x-www-form-urlencoded'
    },
    proxy : 'http://proxy3.pmpa.ad:3128/',
    json: true
};*/

module.exports.createmaps = function (xmin,xmax,ymin,ymax,id){
	console.log("Chama a função para criar os mapas após o fim do timer")
}


