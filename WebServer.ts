const express = require('express')
const { WebhookClient } = require('dialogflow-fulfillment')
const app = express()
const numeral = require('numeral');
var formidable = require('formidable');
var mysql = require('mysql')
var fs = require('fs');
// Outros scripts
var testbairro = require('./meuBairro.js');
var bairroList = require('./FaltaBairros.js');
var timescript = require('./horario.js');
var dividatotal = require('./dividalancamentos.js');
var banquinho = require('./parsingJson.js');
var segundaVia = require('./segundaVia.js');
var intentText = require('./phrases.js');
//var findcdl = require('./cdlfinder.js');
var testearrecadado = require('./testechecagem2.js')

var nameSave = require('./namesave.js');
var db = require('./db_connection.js');
var tgmail = require('./triggermail.js');

//OPÇÃO DE SAIDA, apenas admin
function exit() {
  process.exit();
}

/*app.get('/', (req, res) => {
	
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  
});*/

app.use(express.static('public'));

app.get('/pos', (_req: any, res: { header: (arg0: string, arg1: string) => void; write: (arg0: string) => void; end: () => void; }) => {

  //res.send("BairroList") 
  res.header("Access-Control-Allow-Origin", "*");
  var textRef = "Bairros;Endereco;Numero;Situacao\n"
  console.log(bairroList.getlenght());
  for (let i: number = 0; i <= bairroList.getlenght(); i++) {
    //agent.add('Bairro: ' + bairroList.getbairros()[i]);
    //agent.add('Local do conserto: ' + bairroList.getenderecos()[i]);
    textRef = textRef + "(" + bairroList.getbairros()[i] + ");" + bairroList.getenderecos()[i] + ";" + bairroList.getnumeros()[i] + ";" + bairroList.getsituacao()[i] + '\n';
    //res.send(textRef)

  }
  res.write(textRef);
  res.end();

});

app.get('/json', (_req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: any): void; new(): any; }; }; end: () => void; }) => {

  //res.send("BairroList") 
  let jsonReference = fs.readFile("./data/phrases.json", {
    encoding: 'utf8'
  }, (err: any, data: string) => {
    if (err) { throw err; }
    console.log("Está tendo uma requisição no route /json")
    //res.header("Access-Control-Allow-Origin", "*");

    res.status(200).json(JSON.parse(data));
    res.end();

  });


});


app.post('/fileupload', (req: any, res: { send: (arg0: string) => void; }, _next: any) => {
  const formidable = require('formidable');
  const form = new formidable.IncomingForm();
  form.parse(req, (_err: any, _fields: any, files: { filetoupload: { path: any; name: any; }; }) => {

    const path = require('path');
    const oldpath = files.filetoupload.path;
    const newpath = path.join(__dirname, files.filetoupload.name);

    fs.rename(oldpath, newpath, (error: any) => {
      if (error) {
        console.log(error)
        res.send('Upload Error')
      } else {
        res.send("Encaminhado para checagem, Aguarde o retorno pelo e-mail")
        testearrecadado.ler();
        //Executar checagem
      }
    });


  });
});


