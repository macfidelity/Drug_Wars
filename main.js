/*
	On game start
*/
$( document ).ready(function() 
{	
	checkLocalStorageSupport();			// LocalStorage
	loadHighscoreFromLocalStorage(); 	// load highscore values to highscore div
	disableActionButtons();				// disable main buttons	
	showSettingsOnly();					// show only the settings div	
});


/*	###########################################
	GAME LOGIC
	########################################### */
	
/*
// init the game
*/
function initGame()
{
	log.info("Initializing the game");
	
	// get player name
	var nameObject = document.getElementById("fname");
	playersName = nameObject.value;
	
	var n = noty({text: 'Welcome '+playersName+' to DrugWars - The Heisenberg Edition'});
	
	// Save name to local storage
	localStorage.setItem("playersName", playersName);
	log.debug("Player name: "+playersName+" stored to local Storage");
	
	// define game length
	var daysObject = document.getElementById("gameLength");
	maxDays = (daysObject.value);
	curDay=0;

	// init values
	//
	// score modifier
	luckEvents = 0;
	badLuckEvents = 0;
	// pockets
	maxPockets=100;
	usedPockets=0;
	freePockets=maxPockets - usedPockets;
	pockets=usedPockets+ " of "+maxPockets+" used";
	// health
	health=100;
	




	
	
	// hide several content divs
	$('#div_Gameresult').hide();
	$('#div_Info').hide();
	$('#div_Highscore').hide();
	$('#div_Settings').hide();
	
	// enable main buttons	
	document.getElementById("choose_buyd").disabled = false;		// disable buy button
	document.getElementById("choose_selld").disabled = false;	// disable sell shark
	document.getElementById("choose_city").disabled = false;		// disable travel button
	document.getElementById("choose_loan").disabled = false;		// disable loan shark
	
	// show some divs
	$('#div_ActionButtons').show();
	$('#div_StatusTable').show();
	$('#div_Market').show();
	$('#div_GameProgress').show();
	
	// get start-timestamp
	var startTime = new Date().getTime();
	log.debug("Start-Time: "+startTime);
	
	newDay(); // start a new day
} // END: initGame()
	

/*
// init a new Day
*/
function newDay()
{
	if(curDay==maxDays) // last day
	{
		gameEnded();
		return;
	}
	else // normal day
	{
		curDay=curDay+1;
	}
	
	updateDebt();				// re-calculate debt
	randomEventsOnDayChange();	// check for random events
	updateAllUIElements();		// update all relevant UI elements
	
	// update day-progress-o-meter
	progressRatio = (curDay / maxDays) * 100;
	document.getElementById('progressBar').style.width= (progressRatio) +'%';
} // END: newDay()


/*
	CHANGE CITY
*/
function changeCity()
{	
	// hide buy/sell/loan div
	$('#sell_Drugs').hide();
	$('#buy_Drugs').hide();
	$('#loanshark_div').hide(); 
	
	// prepare the new day
	newDay();
	
	if (currentLocation === 'lnd')
	{
		currentLocation = locations.ny;		// change city

		// change city title
		$('#market').empty();
		$('#market').append('<i class="fa fa-map-marker"></i> The Market: New York City');

		// cost in nyc
		drugs.acid = getRandomInt(600,1300);
		drugs.coke = getRandomInt(900,1900);

		// change units to represent time passed
		coke_unit = drugs.unit();
		acid_unit = drugs.unit();
				
		// how many units available
		$('#acidUnits').html(acid_unit);
		$('#cokeUnits').html(coke_unit);
				
		// cost per unit
		$('#acidPerUnit').html("$"+drugs.acid);
		$('#cokePerUnit').html("$"+drugs.coke);

		sellPrice(); 
	} // end of IF
	else if (currentLocation === 'nyc')
	{
		currentLocation = locations.lnd;		// change city

		// change city title
		$('#market').empty();
		$('#market').append("<i class='fa fa-map-marker'></i> The Market: London"); 
	
		// cost in lnd
		drugs.acid = getRandomInt(700,1500);
		drugs.coke = getRandomInt(900,1700);

		// change units to represent time passed
		coke_unit = drugs.unit();
		acid_unit = drugs.unit();

		// how many units available
		$('#acidUnits').html(acid_unit);
		$('#cokeUnits').html(coke_unit);
				
		// cost per unit
		$('#acidPerUnit').html("$"+drugs.acid);
		$('#cokePerUnit').html("$"+drugs.coke);

		sellPrice(); 	
	} // else if  
	
	log.info("Arrived in: "+currentLocation)
} // END: changeCity


