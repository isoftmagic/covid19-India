$(document).ready(function () {

  let todaysDataJSON = {};
  let stateFilter = 'ALL';
  const REFRESH_TIME = 5 * 60 * 1000; //5 minute
  let autoRefresh = true;
  let timeIntervalFunction;

  const getTodaysData = function () {
    return $.ajax({
      url: "https://www.mohfw.gov.in/data/data.json", success: function (result) {
        todaysDataJSON = result;
      }

    });
  }

  const populateData = function (stateID) {

    let result = todaysDataJSON;
    let positiveCasesToday = 0;
    let curedCasesToday = 0;
    let deathCasesToday = 0;
    let positiveCasesYesterday = 0;
    let curedCasesYesterday = 0;
    let deathCasesYesterday = 0;

    let stateName = 'ALL'

    if(typeof stateID === 'undefined' || stateID === null || stateID === '' ) {
      stateID = stateFilter;
    }

    result.forEach(data => {
      if (data.sno !== "11111" && (stateID == null || stateID === 'ALL' || stateID === data.sno)) {

        positiveCasesToday += parseInt(data.positive);
        curedCasesToday += parseInt(data.cured);
        deathCasesToday += parseInt(data.death);

        if(stateID === data.sno){
          stateName = data.state_name.replace("@", "");
        }
      }
    });
    let activeCaseToday = positiveCasesToday - curedCasesToday - deathCasesToday;



    $("#positive").html(positiveCasesToday);
    $("#cured").html(curedCasesToday);
    $("#death").html(deathCasesToday);
    $("#active").html(activeCaseToday);

    // let activeCasesYesterday = positiveCasesYesterday - curedCasesYesterday - deathCasesYesterday;
    // let positiveDelta = positiveCasesToday - positiveCasesYesterday;
    // let curedDelta = curedCasesToday - curedCasesYesterday;
    // let deathDelta = deathCasesToday - deathCasesYesterday;
    // let activeDelta = activeCaseToday - activeCasesYesterday;
    //
    // $("#positive-delta").html(positiveDelta);
    // $("#cured-delta").html(curedDelta);
    // $("#death-delta").html(deathDelta);
    // $("#active-delta").html(activeDelta);

    $("#last-update-time").html(moment().format("MMM DD, YYYY h:mm A"));

    //setDeltaColor(positiveDelta, curedDelta, deathDelta, activeDelta);
  };

  const setDeltaColor = function(positive, cured, deaths, active){
    setColorClass("positive", positive, false);
    setColorClass("cured", cured, true);
    setColorClass("death", deaths, false);
    setColorClass("active", active, false);
  }

  const setColorClass = function (cellId, value, isGreenIfPositive) {
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

  const populateStates = function () {
    todaysDataJSON.forEach(data => {
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


  const getURLParams = function(){
    const urlParams = new URLSearchParams(window.location.search);
    let stateParam = urlParams.get("s");

    if(stateParam !== null && stateParam !== ''){
      stateParam = stateParam.toLowerCase().trim();
      todaysDataJSON.forEach(data => {
        let stateName = data.state_name.toLowerCase().trim().replace('@', '');
        if(stateName === stateParam || data.state_name.toLowerCase() === stateParam) {
          stateFilter = data.sno;
          return stateFilter;
        }
      });
    }
  }

  const setAutoRefreshChekboxFromCookie = function() {
    autoRefresh = $.cookie('autoRefresh');

    autoRefresh = typeof autoRefresh == 'undefined' || autoRefresh === 'true';
    $("#refresh-checkbox").prop('checked', autoRefresh);
  }

  const setAutoRefreshListener = function () {
    setAutoRefreshChekboxFromCookie();
    $("#refresh-checkbox").change(function () {

      autoRefresh = $("#refresh-checkbox").prop('checked');
      $.cookie("autoRefresh", autoRefresh);

      if(autoRefresh){
        refreshDataAndReload();
      } else {
        clearTimeout(timeIntervalFunction);
      }
    });
  }

  const setRefreshTimer = function () {
    if(autoRefresh) {
      timeIntervalFunction = setTimeout(function(){
        refreshDataAndReload()
      }, REFRESH_TIME);
    }
  }

  const refreshDataAndReload = function(){
    if(autoRefresh) {
      getTodaysData()
        .then(() => {
          populateData($("#stateFilter").val());
        })
        .then(setRefreshTimer);
    }
  }

  getTodaysData()
    .then(getURLParams)
    .then(populateStates)
    .then(populateData)
    .then(setAutoRefreshListener)
    .then(setRefreshTimer);
});
