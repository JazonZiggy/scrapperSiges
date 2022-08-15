var mysql = require('mysql');
var segundaVia = require('./segundaVia.js');
var geodmae = require ('./geodmaeRest.js');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "central115",
  database: "whats",
  charset: "utf8mb4"
});

var databaseRef;

module.exports.search = function (sessionRef, ramalref, dividavencidaRef, dividavencerRef, situacaoRef, complengthRef, enderecoRef, numeroRef, bairroRef){
	con.connect(function(err) {

	  if (err) 
	  {
	  	console.log("Ja conectado");
	  }
	  var ramal = ''+ramalref;
	  var session = ''+sessionRef;
	  var sql = 'SELECT * FROM sessions WHERE ramal = ' + mysql.escape(ramal)+'AND  session = '+mysql.escape(session);
	  con.query(sql, function (err, result) {
	    if (err)
	    {
	    	console.log(err);
	    }
	    console.log(result);
	    if (result == '')
	    {
	    	console.log('Não tem nada, favor inserir dados no banco')
	    	insertDatabase(sessionRef, ramalref, dividavencidaRef, dividavencerRef, situacaoRef, complengthRef, enderecoRef, numeroRef, bairroRef);
	    	//segundaVia()
	    } else {
	    	console.log("Achou algo, verificar a data");
	    	if (checkdate(ramal, result[0].data))
	    	{
	    		updateDatabase(sessionRef, ramalref, dividavencidaRef, dividavencerRef, situacaoRef, complengthRef, enderecoRef, numeroRef, bairroRef);
	    		
	    	} else 
	    	{
	    		console.log("Do nothing");
	    	}
	    }


	  });
	});

}

function checkdate(ramalref, data)
{
	var d = new Date().setHours(0,0,0,0);
	//d = d.setHours(0,0,0,0);
	console.log(d);
	console.log(typeof d);
	console.log(data);
		//console.log(typeof result)
		console.log(data.setHours(0,0,0,0));
		if (d>data.setHours(0,0,0,0))
		{
			console.log("DATA inserida maior");
			return true;
		} else {
			console.log("DATA inserida igual ou menor")
			return false;
		}

}

function insertDatabase (sessionRef, ramalref, dividavencidaRef, dividavencerRef, situacaoRef, complengthRef, enderecoRef, numeroRef, bairroRef)
{
	var d = new Date();
	//con.connect(function(err) {
  	//if (err) throw err;
		console.log("Connected!");
		var sql = "INSERT INTO sessions (session, ramal, dividavencida, dividavencer, situacao, competencias, logradouro, numero, bairro, data) VALUES ?";
		var values =[
		[sessionRef, ramalref, dividavencidaRef, dividavencerRef, situacaoRef, complengthRef, enderecoRef, numeroRef, bairroRef, d]
		];
		con.query(sql, [values], function (err, result) {
		    if (err){
		    	console.log(err);
		    }else 
		    {
		    	console.log("Number of records inserted: " + result.affectedRows);
		    console.log(result)
		    segundaVia.segundaViaRamal(ramalref, sessionRef);
		    //geodmae.getBairro(ramalref);
		    }
		    
	  });
	//});
}

function updateDatabase(sessionRef, ramalref, dividavencidaRef, dividavencerRef, situacaoRef, complengthRef, enderecoRef, numeroRef, bairroRef)
{
	var d = new Date();
	var diatemp = d.getDate();
	var mestemp = d.getMonth()+1;
	var anotemp = d.getFullYear();
	console.log(d);
	//con.connect(function(err) {
  	//if (err) throw err;
		console.log("Connected!");
		//PAREI AQUI, problemas dando update nas datas...
		var sql = "UPDATE sessions SET session = '"+sessionRef+"'"+", dividavencida = '"+dividavencidaRef+"'"+" ,dividavencer = '"+dividavencerRef+"'"+" ,situacao = '"+situacaoRef+"'"+" ,diaultima = '"+diatemp+"'"+" ,mesultima = '"+mestemp+"'"+" ,anoultima = '"+anotemp+"'"+" WHERE ramal = "+''+ramalref+' AND  session = "'+sessionRef+'"'; 
		console.log("TESTE DIA ULTIMO CONTATO");
		console.log ("Contato foi "+d.getDate());
		con.query(sql,  function (err, result) {
		    if (err){
		    	console.log(err);
		    } else 
		    {
		    	console.log("Number of records inserted: " + result.affectedRows);
		    	segundaVia.segundaViaRamal(ramalref, sessionRef);
		    	//geodmae.getBairro(ramalref);
		    }
	  });
	//});
}

