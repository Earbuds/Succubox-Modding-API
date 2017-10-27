/** ----- GENERICS ----- **/

// Used to register objects and distinguishes mods
var modid = "DEFAULT_MODID";

// Temporary modded object arrays
var mod_res = [];
var mod_shop_items = [];
var mod_events = [];
var mod_recipes = [];

// Persistent modded object arrays
var mod_resp = [];
var mod_shop_itemsp = [];
var mod_eventsp = [];
var mod_recipesp = [];

// Count of mods currently loaded
var mods_loaded = 0;

// Modded saveInterval, can be cancelable
var saveInterval;

/** 
Easy-to-use object which consists of an item and an amount of that item
*/
function ItemPair(item, amount) {
	if(mod_res[modid + "_" + item] != null) this.item = data[modid + "_" + item];
	else this.item = data[item];
	this.amount = amount;
}

/**
Used for checks between an item and amount in an ItemPair with a specific operator.

OPERATORS - equal: equal to amount
			         gequal: greater than or equal to amount
		         	 lequal: less than or equal to amount
			         nequal: not equal to amount
*/
function ItemCondition(itemPair, operator) {
	this.itemPair = itemPair;
	this.operator = operator;
}

/**
Used to change an item by an amount using a type of operator on completion of an action

OPERATORS - add: adding/subtracting an amount (just use negative amount in ItemPair lol)
			         mult: multiplies by amount
			         div: divides by amount
			         mod: modulo by amount
		          	 exp: exponentially increases by amount
		             equals: equals new amount
*/
function ItemResult(itemPair, operator) {
	this.itemPair = itemPair;
	this.operator = operator;
}

/**
Checks an ItemCondition and returns true or false
*/
function CheckItemCondition(itemCondition) {
	if(itemCondition.operator == "equal") return itemCondition.itemPair.item.value == itemCondition.itemPair.amount;
	else if(itemCondition.operator == "gequal") return itemCondition.itemPair.item.value >= itemCondition.itemPair.amount;
	else if(itemCondition.operator == "lequal") return itemCondition.itemPair.item.value <= itemCondition.itemPair.amount;
	else if(itemCondition.operator == "nequal") return itemCondition.itemPair.item.value != itemCondition.itemPair.amount;
	else return false;
}

/**
Changes an item by an amount using an expression defined by an ItemResult
*/
function ParseResult(itemResult) {
	if(itemResult.operator == "add") itemResult.itemPair.item.value += itemResult.itemPair.amount;
	else if(itemResult.operator == "mult") itemResult.itemPair.item.value *= itemResult.itemPair.amount;
	else if(itemResult.operator == "div") itemResult.itemPair.item.value /= itemResult.itemPair.amount;
	else if(itemResult.operator == "mod") itemResult.itemPair.item.value %= itemResult.itemPair.amount;
	else if(itemResult.operator == "exp") itemResult.itemPair.item.value **= itemResult.itemPair.amount;
	else if(itemResult.operator == "equals") itemResult.itemPair.item.value = itemResult.itemPair.amount;
}

// MOD STARTUP

/**
Called before a mod is initialized
*/
function initMod() {
	mod_res = [];
	mod_shop_items = [];
	mod_events = [];
}

/**
Called after a mod is done being initialized
*/
function postInitMod(id) {
	modLoad(id);
	
	if(mods_loaded == 1) saveInterval = setInterval(modSave, 1000*60);
	else {
		clearInterval(saveInterval);
		saveInterval = setInterval(modSave, 1000*60);
	}
	
	addGameEvent("loadedEvent", new ItemCondition(new ItemPair("gold", 0), "gequal"), "MOD LOADED", "Mod: \""+ modid + "\" loaded successfully!", "okbox", null);
}

// SAVING

