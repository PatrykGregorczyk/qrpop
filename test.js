// ==UserScript==
// @name        TrackQRBETA
// @namespace   https://traceability24.eu/
// @include     *traceability24.eu*
// @require     https://unpkg.com/qrcode-decoder@0.3.3/dist/index.min.js
// @require     https://github.com/PatrykGregorczyk/TrackQR/blob/main/library.min.js?raw=true
// @version     0.01
// @run-at      document-start
// @grant       none
// ==/UserScript==

window.addEventListener ("load", DOM_ContentReady);

function DOM_ContentReady () {

if(window.location.href.toString().substr(0,38) === 'https://traceability24.eu/batches/view'){

    const STX = String.fromCharCode(2);
    const ETX = String.fromCharCode(3);
    const SEP = String.fromCharCode(10);
    const CR = String.fromCharCode(13,10)
    var TIND = document.querySelector("#p_code_mil").value;
    var TMHD = document.querySelector("#exp_date").value;
    var TDMR = document.querySelector("#freezing_date").value;
    var TLOT = document.querySelector("#b_lot_nr").value;
    var TATC = document.querySelector("#b_traceability_code").value;
    var TDUB = document.querySelector("#slau_date").value;
    var TGGN = document.querySelector("div.row:nth-child(5) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > h5:nth-child(2)").outerText;
    var DPR = document.querySelector("#prod_date").value;
    var PARTIA = document.querySelector(".card-header > strong:nth-child(1)").outerText;
    var PRODUKT = document.querySelector("div.col-lg-6:nth-child(3) > div:nth-child(1) > h5:nth-child(2)").outerText;
    var poNum = document.querySelector("div.row:nth-child(13) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > h5:nth-child(2)").outerText;

	const dayOfYear = date => Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    var LotDate = new Date(20+TLOT.substr(-2,2), 0,TLOT.substr(-5,3),2);

    var lotISO = LotDate.toISOString();
    lotISO = lotISO[8] + lotISO[9] + '.' + lotISO[5] + lotISO[6] + '.' + lotISO[0] + lotISO[1] + lotISO[2] + lotISO[3];

    var monthca = [, 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    function normalDate(fieldName, dfName) {
        if (dfName == "Canada_1") {
            var monthNormal = 0
            for (var i=1; i<13; i++) {
                if ((fieldName[3]+fieldName[4]+fieldName[5]).toUpperCase() == monthca[i]) {
                    if (i < 10) {
                        monthNormal = '0' + i;
                    } else {
                        monthNormal = i;
                    }
                }
            }
            return fieldName[0]+fieldName[1]+'.'+monthNormal+'.'+fieldName[7]+fieldName[8]+fieldName[9]+fieldName[10];
        } else if (dfName == "Japan_2") {
            return fieldName[8]+fieldName[9]+'.'+fieldName[5]+fieldName[6]+'.'+fieldName[0]+fieldName[1]+fieldName[2]+fieldName[3];
        } else if (dfName == "-- undefinied --") {
            return fieldName[8]+fieldName[9]+'.'+fieldName[5]+fieldName[6]+'.'+fieldName[0]+fieldName[1]+fieldName[2]+fieldName[3];
        } else if (dfName == "MM.DD.YYYY" || dfName == "MM/DD/YYYY") {
            return fieldName[3]+fieldName[4]+'.'+fieldName[0]+fieldName[1]+'.'+fieldName[6]+fieldName[7]+fieldName[8]+fieldName[9];
        } else if (dfName == "USA_3") {
            monthNormal = 0;
            for (i=1; i<13; i++) {
                if ((fieldName[0]+fieldName[1]+fieldName[2]).toUpperCase() == monthca[i]) {
                    if (i < 10) {
                        monthNormal = '0' + i;
                    } else {
                        monthNormal = i;
                    }
                }
            }
            return fieldName[4]+fieldName[5]+'.'+monthNormal+'.'+fieldName[7]+fieldName[8]+fieldName[9]+fieldName[10];
        } else if (dfName == "Julian_date") {
            var lotISO = new Date(20+fieldName.substr(0,2), 0,fieldName.substr(2,3),2);
            lotISO = lotISO.toISOString();
            return lotISO[8]+lotISO[9]+'.'+lotISO[5]+lotISO[6]+'.'+lotISO[0]+lotISO[1]+lotISO[2]+lotISO[3]
        } else {
            return fieldName;
        }
    }

    if (document.querySelector("#freezing_date")) {
        document.querySelector("#freezing_date").outerHTML = '<div id="freezing_date"><b style="color: blue; font-size:18;">'+TDMR+'</b>';
    }
    if (TATC != TLOT) {
        document.querySelector("#b_lot_nr").outerHTML = '<div id="b_lot_nr"><b style="color: cornflowerblue;">'+TLOT+'</b>';
    } else {
        document.querySelector("#b_lot_nr").outerHTML = '<div id="b_lot_nr"><b style="color: chocolate;">'+TLOT+'</b>';
    }
    document.querySelector("#slau_date").outerHTML = '<div id="slau_date"><b style="color: green; font-size:18;">'+TDUB+'</b>';
    document.querySelector("#prod_date").outerHTML = '<div id="prod_date"><b style="color: goldenrod; font-size:18;">'+DPR+'</b>';
    document.querySelector("#b_traceability_code").outerHTML = '<div id="b_traceability_code"><b style="color: chocolate;">'+TATC+'</b>';
    document.querySelector("#exp_date").outerHTML = '<div id="exp_date"><b style="color: red; font-size:18;">'+TMHD+'</b>';

    var trackCopies = document.createElement('input');
    trackCopies.id = 'lcopies';
    trackCopies.setAttribute('type', 'number');
    trackCopies.setAttribute('min', '1');
    trackCopies.setAttribute('max', '10');
    trackCopies.style.width = "50px";
    trackCopies.style.height = "25px";
    trackCopies.defaultValue = 5;
    trackCopies.style.position = "absolute";
    trackCopies.style.top = "213px";
    trackCopies.style.left = "220px";
    document.querySelector('div.card-body:nth-child(4)').appendChild(trackCopies);

    var labelForCopy = document.createElement('p');
    labelForCopy.style.position = "absolute";
    labelForCopy.innerHTML = 'Ilość kopii (strzałki - zmiana; enter - drukuj)';
    labelForCopy.style.height = "25px";
    labelForCopy.style.top = "305px";
    labelForCopy.style.left = "1075px";
    document.querySelector('div.card-body:nth-child(4)').appendChild(labelForCopy);

function makeTrackBoard (qr) {
    if(document.querySelector('.text-info').innerHTML == 'Default'){
        qr=0;
    }

    if(document.querySelector("#printtrack")) {
        document.querySelector("#printtrack").remove();
    }

    var trackBoard = document.createElement("div");
    trackBoard.id = "printtrack";
    trackBoard.style.fontSize = "0px";
    trackBoard.style.position = "absolute";
    trackBoard.style.top = "50px";
    trackBoard.style.left = "290px";
    trackBoard.style.width = "78mm";
    trackBoard.style.height = "50mm";
    trackBoard.style.border = "1px solid grey"
    trackBoard.style.borderRadius = "8px";
    document.querySelector('div.card-body:nth-child(4)').appendChild(trackBoard);

    var trackLabel = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    trackLabel.style.fontSize = "0px";
    trackLabel.style.position = "relative";
    trackLabel.style.left = "0mm";
    trackLabel.style.top = "0mm";
    trackLabel.style.width = "78mm";
    trackLabel.style.height = "50mm";
    trackBoard.appendChild(trackLabel);

    if(qr) {
        var qrr = new QrcodeDecoder();
    const qr1 = qrr.decodeFromImage(document.querySelector('div.col-lg-4:nth-child(3) > div:nth-child(1) > div:nth-child(2) > img:nth-child(2)')).then((res) => {
        if (res.data) {
            var qrdata = res.data.toUpperCase();
        } else {
            qrdata = res.data;
        }
        var newQR = QRCode({
            msg :  qrdata
            ,dim :  75
            ,pad :	 0
            ,ecl :  "L"
            ,ecb :   1
            ,vrb :   1
        });

            newQR.setAttribute('transform', 'translate(12,14)')
            trackLabel.appendChild(newQR);
    });
    }

    InsertText(3+(22*qr)+'mm', '7.5mm', PARTIA,'16px', 'Arial black');
    InsertText(3+(22*qr)+'mm', '12.5mm', 'Data uboju: '+normalDate(TDUB, document.querySelector("div.bs-component:nth-child(2) > div:nth-child(1) > h5:nth-child(2)").outerText),'15px', 'Arial','bold');
    if(TGGN){
                InsertText(3+(22*qr)+'mm', '18.25mm', 'GGN: '+TGGN,'15px', 'Arial','bold');
            } else if (TGGN == "" && TDMR) {
                InsertText(3+(22*qr)+'mm', '18.25mm', 'Data mrożenia: '+normalDate(TDMR, document.querySelector("div.bs-component:nth-child(2) > div:nth-child(1) > h5:nth-child(2)").outerText),'15px', 'Arial','bold');
            }
            if(TLOT != TATC){
                InsertText('3mm', '29.5mm', 'Traceability: '+TATC,'15px', 'Arial','bold');
                if (TGGN && TDMR) {
                    InsertText(3+(22*qr)+'mm', '23.5mm', 'Data mrożenia: '+normalDate(TDMR, document.querySelector("div.bs-component:nth-child(2) > div:nth-child(1) > h5:nth-child(2)").outerText),'15px', 'Arial','bold')
                }
            } else if (TGGN && TDMR && TLOT == TATC) {
                InsertText('3mm', '29.5mm', 'Data mrożenia: '+normalDate(TDMR, document.querySelector("div.bs-component:nth-child(2) > div:nth-child(1) > h5:nth-child(2)").outerText),'15px', 'Arial','bold')
            }
    if(poNum) {
        InsertText(3+(22*qr)+'mm', '23.5mm', 'Kontener: '+poNum,'15px', 'Arial','bold')
    }
    InsertText('3mm', '35mm', 'Indeks: '+TIND,'15px', 'Arial','bold');
    InsertText('3mm', '40.5mm','MHD: ','15px', 'Arial','bold');
    InsertText('15mm', '40.5mm',normalDate(TMHD, document.querySelector("div.bs-component:nth-child(2) > div:nth-child(1) > h5:nth-child(2)").outerText),'16px', 'Arial black');
    InsertText('3mm', '46mm','Lot: '+TLOT,'15px', 'Arial', 'bold');
    InsertText('52mm', '41mm','Data produkcji:', '11px', 'Arial', 'bold');
    InsertText('54mm', '46mm', lotISO, '13px', 'Arial', 'bold');

    function InsertText (x, y, text, fontsize, fontfamily, fontweight) {
    this.trackText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        trackText.style.position = "relative";
        trackText.setAttribute('x', x);
        trackText.setAttribute('y', y);
        trackText.setAttribute('font-size', fontsize);
        trackText.setAttribute('font-family', fontfamily);
        trackText.setAttribute('font-weight', fontweight);
        trackText.innerHTML = text;
    trackLabel.appendChild(trackText);

    }
}

makeTrackBoard(true);


    document.addEventListener('keydown', function(e) {
    var code = e.code;
        if (code == 'ArrowRight') {
            document.getElementById('lcopies').stepUp();
        } else if (code == 'ArrowLeft') {
            document.getElementById('lcopies').stepDown();
        } else if (code == 'Enter') {
            printPageArea("printtrack", trackCopies.value);
        }
    })

}


function printPageArea(areaID, labelCopies){
    var printContent = document.getElementById(areaID);
    var WinPrint = window.open('', '', 'width=640, height=680');
    WinPrint.document.write('<style type="text/css">@media print { body {margin-top:0 !important;} } @page { size: auto;  margin: 0mm; }</style>');
    for (var i = 1; i <= labelCopies; i++) {
        WinPrint.document.write(printContent.innerHTML);
        if (i != labelCopies) {
            WinPrint.document.write('<div style="page-break-after: always;"></div>');
        }
    }
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
}}