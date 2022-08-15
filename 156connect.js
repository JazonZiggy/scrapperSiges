const request = require ('request');
const fs = require('fs');
const rp = require ('request-promise').defaults({ jar: true });
const cheerio = require('cheerio');
const parsing = require('./parsingJson.js')
const cookieParser = require('cookie-parser');



var requestp = request.defaults({jar: true})
var html = "https://acesso.poa.br/auth/realms/acessopoa/protocol/openid-connect/auth?client_id=156web&redirect_uri=https%3A%2F%2F156web.procempa.com.br%2F%2Fservicos%2Fagua-e-esgoto%2F4&state=c3a23ab8-498f-43c4-9b61-69ad55940ac7&response_mode=fragment&response_type=code&scope=openid&nonce=e49e12af-1567-491e-85e1-f8addd998dc8"

test156();

function test156(){

	request.get(html, {

		proxy: 'http://lproxy:3128/',
		headers : {
			'Accept-Encoding': "gzip,deflate,br"
		}
		//Authorization: login+":"+senha
		
		//cookie: "GA1.3.1941228563.1652881093"

	}, (error, res, body) => {
		if (error){
			console.error(error)
			console.log(body)
			//text = text+'\nerror';
			//return
			console.log("ERRROOOOOOOO")


		} else {
			console.log("conectado")
			console.log(res)
			console.log(body)
		}
	});

}

function generatecookie(login,password){
	request.post(html, {
		form: {
			login: login,
			senha: senha
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


		} else {
			console.log("conectado")
			console.log(res)
			console.log(body)
		}
	});

}