/*
	Show final score
*/
function gameEnded()
{	
	log.info("GAME OVER")
	
	disableActionButtons();	// disable main buttons	
	
	// hide input menues
	$('#sell_Drugs').hide();
	$('#loanshark_div').hide();
	$('#buy_Drugs').hide();
	
	// hide main game-divs
	$('#div_ActionButtons').hide();
	$('#div_StatusTable').hide();
	$('#div_Market').hide();
	$('#div_GameProgress').hide();
	
	// calculate some values:
	var finalMoney = bank;
	var finalDebt = debt;
	var finalScore = bank - (3* debt); // calc final score
	
	// add luck and badLuck modifiers to score
	badLuckModifier =  (badLuckEvents * 5000);
	log.debug("BadLuckModifier: "+badLuckModifier)
	
	luckModifier =  (luckEvents * 5000);
	log.debug("LuckModifier: "+luckModifier)
	
	finalScore = finalScore + badLuckModifier -luckModifier;
	
	if (finalScore < 1) // negative final score is not possible
	{
		finalScore = 0;
	}

	// get end-timestamp
	var endTime = new Date().getTime();
	
	//log.debug(startTime);
	log.debug("End Time: "+endTime);
	
	// check highscore - depends on maxDays
	log.debug("Max Days: "+maxDays);
	
	switch(maxDays) 
	{		
		case "5":
			log.debug("highscore_5");
			if (finalScore > localStorage.getItem("highscore_5")) 
			{
				localStorage.setItem("highscore_5", finalScore);
				localStorage.setItem("player_5", playersName);
				localStorage.setItem("date_5", Date.now());
				log.debug("New highscore_5 written");
			}
		break;

		case "15":
			log.debug("highscore_15");
			if (finalScore > localStorage.getItem("highscore_15")) 
			{
				localStorage.setItem("highscore_15", finalScore);
				localStorage.setItem("player_15", playersName);
				log.debug("New highscore_15 written");
			}
		break;
		
		case "30":
			log.debug("highscore_30");
			if (finalScore > localStorage.getItem("highscore_30")) 
			{
				localStorage.setItem("highscore_30", finalScore);
				localStorage.setItem("player_30", playersName);
				log.debug("New highscore_30 written");
			}
		break;
		
		case "45":
			log.debug("highscore_45");
			if (finalScore > localStorage.getItem("highscore_45")) 
			{
				localStorage.setItem("highscore_45", finalScore);
				localStorage.setItem("player_45", playersName);
				localStorage.setItem("date_45", Date.now());
				log.debug("New highscore_45 written");
			}
		break;
		
		case "90":
			log.debug("highscore_90");
			if (finalScore > localStorage.getItem("highscore_90")) 
			{
				localStorage.setItem("highscore_90", finalScore);
				localStorage.setItem("player_90", playersName);
				localStorage.setItem("date_90", Date.now());
				log.debug("New highscore_90 written");
			}
		break;
	} 
	
	loadHighscoreFromLocalStorage(); // updates the highscore
	
	// write values to endgame div
	$('#finalMoneyCount').html(+finalMoney);
	$('#finalDebtCount').html(+finalDebt);
	$('#finalScoreCount').html(+finalScore);	
	
	$('#div_Gameresult').show();	// show result div
} // END: gameEnded()







/*	###########################################
	BUTTON-CLICKS
	########################################### */

/*
// Button: Open Buy-Area
*/
$('#choose_buyd').click(function(event) 
{	
	$('#sell_Drugs').hide();
	$('#loanshark_div').hide();
	$('#buy_Drugs').toggle(400); 
});


/*
	Button: Open Sell-Area
*/
$('#choose_selld').click(function(event) 
{	
	$('#loanshark_div').hide();
	$('#buy_Drugs').hide();
	$('#sell_Drugs').toggle(400); 
});


/*
	Button: Open Loan-Shark-Area
*/
$('#choose_loan').click(function(event) 
{	
	updateLoansharkUI();
	
	$('#sell_Drugs').hide();
	$('#buy_Drugs').hide();
	$('#loanshark_div').toggle(400);
});


/*
	BUTTON PRESS: Do Borrow Money 
*/
$('#btn').click(function(event) 
{
	var amount = $('input').val(); 
	log.info("Borrowing "+amount+" $ from loan shark")
	var b = parseInt(amount); 
	 
	// work out new bank balance
	bank = bank + b;
	log.info("New Bank balance is: "+bank)

	// update my bank
	$('#inBank').html("$"+bank);

	// update the debt
	debt = debt + b;
	$('#debt').html("$"+debt);
	
	updateLoansharkUI();
	updateAllUIElements();
});


/*	
	BUTTON PRESS: change city
*/
$('#choose_city').click(function(event) 
{	
	changeCity(); 
});


