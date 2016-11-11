/**
 * Created by cielly on 20/09/16.
 */

var tz_selected;

var header = $('.stats__header');
var header_name = $('.stats__header .stats__header-name span');
var item = $('.stats__item');
var bar  = $('.stats__item-bar');
var nums = $('.stats__item-num');
var overlay = $('.stats__overlay');
var back = $('.stats__overlay-back');
var isOpen = false;

var vHour = $('#hour');
var vAvg = $('#avg');
var vRanking = $('#ranking');
var vTotal = $('#total');

$(document).on('ready', function() {
    tz_selected = localStorage.getItem("tz_selected");
    var tz_offset = tz_selected;
    if (parseInt(tz_offset) >= 0) tz_offset = "+" + tz_offset;
    var timezone = "UTC" + tz_offset;

    header_name.text(timezone);
    entrance(calculateHeight);
});

bar.on('click', showOverlay);
back.on('click', showOverlay);

var data, index, total_commits;

function entrance(callback) {
    bar.addClass('active');
    header.addClass('active');
    header.on('transitionend webkitTransitionend', function() {
        nums.css('opacity', '1');
       // bar.css('transition-delay', '0');
        header.off('transitionend webkitTransitionend');
    });

    $.getJSON( "data/commit_by_time.json", function(jsondata) {
        data = jsondata;
        //console.log(data);

        callback(tz_selected);
    });


}

function showOverlay() {
    if (!isOpen) {
        overlay.addClass('active').removeAttr('style');
        bar.css('transition', 'all 0.4s cubic-bezier(0.86, 0, 0.07, 1)')
            .removeClass('active');
        header.removeClass('active');
        nums.css('opacity', '0');
        isOpen = true;

        updateInfo($(this).parent().index());
    } else {
        overlay.css('transition', 'all 0.4s cubic-bezier(0.755, 0.05, 0.855, 0.06)').removeClass('active');
        bar.addClass('active').removeAttr('style');
        header.addClass('active');
        nums.css('opacity', '1');
        calculateHeight(tz_selected);
        isOpen = false;
    }
}

function calculateHeight(cur_offset){

    var height_max = parseInt($('.stats__item').css('height'));

    var offset  = String(cur_offset*60);
    var found = false;
    var num = 0;
    //var total_commits = Math.max.apply(Math,data[offset].map(function(o){return parseInt((o.num_commits))}));

    for(var i = 0; i < data.length; i++) {
        if (found) {
            num++;
            // if (parseInt((data[i]["num_commits"])) > total_commits)
            total_commits += parseInt((data[i]["num_commits"]));
            if (data[i]["author_tz_offset"] != offset) break;
        }
        else if (data[i]["author_tz_offset"] == offset) {
            index = i;
            found = true;
            total_commits = parseInt((data[i]["num_commits"]));
        }
    }

    var start = index + 1;

    for (var i = 1 ; i <= num; i++) {
        var commits =  parseInt(data[index]["num_commits"]);
        index++;
        var tam = commits*height_max*12/total_commits;
        var time_trans = i * 100;


        $(".stats__item:nth-of-type(" + i + ") .stats__item-bar")
            .css('height', tam + 'px');
        // .css('-webkit-transition-delay', time_trans + 'ms')
        // .css('transition-delay', time_trans + 'ms'); //(doesnt work)
    }

    index = index - num;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateInfo(i) {
    var tz_offset = data[index + i].author_tz_offset;
    if (parseInt(tz_offset) >= 0) tz_offset = "+" + tz_offset;
    var timezone = "UTC" + tz_offset;

    vAvg.text(numberWithCommas(Math.round(parseInt(data[index + i].num_commits)/60)));
    vHour.text(i + ":00 - " + (i) + ":59");
    vTotal.text(numberWithCommas(Math.round(parseInt(data[index + i].num_commits))));
    vRanking.text((data[index + i].num_commits*100/total_commits).toFixed(2) + "%");
}