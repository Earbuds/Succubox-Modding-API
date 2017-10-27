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
	
	// Resource Format: Name of Resource, Singular Name of Resource, Internal Name of Resource (usually lowercase name w/ underscores instead of spaces), Initial Value of Resource
	addResource("Ex Resources", "Ex Resource", "ex_resource", 	1);
	
	// Drop Format: ItemPair(Resource, Amount), String, int
	addDrop(new ItemPair("gold", 100), "Gold", 10);
	
	var costs = [new ItemPair("gold", 100), new ItemPair("research", 100)];
	var conditions = [new ItemCondition(new ItemPair("gold", 10), "gequal"), new ItemCondition(new ItemPair("research", 10), "gequal")];
	var unlocks = [new ItemResult(new ItemPair("gold", 10), "mult"), new ItemResult(new ItemPair("research", 10), "mult")];
	
	addShopUpgrade("Test Upgrade", "testupgradef", "This is a test upgrade.", costs, conditions, unlocks);
	
	conditions.push(modid + "_testupgradef");
	addShopUpgrade("Test Upgrade 2", "testupgradef2", "This is a test upgrade pt 2.", costs, conditions, unlocks);
	
	costs.push(new ItemPair("ex_resource", 1));
	conditions.push(new ItemCondition(new ItemPair("ex_resource", 1), "gequal"));
	unlocks.push(new ItemResult(new ItemPair("ex_resource", 100), "add"));
	addShopUpgrade("Test Upgrade 3", "testupgradef3", "This is a test upgrade pt 3.", costs, conditions, unlocks);
	
	addGameEvent("testevent", new ItemCondition(new ItemPair("ex_resource", 100), "gequal"), "Test Event", "This event is a test.", "okbox", null);
	addGameEvent("testeventconscience", new ItemCondition(new ItemPair("ex_resource", 100), "gequal"), null, "At least I'm safe here in my mind.", "conscience", null);
	
	postInitMod(modid);
}

loadSMAPI();