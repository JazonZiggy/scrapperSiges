module.exports.passtheTxt = function (textToCorrect: String) {
    var textRef = textToCorrect;
    var dmaeString = " DMAE ";
    //var i = 0;
    var newText = textRef.toString();
    var textclean = newText.trim();
    var newtextfin = replaceAll(" EBAT ", dmaeString, textclean);
    var sigesFin = replaceAll(" EBATa ", dmaeString, newtextfin);
    sigesFin = replaceAll(" RES ", " DMAE ", sigesFin);
    sigesFin = replaceAll(" EBE ", " DMAE ", sigesFin);
    sigesFin = replaceAll(" ETA ", " DMAE ", sigesFin);
    sigesFin = replaceAll(" EBATb ", " DMAE ", sigesFin);
    sigesFin = replaceAll(" EBAB ", " DMAE ", sigesFin);
    sigesFin = replaceAll(" EBABa ", " DMAE ", sigesFin);
    sigesFin = replaceAll("VL.", "VILA ", sigesFin);
    sigesFin = replaceAll(" VL ", " VILA ", sigesFin);
    sigesFin = replaceAll(" VILA FLORESTA ", " JARDIM FLORESTA", sigesFin);
    sigesFin = replaceAll(" DMAE VILA ASSUNCAO ", " DMAE ", sigesFin);
    sigesFin = replaceAll(" DMAE JARDIM ISABEL ", " DMAE ", sigesFin);
    sigesFin = replaceAll(" JD MEDIANEIRA", " JD Medianeira", sigesFin);
    sigesFin = replaceAll("VILA BOA VISTA", "", sigesFin);
    sigesFin = replaceAll("VL BOA VISTA", "", sigesFin);
    sigesFin = replaceAll("Ã", "A", sigesFin);
    sigesFin = replaceAll("Í", "I", sigesFin);
    sigesFin = replaceAll("Ó", "O", sigesFin);
    sigesFin = replaceAll("É", "E", sigesFin);
    sigesFin = replaceAll("é", "E", sigesFin);
    sigesFin = replaceAll("ó", "O", sigesFin);
    sigesFin = replaceAll("í", "I", sigesFin);
    sigesFin = replaceAll("STA.", "SANTA", sigesFin);
    sigesFin = replaceAll("CEL.", "CEL", sigesFin);
    sigesFin = replaceAll(" JD ", "JARDIM ", sigesFin);
    sigesFin = replaceAll("JD.", "JARDIM", sigesFin);
    sigesFin = replaceAll("PASSO AREIA", "PASSO DA AREIA", sigesFin);
    sigesFin = replaceAll("LOMBA PINHEIRO", "LOMBA DO PINHEIRO", sigesFin);
    return sigesFin;
}

