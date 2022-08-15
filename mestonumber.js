module.exports.checkcomp = function(mes)
{
	var mesnumber;
	
	
	if (mes == "Jan")
	{
		mesnumber = 1;
	} else if (mes == "Fev")
	{
		mesnumber = 2;
	} else if (mes == "Mar")
	{
		mesnumber = 3;
	} else if (mes == "Abr")
	{
		mesnumber = 4;
	} else if (mes == "Mai")
	{
		mesnumber = 5;
	} else if (mes == "Jun")
	{
		mesnumber =6;
	} else if (mes == "Jul")
	{
		mesnumber = 7;
	} else if (mes == "Ago")
	{
		mesnumber = 8;
	} else if (mes == "Set")
	{
		mesnumber = 9;
	} else if (mes == "Out")
	{
		mesnumber = 10;
	} else if (mes == "Nov")
	{
		mesnumber = 11;
	} else if (mes == "Dez")
	{
		mesnumber =12;
	}
	//console.log (" O Mes de "+mes+" é equivalente ao "+mesnumber+"º mês do ano")
	return mesnumber;

}

module.exports.returnlimit = function (mes, ano, parcela)
{
	var retorno;
	var dif;
	var anos;
	console.log(parcela)
	console.log(mes);
	if (parcela <mes)
	{
		dif = mes-parcela;
		retorno = dif+"/"+ano;
		console.log ("O Parcelamento foi feito em "+ retorno);
		console.log("Primeira ETAPA");
		//return retorno;
	} else 
	{
		anos = Math.floor(parcela/12);
		var parcelaRef = (parcela-(anos*12));
		var anoRef;
		if (parcelaRef<mes)
		{
			dif = mes-parcelaRef;
			anoRef = ano-anos;
			retorno = dif+"/"+anoRef;
			console.log ("O Parcelamento foi feito em "+ retorno);
			console.log("Segunda ETAPA");
			//return retorno;
		} else
		{
			dif = mes-parcelaRef+12;
			anoRef = ano-anos-1;
			retorno = dif+"/"+anoRef;
			console.log ("O Parcelamento foi feito em "+ retorno);
			console.log("Terceira ETAPA");
			console.log(anos)
			console.log(parcelaRef)
		//	return retorno;
		}

	}

	return retorno;
}