module.exports.updatebairro = function(ramalref, bairroRef)
{
	console.log("Atualizando bairro do usuario no banco de dados");

	var sql = "UPDATE sessions SET bairro ='"+bairroRef+"' WHERE ramal ="+ramalref;
	con.query(sql, function (err, result) {
    if (err) 
    {
    	console.log(err)
    }
    console.log(result.affectedRows + " record(s) updated");
});
}


module.exports.codbarras = function (ramalref, codigo, datavencimentoref, valorref, sessionref)
{
	console.log(codigo);
	var sql = "UPDATE sessions SET codbarras = '"+codigo+"'"+", datavencimento = '"+datavencimentoref+"'"+" ,valorultima = '"+valorref+"'"+" WHERE ramal = "+''+ramalref+' AND  session = "'+sessionref+'"'; 
	con.query(sql, function (err, result) {
    if (err) 
    {
    	console.log(err)
    }
    console.log(result.affectedRows + " record(s) updated");
  ///  console.log(result)
  });
}



module.exports.returninfo = function (ramalref, sessionRef)
{

	var sql = "SELECT * FROM sessions WHERE ramal = "+''+ramalref+' AND  session = "'+sessionRef+'"'; 
	var ref;
	return new Promise((resolve, reject) =>{
		console.log("Primeiro Passo, checar o query do Database");
		con.query(sql, function (err, result) {
	    if (err) 
	    {
	    	console.log("Ramal não encontrado");
	    	return err;
	    }
	    console.log("Segundo passo, rodar no meio");
	   // console.log(result);
	    resolve(result);

		})
	}).then(result => {
		
		console.log("UltimoPasso");
		//message;
		return result;
	});
}

module.exports.message = function (session, messageId, menuId =null, titulo=null)
{
	var sql;
	if (menuId){
		sql = "SELECT * FROM messages WHERE messageId = "+messageId+" AND menuId = "+menuId;
	} else if (messageId) {
		sql = "SELECT * FROM messages WHERE messageId = "+messageId+" AND menuId IS NULL";
	} else {
		sql = "SELECT * FROM messages WHERE titulo = '"+titulo+"'";
	}
	 
	return new Promise((resolve, reject) =>{
		console.log("Primeiro Passo, checar o query do Database");
		con.query(sql, function (err, result) {
	    if (err) 
	    {
	    	console.log("Ramal não encontrado");
	    	return err;
	    }
	    console.log("Segundo passo, rodar no meio");
	    console.log(result);
	    resolve(result);

		})
	}).then(result => {
		includeTrack(session, result[0].titulo)
		console.log("UltimoPasso");
		//message;
		return result;
	});
}

function includeTrack(id, titulo){

	var sql = "SELECT * FROM sessions WHERE session = '"+id+"'";
		console.log("TESTE DIA ULTIMO CONTATO");
		//console.log ("Contato foi "+d.getDate());
		con.query(sql,  function (err, result) {
		    if (err){
		    	console.log(err);
		    } else 
		    {
				lastsession = result[result.length-1]
				console.log(lastsession)
				var idRef
				if (lastsession){
					idRef= lastsession.id
				} else {
					idRef = null;
				}
		    	console.log("Number of records inserted: " + result.affectedRows);
				var sql2 = "INSERT INTO trackoptions (idSession, titulo) VALUES ?"
				var values = [
					[idRef, titulo ] 
					];

					con.query(sql2, [values], function (err, result) {
						if (err){
							console.log(err);
						}else 
						{
						console.log("Number of records inserted: " + result.affectedRows);
						console.log(result)
						console.log("************************************************************************");
						console.log("*ATUALIZADO CONTATO PARA INFORMAÇÕES SOBRE OPÇÃO ESCOLHIDA PELO USUARIO*");
						console.log("************************************************************************");
					   // segundaVia.segundaViaRamal(ramalref);
					   // geodmae.getBairro(ramalref);
		    	//geodmae.getBairro(ramalref);
		    			}
					})
	  		}
		});

}



