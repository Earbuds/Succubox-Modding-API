var loadSMAPI;
function loadSMAPI() {
	if(!document.body.contains(document.getElementById('SMAPI'))) {
		var js = document.createElement('script'); 
		js.setAttribute('type', 'text/javascript'); 
		js.setAttribute('id', 'SMAPI');
		js.setAttribute('src', 'https://rawgit.com/Earbuds/Succubox-Modding-API/master/SMAPI.js');
		document.head.appendChild(js);
	}
	
	loadSMAPI = setInterval(loadMod, 1000);
}

function loadMod() {
	clearInterval(loadSMAPI);
	initMod();
	
	modid = "examplemod";
	
	// Drop Format: ItemPair(Resource, Amount), String, Weight
	addDrop(new ItemPair(data.gold, 100), "Gold", 10);
	
	
	var costs = [new ItemPair(data.gold, 100), new ItemPair(data.research, 100)];
	var conditions = [new ItemCondition(new ItemPair(data.gold, 10), "gequal"), new ItemCondition(new ItemPair(data.research, 10), "gequal")];
	var unlocks = [new ItemResult(new ItemPair(data.gold, 10), "mult"), new ItemResult(new ItemPair(data.research, 10), "mult")];
	
	addShopUpgrade("Test Upgrade", "testupgradef", "This is a test upgrade.", costs, conditions, unlocks);
	
	var conditions2 = [new ItemCondition(new ItemPair(data.gold, 10), "gequal"), new ItemCondition(new ItemPair(data.research, 10), "gequal"), modid + "_testupgradef"];

	addShopUpgrade("Test Upgrade 2", "testupgradef2", "This is a test upgrade pt 2.", costs, conditions2, unlocks);
	
	// Not yet saveable
	//addGameEvent("testevent", new ItemCondition(new ItemPair(data.gold, 100), "gequal"), "Test Event", "This event is a test.", "okbox", null);
	//addGameEvent("testeventconscience", new ItemCondition(new ItemPair(data.gold, 100), "gequal"), null, "At least I'm safe here in my mind.", "conscience", null);
	
	postInitMod(modid);
}

loadSMAPI();