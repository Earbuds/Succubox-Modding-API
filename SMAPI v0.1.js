function addDrop(resourceDatatype, resourceName, amount, rarity) {
	droptable.push(new LootDrop(
        new ResourceUnlock(resourceDatatype, amount),
        amount + " " + resourceName + ".", rarity));

    droptablemax = 0;
    for(var i = 0; i<droptable.length; i++){
        droptablemax += 100.0/droptable[i].rarity;
    }

    calc_quantum();
}