/*
// BUTTON PRESS: Buy Drugs Click
*/
$('#drugBtn').click(function(event) 
{
	// check that a tick box is selected
	if (pickedAcid === false && pickedCoke === false)
	{
		var n = noty({text: 'You need to pick a drug'});
		return;
	}
	
	// turn number of units into a number 
	var xUnits = $('input[id="buyDrugs"]').val(); 
	var numUnits = parseInt(xUnits); 

	// depending on your selection
	if (pickedAcid === true)
	{
		cashSpent = drugs.acid * numUnits;
		
		// check to see if you can afford it
		if (bank - cashSpent < 0)
		{
			var n = noty({text: 'You cant afford that!'});
			return;
		}

		// check to see if have enough units
		if (acid_unit < numUnits)
		{
			var n = noty({text: 'Not enough units available, select less!'});
			return;
		}
		
		// check to see if have enough units
		if (freePockets < numUnits)
		{
			var n = noty({text: 'You dont have enough free pockets. You cant buy more then '+freePockets+' units.'});
			return;
		}
		
		log.info("You spent "+cashSpent+" $ for new drugs")

		// update units of drugs you own
		currentDrugs.acid = currentDrugs.acid + numUnits;
		
		// update pockets
		usedPockets = usedPockets+ numUnits;
		freePockets = maxPockets - usedPockets;
		pockets = usedPockets + " of "+maxPockets+" used";
				
		// remove units once bought 
		acid_unit = acid_unit - numUnits;
		$('#acidUnits').html(acid_unit); 

		// work out new bank balance
		bank = bank - cashSpent;
		
		updateAllUIElements();
	} // end of IF Picked Acid
	else if (pickedCoke === true)
	{
		cashSpent = drugs.coke * numUnits;

		// check to see if you can afford it
		if (bank - cashSpent < 0)
		{
			var n = noty({text: 'You cant afford that!'});
			return;
		}

		// check to see if have enough units
		if (coke_unit < numUnits)
		{
			var n = noty({text: 'Not enough units available, select less!'});
			return;
		}
		
		// check to see if have enough units
		if (freePockets < numUnits)
		{
			var n = noty({text: 'You dont have enough free pockets. You cant buy more then '+freePockets+' units.'});
			return;
		}
		
		log.info("You spent "+cashSpent+" $ for new drugs")

		// update units of drugs you own
		currentDrugs.coke = currentDrugs.coke + numUnits;
		
		// update pockets
		usedPockets = usedPockets+ numUnits;
		freePockets = maxPockets - usedPockets;
		pockets = usedPockets + " of "+maxPockets+" used";

		// remove units once bought 
		coke_unit = coke_unit - numUnits;
		$('#cokeUnits').html(coke_unit);  

		// work out new bank balance
		bank = bank - cashSpent;
		log.info("Bank "+bank)
		
		updateAllUIElements();
	} // End of else if	
}); // buy drugs button
	

/*
	BUTTON PRESSED: SELL drugs
*/
$('#sellBtn').click(function(event) 
{
	// check that a tick box is selected
	if (pickedAcid === false && pickedCoke === false)
	{
		var n = noty({text: 'You need to pick a drug'});
		return;
	}

	// turn number of units into a number 
	var xUnits = $('input[id="sellDrugs"]').val(); 
	var numUnits = parseInt(xUnits); 

	// depending on your selection
	if (pickedAcid === true)
	{
		cashEarned = drugs.acid * numUnits;
		log.info("You earned "+cashEarned+" $")

		// check to see if you have enough units
		if (numUnits > currentDrugs.acid)
		{
			var n = noty({text: 'Sell what you have, not what you dont'});
			return;
		}

		// update units of drugs you own
		currentDrugs.acid = currentDrugs.acid - numUnits;

		// update pockets
		usedPockets = usedPockets - numUnits; // update pocket calculation
		pockets = usedPockets + " of "+maxPockets+" used";
		
		// add back units once sold 
		acid_unit = acid_unit + numUnits;
		$('#acidUnits').html(acid_unit); 

		// work out new bank balance
		bank = bank + cashEarned;
		
		updateAllUIElements();
		
	} // end of IF Picked Acid
	// NOW LET'S DO FOR COKE
	else if (pickedCoke === true)
	{
		cashEarned = drugs.coke * numUnits;
		log.info("You earned "+cashEarned+" $")
		
		// check to see if have enough units
		if (numUnits > currentDrugs.coke)
		{
			var n = noty({text: 'Sell what you have, not what you dont'});
			return;
		}

		// update units of drugs you own
		currentDrugs.coke = currentDrugs.coke - numUnits;
		
		// update pockets
		usedPockets = usedPockets - numUnits; // update pocket calculation
		pockets = usedPockets + " of "+maxPockets+" used";

		// add back units once sold  
		coke_unit = coke_unit + numUnits;
		$('#cokeUnits').html(coke_unit);  

		// work out new bank balance
		bank = bank + cashEarned;
		
		updateAllUIElements();
	} // End of else if
}); // buy drugs button
	
		
/*	
	BUTTON PRESS: Pay Back Money
*/	
$('#btn_payDebt').click(function(event) 
{
	var amount = $('#payDebt').val();
	if(amount <= 0) // check if entered payback-amount is valid 
	{
		var n = noty({text: 'Loan shark: Dont try to fuck with me dude.'});
		return;
	}
	else // amount is valid
	{
		log.info("Payback "+amount+" $ to loan shark")
		var b = parseInt(amount); 
	 
		// work out new bank balance
		bank = bank - b;
		log.debug("New bank balance is:"+bank+" $")

		// recalculate the debt
		debt = debt - b;

		updateLoansharkUI();
		updateAllUIElements();
	}
});	