module.exports.estatisticasegundavia = function(inicio,fim)
{
	console.log("Solicitando informações sobre segundas vias encaminhadas entre os dias "+inicio+" "+fim )
	var sql = "SELECT DISTINCT ramal, data, valor from segundavia where data between "+"'"+inicio+"'"+" AND "+"'"+fim+"'";
	return new Promise((resolve, reject) =>{
		console.log("Primeiro Passo, checar o query do Database");
		con.query(sql, function (err, result) {
	    if (err) 
	    {
	    	console.log(err);
	    	return err;
	    }
	    console.log("Segundo passo, rodar no meio");
	   // console.log(result);
	    resolve(result);

		})
	}).then(result => {
		
		console.log("UltimoPasso");
		//message;
		return result;
	});
}


module.exports.returndividavencida = function (ramalref, sessionref)
{
	console.log("Chegamos aqui");
	var sql = "SELECT * FROM sessions WHERE ramal = "+''+ramalref+' AND  session = "'+sessionref+'"'; 
	con.query(sql, function (err, result) {
    if (err) 
    {
    //	console.log("Ramal não encontrado");
    }
   // console.log(result.dividavencida);
    return result[0].dividavencida;
  });

}

function dataUpdate(data)
{
	databaseRef = data;
}

module.exports.estatistica = function(anoI, mesI, diaI, anoF, mesF, diaF)
{
	//Isso tem que criar o arquivo txt, mas como faço isso
	//var mesultimoref = mes+1;
	//temporario enquanto o mes é 0 ou 1, a partir de fevereiro tenho q trocar sql
	var sql = "SELECT COUNT(id) AS countID FROM sessions WHERE diaultima >='"+diaI+"' AND diaultima <='"+diaF+"' AND  mesultima ='"+mesF+"' AND anoultima  = '"+anoI+"' OR data >='"+anoI+"-"+mesI+"-"+diaI+"' AND data <='"+anoF+"-"+mesF+"-"+diaF+"'";
	var ref;
	return new Promise((resolve, reject) =>{
		console.log("Primeiro Passo, checar o query do Database");
		con.query(sql, function (err, result) {
	    if (err) 
	    {
	    	console.log(err);
	    	return err;
	    }
	    console.log("Segundo passo, rodar no meio");
	   // console.log(result);
	    resolve(result);

		})
	}).then(result => {
		
		console.log("UltimoPasso");
		//message;
		return result;
	});
}


module.exports.updateFalta = function(resultref, bairroListRef, lengthRef, enderecoRef, numeroRef )
{
	var datapo = new Date();
	var bairroList = bairroListRef;
	console.log("Executa atualização de banco de dados de ramais com falta de agua");
	console.log("*****************************************************************\n");
	console.log(resultref);
	console.log("*****************************************************************\n");
	console.log("Lista de Bairros com falta de agua");
	console.log(bairroList);

	//var where = returnBairro(resultref[0].bairro, lengthRef, enderecoRef, bairroListRef)
	//console.log("WHERE" + where);
	var sql = "INSERT INTO faltas (ramal, endramal, numero, session, endfalta, numfalta, bairro, datapo, falta) VALUES ?";
	var values = [
	[resultref[0].ramal, resultref[0].logradouro, resultref[0].numero, resultref[0].session, "0", "0" , resultref[0].bairro, datapo, "X"] 
	];
	/*if (where == -1)
	{
		console.log("Bairro não consta falta de agua")
	} else
	{*/
			con.query(sql, [values], function (err, result) {
		    if (err){
		    	console.log(err);
		    }else 
		    {
		    console.log("Number of records inserted: " + result.affectedRows);
		    console.log(result)
		    console.log("*********************************************************");
		    console.log("*ATUALIZADO CONTATO PARA INFORMAÇÕES SOBRE FALTA DE AGUA*");
		    console.log("*********************************************************");
		   // segundaVia.segundaViaRamal(ramalref);
		   // geodmae.getBairro(ramalref);
		    }
		    
	  });
	//}
	
}

module.exports.updatesegundaviadb = function(ramal, valor)
{
	var datapo = new Date();
	console.log("Executa atualização de banco de dados de segundas vias solicitadas no whats");
	console.log("*****************************************************************\n");
	//console.log()
	console.log("Ramal: "+ramal+ " Valor: "+valor);
	console.log("*****************************************************************\n");
	console.log("Ramal e valor da segunda via");
	//console.log(bairroList);

	//var where = returnBairro(resultref[0].bairro, lengthRef, enderecoRef, bairroListRef)
	//console.log("WHERE" + where);
	var sql = "INSERT INTO segundavia (Ramal, Data, Valor) VALUES ?";
	var values = [
	[ramal, datapo, valor] 
	];
	/*if (where == -1)
	{
		console.log("Bairro não consta falta de agua")
	} else
	{*/
			con.query(sql, [values], function (err, result) {
		    if (err){
		    	console.log(err);
		    }else 
		    {
		    console.log("Number of records inserted: " + result.affectedRows);
		    console.log(result)
		    console.log("*********************************************************");
		    console.log("*ATUALIZADO CONTATO PARA INFORMAÇÕES SOBRE SEGUNDA VIA*");
		    console.log("*********************************************************");
		   // segundaVia.segundaViaRamal(ramalref);
		   // geodmae.getBairro(ramalref);
		    }
		    
	  });
	//}
	
}

