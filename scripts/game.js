/*
	--- GAME: Programmers Notes ---
	The current state of affairs:
	* Need to implement command verbs
	* Need to implement Save/Load
	* Need to implement Inventory
	* Need to implement Character Screen
	* Need to implement Map
	* Need to create more images
	* Need to create a story and game goal
	
	Currently implemented:
	Loads viewport, menu, buttons, maps, objects, characters
	Keypresses and mouse commands are interpreted as command verbs
	Command pending is in place for commands that require a mouse click
	Functions can run when you attempt to move onto objects with triggers attached
	Info div can be written to including links that can perform ingame actions
	All mapfiles in maps folder load and are accessible by name under GAME.maps
	
*/
GAME = JSON.Load("data/game object.json");
$(document).ready(function(){
	// Load maps, keypress object, mouse object, menu and sidebuttons, the main game objects
	// Show the first state of the game, and wait for key or mouse commands to change the state
	
	// Load all the maps in the map folder
	GAME.maps = (function(){
		var fso, folder, files, map, that={};
		fso = new ActiveXObject("Scripting.FileSystemObject");
		folder = fso.GetFolder("maps");
		files = new Enumerator(folder.files);
		for (; !files.atEnd(); files.moveNext()){
			map = JSON.Load(files.item());
			that[map.name] = map;
		}
		return that;
	}());
	
	// Translates key events into game commands using the custom keycommands file
	GAME.Keypress = (function(){
		var keymap = JSON.Load("data/keycommands.json");
		return function(e){
			var key = String.fromCharCode(e.keyCode),cmd="";
			if(keymap.hasOwnProperty(key)) cmd = keymap[key];
			else if(e.keyCode==27) cmd="cancel";
			GAME.RunCommand(cmd);
		};
	}());
	
	// Loads the viewport object: {LoadMap: function, Update: function, OnClick: function, CellInfo: function}
	GAME.viewport = (function(){
		/*	(Comment:) --- INFO ABOUT THE IMGPOOL: ---
			The image pool reuses the same img elements each time the viewport is updated.
			This limits memory consumption and possible memory leaks (if the IE memory leak bug applies to HTAs)
			Objects needing to be shown are assigned to an img from the pool.
			When you run out, no more objects are shown and a message is displayed using GAME.info.Write
			Increase IMG_LIMIT to allow for more objects, but this creates a bigger img pool
		*/
		
		var x=0, y=0, imgs, imgpool, last_img=0, prev_last_img=0, i, that={}, mapObj=null, objArray=null, imgClick=null;
		var IMG_LIMIT = 100;
		
		// Create the tile images that are always showing
		for(i=0;i<100;i++) $("#viewport").append($("<img src='images/blank.png' />"));
		imgs = $("#viewport img");
		
		// Create the image pool used to show objects
		for(i=0;i<IMG_LIMIT;i++) $("#viewport").append($("<img class=\"imgpool\" src='images/blank.png' />"));
		imgpool = $("#viewport img.imgpool");
		
		// Attach onclick to the viewport and run imgClick with the map coordinates
		$("#viewport")[0].onclick =(function(e){
			var dx = Math.floor((event.x-1)/40), dy = Math.floor(event.y/40);
			// This is to fix clicking on the right border giving you a dx value of 10 (border is clickable for horizontal axis: why???)
			if(dx==10)dx=9;
			imgClick(x+dx,y+dy);
		});
		
		// Load a map into the viewport
		that.LoadMap = function(map, point){
			var i;
			x = point.x || 0;
			y = point.y || 0;
			x*=1, y*=1; // to make sure they are numerical values
			mapObj=GAME.maps[map];
			// Loads objects from the map file
			objArray=[];
			for(i=0;i<mapObj.objects.length;i++) {
				// Make a fresh copy of the object from the item prototypes
				objArray[i] = JSON.parse(JSON.stringify(GAME.item_prototypes[mapObj.objects[i].id]));
				// Apply the item specific values from the map file (allowing item prototype default values to be overridden
				for(key in mapObj.objects[i]) if(mapObj.objects[i].hasOwnProperty(key)) objArray[i][key] = mapObj.objects[i][key];
			}
		
			if(!(mapObj.width && mapObj.height && mapObj.tiles && mapObj.images)) throw {message: "Bad Map"};
			that.Update();
		};
		
		// Get the rectangle of data and display it in the viewport
		that.Update = function(point){
			var i, j, tiles=[], current_img=0;
			var tmp_array, tmp_array_len, obj;
			if(point) {
				x = point.x || x; y = point.y || y;
				x*=1, y*=1; // to make sure x and y are numerical values
			};
			else {
				if (Math.abs((x+5)-GAME.characters[0].x)>3) x=GAME.characters[0].x-5;
				if (Math.abs((y+5)-GAME.characters[0].y)>3) y=GAME.characters[0].y-5;
			};
			if(x<0)x=0;
			if(y<0)y=0;
			if(x>mapObj.width-10) x=mapObj.width-10;
			if(y>mapObj.height-10) y=mapObj.height-10;
			
			// Set the src of the imgs to the imagefile, stored in mapObj.images at the index specified by the tile at the proper viewport location
			for(i=0;i<10;i++){
				for(j=0; j<10; j++){
					$(imgs[i*10+j]).attr("src","images/"+mapObj.images[mapObj.tiles[(y + i)*mapObj.width + (x + j)]]);
				}
			}
			
			// Set imgpool images for each character and item within the viewport
			for(i=0;i<2;i++){
				(function(tmp_array){
					var i;
					for(i=0, tmp_array_len = tmp_array.length;i<tmp_array_len;i++){
						obj = tmp_array[i];
						if(obj.visible && obj.x >= x && obj.x < (x + 10) && obj.y >= y && obj.y < (y+10)){
							if(current_img>=IMG_LIMIT) {
								GAME.info.Write("Image pool exceeded.  Pictures not drawn.  Increase pool size.");
								break;
							}
							$(imgpool[current_img]).css({"top":(obj.y-y)*40 + "px","left":(obj.x-x)*40 + "px","display":"inline"});
							$(imgpool[current_img++]).attr("src","images/"+obj.img);
						}
					}
				}([GAME.characters,objArray][i]));
				last_img = current_img;
			};
			// Set display=none for all imgpool imgs not used this time that were used last time
			while(current_img<=prev_last_img) $(imgpool[current_img++]).css({"display":"none"});
			prev_last_img = last_img;
		};
		
		// Set the default img click function, allow it to be overridden by passing a function to the OnClick method
		imgClick = function(x,y){ alert("X: " + x + "\nY: " + y); };
		that.OnClick = function( fn ){
			imgClick = fn;
		};
		
		that.CellInfo = function(x,y){
			var i, objs=[], walkable=true;
			
			// If off the map, return walkable=false, objects=[]
			if(x<0 || y<0 || x>=mapObj.width || y>=mapObj.height) return {walkable:false, objects:objs};
			// If on the map, return walkable(true/false) and objects array
			for(i=0;i<objArray.length;i++) if(objArray[i].x==x && objArray[i].y==y) {
				if(!objArray[i].walkable) walkable = false;
				objs[objs.length] = objArray[i];
			}
			return {walkable:walkable, objects:objs};
		}
		return that;
	}());
	
	// --- (Load: Menu) ---
	GAME.menu = (function(){
		var menuitem, that={};
		$("#menu").append($("<ul></ul>"));
		for(key in GAME.menuitems) {
			menuitem = $("<li onclick=\"GAME.RunCommand('"+function(){ return GAME.menuitems[key]; }()+"');\">" + key + "</li>");
			$("#menu ul").append(menuitem);
		}
		
		// Adds the disabled class to show that a menuitem is disabled
		that.Disable = function(cmd){
			var i,menuitemlist=$("#menu li");
			for(i=0;i<menuitemlist.length;i++)
			if(GAME.menuitems[$(menuitemlist[i]).html()]==cmd) $(menuitemlist[i]).addClass("disabled");
		};
		
		// Removes the disabled class to show that a menuitem is enabled
		that.Enable = function(cmd){
			var i,menuitemlist=$("#menu li");
			for(i=0;i<menuitemlist.length;i++)
			if(GAME.menuitems[$(menuitemlist[i]).html()]==cmd) $(menuitemlist[i]).removeClass("disabled");		
		};
		return that;
	}());
	
	// --- (Load: Side Buttons) ---
	GAME.buttons = (function(){
		var buttonitem, key, that={};
		// Buttons is a list of custom commands shown on the side.  These are stored in the game object under 'abilities'
		$("#viewport").after($("<ul class=\"buttons\"></ul>"));
		for(key in GAME.abilities){
			buttonitem = $("<li onclick=\"GAME.RunCommand('"+(function(){ return GAME.abilities[key] }())+"');\">"+ key +"</li>");
			$(".buttons").append(buttonitem);
		}
		
		// Allows you to add the CSS class disabled to show commands are disabled
		that.Disable = function(cmd){
			var i,buttonlist=$(".buttons li");
			for(i=0;i<buttonlist.length;i++)
			if(GAME.abilities[$(buttonlist[i]).html()]==cmd) $(buttonlist[i]).addClass("disabled");
		}
		
		// Allows you to remove the CSS class disabled to show commands are disabled
		that.Enable = function(cmd){
			var i,buttonlist=$(".buttons li");
			for(i=0;i<buttonlist.length;i++)
			if(GAME.abilities[$(buttonlist[i]).html()]==cmd) $(buttonlist[i]).removeClass("disabled");
		}
		return that;
	}());
	
	GAME.info = (function(){
		var that = {};
		// Allow writing to the info panel using GAME.info.Write()
		that.Write = function(txt){ $("#information").html(txt + "<br>" + $("#information").html()); };
		// Clears the info panel
		that.Clear = function(){ $("#information").html(""); };
		return that;
	}());
	// Load character data
	GAME.characters[0] = JSON.Load("data/characters.json");
	// Load the item prototypes
	GAME.item_prototypes = JSON.Load("data/items.json");
	// Load the map into the viewport, then load map objects
	GAME.viewport.LoadMap("main",{x:0,y:0});
	
	// Attach the keypress handler
	$(document).keypress(GAME.Keypress);
	
	// Attach the typical click handler
	GAME.viewport.OnClick(function(){});
	
	// Runs GAME.Initialized if all components are finished being initialized
	if((typeof GAME.RunCommand)!="string") GAME.EnvInitialized();
});
// Runs code before user has control, but after all components are loaded
GAME.EnvInitialized = function(){
	GAME.RunCommand("disable,use");
	GAME.RunCommand("disable,save");
};