/*	
	BUTTON PRESS: Pay Back Money all
*/	
$('#btn_payDebtAll').click(function(event) 
{
	bank = bank - debt;
	debt = 0;
	
	updateLoansharkUI();
	updateAllUIElements();
});	




// check if acid-drug box got ticked -
$('#acid_tick').click(function(event) 
{
	if (this.checked)
	{
		$('#coke_tick').prop('checked', false);
		pickedAcid = true;
		pickedCoke = false; 
		
		//calculateMaxBuyAcid();
		choosenDrug ="Acid";
		calculateMaxBuy(choosenDrug);
	}	
});


// check if coke-drug box got ticket
$('#coke_tick').click(function(event) 
{
	if (this.checked)
	{
		$('#acid_tick').prop('checked', false);
		pickedCoke = true;
		pickedAcid = false;
		
		//calculateMaxBuyAcid();
		choosenDrug ="Coke";
		calculateMaxBuy(choosenDrug);
	}	
});
	

// check if sell acid-drug box got ticked
$('#s_acid_tick').click(function(event) 
{	
	if (this.checked)
	{
		$('#s_coke_tick').prop('checked', false);
		pickedAcid = true;
		pickedCoke = false; 
	}	
});


// check if sell coke-drug box got ticked
$('#s_coke_tick').click(function(event) 
{	
	if (this.checked)
	{
		$('#s_acid_tick').prop('checked', false);
		pickedCoke = true;
		pickedAcid = false;
	}	
});









/*	###########################################
	HELPERS
	########################################### */

/*
	HELPER: update all ui-elements
*/
function updateAllUIElements()
{
	// action buttons
	updateTradingButtons();

	// unselect buy & sell checkboxes for drug-selection
	$('#acid_tick').prop('checked', false);
	$('#coke_tick').prop('checked', false);
	$('#s_acid_tick').prop('checked', false);
	$('#s_coke_tick').prop('checked', false);
	
	maxPossibleBuy=0;
	$('#maxBuy').html("(max: "+maxPossibleBuy+")");			// update UI
	
	
	// status menues
	$('#calendar').html("Day "+curDay+" of "+maxDays);	//
	$('#inBank').html("$"+bank); 
	$('#listDrugs').html("Acid: " +  currentDrugs.acid + "<br>" + " Coke: " + currentDrugs.coke);
	$('#pockets').html(pockets); 
	$('#debt').html("$"+debt); 
	$('#health').html(health); 
} // END: updateAllUIElements()



/*
	HELPER: check browser support for localStorage
*/
function checkLocalStorageSupport()
{
	if(typeof(Storage) !== "undefined") 
	{
		document.getElementById("fname").innerHTML = localStorage.getItem("playersName"); 
		lastName = localStorage.getItem("playersName"); 	// get the last name used in this game from local storage
		
		// set the name into the settings dialog
		var elem = document.getElementById("fname");
		elem.value = lastName;
	} 
	else 
	{
		alert("No support for Local storage found. This means: No highscore management possible.");
	}
} // END: checkLocalStorageSupport()


/*
	HELPER: show only the settings div - and hide all the others
*/
function showSettingsOnly()
{
	// show settings div
	$('#div_Settings').show(); 
	
	// and hide most other divs
	$('#div_Gameresult').hide();
	$('#div_Info').hide();
	$('#div_Highscore').hide();
	$('#div_ActionButtons').hide();
	$('#div_StatusTable').hide();
	$('#div_Market').hide();
	$('#div_GameProgress').hide();
	
} // END: showSettingsOnly()




/*
	HELPER: disable the main 4 action buttons
*/
function disableActionButtons()
{
	document.getElementById("choose_buyd").disabled = true;		// disable buy button
	document.getElementById("choose_selld").disabled = true;	// disable sell shark
	document.getElementById("choose_city").disabled = true;		// disable travel button
	document.getElementById("choose_loan").disabled = true;		// disable loan shark
} // END: disableActionButtons()


/*
	HELPER: calculate max possible buy
*/
function calculateMaxBuy()
{
	if(choosenDrug == "Acid")
	{
		maxPossibleBuy = Math.floor(bank / drugs.acid);
		if(maxPossibleBuy > acid_unit) // check if enough is available
		{
			maxPossibleBuy = acid_unit;
		}
		if(maxPossibleBuy > freePockets)
		{
			maxPossibleBuy = freePockets;
		}
		$('#maxBuy').html("(max: "+maxPossibleBuy+")");			// update UI
		
		if(maxPossibleBuy == 0)
		{
			document.getElementById("acid_tick").disabled = true;
		}
	}
	
	if(choosenDrug == "Coke")
	{
		maxPossibleBuy = Math.floor(bank / drugs.coke);
		if(maxPossibleBuy > coke_unit) // check if enough is available
		{
			maxPossibleBuy = coke_unit;
		}
		if(maxPossibleBuy > freePockets)
		{
			maxPossibleBuy = freePockets;
		}
		$('#maxBuy').html("(max: "+maxPossibleBuy+")");			// update UI
		
		if(maxPossibleBuy == 0)
		{
			document.getElementById("coke_tick").disabled = true;
		}
	}
}



