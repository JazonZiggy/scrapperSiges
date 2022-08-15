
module.exports.getAno = function (){
	var data = new Date();
	//console.log("Eu entro aqui?")
	//console.log(data)
	//Recebe o mes de 0 a 11 e não como o esperado de 1 a 12
	var anoatual = data.getUTCFullYear();
	console.log("O ano é esse? "+anoatual)
	return anoatual;


}

module.exports.getMes = function (){
	var data = new Date();
	
	//console.log(data)
	//Recebe o mes de 0 a 11 e não como o esperado de 1 a 12
	var mesatual = data.getUTCMonth()+1;
	if (mesatual == 13){
		
		return 01;
	}
	//console.log("O Mes atual é"+mesatual)
	return mesatual;


}
////
//Retorna a competência Do mês passado em relação ao mes atual
////
module.exports.getComp = function (dif){
	var data = new Date();
	//console.log(data)
	//Recebe o mes de 0 a 11 e não como o esperado de 1 a 12
	var mesatual = data.getUTCMonth()-dif;
	var anoatual = data.getUTCFullYear().toString().slice(2,4);
	var anopassado = (data.getUTCFullYear()-1).toString().slice(2,4);


	if (mesatual == 0)
	{	
		
		var comp = "Dez/"+anopassado
		//console.log(comp);
		return comp;
		
	} else
	if (mesatual == 1)
	{	
		
		var comp = "Jan/"+anoatual
		//console.log(comp);
		return comp;
		
	}else
	if (mesatual == 2)
	{	
		
		var comp = "Fev/"+anoatual
		//console.log(comp);
		return comp;
		
	}else
	if (mesatual == 3)
	{	
		
		var comp = "Mar/"+anoatual
		//console.log(comp);
		return comp;
		
	}else
	if (mesatual == 4)
	{	
		
		var comp = "Abr/"+anoatual
		//console.log(comp);
		return comp;
		
	}else
	if (mesatual == 5)
	{	
		
		var comp = "Mai/"+anoatual
		//console.log(comp);
		return comp;
		
	}else
	if (mesatual == 6)
	{	
		
		var comp = "Jun/"+anoatual
		//console.log(comp);
		return comp;
		
	} else
	if (mesatual == 7)
	{	
		
		var comp = "Jul/"+anoatual
		//console.log(comp);
		return comp;
		
	}else
	if (mesatual == 8)
	{	
		
		var comp = "Ago/"+anoatual
		//console.log(comp);
		return comp;
		
	}else
	if (mesatual == 9)
	{	
		
		var comp = "Set/"+anoatual
		//console.log(comp);
		return comp;
		
	} else
	if (mesatual == 10)
	{	
		
		var comp = "Out/"+anoatual
		//console.log(comp);
		return comp;
		
	}else
	if (mesatual == 11)
	{	
		
		var comp = "Nov/"+anoatual
		//console.log(comp);
		return comp;
		
	}
	

}