/**
Saves all modded objects
*/
function modSave() {
	var storage = window.localStorage;
	
	for(var i = 0; i < mod_resp.length; i++) {
		if(mod_resp[i].constructor === PairObjectArray) {
			storage.setItem(mod_resp[i].id + "_save_exists", JSON.stringify(true));
			
			for(obj in mod_res[i].objArr) {
				if(data[obj].value == NUMBER.POSITIVE_INFINITY || isNaN(data[obj].value)) storage.setItem("data-" + obj, "inf");
				else storage.setItem("data-" + obj, JSON.stringify(data[obj]));
			}
		}
	}
	
	for(var i = 0; i < mod_shop_itemsp.length; i++) {
		if(mod_shop_itemsp[i].constructor === PairObjectArray) {
			for(obj in mod_shop_itemsp[i].objArr) {
				storage.setItem("shopbought-" + obj, JSON.stringify(shop_items[obj].bought));
				storage.setItem("shopavailable-" + obj, JSON.stringify(shop_items[obj].available));
			}
		}
	}
	
	for(var i = 0; i < mod_eventsp.length; i++) {
		if(mod_eventsp[i].constructor === PairObjectArray) {
			for(obj in mod_eventsp[i].objArr) {
				storage.setItem("event-" + obj, JSON.stringify(game_events[obj].unlocked));
			}
		}
	}
}

/**
Loads data from a specific mod
*/
function modLoad(id) {
	var storage = window.localStorage;
	
	if(storage.getItem(id + "_save_exists")) {
		for(obj in mod_res) {
			if(storage.getItem("data-" + obj)) {
				if(storage.getItem("data-" + obj) == "inf") data[obj].value == Number.POSITIVE_INFINITY;
				else data[obj].value = JSON.parse(storage.getItem("data-" + obj));
			}
		}
	
		for(obj in mod_shop_items) {
			if(storage.getItem("shopbought-" + obj)) {
				shop_items[obj].bought = JSON.parse(storage.getItem("shopbought-" + obj));
				shop_items[obj].available = JSON.parse(storage.getItem("shopavailable-" + obj));
			}
		}
		
		for(obj in mod_events) {
			if(storage.getItem("event-" + obj)) {
				game_events[obj].unlocked = JSON.parse(storage.getItem("event-" + obj));
			}
		}
	}
	
	mod_resp.push(new PairObjectArray(id, mod_res));
	mod_shop_itemsp.push(new PairObjectArray(id, mod_shop_items));
	mod_eventsp.push(new PairObjectArray(id, mod_events));
	
	mods_loaded += 1;
}

/**
Used to pair arrays of objects with a modid for saving purposes

TAKES: String, array of: (mod_shop_items, mod_res, mod_events)
*/
function PairObjectArray(modid, objectArray) {
	this.id = modid;
	this.objArr = objectArray;
}

// RESOURCES

/**
Adds a custom resource to the list of all resources.

TAKES: String, String, String, int
*/
function addResource(name, singularName, internalName, initialValue) {
	var resName = modid + "_" + internalName;
	
	mod_res[resName] = new Resource(name, initialValue);
	mod_res[resName].singular = singularName;
	
	data[resName] = mod_res[resName];
}

// DROPS

/**
Adds a drop with a specific weight and result to the drop table pool.

TAKES: ItemPair, String, int.

Lower rarity = better odds at getting drop
*/
function addDrop(itemPair, resourceName, rarity) {
	droptable.push(new LootDrop(
        new ResourceUnlock(itemPair.item, itemPair.amount),
        itemPair.amount + " " + resourceName + ".", Math.abs(rarity))); // just in case someone decides to be cheeky

    droptablemax = 0;
    for(var i = 0; i<droptable.length; i++){
        droptablemax += 100.0/droptable[i].rarity;
    }

    calc_quantum();
}

// SHOP UPGRADES