/*
	HELPER: update Loan Payback section
*/
function updateLoansharkUI()
{			
	if(debt > 0)
	{
		$("#form_Payback").show();
		$("#btn_payDebt").show();

		if(bank > debt)
		{
			$("#btn_payDebtAll").show();
		}
		else
		{
			$("#btn_payDebtAll").hide();
		}
	}
	else // player has no debt
	{
		$("#form_Payback").hide();		// hide all payback options
	}
}



/*
	HELPER: updateHighscore
*/
function loadHighscoreFromLocalStorage() 
{
	// 5 Days
	highscore_5_score = localStorage.getItem("highscore_5");
	$('#score_5').html("<b>"+highscore_5_score+"</b>");							
	highscore_5_name = localStorage.getItem("player_5");
	$('#player_5').html("by "+highscore_5_name);
	highscore_5_date = localStorage.getItem("date_5");
	$('#date_5').html("at "+highscore_5_date);
	
	// 15 Days
	highscore_15_score = localStorage.getItem("highscore_15");
	$('#score_15').html("<b>"+highscore_15_score+"</b>");
	highscore_15_name = localStorage.getItem("player_15");
	$('#player_15').html("by "+highscore_15_name);
	highscore_15_date = localStorage.getItem("date_15");
	$('#date_15').html("at "+highscore_15_date);
	
	// 30 Days
	highscore_30_score = localStorage.getItem("highscore_30");
	$('#score_30').html("<b>"+highscore_30_score+"</b>");
	highscore_30_name = localStorage.getItem("player_30");
	$('#player_30').html("by "+highscore_30_name);
	highscore_30_date = localStorage.getItem("date_30");
	$('#date_30').html("at "+highscore_30_date);
	
	// 45 Days
	highscore_45_score = localStorage.getItem("highscore_45");
	$('#score_45').html("<b>"+highscore_45_score+"</b>");						
	highscore_45_name = localStorage.getItem("player_45");
	$('#player_45').html("by "+highscore_45_name);
	highscore_45_date = localStorage.getItem("date_45");
	$('#date_45').html("at "+highscore_45_date);
	
	// 90 Days
	highscore_90_score = localStorage.getItem("highscore_90");
	$('#score_90').html("<b>"+highscore_90_score+"</b>");						
	highscore_90_name = localStorage.getItem("player_90");
	$('#player_90').html("by "+highscore_90_name);
	highscore_90_date = localStorage.getItem("date_90");
	$('#date_90').html("at "+highscore_90_date);
}



/*
	HELPER: get randon int 
*/
function getRandomInt(min, max) 
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

	
/*
	HELPER: updateTradingButtons (enable or disable them based on the amount of money and/or drugs in pocket
*/
function updateTradingButtons()
{
	log.info("Updating trade buttons")
	
	// Buy-Area button
	//
	if(bank>0) // player has money - enable buy button
	{
		document.getElementById("choose_buyd").disabled = false;	// enable buy button
	}
	else
	{
		document.getElementById("choose_buyd").disabled = true;	// disable buy buton
	}
	
	// BUY - disable all drug-checkboxes which arent available
	if(acid_unit == 0)
	{
		document.getElementById("acid_tick").disabled = true; 
		$('#acid_tick').attr('checked', false);
	}
	else
	{
		document.getElementById("acid_tick").disabled = false
	}
	// coke
	if(coke_unit == 0)
	{
		document.getElementById("coke_tick").disabled = true; 
		$('#coke_tick').attr('checked', false);
	}
	else
	{
		document.getElementById("coke_tick").disabled = false
	}
	
	
	// Sell-Area buttons
	if ((currentDrugs.acid == 0) & (currentDrugs.coke == 0) )
	{
		document.getElementById("choose_selld").disabled = true;	// disable sell button
	}
	else
	{
		document.getElementById("choose_selld").disabled = false; // enable sell button
	}
	
	// SELL - disable all drug-checkboxes we dont have
	if(currentDrugs.acid == 0)
	{
		document.getElementById("s_acid_tick").disabled = true;  
		$('#s_acid_tick').attr('checked', false);
	}
	else
	{
		document.getElementById("s_acid_tick").disabled = false
	}
	// coke
	if(currentDrugs.coke == 0)
	{
		document.getElementById("s_coke_tick").disabled = true; 
		$('#s_coke_tick').attr('checked', false); 
	}
	else
	{
		document.getElementById("s_coke_tick").disabled = false
	}
	
	// payback
	if(debt == 0)
	{
		document.getElementById("btn_payDebt").disabled = true;
		document.getElementById("payDebt").disabled = true;  
	}
	else
	{
		document.getElementById("btn_payDebt").disabled = false;
		document.getElementById("payDebt").disabled = false;  
	}
}


