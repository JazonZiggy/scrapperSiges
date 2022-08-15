const {exec} = require ("child_process");
var mailsender = require('./mailsender.js');
//var db =require('./db_connection.js');
const fs = require('fs');

//mail.talkqtd(2021, 02, 08, "jeison.molina@dmae.prefpoa.com.br");

module.exports.triggermail = function (firstdate, lastdate, mail)

{
	console.log(firstdate);
	console.log(lastdate);
	var anoInicial = firstdate.slice(0,4);
	console.log(anoInicial);
	var mesInicial = firstdate.slice(5,7);
	console.log(mesInicial);
	var diaInicial = firstdate.slice(8,10);
	console.log(diaInicial)
	var anoFinal = lastdate.slice(0,4);
	var mesFinal = lastdate.slice(5,7);
	var diaFinal = lastdate.slice(8,10); 

	mailsender.talkqtd(anoInicial, mesInicial, diaInicial, anoFinal, mesFinal, diaFinal, mail)
}

module.exports.triggersegundavia = function (ramal)

{
	
	mailsender.talksegundavia(ramal)
}

module.exports.triggercontas = function (firstdate, lastdate, mail)

{
	/*console.log(firstdate);
	console.log(lastdate);
	var anoInicial = firstdate.slice(0,4);
	console.log(anoInicial);
	var mesInicial = firstdate.slice(5,7);
	console.log(mesInicial);
	var diaInicial = firstdate.slice(8,10);
	console.log(diaInicial)
	var anoFinal = lastdate.slice(0,4);
	var mesFinal = lastdate.slice(5,7);
	var diaFinal = lastdate.slice(8,10); */

	mailsender.talkcontas(firstdate, lastdate, mail)
}

module.exports.triggerarrecadado = function (mail)

{
	
	mailsender.backplanilha(mail)
}

module.exports.triggercancel = function (mail, fone)

{
	
	mailsender.backcancel(mail, fone)
}
