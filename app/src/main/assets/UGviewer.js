const page_selector = "main > div:nth-child(2)"
const tab_selector = page_selector + " > article"
const options_toolbar_selector = tab_selector + " > div > article > :nth-child(6)";
const tohide_selector = [
        "body > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)", // banner
        "main > div:nth-child(1)",// Left menu
        tab_selector + " > section > section > div > div", // Views number, Difficulty, Author, Edit, Favorite...
        tab_selector + " > :nth-child(2)", // Official tabs, download pdf, etc...
        tab_selector + " > div > article > :nth-child(3)", // Strumming
        tab_selector + " > div > article > :nth-child(5)", // Footer
        options_toolbar_selector, // Options toolbar
        //",._3fm2e": 0, // Chords
        tab_selector + " > div > article > footer", // Footer
        "#shots", // Shots
        "#comments", // Comment
        "body > div > div > footer", // Footer 2
        "aside", // DOwnload pdf, etc...
        "#tab-bottom-controls", // Tab bottom controls
];

const chords_selector = tab_selector + " > div > article > :nth-child(2)" // Chords
const chords_buttons_selector = chords_selector + " > div > nav > button"
const tab_chords_selector = "code > pre";

const right_panel_width = "210px"

document.chords_button = [null,null,null]
document.dec_font_button = null
document.inc_font_button = null
document.dec_transpose_button = null
document.inc_transpose_button = null

function setup_buttons()
{
    var grp = document.querySelectorAll(options_toolbar_selector+ " article > section> div > div > span")
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

    var btn = document.querySelectorAll(chords_buttons_selector)
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
    var max_num = 0;
    var active = 0;
    for (var i = 0; i < document.chords_button.length;i++)
    {
        if(!document.chords_button[i])
            continue

        if(document.chords_button[i].classList.length > max_num)
        {
            active = i;
            max_num = document.chords_button[i].classList.length;
        }
    }
    return active
}

function generate_click(button)
{
    if(!button)
        return "button not found"

    e=document.createEvent('HTMLEvents');
    e.initEvent('click',true,true);
    button.dispatchEvent(e);
 }

function toggle_chords_type(direction=1)
{
    var i = get_active_chords_type()
    if(i <0)
        return "Chord buttons not defined"

    i = (i+direction)%document.chords_button.length

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
    var chords = document.querySelectorAll(chords_selector);
    if(chords.length == 0)
        return false;
    chords = chords[0]

    //chords.className += " _2M9MP"

    chords.style.position = (on ? "fixed" : "");
    chords.style.right = (on ? "0px" : "");
    chords.style.top = (on ? "0px" : "");
    chords.style.margin = (on ? "0px" : "");
    chords.style.padding = (on ? "10px" : "");
    chords.style.width = (on ? right_panel_width : "");
    chords.style.height = (on ? "100%" : "");
    chords.style.zIndex = (on ? "1000" : "");
    //chords.style.background="#FFFFFF55";
    chords.style.background="#F8F8F8";
    return true
}

function setcolumns (nums) {
  const tabsSelector = tab_chords_selector;
  const tabWrapper = document.querySelector(tabsSelector)
  if (tabWrapper) {
    tabWrapper.style.columnCount = nums
  }
}

function isfullscreen()
{
    var elements = document.querySelectorAll(page_selector);
    if(elements.length < 1)
        return "Page not found";

    var on = (elements[0].style.position != "");
    return on
}

function setfullscreen (on, right_space = "0px")
{
    var elements = document.querySelectorAll(page_selector);
    if(elements.length < 1)
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

    for (var i = 0, n = tohide_selector.length; i < n; i++)
    {
        var tohide = document.querySelectorAll(tohide_selector[i]);
        for (var j = 0; j<tohide.length; j++)
            tohide[j].style.display = (on ? "none" : "");
    }

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
    var grp = document.querySelectorAll("main > div > div > section > div > div > nav");
    if(!grp || grp.length ==0 | grp[0].children.length <3)
        return "Unable to find button"
    generate_click(grp[0].children[2]);
}

function get_current_font_size()
{
    var grp = document.querySelectorAll(tab_chords_selector);
    if(!grp || grp.length == 0)
            return null;
    return grp[0].style.fontSize;
}

function force_current_font_size(font_size)
{
    var grp = document.querySelectorAll(tab_chords_selector);
    if(!grp || grp.length == 0)
            return "Unable to find font size";
    grp[0].style.fontSize = font_size+"px";
    return "Font size forced to "+font_size;
}

function set_tabs_style()
{
    var tab_style = tab_chords_selector+" > span {overflow: hidden;}"
    var style=document.createElement('style');
    style.type='text/css';
    if(style.styleSheet){
        style.styleSheet.cssText=tab_style;
    }else{
        style.appendChild(document.createTextNode(tab_style));
    }

    document.getElementsByTagName('head')[0].appendChild(style);

}

function createInfoZone()
{
    const square = document.createElement('div');
    square.id = "info_zone";
    square.innerHTML = "<b>TEST</b>";
    square.style.fontSize = "30px";
    square.style.height = '0';
    square.style.width = '120px';
    square.style.zIndex = '20000';
    square.style.position = 'fixed';
    square.style.backgroundColor = 'rgb(0,0,0)';
    square.style.backgroundColor = 'rgb(0,0,0,0.7)';
    square.style.textAlign = 'center';
    square.style.margin = 'auto';
    square.style.overflowX= 'hidden';
    square.style.transition= '0.5s';
    square.style.right = 0;
    square.style.bottom = 0;
    document.body.appendChild(square)
}

function showInfoZone(text="")
{
    var square = document.getElementById("info_zone");
    square.style.height = (text == "" ? '0px' : '50px');
    square.children[0].innerHTML = text;
}

setup_buttons();
set_tabs_style();
createInfoZone()