/*
	HELPER: Calculate debt (happens on each new day)
*/
function updateDebt()
{
	if(debt > 0) // only if player has debt
	{
		log.info("Update debt (adding 10%")
		debt = Math.round(debt * 1.1);	// calculate new debt
		updateAllUIElements();
	}
}


/*
	HELPER: Calculate Sales Price
*/
function sellPrice()
{
	var sell_Acid;
	
	if (acid_unit < 10){ sell_Acid = Math.round(drugs.acid / 100 * 30 + drugs.acid); }
	else if (acid_unit < 20){ sell_Acid = Math.round(drugs.acid / 100 * 20 + drugs.acid); }
	else if (acid_unit < 30){ sell_Acid = Math.round(drugs.acid / 100 * 10 + drugs.acid); }
	else if (acid_unit < 40){ sell_Acid = Math.round(drugs.acid / 100 * 5 + drugs.acid); }
	else { sell_Acid = Math.round(drugs.acid / 100 * 3 + drugs.acid); }

	var sell_Coke;
	
	if (coke_unit < 10){ sell_Coke = Math.round(drugs.coke / 100 * 30 + drugs.coke); }
	else if (coke_unit < 20){ sell_Coke = Math.round(drugs.coke / 100 * 20 + drugs.coke); }
	else if (coke_unit < 30){ sell_Coke = Math.round(drugs.coke / 100 * 10 + drugs.coke); }
	else if (coke_unit < 40){ sell_Coke = Math.round(drugs.coke / 100 * 5 + drugs.coke); }
	else { sell_Coke = Math.round(drugs.coke / 100 * 3 + drugs.coke); }

	// sell per unit
	$('#acidSell').html("$"+sell_Acid);
	$('#cokeSell').html("$"+sell_Coke);  
} // end of sales price function




/*
	HELPER: Random Events
*/
function randomEventsOnDayChange()
{
	log.info("Check for random events")
	
	if(curDay >= 2) // not on the first day
	{
		var shouldRandomHappen = getRandomInt(1,10); // calculate chance for a random event
		if(shouldRandomHappen >= 8) // random event happens
		{
			var x = getRandomInt(1,7); // what random event should happen?
			log.debug("Random Event: "+x)
			
			// Execute Random Event: Police
			switch(x)
			{
				case 1:
					randomEvent_Police();
				break;

				case 2:
					randomEvent_Robbery();
				break;
				
				case 3:
					randomEvent_FindDrugs();
				break;

				case 4:
					randomEvent_JesseQuote();
				break;
				
				case 5:
					randomEvent_ExtraPockets();
				break;

				case 6:
					randomEvent_CheapDrugs();
				break;
				
				case 7:
					randomEvent_HankQuote();
				break;
			} // end case
		}
	}
}







/*	###########################################
	RANDOM EVENTS
	########################################### */

/*
	RANDOM EVENT: Police
*/
function randomEvent_Police()
{
	badLuckEvents = badLuckEvents + 1;

	if( freePockets == maxPockets) // we dont have any drug
	{
		var n = noty({text: 'Lucky you - cops controlled you - but you had empty pockets.'});
	}
	else // we do have drugs - cops will rip us
	{
		var n = noty({text: 'The cops .... dumping my stash'});

		// calculate new values
		//
		// health
		health = health - 10;
		// drugs		
		currentDrugs.coke = 0;
		currentDrugs.acid = 0; 
		// pockets					
		usedPockets = 0;
		freePockets = maxPockets;
		pockets=usedPockets+ " of "+maxPockets+" used";

		updateAllUIElements();
	}  
}


/*
	RANDOM EVENT: Robbery
*/
function randomEvent_Robbery()
{
	badLuckEvents = badLuckEvents + 1;

	if(bank == 0) // if there is no money at all
	{
		var n = noty({text: 'Someone tried to rob you but you had no money anyways.'}); 
		return;
	}
				
	if(bank > 500) // we dont rob poor ppl
	{
		// calculate money stolen
		var stolen = Math.round(bank / 100 * 30);
		bank = bank - stolen; 
				
		var n = noty({text: 'You got robbed. Loss '+stolen+' $.'});
		log.info("You lost "+stolen+" $ (robbery)")					
				
		updateAllUIElements();
	}
}


/*
	RANDOM EVENT: Find Drugs
*/
function randomEvent_FindDrugs()
{
	luckEvents = luckEvents + 1;

	foundDrugs = getRandomInt(1,50); // get random number
	if(foundDrugs <= freePockets)
	{
		var n = noty({text: 'You found '+foundDrugs+' acid on the streets'}); 
	}
	else // not enough pockets
	{			
		var n = noty({text: 'You found '+foundDrugs+' acid on the streets but could take only '+freePockets+' cause of pocket size.'}); 
		foundDrugs = freePockets;
	}
						
	// calculate new values
	//
	// drugs
	currentDrugs.acid = currentDrugs.acid + foundDrugs;
	// pockets
	usedPockets= usedPockets+foundDrugs;
	freePockets = maxPockets - usedPockets;
	pockets=usedPockets+ " of "+maxPockets+" used";

	updateAllUIElements();				
	return;
}