function returnBairro(bairroRef, lengthRef, enderecoRef, bairroListRef)
{
	console.log("Teste referente a pesquisa de bairros na lista de falta");
    var bairro = bairroRef;
    var length = lengthRef;
    var bairroList = bairroListRef;
    var enderecoList = enderecoRef;
    var where = -1;
    var conserto = false;

    for (var i =0; i<=length; i++)
    {
      if (bairroList[i].includes(bairro))
      {
      	where = i;
        console.log(bairro+" Está na lista: "+bairroList[i]);
        console.log("Conserto no endereço: "+enderecoList[i]);
        conserto =true;
        i = length;
      }
    }

    
    return where;

    //console.log(falta);
    //console.log(falta[0]);
    //console.log(typeof falta[0]);
    //agent.add("Teste concluido");
}

module.exports.updatemap = function(id, xmin, xmax, ymin, ymax) 
{
	console.log("Update Banco")

	con.connect(function(err) {

	  if (err) 
	  {
	  	console.log("Ja conectado");
	  }
	  
	  var sql = 'SELECT * FROM geomaps WHERE id = ' + mysql.escape(id);
	  con.query(sql, function (err, result) {
	    if (err)
	    {
	    	console.log(err);
	    }
	    console.log(result);
	    if (result == '')
	    {
	    	console.log('Não tem nada, favor inserir dados no banco')
	    	//con.end();
	    	insertGeoBase(id,xmin,xmax,ymin,ymax);
	    	//segundaVia()
	    } else {
	    	console.log("Achou algo, verificar a data");
	    	//con.end();
	    	updateGeoBase(id,xmin,xmax,ymin,ymax);
	    
	    }


	    });
	});

}

function insertGeoBase(id, xmin, xmax, ymin, ymax)

{
	

	con.connect(function(err) {

	  if (err) 
	  {
	  	console.log("Ja conectado");
	  }

	console.log("INSERIR ID: "+id+" "+xmin+" "+xmax+" "+ymin+" "+ymax)
	var sql = "INSERT INTO geomaps (id, xmin, xmax, ymin, ymax) VALUES ?";
	var values =[
	[id, xmin, xmax, ymin, ymax]
	];
	con.query(sql, [values], function (err, result) {
	    if (err){
	    	console.log(err);
	    }else 
	    {
	    console.log("Number of records inserted: " + result.affectedRows);
	    console.log(result);
	    console.log("CONSEGUI INSERIR ID: "+id+" "+xmin+" "+xmax+" "+ymin+" "+ymax)
	    //con.end();
	    }
	    
	});
});
	
}

function updateGeoBase(id, xmin, xmax, ymin, ymax)
{
	con.connect(function(err) {

	  if (err) 
	  {
	  	console.log("Ja conectado");
	  }

	console.log("Connected!");
	console.log("INSERIR ID: "+id+" "+xmin+" "+xmax+" "+ymin+" "+ymax)
		//PAREI AQUI, problemas dando update nas datas...
		var sql = "UPDATE geomaps SET xmin = '"+xmin+"'"+", xmax = '"+xmax+"'"+" ,ymin = '"+ymin+"'"+" ,ymax = '"+ymax+"'"+" WHERE id = "+''+id;
		
		con.query(sql,  function (err, result) {
		    if (err){
		    	console.log(err);
		    } else 
		    {
		    	console.log("Number of records inserted: " + result.affectedRows);
		    	console.log("CONSEGUI INSERIR ID: "+id+" "+xmin+" "+xmax+" "+ymin+" "+ymax)
		    	//con.end();
		    	

		    }
	  });
	});
	
}

module.exports.closecon = function ()
{
	con.end();
}

/*con.connect(function(err) {

  if (err) throw err;
  con.query("SELECT * FROM customers WHERE address = 'Park Lane 381'", function (err, result) {
    if (err) throw err;
    console.log(result);
  });
});*/