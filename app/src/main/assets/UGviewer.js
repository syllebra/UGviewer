const page_selector = "_1HVlc"
const tohide_selector =
        ".n5ucf"+ // banner
        ",._3oGPQ"+ // Left menu
        ",._2bi9V"+ // Views number
        ",.tDXKF"+ // Difficulty
        ",._27xzf"+ // Officaltabs, downloadpdf, etc...
        //",._3fm2e"+ // Chords
        ",._6aYQY"+ // Strumming
        ",._3bzfG"+ // Footer
        ",#shots"+ // Shots
        ",#comments"+ // Shots
        ",._39xi3"+ // Footer 2
        "";

const right_panel_width = "210px"

function toggleautoscroll() {
    var btns = document.getElementsByTagName('button');
    e=document.createEvent('HTMLEvents');
    e.initEvent('click',true,true);
    for (var i = 0, n = btns.length; i < n; i++) {
       if (btns[i].getAttribute('data-for') === 'autoscroll-tooltip') {
          btns[i].setAttribute('onclick', 'AndroidInterface.onClicked()');
          btns[i].dispatchEvent(e);
       }
    }
}

function displacechords(on)
{
    var chords = document.getElementsByClassName("_3fm2e");
    if(chords.length == 0)
        return false;
    chords = chords[0]

    chords.className += " _2M9MP"

    chords.style.position = (on ? "fixed" : "");
    chords.style.right = (on ? "0px" : "");
    chords.style.top = (on ? "0px" : "");
    chords.style.margin = (on ? "0px" : "");
    chords.style.padding = (on ? "10px" : "");
    chords.style.width = (on ? right_panel_width : "");
    chords.style.height = (on ? "100%" : "");
    chords.style.zIndex = (on ? "1000" : "");
    //chords.style.background="#FFFFFF55";
    return true
}

function setcolumns (nums) {
  const tabsSelector = 'code > pre';
  const tabWrapper = document.querySelector(tabsSelector)
  if (tabWrapper) {
    tabWrapper.style.columnCount = nums
  }
}

function isfullscreen()
{
    var elements = document.getElementsByClassName(page_selector);
    if(elements.length == 0)
        return "Page not found";

    var on = (elements[0].style.position != "");
    return on
}

function setfullscreen (on)
{
    var tohide = document.querySelectorAll(tohide_selector);

    var elements = document.getElementsByClassName(page_selector);
    if(elements.length == 0)
        return "Page not found";

    var page = elements[0];

    //document.body.appendChild(page);

    page.children[0].style.margin = (on? "0px": "");

    page.style.position = (on? "absolute" : "");
    page.style.width = (on? "calc(100% - "+right_panel_width+")": "");
    page.style.height = (on? "100%": "");
    page.style.left = (on? "0px": "");
    //page.style.right = (on? "0px": "");
    page.style.top = (on? "0px": "");
    //page.style.bottom = (on? "0px": "");
    page.style.margin = (on? "0px": "");

    for (var i = 0, n = tohide.length; i < n; i++)
        tohide[i].style.display = (on ? "none" : "");

    return "Page fullscreen set "+(on ?"ON":"OFF");
}

function togglefullview(nums) {
    var on = isfullscreen()
    on = !on
    setfullscreen(on)
    setcolumns(on ? nums : 1)
    displacechords(on)
}