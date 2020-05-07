$(document).ready(function () {

  var todaysDeltaJSON = {};
  var deltaJSON = {};
  var stateFilter = 'ALL';

  var todaysDelta = function () {
    return $.ajax({
      url: "https://www.mohfw.gov.in/data/datanew.json", success: function (result) {
        todaysDeltaJSON = result;
      }

    });
  }

  var populateData = function (stateID) {

    let result = todaysDeltaJSON;
    let new_positive = 0;
    let new_cured = 0;
    let new_deaths = 0;

    let stateName = 'ALL'

    if(stateID === undefined || stateID === null || stateID === '' ) {
      stateID = stateFilter;
    }

    result.forEach(data => {
      if (data.sno !== "11111" && (stateID == null || stateID === 'ALL' || stateID === data.sno)) {
        new_positive += parseInt(data.new_positive);
        new_cured += parseInt(data.new_cured);
        new_deaths += parseInt(data.new_death);

        if(stateID === data.sno){
          stateName = data.state_name.replace("@", "");
        }
      }
    });
    let active = new_positive - new_cured - new_deaths;

    let deltaData = deltaJSON[stateName.toLowerCase()];
    let previousDayData = deltaData[deltaData.length - 2];
    //Add Active + Cured + Death
    let delta = Math.abs(new_positive - (previousDayData[1] + previousDayData[2] + previousDayData[3]));

    $("#positive").html(new_positive);
    $("#cured").html(new_cured);
    $("#death").html(new_deaths);
    $("#active").html(active);

    let curedDelta = new_cured - previousDayData[2];
    let deathDelta = new_deaths - previousDayData[3];
    let activeDelta = active - previousDayData[1];

    $("#positive-delta").html(delta);
    $("#cured-delta").html(curedDelta);
    $("#death-delta").html(deathDelta);
    $("#active-delta").html(activeDelta);

    setDeltaColor(delta, curedDelta, deathDelta, activeDelta);
  };

  var setDeltaColor = function(positive, cured, deaths, active){
    setColorClass("positive", positive, false);
    setColorClass("cured", cured, true);
    setColorClass("death", deaths, false);
    setColorClass("active", active, false);
  }

  var setColorClass = function (cellId, value, isGreenIfPositive) {
    if(value <= 0 || (value > 0 && isGreenIfPositive)){
      $(`#p-${cellId}-delta`).removeClass('up-delta').addClass('down-delta');
    } else {
      $(`#p-${cellId}-delta`).removeClass('down-delta').addClass('up-delta');
    }
    if(value > 0){
      $(`#${cellId}-delta-arrow`).html('&uarr;')
    } else {
      $(`#${cellId}-delta-arrow`).html('&darr;')
    }
  }

  var populateStates = function () {
    todaysDeltaJSON.forEach(data => {
      if (data.sno !== "11111") {
        $("#stateFilter").append(`<option value='${data.sno}'>${data.state_name.replace("@", "")}</option>`);
      }
    });
    $("#stateFilter").val(stateFilter);
    $("#stateFilter").change((value) => {

      let selectedIndex = $("#stateFilter").val().replace("ALL", 0);
      let selectedState = $("#stateFilter")[0].options[selectedIndex].text;
      let url = new URL(window.location);
      url.searchParams.set("s", selectedState);
      window.history.pushState({}, "Covid-19 India Dashboard", url.toString())
      populateData($("#stateFilter").val());
    });
  }

  var getDeltaData = function () {
    return $.ajax({
      url: "https://www.mohfw.gov.in/index.php", success: function (result) {
        let formIndex = result.indexOf('url: "data/new.php",');
        let toIndex = result.indexOf('title: "Trends:"+" "+ result,');

        let targetString = result.substring(formIndex, toIndex);

        targetString = targetString.substring(targetString.indexOf("'All States'"));
        targetString = targetString
          .replace(/\t/gi, '')
          .replace(/if\(result == /gi, '')
          .replace(/var data = google.visualization.arrayToDataTable\(\[/gi, '')
          .replace(/\['Date','Active cases','Cured','Death','Diffrential\(compared to previous day\)'\],/gi, '')
          .replace(/\['Date','Active cases','Cured','Death'\],/gi,'')
          .replace(/\){\n/gi,': [')
          .replace(/\);\n}/gi, ',')
          .replace(/\],\n\],/gi, ']\n],')
          .replace(/var options = {/gi, '')
          .replace(/'/gi, '"')
          .replace(/All States/gi, 'ALL')
          .toLowerCase()
          .trim()

        targetString = targetString.substr(0, targetString.length-1)
        targetString = `{${targetString}}`
        try{
          deltaJSON = JSON.parse(targetString);
        } catch (e) {
          console.log('Error occurred while parsing delta data', e);
        }
      }
    });
  }

  const getURLParams = function(){
    const urlParams = new URLSearchParams(window.location.search);
    let stateParam = urlParams.get("s");

    if(stateParam !== null && stateParam !== ''){
      stateParam = stateParam.toLowerCase().trim();
      let result = todaysDeltaJSON;
      result.forEach(data => {
        let stateName = data.state_name.toLowerCase().trim().replace('@', '');
        if(stateName === stateParam || data.state_name.toLowerCase() === stateParam) {
          stateFilter = data.sno;
          return stateFilter;
        }
      });
    }
  }

  todaysDelta()
    .then(getDeltaData)
    .then(getURLParams)
    .then(populateStates)
    .then(populateData);

});
