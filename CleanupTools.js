//CleanupTools v 0.3 (170414)
//CleanupTools is spin-off from SAETools targeting any page, as opposed to SAETools.

var SAEfileNameBeginning='Էջ:Հայկական_Սովետական_Հանրագիտարան_(Soviet_Armenian_Encyclopedia)_';
//var originalHyphenCount, originalSectionCount, originalNewLineCount;


/* Check if view is in edit mode and that the required modules are available and we're not on SAE page, as SAETools have similar features. Then, customize the toolbar */
/* Commented out, as currently check is done in users' common.js. May need to reenable this initalization call, in Gadgets. */
if ( $.inArray( mw.config.get( 'wgAction' ), ['edit', 'submit'] ) !== -1 && mw.config.get( 'wgPageName' ).substr(0,66) != SAEfileNameBeginning) {
	$( '#wpTextbox1' ).on( 'wikiEditor-toolbar-doneInitialSections', function () {
			
		/*mw.loader.using( 'user.options', function () {
					if ( mw.user.options.get('usebetatoolbar') ) {
							mw.loader.using( 'ext.wikiEditor.toolbar', function () {								
									$(window).load( CTInitialize );
							} );
					}
			});
	*/	
		CTInitialize();
		});
}


function CTInitialize()
{
	//Variables here may be unused, if we don't show count of hyphens/newlines removed.
	//originalHyphenCount = countHyphens(); //Let's calculate HyphenCount on page open, and calculate it at save, showing number of removed hyphens in Edit summar
	//originalSectionCount = (document.getElementById("wpTextbox1").value.split(/##/g).length-1)/2; //Same feautre for Sections
	//originalNewLineCount = document.getElementById("wpTextbox1").value.split(/\n{1}/g).length-1; //And same for New Line count
	
	addCTToolsButtons();
	//To-Do Alt+1, Alt+2 etc are used to swtich between tabs in browsers, we need to override it or change hotkeys
	$(document).keyup(function(evt)
		{
			if (evt.altKey && !(evt.ctrlKey)) //Left Alt under Win, Alt & no Ctrl under Lin/OS X
			{
				evt.stopPropagation();
	
				switch(evt.keyCode)
				{
				case 50: //Alt + 2
				  removeHyphens();
				  break;
				case 51: //Alt + 3
				  removeNewLines();
				  break;
				case 52: //Alt + 4
				  fixArmPunctuation();
				  break;
				case 65: //Alt + A
				  removeHyphens();
				  removeNewLines();
				  fixArmPunctuation();
				  break;
				}
				return false;
			}
		});
	
}

//We're adding button here
function addCTToolsButtons () 
{
	$( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
			'section': 'main',
			'groups': {
				'SAE': { 'label': '' }
			}
	} );


	$( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
		'section': 'main',
		'group': 'SAE',
		'tools': {
				'RmHyphnes': {
						label: 'Հեռացնել տողադարձերը (Alt+2)',
						type: 'button',
						icon: '//upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Crystal_Clear_action_edit_remove.png/22px-Crystal_Clear_action_edit_remove.png',
						action: {
							type: 'callback',
								execute: function(context){
									removeHyphens();
							}
						}
				}
		}
	} );

	$( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
		'section': 'main',
		'group': 'SAE',
		'tools': {
				'RmNewLines': {
						label: 'Հեռացնել նոր տողերը և ավելորդ բացատները (Alt+3)',
						type: 'button',
						icon: '//upload.wikimedia.org/wikipedia/commons/a/a8/Toolbaricon_definition_list.png',
						action: {
							type: 'callback',
								execute: function(context){
									removeNewLines();
							}
						}
				}
		}
	} );

	$( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
		'section': 'main',
		'group': 'SAE',
		'tools': {
				'RmHyphnes': {
						label: 'Լատիներեն կետադրական նշանները փոխել հայերեն նշաններով (Alt+4)',
						type: 'button',
						icon: '//upload.wikimedia.org/wikipedia/commons/b/b9/Toolbaricon_ellipsis.png',
						action: {
							type: 'callback',
								execute: function(context){
									fixArmPunctuation();
							}
						}
				}
		}
	} );

	//Is separator in toolbar needed for 3 buttons?
	//$(".group.group-insert").css("border-right","1px solid #DDDDDD");

}

function removeNewLines() {
	var text = document.getElementById("wpTextbox1").value;
	origNewLineCount = text.split("\n").length;
	text = text.replace(/[ ]{2,}/g, ' ');
	text = text.replace(/([ա-և»\),՝])\n([\(«ա-և0-9])/g, "$1 $2"); //remove new lines

	document.getElementById("wpTextbox1").value = text;
	removedNewLineCount = origNewLineCount-text.split("\n").length;
	mw.notify("Հեռացվեց " + removedNewLineCount + " նոր տող " + origNewLineCount + "-ից");
	if (removedNewLineCount>0) {
		insertSummary('-նոր տողեր ');
	}
}