app.post('/dialogflow', express.json(), (req: { body: { sessionId: any; session: { toString: () => string; }; queryResult: { queryText: string | any[]; }; }; }, res: any) => {
  const agent = new WebhookClient({ request: req, response: res })
  // var retornodafuncao;
  // console.log(agent.context.get);
  console.log(req.body.sessionId);
  console.log(req.body.session);


  //console.log(turno);
  function welcome(agent: { context: { delete: (arg0: string) => void; }; add: (arg0: string) => void; }) {
    var n: number = timescript.horario();
    agent.context.delete('ramalcadastra-followup');
    //agent.add('Welcome to my agent!');
    if (n >= 13 && n < 19) {
      agent.add('Boa Tarde!\nO DMAE  agradece o seu contato.\nPara prosseguir o atendimento, favor informe o número do Ramal para solicitações de serviços');
      console.log(n);
      //agent.add('Caso não possua o Ramal digite 9, porém algumas funções estarão indisponiveis.')
      //console.log('Boa Tarde');
    }
    else if (n < 13 && n > 6) {
      agent.add('Bom Dia!\nO DMAE agradece o seu contato.\nPara prosseguir o atendimento, favor informe o número do Ramal para solicitações de serviços');
      console.log(n);
      //agent.add('Caso não possua o Ramal digite 9, porém algumas funções estarão indisponiveis.')
      //console.log('Bom dia');
    }
    else {
      agent.add('Boa Noite!\nO DMAE agradece o seu contato.\nPara prosseguir o atendimento, favor informe o número do Ramal para solicitações de serviços');
      console.log(n);
      // agent.add('Caso não possua o Ramal digite 9, porém algumas funções estarão indisponiveis.')
      //  console.log('Boa noite');
    }
    //console.log(testbairro.getmyzone(19));
    agent.add('Caso não possua o número do ramal e deseja obter informações sobre Paradas Operacionais digite "Falta de Água"');
    agent.add('Para solicitar ligação nova de água informe "Ligação de Água"');
    agent.add('Para Informações sobre negociação da dívida ou parcelamento digite "Parcelamento"');
    //console.log('Bem-Vindo');
    //console.log(dividatotal.dividaramal(19));
  }

  function menu(agent: { parameters: { ramal: any; }; add: (arg0: any) => void; }) {
    var salvaRamal = agent.parameters.ramal;
    console.log("USUARIO INFORMA O NUMERO DO RAMAL DE AGUA " + salvaRamal);
    //console.log(agent.context.get('ramalcadastra-followup'))
    salvaRamal = salvaRamal.toString().replace('.', '');
    salvaRamal = salvaRamal.toString().replace('-', '');
    salvaRamal = salvaRamal.toString().replace('/', '');
    dividatotal.dividaramalassync(salvaRamal, req.body.session);
    //segundaVia.segundaViaRamal(salvaRamal);
    //db.search(salvaRamal);
    //agent.add()
    //console.log (salvaRamal);
    //findcdl.cdlfinder("Av. Ipiranga", "200");
    //console.log("consigo ti pegar ou nao?")
    //console.log(teste);
    //Resposta em FRASES

    //console.log(meuBairro.getmyzone(19))
    agent.add(intentText.menuRef());
    //console.log(intentText.menuRef());


    //agent.add('7⃣ - Perguntas Frequentes');

  }


  function faltasiges(agent: { context: { get: (arg0: string) => any; }; add: (arg0: string) => void; }) {
    //console.log(bairroList.getbairros());
    var i;
    var lenghtRef = bairroList.getlenght();
    var faltacontext = agent.context.get('ramalcadastra-followup');
    var ramalref = faltacontext.parameters.ramal;
    var sessionref = req.body.session.toString();
    //var infos = banquinho.searchRamal(faltacontext.parameters.ramal);
    //var falta = false;
    ramalref = ramalref.toString().replace('.', '');
    ramalref = ramalref.toString().replace('-', '');
    ramalref = ramalref.toString().replace('/', '');
    //console.log(agent.context.get('ramalcadastra-followup'))
    //console.log(typeof lenghtRef);
    //console.log(infos);
    var textRef = "";




    // agent.add("Seu bairro é "+testbairro.getmyzone(infos.ramal));
    for (i = 0; i <= lenghtRef; i++) {
      //agent.add('Bairro: ' + bairroList.getbairros()[i]);
      //agent.add('Local do conserto: ' + bairroList.getenderecos()[i]);
      if (bairroList.getsituacao()[i] === 1) {
        //if (bairroList.getbairros()[i] == infos.bairroRef)
        // {
        textRef = textRef + 'Bairro(s): ' + bairroList.getbairros()[i] + '\nLocal do conserto: ' + bairroList.getenderecos()[i] + '\nSituação: Serviço em execução\n\n'
        // falta =true;
        // }

      } else if (bairroList.getsituacao()[i] === 2) {
        // if (bairroList.getbairros()[i] == infos.bairroRef)
        //  {
        textRef = textRef + 'Bairro(s): ' + bairroList.getbairros()[i] + '\nLocal do conserto: ' + bairroList.getenderecos()[i] + '\nSituação: Serviço concluido em fase de normalização\n\n'
        //  falta=true;
        //}
        //  
        //agent.add('Serviço concluido em fase de normalização')
      } else if (bairroList.getsituacao()[i] === 3) {
        //agent.add('Serviço programado para execução nos próximos dias');
        //if (bairroList.getbairros()[i] == infos.bairroRef)
        // {
        textRef = textRef + 'Bairro(s): ' + bairroList.getbairros()[i] + '\nLocal do conserto: ' + bairroList.getenderecos()[i] + '\nSituação: Serviço programado para execução nos próximos dias\n\n'
        //falta=true;
        // }

      }

    }

    //Esse comentario é para informações, utilizando o siges
    agent.add(textRef);
    if (i <= 0) {
      agent.add('O DMAE não apresenta nenhum conserto no momento');
      agent.add('Para verificar outras possibilidades do que pode ter ocorrido, informe "Outro"');
    } else {
      agent.add('Caso o seu bairro não esteja entre os citados acima digite "Outro" ');
      agent.add('Para retornar ao menu inicial basta informar o número do Ramal')
    }
    var bairroListarr = bairroList.getbairros();


    //agent.context.delete('ramalcadastra-followup');
    //agent.add('Caso o seu bairro não esteja entre os citados acima digite "Outro" ');
    return db.returninfo(ramalref, sessionref).then((result: string) => {
      if (result == '') {
        console.log("****************************************************\n");
        console.log("*Ramal" + ramalref + " não localizado no banco de dados*\n");
        console.log("****************************************************\n");
      }
      else {
        console.log("Ramal localizado")
        db.updateFalta(result, bairroListarr, bairroList.getlenght(), bairroList.getenderecos(), bairroList.getnumeros());
      }

    });



  }

  function faltasiges2(agent: { context: { get: (arg0: string) => any; }; add: (arg0: string) => void; }) {
    //console.log(bairroList.getbairros());
    var i;
    var lenghtRef = bairroList.getlenght();
    var faltacontext = agent.context.get('ramalcadastra-followup');
    // var ramalref = faltacontext.parameters.ramal;
    var sessionref = req.body.session.toString();
    //var infos = banquinho.searchRamal(faltacontext.parameters.ramal);
    //var falta = false;
    /* ramalref = ramalref.toString().replace('.', '');
     ramalref = ramalref.toString().replace('-', '');
     ramalref = ramalref.toString().replace('/', '');*/
    //console.log(agent.context.get('ramalcadastra-followup'))
    //console.log(typeof lenghtRef);
    //console.log(infos);
    var textRef = "";




    // agent.add("Seu bairro é "+testbairro.getmyzone(infos.ramal));
    for (i = 0; i <= lenghtRef; i++) {
      //agent.add('Bairro: ' + bairroList.getbairros()[i]);
      //agent.add('Local do conserto: ' + bairroList.getenderecos()[i]);
      if (bairroList.getsituacao()[i] === 1) {
        //if (bairroList.getbairros()[i] == infos.bairroRef)
        // {
        textRef = textRef + 'Bairro(s): ' + bairroList.getbairros()[i] + '\nLocal do conserto: ' + bairroList.getenderecos()[i] + '\nSituação: Serviço em execução\n\n'
        // falta =true;
        // }

      } else if (bairroList.getsituacao()[i] === 2) {
        // if (bairroList.getbairros()[i] == infos.bairroRef)
        //  {
        textRef = textRef + 'Bairro(s): ' + bairroList.getbairros()[i] + '\nLocal do conserto: ' + bairroList.getenderecos()[i] + '\nSituação: Serviço concluido em fase de normalização\n\n'
        //  falta=true;
        //}
        //  
        //agent.add('Serviço concluido em fase de normalização')
      } else if (bairroList.getsituacao()[i] === 3) {
        //agent.add('Serviço programado para execução nos próximos dias');
        //if (bairroList.getbairros()[i] == infos.bairroRef)
        // {
        textRef = textRef + 'Bairro(s): ' + bairroList.getbairros()[i] + '\nLocal do conserto: ' + bairroList.getenderecos()[i] + '\nSituação: Serviço programado para execução nos próximos dias\n\n'
        //falta=true;
        // }

      }

    }

    //Esse comentario é para informações, utilizando o siges
    agent.add(textRef);
    if (i <= 0) {
      agent.add('O DMAE não apresenta nenhum conserto no momento');
      //agent.add('Para verificar outras possibilidades do que pode ter ocorrido, informe o número do seu ramal');
    } else {
      //agent.add('Caso o seu bairro não esteja entre os citados acima digite "Outro" ');
      //agent.add('Para retornar ao menu inicial basta informar o número do Ramal')
    }
    var bairroListarr = bairroList.getbairros();


    //agent.context.delete('ramalcadastra-followup');
    //agent.add('Caso o seu bairro não esteja entre os citados acima digite "Outro" ');
    /*return db.returninfo(0, sessionref).then(result => {
      if (result=='')
      {
        console.log("****************************************************\n");
        console.log("*Ramal  não informado no banco de dados*\n");
        console.log("****************************************************\n");
      }
      else {
        console.log("Ramal localizado")
        db.updateFalta(result, bairroListarr, bairroList.getlenght(), bairroList.getenderecos(), bairroList.getnumeros());
      }
      
    });*/



  }



  function meuBairro(agent: { add: (arg0: string) => void; }) {
    agent.add("")
    //console.log()
  }


  function loadingRamal(agent: { add: (arg0: any) => void; context: { get: (arg0: string) => any; }; }) {

    //Resposta em frases
    agent.add(intentText.loadingRamal());
    //console.log(agent.context.get('ramalcadastra-followup'))

    var dividacontext = agent.context.get('ramalcadastra-followup');
    //  segundaVia.segundaViaRamal(dividacontext.parameters.ramal);
  }

  function detalhado(agent: { add: (arg0: string) => void; context: { get: (arg0: string) => any; }; }) {
    agent.add("Lista detalhada de lançamentos vencidos:")
    var dividacontext = agent.context.get('ramalcadastra-followup');
    //console.log(agent.context.get('ramalcadastra-followup'))
    //console.log(typeof dividacontext);

    //console.log(dividacontext);
    //console.log(dividacontext.parameters.ramal);
    var infos = banquinho.searchRamal(dividacontext.parameters.ramal);
    //Verificar quantas paginas de lançamentos e informar de 5 em 5 ou 10 em 10, a ver
    var lengthvencidas = Object.keys(infos.lancamentos).length;
    //console.log(infos.competencias);
    //console.log(infos.competencias);
    if (infos) {


      if (infos.competencias <= 10) {
        if (infos.competencias == 0) {
          console.log(infos.competencias);
          agent.add("Nenhum lançamento vencido em aberto");
        }
        for (var i = 0; i < lengthvencidas; i++) {
          var text;
          text = "Mês Competência: " + infos.lancamentos[i].competencia;
          text = text + "\nVencimento em: " + infos.lancamentos[i].datasit;
          text = text + "\nTipo de lançamento: " + infos.lancamentos[i].tipo;
          text = text + "\nComposição de valores";

          //console.log(infos.lancamentos.competencia);
          //console.log(parseFloat(infos.lancamentos[i].correcao))
          //String to Float AQUI

          var aguaservRef = infos.lancamentos[i].aguaserv.replace('.', '');
          aguaservRef = parseFloat(aguaservRef.replace(',', '.'));
          var esgotoRef = infos.lancamentos[i].esgoto.replace('.', '');
          esgotoRef = parseFloat(esgotoRef.replace(',', '.'));
          var correcaoRef = infos.lancamentos[i].correcao.replace('.', '');
          correcaoRef = parseFloat(correcaoRef.replace(',', '.'));
          var jurosRef = infos.lancamentos[i].juros.replace('.', '');
          jurosRef = parseFloat(jurosRef.replace(',', '.'));
          var multaRef = infos.lancamentos[i].multa.replace('.', '');
          multaRef = parseFloat(multaRef.replace(',', '.'));



          //console.log(parseFloat(aguaservRef));
          //var 



          if (aguaservRef > 0) {
            //console.log("cheguei");
            if (infos.lancamentos[i].tipo === 'consumo') {
              text = text + "\nAgua: R$ " + infos.lancamentos[i].aguaserv;

            } else {
              text = text + "\nServiço: R$ " + infos.lancamentos[i].aguaserv;
            }

          }
          if (esgotoRef > 0) {
            text = text + "\nEsgoto: R$ " + infos.lancamentos[i].esgoto;
          }
          if (correcaoRef > 0) {
            text = text + "\nCorrecao Monetaria: R$ " + infos.lancamentos[i].correcao;
          }
          if (jurosRef > 0) {
            text = text + "\nJuros: R$ " + infos.lancamentos[i].juros;
          }
          if (multaRef > 0) {
            text = text + "\nMulta: R$ " + infos.lancamentos[i].multa;
          }
          var total = aguaservRef + esgotoRef + correcaoRef + jurosRef + multaRef;
          var arredonda = parseFloat(total.toFixed(2));
          //numeral this
          //var stringify = numeral(total).format('0,0.00');



          text = text + "\nValor total do Lançamento: R$ " + arredonda;
          //console.log(i);
          //console.log(lengthvencidas)
          if (i === lengthvencidas - 1) {
            text = text + '\n\nCaso queira o código de barras da ultima conta disponivel digite "Segunda Via"';
          }
          //text = text+'\n\nCaso queira o código de barras da ultima conta disponivel digite "Segunda Via"';

          agent.add(text);

        }
      } else {
        //console.log("Mais do que 10 lançamentos em aberto, configurar mostrar em paginas");
        agent.add("Mais do que 10 competências em aberto, verificar no site do DMAE ou pelo 156 opção 2")
      }
    } else (agent.add("Ramal não localizado ou sistema fora do ar, favor entrar em contato no fone 156 opção 2"))


  }




  function divida(agent: { context: { get: (arg0: string) => any; }; add: (arg0: string) => void; }) {

    var dividacontext = agent.context.get('ramalcadastra-followup');
    //console.log(agent.context.get('ramalcadastra-followup'))
    //console.log(typeof dividacontext);
    //console.log(dividacontext);
    var text;
    //console.log(dividacontext.parameters.ramal);
    var infos = banquinho.searchRamal(dividacontext.parameters.ramal);
    var ramalref = dividacontext.parameters.ramal;
    ramalref = ramalref.toString().replace('.', '');
    ramalref = ramalref.toString().replace('-', '');
    ramalref = ramalref.toString().replace('/', '');
    var sessionref = req.body.session.toString();
    //var infosdb = db.returninfo(dividacontext.parameters.ramal);

    return db.returninfo(ramalref, sessionref).then((result: string | { situacao: string; }[]) => {
      if (result == '') {
        text = "O Ramal " + ramalref + " informado anteriormente não foi localizado no banco de dados ou sistema está fora do ar. \nFavor entrar em contato no fone 156 opção 2 caso não possua o número do ramal";
      }
      else {
        text = "Resumo do histórico de pagamentos";
        text = text + "\n\nEndereço: " + result[0].logradouro + ' ' + result[0].numero;
        text = text + "\nDivida vencida é: R$ " + result[0].dividavencida;
        text = text + "\nDivida a Vencer é: R$ " + result[0].dividavencer;
        text = text + '\nA Situação atual deste ramal é: ' + result[0].situacao;
        //text = text+'\n\nCaso queira o código de barras da ultima conta disponivel digite "Segunda Via"';
      }
      agent.add(text)
    });


    /* var text;
 
     //console.log(db.returndividavencida(dividacontext.parameters.ramal));
     if (infos)
     {
       text = "Resumo do histórico de pagamentos";
       text = text+"\n\nEndereço: "+infos.enderecoRef+ ' '+infos.numeroRef;
       text = text+"\nDivida vencida é: R$ "+dividateste; 
       text = text+"\nDivida a Vencer é: R$ "+infos.dividavencer;
       text = text+'\nA Situação atual deste ramal é: ' +infos.situacao;
       text = text+'\n\nCaso queira o código de barras da ultima conta disponivel digite "Segunda Via"';
     } else {
       text = "O Ramal "+dividacontext.parameters.ramal+" informado anteriormente não foi localizado no banco de dados ou sistema está fora do ar. \nFavor entrar em contato no fone 156 opção 2 ou através do Chat DMAE pelo link https://centraldmae.procempa.com.br/chat/";
     }
     agent.add(text);*/

  }

  function segundaViaIntent(agent: { context: { get: (arg0: string) => any; }; add: (arg0: string) => void; }) {

    var dividacontext = agent.context.get('ramalcadastra-followup');
    //console.log("Cheguei AQUI")
    //Provavelmente defasado variavel a baixo: infos
    var infos = banquinho.searchRamal(dividacontext.parameters.ramal);
    var ramalref = dividacontext.parameters.ramal;
    ramalref = ramalref.toString().replace('.', '');
    ramalref = ramalref.toString().replace('-', '');
    ramalref = ramalref.toString().replace('/', '');
    //console.log(agent.context.get('ramalcadastra-followup'))
    var text;
    var sessionref = req.body.session.toString();
    //console.log(infos.codbarras);
    /*if (infos.codbarras == '')
    {
      agent.add("Ultima conta não está disponivel para este ramal");
    } else
    {
      agent.add("Segue código de barras da ultima conta em aberto");
      agent.add("Código de barras ultima conta:");
      agent.add(infos.codbarras);
      agent.add("Data de Vencimento: " + infos.datavencimento)
      agent.add("Valor: "+infos.valorultima);
    }*/

    return db.returninfo(ramalref, sessionref).then((result: string | { valorultima: any; }[]) => {
      if (result == '' || result[0].codbarras == null) {
        text = "Ultima conta não está disponivel para este ramal";
      }
      else {
        text = "Segue código de barras da última conta em aberto do ramal ";
        text = text + ramalref;
        text = text + "\nCódigo de barras última conta:\n"
        text = text + result[0].codbarras;
        text = text + "\nData de Vencimento: " + result[0].datavencimento;
        text = text + "\nValor: " + result[0].valorultima;
        db.updatesegundaviadb(ramalref, result[0].valorultima);
        //tgmail.triggersegundavia(ramalref);
      }
      agent.add(text)
    });


  }

  function segundaViaFullIntent(agent: { context: { get: (arg0: string) => any; }; add: (arg0: string) => void; }) {

    var dividacontext = agent.context.get('ramalcadastra-followup');
    var textemail;
    //console.log("Cheguei AQUI")
    //Provavelmente defasado variavel a baixo: infos
    var infos = banquinho.searchRamal(dividacontext.parameters.ramal);
    var ramalref = dividacontext.parameters.ramal;
    ramalref = ramalref.toString().replace('.', '');
    ramalref = ramalref.toString().replace('-', '');
    ramalref = ramalref.toString().replace('/', '');
    //console.log(agent.context.get('ramalcadastra-followup'))
    var text;
    var sessionref = req.body.session.toString();

    text = "Solicitado emissão de 2ª Via dos valores em aberto para o ramal " + ramalref + "\n\n O prazo para recebimento da 2ª Via por este canal é de no maximo 2 dias úteis."
    //console.log(infos.codbarras);
    /*if (infos.codbarras == '')
    {
      agent.add("Ultima conta não está disponivel para este ramal");
    } else
    {
      agent.add("Segue código de barras da ultima conta em aberto");
      agent.add("Código de barras ultima conta:");
      agent.add(infos.codbarras);
      agent.add("Data de Vencimento: " + infos.datavencimento)
      agent.add("Valor: "+infos.valorultima);
    }*/
    textemail = "" + ramalref + " referente ao numero de telefone " + sessionref;
    agent.add(text);
    db.updatesegundaviadb(ramalref, 10);
    tgmail.triggersegundavia(textemail);


  }

  function resetServer(agent: { parameters: { firstdate: any; lastdate: any; }; add: (arg0: string) => void; }) {
    // console.log('Resetando Servidor');
    //agent.add("Resetando Servidor");
    //var agentRef = agent.context.get('Restart')
    var adm = "projects/whatsapp-raqiit/agent/sessions/+55519336-0474"
    var adm2 = "projects/whatsapp-raqiit/agent/sessions/+55519219-1842"
    var dataInicial = agent.parameters.firstdate;
    var dataFinal = agent.parameters.lastdate;

    console.log("ESSE É O LOG DO reqbody")
    console.log(req.body.queryResult.queryText)
    var intention = req.body.queryResult.queryText.slice(0, 6);
    console.log("Essa é a intenção: " + intention);
    console.log("ESSE é O LOG DOS PARAMETROS")
    console.log(agent.parameters)
    console.log("A data inicial informada foi : " + dataInicial);
    console.log("A data Final  informada foi : " + dataFinal);
    //Comando para gerar a segunda via Segunda via 2021-10-01 Fim 2021-10-31
    if (req.body.session.toString() === adm && intention === "Inicio") {
      // console.log("Adm aqui");
      agent.add("Ola Jeison");

      tgmail.triggermail(dataInicial, dataFinal, "zapdmae@dmae.prefpoa.com.br")
      //exit();

    } else if (req.body.session.toString() === adm2 && intention === "Inicio") {
      agent.add("Ola Fabiano, foi encaminhado para o seu email a quantidade de conversas do periodo entre " + dataInicial + " e " + dataFinal);

      tgmail.triggermail(dataInicial, dataFinal, "zapdmae@dmae.prefpoa.com.br")
    } else if (req.body.session.toString() === adm && intention === "Segund") {
      //console.log("Not a Admin");
      agent.add("Encaminhado solicitação para encaminhamento de csv com dados de Segundas vias de agua  de agua");
      tgmail.triggercontas(dataInicial, dataFinal, "zapdmae@dmae.prefpoa.com.br");
    } else if (req.body.session.toString() === adm2 && intention === "Segund") {
      //console.log("Not a Admin");
      agent.add("Encaminhado solicitação para encaminhamento de csv com dados de Segundas vias de agua  de agua, não esquece de repetir a mensagem que pra garantir que va a planilha certinha xD");
      tgmail.triggercontas(dataInicial, dataFinal, "zapdmae@dmae.prefpoa.com.br");
    } else {
      //console.log("Not a Admin");
      agent.add("Desculpe não consegui compreender, informe o ramal para iniciar o atendimento");
    }

    //throw new Error('This is not an error. This is just to abort javascript');
  }

  function whichTime(agent: { add: (arg0: string) => void; context: { delete: (arg0: string) => void; }; }) {
    // console.log('Resetando Servidor');
    //agent.add("Resetando Servidor");
    //var agentRef = agent.context.get('Restart')
    /*var adm = "projects/whatsapp-raqiit/agent/sessions/+55519336-0474"
    var adm2 = "projects/whatsapp-raqiit/agent/sessions/+55519219-1842"*/
    /*var dataInicial = agent.parameters.firstdate;
    var dataFinal = agent.parameters.lastdate;*/
    var fullbodysession = req.body.session.toString();
    var marcado = "projects/whatsapp-raqiit/agent/sessions/A"
    console.log("ESSE É O LOG DO reqbody")
    console.log(req.body.queryResult.queryText)
    var intention = fullbodysession.slice(0, 41);
    var intentionlength = fullbodysession.length;
    console.log(intentionlength)
    console.log("Essa é a intenção: " + intention);
    var lasthifen = fullbodysession.lastIndexOf("ا");;
    var firsthifen = fullbodysession.indexOf("ا");
    var data = fullbodysession.slice(firsthifen + 1, fullbodysession.indexOf("ا", firsthifen + 1));
    var horario = fullbodysession.slice(fullbodysession.lastIndexOf("ا", lasthifen - 1) + 1, lasthifen);
    var nome = fullbodysession.slice(lasthifen + 1, intentionlength);
    /*console.log("ESSE é O LOG DOS PARAMETROS")
    console.log(agent.parameters)*/
    /*console.log("A data inicial informada foi : "+dataInicial);
    console.log("A data Final  informada foi : "+dataFinal);*/
    if (intention === marcado) {
      // console.log("Adm aqui");
      agent.add("Nome Cadastrado: " + nome);
      agent.add("O atendimento será dia " + data.slice(0, 2) + "/" + data.slice(2, 4));
      agent.add("Horário: " + horario.slice(0, 2) + ":" + horario.slice(2, 4));

      //tgmail.triggermail(dataInicial, dataFinal, "jeison.molina@dmae.prefpoa.com.br")
      //exit();

    } else {
      var n = timescript.horario();
      agent.context.delete('ramalcadastra-followup');
      //agent.add('Welcome to my agent!');
      if (n >= 13 && n < 19) {
        agent.add('Boa Tarde!\nO DMAE  agradece o seu contato.\nPara prosseguir o atendimento, favor informe o número do Ramal para solicitações de serviços');
        console.log(n);
        //agent.add('Caso não possua o Ramal digite 9, porém algumas funções estarão indisponiveis.')
        //console.log('Boa Tarde');
      }
      else if (n < 13 && n > 6) {
        agent.add('Bom Dia!\nO DMAE agradece o seu contato.\nPara prosseguir o atendimento, favor informe o número do Ramal para solicitações de serviços');
        console.log(n);
        //agent.add('Caso não possua o Ramal digite 9, porém algumas funções estarão indisponiveis.')
        //console.log('Bom dia');
      }
      else {
        agent.add('Boa Noite!\nO DMAE agradece o seu contato.\nPara prosseguir o atendimento, favor informe o número do Ramal para solicitações de serviços');
        console.log(n);
        // agent.add('Caso não possua o Ramal digite 9, porém algumas funções estarão indisponiveis.')
        //  console.log('Boa noite');
      }
      //console.log(testbairro.getmyzone(19));
      agent.add('Caso não possua o número do ramal e deseja obter informações sobre Paradas Operacionais digite "Falta de Água"');
      agent.add('Para solicitar ligação nova de água informe "Ligação de Água"');
      agent.add('Para Informações sobre negociação da dívida ou parcelamento digite "Parcelamento"');
    }
  }

  function cancelTime(agent: { add: (arg0: string) => void; context: { delete: (arg0: string) => void; }; }) {
    // console.log('Resetando Servidor');
    //agent.add("Resetando Servidor");
    //var agentRef = agent.context.get('Restart')
    /*var adm = "projects/whatsapp-raqiit/agent/sessions/+55519336-0474"
    var adm2 = "projects/whatsapp-raqiit/agent/sessions/+55519219-1842"*/
    /*var dataInicial = agent.parameters.firstdate;
    var dataFinal = agent.parameters.lastdate;*/
    var fullbodysession = req.body.session.toString();
    var marcado = "projects/whatsapp-raqiit/agent/sessions/A"
    console.log("ESSE É O LOG DO reqbody")
    console.log(req.body.queryResult.queryText)
    var intention = fullbodysession.slice(0, 41);
    var intentionlength = fullbodysession.length;
    console.log(intentionlength)
    console.log("Essa é a intenção: " + intention);
    var lasthifen = fullbodysession.lastIndexOf("Ç");;
    var firsthifen = fullbodysession.indexOf("Ç");
    var data = fullbodysession.slice(firsthifen + 1, fullbodysession.indexOf("Ç", firsthifen + 1));
    var horario = fullbodysession.slice(fullbodysession.lastIndexOf("Ç", lasthifen - 1) + 1, lasthifen);
    var nome = fullbodysession.slice(lasthifen + 1, intentionlength);

    var fulltext = "Usuario " + nome + " entra em contato para cancelar o agendamento do dia +" + data + " Horario: " + horario;
    /*console.log("ESSE é O LOG DOS PARAMETROS")
    console.log(agent.parameters)*/
    /*console.log("A data inicial informada foi : "+dataInicial);
    console.log("A data Final  informada foi : "+dataFinal);*/
    if (intention === marcado) {
      // console.log("Adm aqui");
      agent.add("Encaminhado e-mail para área, fique atento que pode ser feito retorno para confirmar o cancelamento por este canal ou pelo e-mail cadastrado");

      tgmail.triggercancel("jeison.molina@dmae.prefpoa.com.br", fulltext)
      //exit();

    } else {
      var n = timescript.horario();
      agent.context.delete('ramalcadastra-followup');
      //agent.add('Welcome to my agent!');
      if (n >= 13 && n < 19) {
        agent.add('Boa Tarde!\nO DMAE  agradece o seu contato.\nPara prosseguir o atendimento, favor informe o número do Ramal para solicitações de serviços');
        console.log(n);
        //agent.add('Caso não possua o Ramal digite 9, porém algumas funções estarão indisponiveis.')
        //console.log('Boa Tarde');
      }
      else if (n < 13 && n > 6) {
        agent.add('Bom Dia!\nO DMAE agradece o seu contato.\nPara prosseguir o atendimento, favor informe o número do Ramal para solicitações de serviços');
        console.log(n);
        //agent.add('Caso não possua o Ramal digite 9, porém algumas funções estarão indisponiveis.')
        //console.log('Bom dia');
      }
      else {
        agent.add('Boa Noite!\nO DMAE agradece o seu contato.\nPara prosseguir o atendimento, favor informe o número do Ramal para solicitações de serviços');
        console.log(n);
        // agent.add('Caso não possua o Ramal digite 9, porém algumas funções estarão indisponiveis.')
        //  console.log('Boa noite');
      }
      //console.log(testbairro.getmyzone(19));
      agent.add('Caso não possua o número do ramal e deseja obter informações sobre Paradas Operacionais digite "Falta de Água"');
      agent.add('Para solicitar ligação nova de água informe "Ligação de Água"');
      agent.add('Para Informações sobre negociação da dívida ou parcelamento digite "Parcelamento"');
    }
  }

  function faltaagua(agent: { context: { get: (arg0: string) => any; }; add: (arg0: string) => void; }) {
    var dividacontext = agent.context.get('ramalcadastra-followup');
    var infos = banquinho.searchRamal(dividacontext.parameters.ramal);
    var text;
    // console.log(agent.context.get('ramalcadastra-followup'))
    var ramalref = dividacontext.parameters.ramal;
    ramalref = ramalref.toString().replace('.', '');
    ramalref = ramalref.toString().replace('-', '');
    ramalref = ramalref.toString().replace('/', '');
    var sessionref = req.body.session.toString();

    return db.returninfo(ramalref, sessionref).then((result: string | { dividavencida: string; }[]) => {
      if (result == '') {
        text = "O Ramal " + ramalref + " informado anteriormente não foi localizado no banco de dados ou sistema está fora do ar. \nFavor entrar em contato no fone 156 opção 2 ou através do Chat DMAE pelo link https://centraldmae.procempa.com.br/chat/ caso não possua o número do ramal";
      }
      else {
        if (result[0].situacao == 'Ativo') {
          text = "O Ramal " + ramalref + " consta como Ativo no sistema\n";
          text = text + "Favor verificar se o registro está bem aberto e se os vizinhos apresentam o mesmo problema\n";
          text = text + "Caso o registro esteja aberto, entre em contato pelo Fone 156 opção 2 para registrar a falta de água\n";
          text = text + "\nPara retornar ao menu inicial basta digitar o número do Ramal\n";
        } else {
          text = "O Ramal " + ramalref + " está com a situação: " + result[0].situacao + " com o valor vencido em aberto de R$: " + result[0].dividavencida;
          text = text + "\nPara restabelecer o ramal é necessário quitar ou renegociar os valores em aberto, então solicitar o restabelecimento no posto de atendimento do DMAE ou encaminhar e-mail para dmae@dmae.prefpoa.com.br";
          text = text + "\nPara retornar ao menu inicial basta digitar o número do Ramal";
        }
      }
      agent.add(text)
    });

  }

  function test(agent: { add: (arg0: string) => void; }) {
    console.log("Teste referente a pesquisa de bairros na lista de falta");
    var bairroTeste = "ABERTA MORROS";
    var length = bairroList.getlenght();
    var falta = bairroList.getbairros();
    for (var i = 0; i <= length; i++) {
      if (falta[i].includes(bairroTeste)) {
        console.log(bairroTeste + "Está na lista: " + falta[i]);
      }
    }
    console.log(falta);
    console.log(falta[0]);
    console.log(typeof falta[0]);
    agent.add("Teste concluido");
  }

  function agentSayDatabase(message: string) {
    agent.add("Testando " + message);
  }

  function aguaEesgoto(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, 3, null).then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "https://centraldmae.procempa.com.br/chat";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });

  }

  function chatLink(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, 5, null).then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "https://centraldmae.procempa.com.br/chat";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });
  }


  function baixaEmContaPaga(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, null, null, "Baixa em conta Paga").then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "A Baixa da conta pode levar 3 dias";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });
  }

  function desligamento(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, null, null, "Desligamento").then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "O Desligamento deve ser solicitado pelo e-mail dmae@dmae.prefpoa.com.br";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });
  }

  function duvidaRamal(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, null, null, "Não possuo o Ramal").then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "O ramal se contra no canto superior direito da sua conta";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });

  }

  function debitoEmConta(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, null, null, "Débito em Conta").then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "A Solciitação de débito em conta deve ser feita diretamente no seu banco";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });

  }

  function falarAtendente(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, null, null, "Falar com atendente").then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "Entre em contato pelo fone 156, opção 2";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });

  }

  function ligacaoAguaInicial(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, null, null, "Ligação de Agua Inicio").then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "A solicitação deve ser feita pelo e-mail dmae@dmae.prefpoa.com.br";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });

  }

  function parcelamentoInicial(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, null, null, "Parcelamento Inicial").then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "A solicitação deve ser feita pelo e-mail dmae@dmae.prefpoa.com.br";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });

  }

  function postoPresencial(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, 4, null, "Postos de Atendimento").then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "A solicitação deve ser feita pelo e-mail dmae@dmae.prefpoa.com.br";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });

  }

  function aboutDMAE(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, 6, null).then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "A solicitação deve ser feita pelo e-mail dmae@dmae.prefpoa.com.br";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });

  }

  function revisaConta(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text:any = '';
    return db.message(sessionref, 3, 2).then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "A solicitação deve ser feita pelo e-mail dmae@dmae.prefpoa.com.br";
      } else {
        
        text = result[0].resposta1;
      }
      agent.add(text);

    });

  }


  function parcelamentoMenu(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, 4, 2).then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "A solicitação deve ser feita pelo e-mail dmae@dmae.prefpoa.com.br";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });

  }

  function atualizaCadastro(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, 6, 2).then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "A solicitação deve ser feita pelo e-mail dmae@dmae.prefpoa.com.br";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });

  }

  function contaPorEmail(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, 7, 2).then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "A solicitação deve ser feita pelo e-mail dmae@dmae.prefpoa.com.br";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });

  }

  function restabelecimento(agent: { add: (arg0: string) => void; }) {
    var sessionref = req.body.session.toString();
    let text = '';
    return db.message(sessionref, 8, 2).then((result: string | { resposta1: string; }[]) => {
      if (result == '') {
        text = "A solicitação deve ser feita pelo e-mail dmae@dmae.prefpoa.com.br";
      } else {
        text = result[0].resposta1;
      }
      agent.add(text);

    });

  }



  let intentMap = new Map()
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Resumo', divida);
  intentMap.set('Falta de Agua', faltasiges);
  intentMap.set('RamalCadastra', menu)
  intentMap.set('Detalhado', detalhado);
  intentMap.set('Segunda Via', segundaViaIntent);
  intentMap.set('Divida', loadingRamal);
  intentMap.set('Outros', faltaagua);
  intentMap.set('SegundaVia2', segundaViaIntent);
  intentMap.set('SegundaViaMenu', segundaViaIntent);
  intentMap.set('Restart', resetServer);
  intentMap.set('Testando', test);
  intentMap.set('Servicos de Agua e Esgoto', aguaEesgoto)
  //intentMap.set('AguaOption - 1 - sim - mail', agua1SimMail)
  intentMap.set('Segunda Via Full', segundaViaFullIntent)
  intentMap.set('Falta de Agua Inicio', faltasiges2)
  intentMap.set('Horario', whichTime)
  intentMap.set('cancelar', cancelTime)
  intentMap.set('Chat Link', chatLink)
  intentMap.set('Baixa em conta Paga', baixaEmContaPaga)
  intentMap.set('Desligamento', desligamento)
  intentMap.set('DuvidaRamal', duvidaRamal)
  intentMap.set('Débito automatico', debitoEmConta)
  intentMap.set('Gostaria de falar com um atendente', falarAtendente)
  intentMap.set('Ligação de Agua Inicio', ligacaoAguaInicial)
  intentMap.set('Parcelamento Inicial', parcelamentoInicial)
  intentMap.set('Posto de Atendimento', postoPresencial)
  intentMap.set('Sobre', aboutDMAE)
  intentMap.set('Revisão de conta', revisaConta)
  intentMap.set('Parcelamento', parcelamentoMenu)
  intentMap.set('Atualização Cadastral', atualizaCadastro)
  intentMap.set('Conta por e-mail', contaPorEmail)
  intentMap.set('Restabelecimento', restabelecimento)
  //intentMap.set('NomeieOBot', whoami);
  //intentMap.set('NomeieOBot', whoami);
  //intentMap.set('')
  agent.handleRequest(intentMap);
})

app.listen(process.env.PORT || 8080)