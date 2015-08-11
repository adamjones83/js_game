// Sets GAME.RunCommand to a function that processes commands, but has a closure around some extra variables
$(document).ready(function(){
	GAME.RunCommand = (function(){
		var player = GAME.characters[0], i, cmdstr, cmdpending=false;
		var CmdPending = function(fn, cursor) {
			cmdpending=true;
			if(!cursor) $("#viewport").addClass("cmdpending");
			else if(cursor=="whatis") $("#viewport").addClass("whatis");
			GAME.viewport.OnClick(fn);
		}
		var CmdDone = function() {
			cmdpending=false;
			$("#viewport").removeClass("cmdpending");
			$("#viewport").removeClass("whatis");
			GAME.viewport.OnClick(function(){});
		}
		var disabled = {};
		var MoveTo = function(x,y){
			// Get the cell info into a variable
			var cellinfo = GAME.viewport.CellInfo(x,y), objs;
			
			// Process triggers for all objects on the cell
			objs = cellinfo.objects
			for(i=0;i<objs.length;i++) {
				GAME.DoTrigger(objs[i].trigger);
			}
			// If you can walk onto the space, update the player coordinates
			if(cellinfo.walkable) {
				player.x = x;
				player.y = y;
			}
		}
		// The function that will be assigned to GAME.RunCommand, contains a closure around above functions & variables
		var that = function(cmd){
			if(disabled[cmd]) return;
			switch(cmd){
				case "up":
					MoveTo(player.x, player.y-1);
					break;
				case "down":
					MoveTo(player.x, player.y+1);
					break;
				case "left":
					MoveTo(player.x-1, player.y);
					break;
				case "right":
					MoveTo(player.x+1, player.y);
					break;
				case "save":
					alert("Saving Game");
					break;
				case "load":
					alert("Loading Game");
					break;
				case "character":
					alert("Character Screen");
					break;
				case "inventory":
					alert("Inventory Screen");
					break;
				case "map":
					alert("Map Screen");
					break;
				case "look":
					CmdPending(function(x,y){
						var str = "You see:", objs, i, isVisibleHere = function(obj){
							if(obj.x==x && obj.y==y && obj.visible==true) return true;
							return false
						};
						for(i=0;i<GAME.characters.length;i++) if(isVisibleHere(GAME.characters[i])) str += "\n"+GAME.characters[i].name;
						objs = GAME.viewport.CellInfo(x,y).objects;
						for(i=0;i<objs.length;i++) if(isVisibleHere(objs[i])) str += "\n"+objs[i].name;
						alert(str);
						CmdDone();
					}, "whatis");
					break;
				case "get":
					break;
				case "push":
					CmdPending(function(x,y){
						alert("You push at {" + x + ", " + y + "}");
						CmdDone();
					});
					break;
				case "disarm":
					CmdPending(function(x,y){
						alert("You disarm at {" + x + ", " + y + "}");
						CmdDone();
					});
					break;
				case "shoot":
					CmdPending(function(x,y){
						alert("You shoot at {" + x + ", " + y + "}");
						CmdDone();
					});
					break;
				case "heal":
					CmdPending(function(x,y){
						alert("You heal at {" + x + ", " + y + "}");
						CmdDone();
					});
					break;
				case "plague":
					CmdPending(function(x,y){
						alert("You plague at {" + x + ", " + y + "}");
						CmdDone();
					});
					break;
				case "fear":
					CmdPending(function(x,y){
						alert("You fear at {" + x + ", " + y + "}");
						CmdDone();
					});
					break;
				case "confusion":
					CmdPending(function(x,y){
						alert("You 'confusion' at {" + x + ", " + y + "}");
						CmdDone();
					});
					break;
				case "bless":
					CmdPending(function(x,y){
						alert("You bless at {" + x + ", " + y + "}");
						CmdDone();
					});
					break;
				case "curse":
					CmdPending(function(x,y){
						alert("You curse at {" + x + ", " + y + "}");
						CmdDone();
					});
					break;
				case "partwater":
					CmdPending(function(x,y){
						alert("You partwater at {" + x + ", " + y + "}");
						CmdDone();
					});
					break;
				case "cancel":
					if(cmdpending){
						CmdDone();
					}
					break;
				default:
					// Allows you to disable a command using the cmd 'disable,cmdstr'
					if(cmd.split(",")[0]=="disable") {
						cmdstr = cmd.substr(cmd.indexOf(",")+1);
						GAME.menu.Disable(cmdstr);
						GAME.buttons.Disable(cmdstr);
						disabled[cmdstr] = true;
						break;
					}

					// Allows you to enable a command using the cmd 'enable,cmdstr'
					if(cmd.split(",")[0]=="enable") {
						cmdstr = cmd.substr(cmd.indexOf(",")+1);
						GAME.menu.Enable(cmdstr);
						GAME.buttons.Enable(cmdstr);
						delete disabled[cmdstr];
						break;
					}
					
					// If the command is not recognized, it will just alert the command
					alert("Command: " + cmd);
					break;
			}
			GAME.viewport.Update();
		};
		return that;
	}());
	
	// Runs GAME.Initialized if all components are finished being initialized
	if((typeof GAME.info.Write)!="string") GAME.EnvInitialized();
});