const {exec} = require ("child_process");
var db =require('./db_connection.js');
const fs = require('fs');
var tganexo = require('./triggeranexo.js');

//var test = "COUNT(id)"
function sendmail (mail, data, subject)
{
  exec("echo '"+data+"' | mail -a From:E-mail Origem -s '"+subject+"' "+mail, (error, stdout, stderr) => {
  if (error){
    console.log("errou");
    return;
  }
  if (stderr) {
    console.log("Outro erro");
    return;
  }
  console.log('stdout: ${stdout}');
})
}

function sendmailcancel (mail, fone)
{
  exec("echo '"+fone+"' | mail -a From:E-mail Origem -s 'Cancelamento de horario no Agendamento' "+mail, (error, stdout, stderr) => {
  if (error){
    console.log("errou");
    return;
  }
  if (stderr) {
    console.log("Outro erro");
    return;
  }
  console.log('stdout: ${stdout}');
})
}

function sendmailanexo (mail)
{
  exec("echo 'Em anexo dados solicitados' | mail -a From:E-mail Origem -s 'CSV' -A /var/www/html/NodeWebHook/stats/dados.csv "+mail, (error, stdout, stderr) => {
  if (error){
    console.log("errou");
    return;
  }
  if (stderr) {
    console.log("Outro erro");
    return;
  }
  console.log('stdout: ${stdout}');
})
}

function sendmailplanilha (mail)
{
  exec("echo 'Em anexo planilha com valor arrecadado' | mail -a From:E-mail Origem -s 'txt' -A /var/www/html/NodeWebHook/Academias0819.txt "+mail, (error, stdout, stderr) => {
  if (error){
    console.log("errou");
    return;
  }
  if (stderr) {
    console.log("Outro erro");
    return;
  }
  console.log('stdout: ${stdout}');
})
}

module.exports.talkqtd = function (anoI, mesI, diaI, anoF, mesF, diaF, mail)


{

  return db.estatistica(anoI, mesI, diaI, anoF, mesF, diaF).then(result => {
      if (result=='')
      {
        console.log("Pesquisa invalida ou nada localizado");
      }
      else {
        var text = "Total de conversas do dia "+diaI+"-"+mesI+"-"+anoI+" ate o dia "+diaF+"-"+mesF+"-"+anoF+": "+result[0].countID;
        console.log(text);
        fs.writeFileSync('./stats/'+anoF+'-'+mesF+'-'+diaF+'.txt', text);
        sendmail(mail, text, "Quantidade de conversas");
       // process.exit();
      }

      //agent.add(text)
    });
}


module.exports.talksegundavia = function (ramal)


{
  var text = "Encaminhar segunda via do valor total do ramal "+ramal
  //sendmail("jeison.molina@dmae.prefpoa.com.br", text, "Segunda via");
  sendmail("E-mail Destino", text, "Segunda via");
       
}

module.exports.talkcontas = function (inicio, fim, mail)


{


  //sendmail(mail, text, "Quantidade de faltas");
  return db.estatisticasegundavia(inicio,fim).then(result => {
      if (result=='')
      {
        console.log("Pesquisa invalida ou nada localizado");
      }
      else {
        //var text = "Total de conversas do dia "+diaI+"-"+mesI+"-"+anoI+" ate o dia "+diaF+"-"+mesF+"-"+anoF+": "+result[0].countID;
       // console.log(text);
        tganexo.organizardados(result, mail);
        
       // process.exit();
      }

      //agent.add(text)
    });
}

module.exports.backcontas = function (mail)
{
  sendmailanexo(mail)
}

module.exports.backplanilha = function (mail)
{
  sendmailplanilha(mail)
}

module.exports.backcancel = function (mail, fone)
{
  sendmailcancel(mail, fone)
}