const fs = require('fs')

var textRef = './nomeSugestao.txt'

//adicionatexto('teste');

module.exports.adicionanome = function(nome)
{
	console.log(textRef);
	var text;
	fs.readFile('./nomeSugestao.txt', function(err,data){
		if(err) throw err;
		text = data;
		text = text+nome+'\n';

		console.log(text);
		fs.writeFile('./nomeSugestao.txt', text, (err) => {
		if(err) throw err;
		console.log('Data written to file');
	});
});
	
}