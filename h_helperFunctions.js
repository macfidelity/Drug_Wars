/*	###########################################
	HELPERS
	########################################### */

/*
	HELPER: update all ui-elements
*/
function h_updateAllUIElements()
{
	// action buttons
	h_updateTradingButtons();
	
	// update MoneyUI
	h_updateMoneyUI();

	// unselect buy & sell checkboxes for drug-selection
	$('#acid_tick').prop('checked', false);
	$('#coke_tick').prop('checked', false);
	$('#s_acid_tick').prop('checked', false);
	$('#s_coke_tick').prop('checked', false);
	
	// reset max possible buy
	maxPossibleBuy=0;
	$('#maxBuy').html("(max: "+maxPossibleBuy+")");			// update UI
	
	// reset max possible sell
	maxPossibleSell=0;
	$('#maxSell').html("(max: "+maxPossibleSell+")");			// update UI
	
	// update status menues
	$('#calendar').html("Day "+curDay+"/"+maxDays);	//
	$('#inCash').html("$"+cash); 
	$('#inBank').html("$"+bank); 
	$('#listDrugs').html("Acid: " +  currentDrugs.acid + "<br>" + " Coke: " + currentDrugs.coke);
	pockets = usedPockets + "/"+maxPockets;
	$('#pockets').html(pockets); 
	$('#weapons').html(weapons);
	$('#debt').html("$"+debt); 
	$('#health').html(health+"%"); 
} // END: updateAllUIElements()



/*
	HELPER: delete all data from localStorage - kinda reset
*/
function h_resetLocalStorage()
{	
	// delete stored username
	localStorage.removeItem("playersName");
	// delete setting for random Quotes
	localStorage.removeItem("enableRandomQuotes");
	// delete highscore values
	// 30
	localStorage.removeItem("highscore_30");
	localStorage.removeItem("player_30");
	localStorage.removeItem("moneyPerDay_30");
	localStorage.removeItem("date_30");
	// 45
	localStorage.removeItem("highscore_45");
	localStorage.removeItem("player_45");
	localStorage.removeItem("moneyPerDay_45");
	localStorage.removeItem("date_45");
	// 90
	localStorage.removeItem("highscore_90");
	localStorage.removeItem("player_90");
	localStorage.removeItem("moneyPerDay_90");
	localStorage.removeItem("date_90");
	// 120
	localStorage.removeItem("highscore_120");
	localStorage.removeItem("player_120");
	localStorage.removeItem("moneyPerDay_120");
	localStorage.removeItem("date_120");
	
	// inform user
	var n = noty({text: 'Deleted all game-related data from localStorage. Follow the white rabbit neo.'});
	return;
}



/*
	HELPER: check browser support for localStorage and if supported get some values from it
*/
function h_checkLocalStorageSupport()
{
	if(typeof(Storage) !== "undefined")  // if supported
	{
		// playername
		document.getElementById("fname").innerHTML = localStorage.getItem("playersName"); 
		lastName = localStorage.getItem("playersName"); 	// get the last name used in this game from local storage
		// set the name into the settings dialog
		var elem = document.getElementById("fname");
		elem.value = lastName;
		
		// get value for RandomQuotes & set menu icon according to it
		enableRandomQuotes = localStorage.getItem("enableRandomQuotes"); // get value from localStorage
		if(enableRandomQuotes == 1) // make quote icon in menu according to current setting
		{
			iconText = '<i class="fa fa-comment"></i> Quotes </a>';
		}
		else
		{
			iconText = '<span class="fa-stack fa-lg"><i class="fa fa-comment fa-stack-1x"></i><i class="fa fa-ban fa-stack-1x text-danger"></i></span> Quotes </a>';
		}
		$('#menuItemQuotes').html(iconText); // update Icon
	} 
	else // no support for localStorage
	{
		alert("No support for Local storage found. This means: No highscore management possible.");
	}
} // END: checkLocalStorageSupport()


