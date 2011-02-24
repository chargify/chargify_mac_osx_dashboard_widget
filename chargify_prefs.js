// default settings
var prefKeys = new Array(
   "subdomain",
   "api_key",
   "refresh_time"
);

function saveSettings() {
   if (window.widget) {
      for (var i = prefKeys.length-1; i >= 0; i--) {
         tempObj = document.getElementById(prefKeys[i]);
         widget.setPreferenceForKey(tempObj.value,prefKeys[i]);
      }
   }
}

function getSettings() {
   if (window.widget) {
      var prefs = new Array();
      for (var i = prefKeys.length - 1; i > -1; i--) {
         if (widget.preferenceForKey(prefKeys[i]) != undefined) {
            prefs.push(widget.preferenceForKey(prefKeys[i]));
         }
      }
      if (prefs.length != prefKeys.length) prefs = false;
   } else {
      prefs = false;
   }
   return prefs;
}
