$(document).ready(function () {

  var todaysDeltaJSON = {}

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
    let old_positive = 0;
    let new_cured = 0;
    let new_deaths = 0;

    result.forEach(data => {
      if (data.sno !== "11111" && (stateID == null || stateID === 'ALL' || stateID === data.sno)) {
        new_positive += parseInt(data.new_positive);
        new_cured += parseInt(data.new_cured);
        new_deaths += parseInt(data.new_death);

        old_positive += parseInt(data.positive);
      }

    });
    let delta = new_positive - old_positive;
    let active = new_positive - new_cured - new_deaths;

    $("#positive").html(new_positive);
    $("#cured").html(new_cured);
    $("#death").html(new_deaths);
    $("#active").html(active);
    //$("#delta").html(delta);
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

  todaysDelta().then(populateStates).then(populateData);
});