/*
	RANDOM EVENT: Jesse
*/
function randomEvent_JesseQuote()
{
	// random jesse pinkman quote:
	var jesseQuotes = [
					"Look, I like making cherry product, but let’s keep it real, alright? We make poison for people who don’t care. We probably have the most unpicky customers in the world.", 
					"Yeah. Totally Kafkaesque.",
					"You don’t need a criminal lawyer. You need a criminal lawyer", 
					"Oh well, heil Hitler, bitch. And let me tell you something else. We flipped a coin, okay? You and me. You and me! Coin flip is sacred! Your job is waiting for you in that basement, as per the coin!",
					"You either run from things, or you face them, Mr. White.", 
					"Like I came to you, begging to cook meth. ‘Oh, hey, nerdiest old dude I know, you wanna come cook crystal?’ Please. I’d ask my diaper-wearing granny, but her wheelchair wouldn’t fit in the RV.",
					"Yeah Mr. White! You really do have a plan! Yeah science!", 
					"You know what? Why I’m here in the first place? Is to sell you meth. You’re nothing to me but customers! I made you my bitch. You okay with that?",
					"Possum. Big, freaky, lookin’ bitch. Since when did they change it to opossum? When I was comin’ up it was just possum. Opossum makes it sound like he’s irish or something. Why do they gotta go changing everything?", 
					"So no matter what I do, hooray for me because I’m a great guy? It’s all good? No matter how many dogs I kill, I just do an inventory and accept?",
					"I’m supposed to promise, cross my heart, to like straighten up and fly right, or toe the line, or some other crap I’m not going to say?", 
					"I uh… I eat a lot of frozen stuff… It’s usually pretty bad, I mean the pictures are always so awesome, you know? It’s like “hell yeah, I’m starved for this lasagna!” and then you nuke it and the cheese gets all scabby on top and it’s like… it’s like you’re eating a scab… I mean, seriously, what’s that about? It’s like “Yo! What ever happened to truth in advertising?” You know?",
					"Look… look, you two guys are just… guys, okay? Mr. White… he’s the devil. You know, he is… he is smarter than you, he is luckier than you. Whatever… whatever you think is supposed to happen… I’m telling you, the exact reverse opposite of that is gonna happen, okay?", 
					"Are we in the meth business, or the money business?",
					"Nah come on… man, some straight like you giant stick up his ass all of a sudden at age what 60 he’s just going to break bad?", 
					"What if this is like math, or algebra? And you add a plus douchebag to a minus douchebag, and you get, like, zero douchebags?",
					"Hey, you girls want to meet my fat stack?", 
					"I am not turning down the money! I am turning down you! You get it? I want NOTHING to do with you! Ever since I met you, everything I ever cared about is gone! Ruined, turned to shit, dead, ever since I hooked up with the great Heisenberg! I have never been more alone! I HAVE NOTHING! NO ONE! ALRIGHT, IT’S ALL GONE, GET IT? No, no, no, why… why would you get it? What do you even care, as long as you get what you want, right? You don’t give a shit about me! You said I was no good. I’m nothing! Why would you want me, huh? You said my meth is inferior, right? Right? Hey! You said my cook was GARBAGE! Hey, screw you, man! Screw you!",
					"You can’t admit, just for once, that I’m right. Come on. That O’Keeffe lady kept trying over and over until that stupid door was perfect.", 
					"I got two dudes that turned into raspberry slushie then flushed down my toilet. I can’t even take a proper dump in there. I mean, the whole damn house has got to be haunted by now.",
					"Right on. New Zealand. That’s where they made Lord of the Rings. I say we just move there, yo. I mean, you can do your art, right? Like, you can paint the local castles and shit. And I can be a bush pilot.", 
					"What good is being an outlaw when you have responsibilities?",
					"I’M A BLOWFISH! BLOWFISH! YEEEAAAH! BLOWFISHIN’ THIS UP!", 
					"You got me riding shotgun to every dark anal recess of this state. It’d be nice if you clued me in a little.",
					"What happens now? I’ll tell you what happens now. Your scumbag brother-in-law is finished. Done. You understand? I will own him when this is over. Every cent he earns, every cent his wife earns is mine. Any place he goes, anywhere he turns, I’m gonna be there grabbing my share. He’ll be scrubbing toilets in Tijuana for pennies and I’ll be standing over him to get my cut. He’ll see me when he wakes up in the morning and when he crawls to sleep in whatever rat hole is left for him after I shred his house down. I will haunt his crusty ass forever until the day he sticks a gun up his mouth and pulls the trigger just to get me out of his head. That’s what happens next.",
					"Yeah, bitch! Magnets!", 
					"Yo 148, 3-to-the-3-to-the-6-to-the-9. Representin’ the ABQ. What up, biatch? Leave it at the tone!"
				];
				
	// pick random quote from array
	var randomQuote = jesseQuotes[Math.floor(Math.random()*jesseQuotes.length)];
				
	// output random quote
	var n = noty({text: "Jesse Pinkman: "+randomQuote});
}


