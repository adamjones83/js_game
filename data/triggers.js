// Handles object triggers
// The trigger strings are in the form "cmd,arg1,arg2,..,argN"
// Triggers are run when attempting to walk onto an object space, walkable or not
GAME.DoTrigger = function(str) {
	if(typeof str != "string") return;
	var cmd = str.split(",")[0];
	var args = str.substring(str.indexOf(",")+1).split(",");
	switch(cmd){
		case "say":
			GAME.info.Write(args.join(","));
			break;
		case "alert":
			alert(args.join(","));
			break;
		case "move":
			var player = GAME.characters[0];
			player.x += (args[0]*1);
			player.y += (args[1]*1);
			break;
		case "teleport":
			var player = GAME.characters[0];
			player.x = (args[0]*1);
			player.y = (args[1]*1);
			break;
		case "loadmap":
			GAME.viewport.LoadMap(args[0], {x: args[1]*1, y: args[2]*1});
			break;
		default:
			alert("Trigger: " + str);
			break;
	};
};