var gDoneButton;
var gInfoButton;
var gDashboardButton;
var refreshTimer;
var refreshTimeInSeconds = 3600; // default to one hour


function setup() {
    gDoneButton = new AppleGlassButton(document.getElementById("doneButton"), "Done", hidePrefs);
    gInfoButton = new AppleInfoButton(document.getElementById("infoButton"), document.getElementById("front"), "black", "black", showPrefs);
    gDashboardButton = new AppleGlassButton(document.getElementById("dashboardButton"), "Dashboard", gotoDashboard);
    
    var settings = getSettings();
    if (settings == false) {
        showPrefs();
    } else {
        document.getElementById("subdomain").value = widget.preferenceForKey('subdomain');
        document.getElementById("api_key").value = widget.preferenceForKey('api_key');
        refreshTimer = setInterval("loadChargifyData();", 1000*refreshTimeInSeconds);
        loadChargifyData();
    }
}

function showPrefs() {
    var front = document.getElementById("front");
    var back = document.getElementById("back");
 
    if (window.widget)
        widget.prepareForTransition("ToBack");
 
    front.style.display="none";
    back.style.display="block";
 
    if (window.widget)
        setTimeout ('widget.performTransition();', 0);
        
    // select the proper refresh time in the select list
    refreshTimeObj = document.getElementById("refresh_time");
    for (i=0; i < refreshTimeObj.options.length; i++) {
        if ((''+refreshTimeInSeconds/60) == refreshTimeObj.options[i].value) {
            refreshTimeObj.selectedIndex = i;
            break;
        }
    }
}

function hidePrefs() {
    var front = document.getElementById("front");
    var back = document.getElementById("back");
 
    if (window.widget)
        widget.prepareForTransition("ToFront");
 
    back.style.display="none";
    front.style.display="block";
 
    if (window.widget)
        setTimeout ('widget.performTransition();', 0);
    
    saveSettings();
    refreshTimeInSeconds = 60 * parseInt(widget.preferenceForKey('refresh_time'))
    loadChargifyData();
}

function handleStatsResponse() {
      if (this.readyState == 4 && this.status == 200) {
          if (this.responseText != null) {
              var chargifyStats = JSON.parse(this.responseText);

              document.getElementById("data_domain").innerHTML = widget.preferenceForKey('subdomain');
              document.getElementById('data_account').innerHTML = chargifyStats['seller_name'];
              document.getElementById('data_revenue_today').innerHTML = chargifyStats['stats']['revenue_today']
              document.getElementById('data_revenue_this_month').innerHTML = chargifyStats['stats']['revenue_this_month']
              document.getElementById('data_revenue_this_year').innerHTML = chargifyStats['stats']['revenue_this_year']
              document.getElementById('data_revenue_total').innerHTML = chargifyStats['stats']['total_revenue']
              document.getElementById('data_subscriptions_today').innerHTML = chargifyStats['stats']['subscriptions_today']
              document.getElementById('data_subscriptions_total').innerHTML = chargifyStats['stats']['total_subscriptions']
          } else {
              // ???
          }
      } else if (this.readyState == 4 && this.status != 200) {
          // fetched the wrong page or network error...
      }
      document.getElementById("loading_icon").style.display = 'none';
}

function loadChargifyData() {
    settings = getSettings();
    if (settings == false) { return; }
    document.getElementById("loading_icon").style.display = 'inline';
    var url = "https://" + widget.preferenceForKey('api_key') + ":" + widget.preferenceForKey('api_key') + "@" + widget.preferenceForKey('subdomain') + ".chargify.com/stats.json"
    var xmlRequest = new XMLHttpRequest();
    xmlRequest.onreadystatechange = handleStatsResponse;
    xmlRequest.overrideMimeType("text/json");
    xmlRequest.open("GET",url,true);
    xmlRequest.send(null);
    
    clearInterval(refreshTimer);
    refreshTimer = setInterval("loadChargifyData();", 1000*refreshTimeInSeconds);
}

function gotoDashboard() {
  url = 'https://' + widget.preferenceForKey('subdomain') + '.chargify.com/'
  widget.openURL(url);
}
