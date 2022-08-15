//const {exec} = require ("child_process");
var mailsender = require('./mailsender.js');
//var db =require('./db_connection.js');
const fs = require('fs');
var db = require('./db_connection.js');

var text ="Ramal;Data;Divida data Solicitacao\n";
//Preciso organizar os resultados, e salvar em um bloco de textos

//ramal, telefone, segundavia, valor

module.exports.organizardados = function(result, mail)
{
	console.log(result);
	recursive(result, 0, mail);
}

function recursive(result, i, mail)
{
	//var count = i;
	//var lgth = result.length;
	//console.log("Total de segundas vias encaminhadas pelo whats no periodo informado: "+result.length) 
	console.log("Verificando e atualizando a posição "+i);
	console.log(result[i].ramal);
	console.log (i)
	console.log(result.length);
	//recursive(result, i+1)
	text = text+""+result[i].ramal+";"+result[i].data+";";
	if (result[i].valor == 10)
	{
		text = text+"checar\n"
	} else {
		text = text+result[i].valor
	}
	
	if (i <result.length-1)
	{
		
		recursive(result, i+1, mail)
	} else {
		fs.writeFile('./stats/dados.csv', text, function (err,data) {
			if (err) {
				console.log(err)
			}

			mailsender.backcontas(mail);
		})
	}
	




}