function removeHyphens ()  {

	// [Ա-և] բոլոր հայերեն տառերը
	// [Ա-ԷԹ-Ֆա-էթ-և] բոոլոր տառեը բացի ը և Ը
	// [ա-էթ-և] բոլոր փոքրատառը բացի ը-ից

	var text = document.getElementById("wpTextbox1").value;
	var origHyphenCount = countHyphens();

	//removing new lines between numbers, leaving dash intact
	text = text.replace(/([0-9])[֊¬–-]\n([0-9])/g, "$1–$2");
	//Regexp for not touching hidden Y is too complex to mantain,
	//so instead of making it skip e-/nv we're making a dirty trick here
	text = text.replace(/ե–\nվ/g, "եTMP\nվ");

	//Remove (we're very careful taking max 6 letter long words, not to brake dashed phrases)
	text = text.replace(/([\s«\(])(([Ա-և](?!ը)){2,6})[֊¬–-]\n([ա-էթ-և]{1,5}[ա-և]|ը$)([\s,:։․՝»\)])/g, "$1$2$4$5");
    //Remove (if part after hyphen is max 3 letters, then it can't be compound issues with Ev unsolved &
	//we're very careful taking max 6 letter long words, not to brake dashed phrases)
	text = text.replace(/([\s«\(])(([Ա-և](?!ը)){2,})[֊¬–-]\n([ա-էթ-և]{1,2}[ա-և]|ը$)([\s,:։․՝»\)])/g, "$1$2$4$5");
    text = text.replace(/([\s«\(])([Ա-և][ա-էթ-և]|[Ա-և]{1}ու|ու[ա-թի–և]{1})[֊¬–-]\n([ա-էթ-և]{1,}[ա-և])([\s,:։՝»\)])/g, "$1$2$3$4"); //if first part has just 2 letters, it's not a dashed word, ու is basically one letter, so 2 special caes for that, and we're taking out ուժ as it can be compound word

	text = text.replace(/([Ա-ԷԹ-Ֆա-էթ-և]{3,})[֊¬–-]\n([ա-և]{0,3}թյուն(?:ը|ն|ներ|ների|ներից|ները|ներն|ներում)?|[ա-և]{0,3}թյամբ|[ա-և]{0,3}թյան(?:ը|ն|ներ|ների|ները|ներն|ներում)?|[ա-և]{0,2}յինը?|[ա-և]ում|յան|[ա-և]{0,2}կանը?|ներ[ա-և]{0,2})([\s,:։․՝»])/g, "$1$2$3"); //after being so careful, not to brake dashes where they should be, we need to take most common suffixes, and try to do some more work

	//We're removing what we've done in dirty e-/nv trick here. Sorry for this.
	text = text.replace(/եTMP\nվ/g, "ե–\nվ");

	document.getElementById("wpTextbox1").value = text;
	removedHyphenCount = origHyphenCount-countHyphens();
	if (removedHyphenCount>0)
	{
		insertSummary('-տողադարձեր ');
	}
	mw.notify('Հեռացվեց ' + removedHyphenCount + ' տողադարձ ' + origHyphenCount + '-ից');
}


function fixArmPunctuation() {
	var text = document.getElementById("wpTextbox1").value;

	// Verjaket issue. Only after Arm letters, and outside of [] brackets
	text = text.replace(/([Ա-և]([»\)])?):(?!([^\[]+)?])/g, "$1։");
	// Verjaket issue. Only before Arm letters (with optional space or NL) and outside of [] brackets
	text = text.replace(/:([\s\n])(([«])?[Ա-և])(?!([^\[]+)?])/g, "։$1$2");

	// Mijaket issue. Only after Arm letters, and outside of [] brackets
	text = text.replace(/([Ա-և]([»\)])?)\.(?!([^\[]+)?])/g, "$1․");
	// Verjaket issue. Only before Arm letters (with optional space or NL) and outside of [] brackets
	text = text.replace(/\.([\s\n])(([«])?[Ա-և])(?!([^\[]+)?])/g, "․$1$2");

	document.getElementById("wpTextbox1").value = text;
	insertSummary('+հայ․ կետ․ ');
}

function countHyphens () {
	return document.getElementById("wpTextbox1").value.split(/[¬֊-\—-–]\n/g).length-1;
}

function insertSummary( text ) {
	var sum = $('#wpSummary'), vv = sum.val();
	if (vv.indexOf(text) !== -1) return;
	if (/[^,; \/]$/.test(vv)) vv += ',';
	if (/[^ ]$/.test(vv)) vv += ' ';
	sum.val(vv + text);
}