/**
Adds a shop upgrade with a specific name, internal name, upgradeDescription, any amount of costs, conditions, and resultant unlocks

TAKES: String, String, String, ItemPair or array of ItemPairs, ItemCondition or array of ItemConditions, and ItemResult or array of ItemResults
*/
function addShopUpgrade(upgradeName, upgradeInternalName, upgradeDescription, upgradeCost, upgradeAppearCondition, upgradeUnlock) {
	
	var costs;
	var allcosts = [];
	
	if(upgradeCost.constructor === Array) {
		for(var i = 0; i < upgradeCost.length; i++) {
			allcosts.push(new Cost(upgradeCost[i].item, upgradeCost[i].amount));
		}
	} else allcosts.push(new Cost(upgradeCost.item, upgradeCost.amount));
	
	var entryName = modid + "_" + upgradeInternalName;
	mod_shop_items[entryName] = new UpgradeButton(panes.shop_available, upgradeName, upgradeDescription, new MultiCost(...allcosts),
		function(){ //show condition
			if(upgradeAppearCondition.constructor === Array) {
				var conditions = []; // boolean array for conditions
				
				for(var i = 0; i < upgradeAppearCondition.length; i++) {
					if(upgradeAppearCondition[i].constructor === ItemCondition) {
						conditions.push(CheckItemCondition(upgradeAppearCondition[i]));
					}else {
						if(!shop_items[upgradeAppearCondition[i]]) conditions.push(false);
						else conditions.push(shop_items[upgradeAppearCondition[i]].bought);
					}
				}
				
				for(var i = 0; i < conditions.length; i++) if(!conditions[i]) return false;
				return true;
			}else if(upgradeAppearCondition.constructor === ItemCondition) {
				return CheckItemCondition(upgradeAppearCondition);
			}else {
				if(!shop_items[upgradeAppearCondition]) return false; // If it's not an array or ItemCondition, assume it's a string of another shop upgrade
				return shop_items[upgradeAppearCondition].bought;
			}
		},
		
		function(){ //unlock
			if(upgradeUnlock.constructor === Array) {
				for(var i = 0; i < upgradeUnlock.length; i++) ParseResult(upgradeUnlock[i]);
			} else ParseResult(upgradeUnlock);
		}
	);
	
	shop_items[entryName] = mod_shop_items[entryName];
}

// GAME EVENTS

/**
Creates a game event
It can either appear as an 'OK box' on the screen or in the conscience

TAKES: String, ItemCondition or array of ItemConditions, String, String, String, and ItemResult or array of ItemResults

TYPES - okbox: Creates an OK box that appears in the middle of your screen
			conscience: Creates an event that appears in the conscience, eventTitle not needed
*/
function addGameEvent(eventName, eventAppearCondition, eventTitle, eventText, eventType, eventResult) {
	game_events[eventName] = new GameEvent(
		function(){ //condition
			if(eventAppearCondition.constructor === Array) {
				var conditions = []; // boolean array for conditions
				
				for(var i = 0; i < eventAppearCondition.length; i++) {
					if(eventAppearCondition[i].constructor === ItemCondition) {
						conditions.push(CheckItemCondition(eventAppearCondition[i]));
					}else {
						if(!shop_items[eventAppearCondition[i]]) conditions.push(false);
						else conditions.push(shop_items[eventAppearCondition[i]].bought);
					}
				}
				
				for(var i = 0; i < conditions.length; i++) if(!conditions[i]) return false;
				return true;
			}else if(eventAppearCondition.constructor === ItemCondition) {
				return CheckItemCondition(eventAppearCondition);
			}else {
				if(!shop_items[eventAppearCondition]) return false; // If it's not an array or ItemCondition, assume it's a string of another shop upgrade
				return shop_items[eventAppearCondition].bought;
			}
		},
		function(){ //result
			if(eventType == "okbox") alertOK(eventTitle, eventText);
			else if(eventType == "conscience") UpdateInfoTicker(eventText);
			else {
				console.log("Invalid eventType: " +eventType + ".");
				return;
			}
			
			if(eventResult == null) return;
			if(eventResult.constructor === Array) {
				for(var i = 0; i < eventResult.length; i++) ParseResult(eventResult[i]);
			}else ParseResult(eventResult);
		}
	);
}