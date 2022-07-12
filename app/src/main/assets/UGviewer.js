const page_selector = "_1HVlc"
const tohide_selector =
        ".n5ucf"+ // banner
        ",._3oGPQ"+ // Left menu
        ",._2bi9V"+ // Views number
        ",.tDXKF"+ // Difficulty
        ",._27xzf"+ // Official tabs, download pdf, etc...
        //",._3fm2e"+ // Chords
        ",._6aYQY"+ // Strumming
        ",._3bzfG"+ // Footer
        ",#shots"+ // Shots
        ",#comments"+ // Shots
        ",._39xi3"+ // Footer 2
        ",.Wvegf"+ // Options toolbar
        "";

const right_panel_width = "210px"

document.chords_button = [null,null,null]
document.dec_font_button = null
document.inc_font_button = null
document.dec_transpose_button = null
document.inc_transpose_button = null

function setup_buttons()
{
    var grp = document.getElementsByClassName('hXfrh');
    for (var i = 0, n = grp.length; i < n; i++)
    {
         //if(grp[i].closest(".-j5K1"))
         //   continue;
          title = grp[i].previousElementSibling;
          if(!title)
            continue;

          if(title.innerText.includes('TRANSPOSE'))
          {
            document.dec_transpose_button = grp[i].children[0]
            document.inc_transpose_button = grp[i].children[2]
          }
          else
          if(title.innerText.includes('FONT'))
          {
            document.dec_font_button = grp[i].children[0]
            document.inc_font_button = grp[i].children[2]
            continue;
          }
    }

    var btn = document.querySelectorAll("button._14yTH")
    for (var i = 0, n = btn.length; i < n; i++)
    {
        span = btn[i].querySelector(":scope > span")
        if(!span)
            continue;
        text = span.innerText.toUpperCase();
        if(text.includes("GUITAR"))
            document.chords_button[0] = btn[i];
        else if(text.includes("UKULELE"))
            document.chords_button[1] = btn[i];
        else if(text.includes("PIANO"))
            document.chords_button[2] = btn[i];
    }
}

function get_active_chords_type()
{
    for (var i = 0; i < document.chords_button.length;i++)
    {
        if(!document.chords_button[i])
            continue
        if(document.chords_button[i].classList.contains("sS6gK"))
            return i
    }
    return -1
}

function generate_click(button)
{
    if(!button)
        return "button not found"

    e=document.createEvent('HTMLEvents');
    e.initEvent('click',true,true);
    button.dispatchEvent(e);
 }

function toggle_chords_type()
{
    var i = get_active_chords_type()
    if(i <0)
        return "Chord buttons not defined"

    i = (i+1)%document.chords_button.length

    generate_click(document.chords_button[i])
}


function dec_font() { return generate_click(document.dec_font_button);}

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

function setfullscreen (on, right_space = "0px")
{
    var tohide = document.querySelectorAll(tohide_selector);

    var elements = document.getElementsByClassName(page_selector);
    if(elements.length == 0)
        return "Page not found";

    var page = elements[0];

    //document.body.appendChild(page);

    page.children[0].style.margin = (on? "0px": "");

    page.style.position = (on? "absolute" : "");
    page.style.width = (on? "calc(100% - "+right_space+")": "");
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

function toggle_tab_full_view(nums) {
    var on = isfullscreen()
    on = !on
    setfullscreen(on, right_panel_width)
    setcolumns(on ? nums : 1)
    displacechords(on)
}

function toggle_full_view(nums) {
    var on = isfullscreen()
    on = !on
    setfullscreen(on)
    setcolumns(on ? nums : 1)
}

function set_tabs_list_all() {
    var grp = document.getElementsByClassName("z7o1r");
    if(!grp || grp.length ==0 | grp[0].children.length <3)
        return "Unable to find button"
    generate_click(grp[0].children[2]);
}

function get_current_font_size()
{
    var grp = document.querySelectorAll("pre._3hukP");
    if(!grp || grp.length == 0)
            return null;
    return grp[0].style.fontSize;
}

function force_current_font_size(font_size)
{
    var grp = document.querySelectorAll("pre._3hukP");
    if(!grp || grp.length == 0)
            return "Unable to find font size";
    grp[0].style.fontSize = font_size+"px";
    return "Font size forced to "+font_size;
}

function set_tabs_style()
{
    var tab_style = "span._3rlxz {overflow: hidden;}"
    var style=document.createElement('style');
    style.type='text/css';
    if(style.styleSheet){
        style.styleSheet.cssText=tab_style;
    }else{
        style.appendChild(document.createTextNode(tab_style));
    }

    document.getElementsByTagName('head')[0].appendChild(style);

}

setup_buttons();
set_tabs_style();