/*
	HELPER: show only the settings div - and hide all the others
*/
function h_showSettingsOnly()
{
	// show settings div
	$('#div_Settings').hide(); 
	$('#div_Settings').fadeIn(1000); // 1 sec
	
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
	HELPER: disable the 4 main-action buttons
*/
function h_disableActionButtons()
{
	document.getElementById("choose_buyd").disabled = true;		// disable buy button
	document.getElementById("choose_selld").disabled = true;	// disable sell shark
	document.getElementById("choose_city").disabled = true;		// disable travel button
	document.getElementById("choose_loan").disabled = true;		// disable loan shark
} // END: disableActionButtons()


/*
	HELPER: calculate max possible buy for selected drug
*/
function h_calculateMaxBuy()
{
	if(choosenDrug == "Acid")
	{
		maxPossibleBuy = Math.floor(cash / drugs.acid);
		// check if enough pocksts are available
		if(maxPossibleBuy > freePockets)
		{
			maxPossibleBuy = freePockets;
		}
		if(maxPossibleBuy > acid_unit) // check if enough is available
		{
			maxPossibleBuy = acid_unit;
		}
		
		$('#maxBuy').html("(max: "+maxPossibleBuy+")");			// update UI
		
		if(maxPossibleBuy == 0)
		{
			document.getElementById("acid_tick").disabled = true;
		}
	}
	
	if(choosenDrug == "Coke")
	{
		maxPossibleBuy = Math.floor(cash / drugs.coke);
		
		// consider available/free pockets
		if(maxPossibleBuy > freePockets)
		{
			maxPossibleBuy = freePockets;
		}
		
		// check if enough is available
		if(maxPossibleBuy > coke_unit) 
		{
			maxPossibleBuy = coke_unit;
		}
		
		$('#maxBuy').html("(max: "+maxPossibleBuy+")");			// update UI
		
		if(maxPossibleBuy == 0)
		{
			document.getElementById("coke_tick").disabled = true;
		}
	}
	
	// insert max value into text field
	$('#buyDrugs').val(maxPossibleBuy);
}



/*
	HELPER: calculate max possible sell for selected drug
*/
function h_calculateMaxSell()
{	
	if(choosenDrug == "Acid")
	{
		// check what we have
		maxPossibleSell = currentDrugs.acid
		
		$('#maxSell').html("(max: "+maxPossibleSell+")");			// update UI
		
		
		if(maxPossibleSell == 0)
		{
			document.getElementById("s_acid_tick").disabled = true;
		}
	}
	
	if(choosenDrug == "Coke")
	{
		// check what we have
		maxPossibleSell = currentDrugs.coke
		
		$('#maxSell').html("(max: "+maxPossibleSell+")");			// update UI
		
		if(maxPossibleSell == 0)
		{
			document.getElementById("s_coke_tick").disabled = true;
		}
	}
	
	// insert max value into text field
	$('#sellDrugs').val(maxPossibleSell);
}



/*
	HELPER: update Loan Payback section
*/
function h_updateMoneyUI()
{	
	// based on bank 
	//
	if(bank > 0)
	{
		$("#form_Bank_payOut").show();		// hide all pay-out stuff
	}
	else
	{
		$("#form_Bank_payOut").hide();		// hide all pay-out stuff
	}
	
	
	
	// based on cash 
	//
	if(cash > 0)
	{
		$("#form_Bank_deposit").show();		// hide all pay-out stuff
		$("#btn_payDebtMax").show();
	}
	else // no cash
	{
		$("#btn_payDebtMax").hide();
		$("#form_Bank_deposit").hide();		// hide all pay-out stuff
		$("#form_Loan_Payback").hide();		// hide all payback options
	}
	
	
	// based on debt
	if(debt > 0)
	{
		$("#form_Loan_Payback").show();
		$("#btn_payDebt").show();

		if(cash > debt)
		{
			$("#btn_payDebtAll").show();
			$("#btn_payDebtMax").hide(); // hide MAX - as ALL is displayed already
		}
		else
		{
			$("#btn_payDebtAll").hide();
		}
	}
	else // player has no debt
	{
		$("#form_Loan_Payback").hide();		// hide all payback options
	}
}


/*
	HELPER: load highscore from localStorage and display it in UI
*/
function h_loadHighscoreFromLocalStorage() 
{
	// 30 Days
	highscore_30_score = localStorage.getItem("highscore_30");
	if(highscore_30_score == null)
	{
		$('#score_30').html("<i>No highscore available yet</i>");
	}
	else
	{
		// get values
		highscore_30_name = localStorage.getItem("player_30");
		highscore_30_moneyPerDay = localStorage.getItem("moneyPerDay_30");
		highscore_30_date = localStorage.getItem("date_30");
		
		// display values
		$('#score_30').html("<b>"+highscore_30_score+"</b>");
		$('#player_30').html("by "+highscore_30_name);
		$('#moneyPerDay_30').html("("+highscore_30_moneyPerDay+" per Day)");
		$('#date_30').html("at "+highscore_30_date);
	}
	
	
	// 45 Days
	highscore_45_score = localStorage.getItem("highscore_45");
	if(highscore_45_score == null)
	{
		$('#score_45').html("<i>No highscore available yet</i>");
	}
	else
	{
		// get values
		highscore_45_name = localStorage.getItem("player_45");
		highscore_45_moneyPerDay = localStorage.getItem("moneyPerDay_45");
		highscore_45_date = localStorage.getItem("date_45");
		
		// display values
		$('#score_45').html("<b>"+highscore_45_score+"</b>");						
		$('#player_45').html("by "+highscore_45_name);
		$('#moneyPerDay_45').html("("+highscore_45_moneyPerDay+" per Day)");
		$('#date_45').html("at "+highscore_45_date);
	}
	
	
	// 90 Days
	highscore_90_score = localStorage.getItem("highscore_90");
	if(highscore_90_score == null)
	{
		$('#score_90').html("<i>No highscore available yet</i>");
	}
	else
	{
		// get values
		highscore_90_name = localStorage.getItem("player_90");
		highscore_90_moneyPerDay = localStorage.getItem("moneyPerDay_90");
		highscore_90_date = localStorage.getItem("date_90");
		
		// display values
		$('#score_90').html("<b>"+highscore_90_score+"</b>");						
		$('#player_90').html("by "+highscore_90_name);
		$('#moneyPerDay_90').html("("+highscore_90_moneyPerDay+" per Day)");
		$('#date_90').html("at "+highscore_90_date);
	}
	
	
	
	// 120 Days
	highscore_120_score = localStorage.getItem("highscore_120");
	if(highscore_120_score ==  null )
	{
		$('#score_120').html("<i>No highscore available yet</i>");
	}
	else
	{
		// get values
		highscore_120_name = localStorage.getItem("player_120");
		highscore_120_moneyPerDay = localStorage.getItem("moneyPerDay_120");
		highscore_120_date = localStorage.getItem("date_120");
		
		// display values
		$('#score_120').html("<b>"+highscore_120_score+"</b>");
		$('#player_120').html("by "+highscore_120_name);	
		$('#moneyPerDay_120').html("("+highscore_120_moneyPerDay+" per Day)");
		$('#date_120').html("at "+highscore_120_date);
	}
}


/*
	HELPER: get randon int 
*/
function h_getRandomInt(min, max) 
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


/*
	HELPER: updateTradingButtons (enable or disable them based on the amount of money and/or drugs in pocket
*/
function h_updateTradingButtons()
{
	log.info("Updating trade buttons")
	
	// Buy-Area button
	//
	if(cash>0) // player has money - enable buy button
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
function h_updateDebt()
{
	if(debt > 0) // only if player has debt
	{
		log.info("Update debt (adding 10%")
		debt = Math.round(debt * 1.1);	// calculate new debt
		h_updateAllUIElements();
	}
}


/*
	HELPER: Calculate debt (happens on each new day)
*/
function h_updateBank()
{
	if(bank > 0) // only if player has money in bank account
	{
		log.info("Update bank (adding 5%")
		bank = Math.round(bank * 1.05);	// calculate new bank
		h_updateAllUIElements();
	}
}


/*
	HELPER: Random Events
*/
function h_randomEventsOnDayChange()
{
	log.info("Check for random events")
	
	if(curDay >= 2) // not on the first day
	{
		var shouldRandomHappen = h_getRandomInt(1,10); // calculate chance for a random event
		if(shouldRandomHappen >= 8) // random event happens
		{
			var x = h_getRandomInt(1,7); // what random event should happen?
			log.debug("Random Event: "+x)

			// Execute Random Event: Police
			switch(x)
			{
				case 1:
					r_randomEventPolice();
				break;

				case 2:
					r_randomEventRobbery();
				break;

				case 3:
					r_randomEventFindDrugs();
				break;

				case 4:
					r_randomEventExtraPockets();
				break;

				case 5:
					r_randomEventCheapDrugs();
				break;

				case 6:
					r_randomEventBuyWeapon();
				break;
				
				case 7:
					r_randomEventCancerReturns();
				break;
			} // end case
		}
		log.debug("Luck Events Overall: "+luckEvents);
		log.debug("Bad Luck Events Overall: "+badLuckEvents);
	}
}




/*
	HELPER: Random People Quotes
*/
function h_randomPeopleQuotesOnDayChange()
{
	log.info("Check for random people quotes")
	
	if(curDay >= 2) // not on the first day
	{
		var shouldRandomHappen = h_getRandomInt(1,10); // calculate chance for a random event
		if(shouldRandomHappen >= 8) // random event happens
		{
			var x = h_getRandomInt(1,5); // what random event should happen?
			log.debug("Random Quote: "+x)
	
			// Execute Random Quote
			switch(x)
			{
				case 1:
					r_randomQuoteJesse();
				break;

				case 2:
					r_randomQuoteHank();
				break;
				
				case 3:
					r_randomQuoteHector();
				break;
				
				case 4:
					r_randomQuoteMike();
				break;
				
				case 5:
					r_randomQuoteSaul();
				break;
			} // end case
		}
	}
}
	




/*
	HELPER: reduce player health and colorize it based on the value
*/
function h_reduceHealth()
{
	health = health - healthDamage;

	// fit color (green -> orange -> red -> death)
	switch(health)
	{
		case 70:
			$('#health').css('color', 'orange');
		break;

		case 30:
			$('#health').css('color', 'red');
		break;

		case 0:
			var n = noty({text: 'You just died. RIP.'});
			gameEnded();
		break;
	} 
}



/*
	HELPER: h_getRobbed
	function:	player looses between 10%-90% of the money in his pockets & 10% health
*/
function h_getRobbed()
{
	var robberyFactor = h_getRandomInt(10,90); // calculate the percentage player will loose while being robbed

	// calculate money stolen
	var stolen = Math.round(cash / 100 * robberyFactor);
	cash = cash - stolen; 
				
	var n = noty({text: '<p><i class="fa fa-qq"></i> Robbery</p>You got robbed. Loss '+stolen+' $.'});
	log.info("Got robbed - you lost "+stolen+" $ (robbery)");
	
	health = health -10;
	
	h_updateAllUIElements();
}




/*
	HELPER: h_updateFuckCounter
	function:	player did a mistake - fuckcounter++ - if too high - sanction player
*/
function h_updateFuckCounter()
{
	fuckCounter=fuckCounter+1;
	
	switch(fuckCounter)
	{
		case 5:
			var n = noty({text: '<p><i class="fa fa-tachometer"></i> Fuck Counter</p>Dude ... your fuck counter is on 5 - next time it will cost you heavily'});
		break;

		case 6:
			var n = noty({text: '<p><i class="fa fa-tachometer"></i> Ezekiel 25:17</p>The path of the righteous man is beset on all sides by the inequities of the selfish and the tyranny of evil men. Blessed is he who, in the name of charity and good will, shepherds the weak through the valley of darkness, for he is truly his brothers keeper and the finder of lost children. And I will strike down upon thee with great vengeance and furious anger those who attempt to poison and destroy my brothers. And you will know I am the Lord when I lay my vengeance upon you.'});
			bank = 0;
			if(cash >0)
			{
				cash = cash - (cash/2);
			}
		break;
	} 
	h_updateAllUIElements();
}