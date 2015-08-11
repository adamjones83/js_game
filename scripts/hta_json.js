/*
	This file depends on the JSON object from json2.js but the load order is not important
	
	Creates a JSON object if not already present and adds to it 'Load' and 'Save' methods.
	Prototypes:
	Load(filename) - returns a JSON object read and parsed from 'filename'
	Save(jsonObj, filename) - stringifies 'jsonObj' and saves it to 'filename'
*/

if (!this.JSON) {
    this.JSON = {};
}
(function(){
	// Adds a load function to the JSON object
	JSON.Load=function(filename){
		var fs, file, str;
		fs = new ActiveXObject("Scripting.FileSystemObject");
		if(fs) file = fs.OpenTextFile(filename, 1);
		if(!file) return null;
		str = file.ReadAll();
		file.Close();
		try {
			return JSON.parse(str, JSON.dateConvert);
		} catch(e) {
			alert("Unable to load data from '" + filename + "'.\n" + e.message);
			return null;
		}
	}
	// Adds a save function to the JSON object
	JSON.Save=function(jsonObj, filename){
		var fs, file;
		fs = new ActiveXObject("Scripting.FileSystemObject");
		if(fs) file = fs.OpenTextFile(filename, 2, true);
		if(file) {
			file.Write(JSON.stringify(jsonObj,null,"\t"));
			file.Close();
		} else alert("Unable to write to file.");
	}
	// Can be used as the 2nd parameter in JSON.parse to convert stringified date objects to date objects
	JSON.dateConvert=function (key, value) {
		var a;
		if (typeof value === 'string') {
			a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
			if (a) {
				return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
					+a[5], +a[6]));
			}
		}
		return value;
	};
})();