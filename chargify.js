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
 
    // select the proper refresh time in the select list
    refreshTimeObj = document.getElementById("refresh_time");
    for (i=0; i < refreshTimeObj.options.length; i++) {
        if ((''+refreshTimeInSeconds/60) == refreshTimeObj.options[i].value) {
            refreshTimeObj.selectedIndex = i;
            break;
        }
    }
    clearInterval(refreshTimer);

    if (window.widget) {
        widget.prepareForTransition("ToBack");
    }
 
    front.style.display="none";
    back.style.display="block";
 
    if (window.widget) {
        setTimeout ('widget.performTransition();', 0);
    }
    clearChargifyData();
}

function hidePrefs() {
    var front = document.getElementById("front");
    var back = document.getElementById("back");
 
    saveSettings();
    refreshTimeInSeconds = 60 * parseInt(widget.preferenceForKey('refresh_time'));
    loadChargifyData();

    back.style.display="none";
    front.style.display="block";
 
    if (window.widget) {
        widget.prepareForTransition("ToFront");
    }
 
    if (window.widget) {
        setTimeout ('widget.performTransition();', 0);
    }
}

function handleStatsResponse() {
      if (this.readyState == 4 && this.status == 200) {
          if (this.responseText != null) {
              var chargifyStats = JSON.parse(this.responseText);
              document.getElementById("data_domain").innerHTML = widget.preferenceForKey('subdomain');
              document.getElementById('data_account').innerHTML = chargifyStats['seller_name'];
              document.getElementById('data_revenue_today').innerHTML = chargifyStats['stats']['revenue_today'];
              document.getElementById('data_revenue_this_month').innerHTML = chargifyStats['stats']['revenue_this_month'];
              document.getElementById('data_revenue_this_year').innerHTML = chargifyStats['stats']['revenue_this_year'];
              document.getElementById('data_revenue_total').innerHTML = chargifyStats['stats']['total_revenue'];
              document.getElementById('data_subscriptions_today').innerHTML = chargifyStats['stats']['subscriptions_today'];
              document.getElementById('data_subscriptions_total').innerHTML = chargifyStats['stats']['total_subscriptions'];
              document.getElementById('invalid_api_key').style.display = 'none';
              document.getElementById('loading_icon').style.display = 'none';
          } else {
              // no data returned; probably an error on Chargify's end so do nothing
          }
      } else if (this.readyState >= 0 && this.readyState <= 4 && this.status == 401) {
          // wrong API code
          clearChargifyData();
          document.getElementById('invalid_api_key').style.display = 'block';
          showPrefs();
          this.abort();
      } else if (this.readyState == 4 && this.status != 200) {
          // fetched the wrong page or network error...
      }
}

function loadChargifyData() {
    document.getElementById('loading_icon').style.display = 'inline';
    settings = getSettings();
    if (settings == false) { return; }
    var url = "https://" + widget.preferenceForKey('subdomain') + ".chargify.com/stats.json?" + new Date().getTime();
    var xmlRequest = new XMLHttpRequest();
    xmlRequest.open("GET",url,false,widget.preferenceForKey('api_key'),'x');
    xmlRequest.setRequestHeader("Cache-Control", "no-cache");
    xmlRequest.overrideMimeType("text/json");
    xmlRequest.onreadystatechange = handleStatsResponse;
    xmlRequest.send(null);
    clearInterval(refreshTimer);
    refreshTimer = setInterval("loadChargifyData();", 1000*refreshTimeInSeconds);
}

function clearChargifyData() {
    var fieldNames = [
        'domain','account','revenue_today', 'revenue_this_month', 'revenue_this_year',
        'revenue_total', 'subscriptions_today', 'subscriptions_total'
    ];
    for (i=0; i < fieldNames.length; i ++) {
        document.getElementById('data_'+fieldNames[i]).innerHTML = '&nbsp;';
    }
    document.getElementById('loading_icon').style.display = 'none';
}

function gotoDashboard() {
  url = 'https://' + widget.preferenceForKey('subdomain') + '.chargify.com/'
  widget.openURL(url);
}