/*
	RANDOM EVENT: Pockets
*/
function randomEvent_ExtraPockets()
{
	extraPockets = getRandomInt(10,50); // get random number of offerend pockets
	pocketPrice = getRandomInt(5,20); // get random number for pocket price
	calcExtraPocketPrice = extraPockets * pocketPrice;
	
	if(bank >= calcExtraPocketPrice) // if we have enough money for the extra-pockets
	{
		// todo:
		// ask user if he wants to buy those new pockets
		var answer = confirm("Do you want to buy "+extraPockets+" extra pockets for "+calcExtraPocketPrice+" $ ?")
		if (answer)
		{
			var n = noty({text: 'You just got '+extraPockets+' extra pockets for '+calcExtraPocketPrice+' $.'});
					
			// calculate new values
			maxPockets = maxPockets + extraPockets;
			pockets=usedPockets+ " of "+maxPockets+" used";
			bank = bank - calcExtraPocketPrice;
					
			// update UI-items
			updateAllUIElements();	
		}
		else
		{
			var n = noty({text: 'The dude offered you '+extraPockets+' extra pockets for '+calcExtraPocketPrice+' $ but you  denied.'});
			return;
		}
	}
	else
	{
		var n = noty({text: 'The dude offered you '+extraPockets+' extra pockets for '+calcExtraPocketPrice+' $ but you had no money.'});
	}
}


/*
	RANDOM EVENT: Sale / cheap Drugs
*/
function randomEvent_CheapDrugs()
{
	luckEvents = luckEvents + 1;

	var n = noty({text: 'Drug sale - buy now as much as possible'});
	log.info("Cheap drugs on the market")

	// new cost of drugs
	drugs.acid = getRandomInt(300,700);
	drugs.coke = getRandomInt(400,1000);

	// cost per unit
	$('#acidPerUnit').html("$"+drugs.acid);
	$('#cokePerUnit').html("$"+drugs.coke);
}


/*
	RANDOM EVENT: Hank
*/
function randomEvent_HankQuote()
{
	// random hank schrader quotes:
	var hankQuotes = [
					"You're the smartest guy I ever met... but you're too stupid to see... He made up his mind ten minutes ago.", 
					"My name is ASAC Schrader and you can go fuck yourself.",
					"Hey, white boy. My name's Tortuga. You know what that means? Well, if I had to guess, I'd say that's Spanish for asshole.",
					"Do what you're gonna do."
				];
				
	// pick random quote from array
	var randomQuote = hankQuotes[Math.floor(Math.random()*hankQuotes.length)];
				
	// output random quote
	var n = noty({text: "Hank Schrader: "+randomQuote});
}









/*	###########################################
	UNSORTED
	########################################### */

/*
- create all potential drugs
- create events (mugged, police, etc)
*/

var bank = 2000;
var debt = Math.floor(2000);

var currentLocation;
var cashSpent = 0; 
var cashEarned = 0; 
var lastTime = 0;
var maxPockets = 100;
var usedPockets = 0;
var pockets = usedPockets + " of "+maxPockets+" used";


var currentDrugs = {acid:0,coke:0};
var drugs = 
{
	acid:0,
	coke:0,
	unit:function()
	{
		return Math.floor((Math.random()*50)+1)
	}
}; // create new object 


var coke_unit = drugs.unit();
var acid_unit = drugs.unit();

var shark = {capital:10000};
var locations = {ny: "nyc", lnd: "lnd"};  

var acid = drugs.acid;
var coke = drugs.coke;

$('#sell_Drugs').hide();
$('#loanshark_div').hide();
$('#buy_Drugs').hide();
currentLocation = locations.ny; 





// Setup for NYC
//
$('#market').append(' New York City');	// change city title
// cost in nyc
drugs.acid = 700;
drugs.coke = 1400;

var start = 
{
	play: function()
	{
		$('#inBank').html("$"+bank); 
		$('#debt').html("$"+debt);
		$('#listDrugs').html("Acid: " +  currentDrugs.acid + "<br>" + " Coke: " + currentDrugs.coke);
		$('#pockets').html(pockets);

		// how many units available
		$('#acidUnits').html(acid_unit);
		$('#cokeUnits').html(coke_unit);
		
		// cost per unit
		$('#acidPerUnit').html("$"+drugs.acid);
		$('#cokePerUnit').html("$"+drugs.coke);	
	} // play
}; // end start function


start.play();
sellPrice(); 

var pickedAcid = false;
var pickedCoke = false; 


