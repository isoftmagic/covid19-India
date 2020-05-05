$(document).ready(function () {

  var todaysDeltaJSON = {};
  var deltaJSON = {};

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

    result.forEach(data => {
      if (data.sno !== "11111" && (stateID == null || stateID === 'ALL' || stateID === data.sno)) {
        new_positive += parseInt(data.new_positive);
        new_cured += parseInt(data.new_cured);
        new_deaths += parseInt(data.new_death);

        if(stateID === data.sno){
          stateName = data.state_name;
        }
      }
    });
    let active = new_positive - new_cured - new_deaths;

    let deltaData = deltaJSON[stateName];
    let previousDayData = deltaData[deltaData.length - 1];
    //Add Active + Cured + Death
    let delta = new_positive - (previousDayData[1] + previousDayData[2] + previousDayData[3]);

    $("#positive").html(new_positive);
    $("#cured").html(new_cured);
    $("#death").html(new_deaths);
    $("#active").html(active);
<<<<<<< HEAD
    $("#delta").html(delta);
=======
    //$("#delta").html(delta);
>>>>>>> e5d222474a1922e62e3ebc28aafb50d5a39fe4cc
  }

  var populateStates = function () {
    todaysDeltaJSON.forEach(data => {
      if (data.sno !== "11111") {
        $("#stateFilter").append(`<option value='${data.sno}'>${data.state_name}</option>`);
      }
    });
    $("#stateFilter").change((value) => {
      populateData($("#stateFilter").val());
    });
  }

  var getDeltaData = function () {
    return $.ajax({
      url: "https://www.mohfw.gov.in/index.php", success: function (result) {
        console.log(result);
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

  todaysDelta().then(getDeltaData).then(populateStates).then(populateData);

});
