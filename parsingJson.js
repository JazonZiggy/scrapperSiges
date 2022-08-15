const fs = require('fs')

const divida = require('./dividalancamentos.js')

//var cdlfinder = require('./cdlfinder.js');
var db =require('./db_connection.js');

var actualSession ;


fs.readFile('./session.JSON', 'utf8',  (err,jsonString) => {
	if (err)  {
		console.log("File read failed:", err)
		return
	}
	try {
		const session = JSON.parse(jsonString)
		actualSession = session;
		//console.log(session);
		//console.log ('Sessão: ', session[0].sessionID);
		//console.log(session[0].lancamentos[0]);
		actualSession.push({"sessionID":"3","ramal": "3", "dividavencida":"777,77", "dividavencer":"777,77"});
		//console.log(actualSession.lenght);
		//console.log("Nova sessão: ", actualSession[2].sessionID);
	} catch(err)
	{
		console.log('Error parsing JSON string', err)
	}

	//console.log('File data:', jsonString)
})

module.exports.searchRamal = function(ramalref)
{
	//console.log("chegando aqui mas nao no for");
	//console.log(actualSession.length);

	var lengthRef = Object.keys(actualSession).length;
	//console.log(lengthRef);

	for(var i=0; i<lengthRef; i++)
	{
		if(actualSession[i].ramal == ramalref)
		{
			console.log("achou ramal na posicao ", +i);
			//console.log(actualSession[i]);
			//console.log(actualSession[i].lancamentos);
			//actualSession[i].codbarras = ;
			//console.log(actualSession[i]);
			return actualSession[i];

		}else 
		{
			console.log("nao achou ramal na posicao", +i);
		}
	}
}

module.exports.setarcodigobarras = function(ramalref, codigo, datavencimentoref, valorref, sessionref)
{
	//console.log("chegando aqui mas nao no for");
	//console.log(actualSession.length);
	console.log("Adiciona o código de barras no banco de dados do Ramal"+ ramalref);
	//var lengthRef = Object.keys(actualSession).length;
	//console.log(lengthRef);
	db.codbarras(ramalref,codigo,datavencimentoref,valorref,sessionref);
	
	/*for(var i=0; i<lengthRef; i++)

	}*/
}

module.exports.setarbairro = function(ramalref, bairro)
{
	//console.log("chegando aqui mas nao no for");
	//console.log(actualSession.length);

	db.updatebairro(ramalref, bairro);
}



module.exports.pushingRamal = function (sessionRef, ramalref, dividavencidaRef, dividavencerRef, situacaoRef, complengthRef, objectarrayRef, enderecoRef, numeroRef, bairroRef)
{
	//Aqui é as informações sobre a sessão atual
	//actualSession.push({"sessionID": ""+sessionRef, "ramal": "" +ramalref, "dividavencida": ""+ dividavencidaRef, "dividavencer": "" +dividavencerRef, "situacao": "" +situacaoRef,"competencias": ""+complengthRef, "lancamentos": objectarrayRef, "codbarras": '',"datavencimento":"","valorultima":"", "enderecoRef" : ""+enderecoRef, "numeroRef" : ""+numeroRef, "bairroRef": ""+bairroRef });
	//actualSession.lancamentos = objectarrayRef;
	//console.log(actualSession);
	//var session = sessionRef;
	//var lastsession = session.substr(session.length - 12);
	console.log("ATUALIZA INFORMAÇÕES NO BANCO DE DADOS")
	db.search(sessionRef, ramalref, dividavencidaRef, dividavencerRef, situacaoRef, complengthRef, enderecoRef, numeroRef, bairroRef);

	//var values = 
	//console.log(actualSession.lancamentos[0].tipo);
}

module.exports.updateCoordinates = function (id, xmin, xmax, ymin, ymax)
{
	console.log("Update ID"+id+" XMIN: "+xmin+" XMAX: "+xmax+" YMIN: "+ymin+" YMAX: "+ymax)
	db.updatemap(id,xmin,xmax,ymin,ymax);
}

module.exports.closeconnection = function ()
{
	db.closecon();
}
