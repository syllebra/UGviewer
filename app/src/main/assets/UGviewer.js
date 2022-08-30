/*var config_string = `
{
    "page_selector": "main > div:nth-child(2)",
    "tab_selector": "[[page_selector]] > article",
    "options_toolbar_selector": "[[tab_selector]] > section > article > :nth-child(6)",
    "options_toolbar_buttons_selector": "[[options_toolbar_selector]] > article > section> div > div > span",
    "chords_selector": "[[tab_selector]] > section > article > :nth-child(2)",
    "chords_buttons_selector": "[[chords_selector]] > div > nav > button",
    "chords_buttons_inner_selector" : ":scope > span",
    "tab_chords_selector": "code > pre",
    "tabs_list_selector": "main > div > div > section > div > div > nav",
    "tohide_selector":
        {
            "body > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)": "banner",
            "main > div:nth-child(1)": "Left menu",
            "[[tab_selector]] > section > div": "Views number, Difficulty, Author, Edit, Favorite...",
            "[[tab_selector]] > section > section": "Official tabs, download pdf, etc...",
            "[[tab_selector]] > section > article > :nth-child(3)": "Strumming",
            "[[tab_selector]] > section > article > :nth-child(5)": "Footer",
            "[[options_toolbar_selector]]": "Options toolbar",
            "[[tab_selector]] > section > article > footer": "Footer",
            "#shots": "Shots",
            "#comments": "Comment",
            "body > div > div > footer": "Footer 2",
            "aside": "Download pdf, etc...",
            "#tab-bottom-controls": "Tab bottom controls"
        }
}
`;
*/

document.config_string = "";

document.config = null
function parse_config()
{
    console.log("Parsing json:")
    console.log(document.config_string)
    // Initial parse
    tmp = JSON.parse(document.config_string);

    var reg = /(?<=\[\[).+?(?=\])/g;
    var result;
    var shortcuts = new Set();
    while((result = reg.exec(document.config_string)) !== null)
        shortcuts.add(result[0]);

    for (let item of shortcuts)
    {
        document.config_string = document.config_string.replaceAll("[["+item+"]]", tmp[item])
        tmp = JSON.parse(document.config_string);
    }

    console.log(document.config_string)
    document.config = JSON.parse(document.config_string);
}

function load_config(callback)
{
    var url = 'https://raw.githubusercontent.com/syllebra/UGviewer/main/json/config.json';
    console.log("Loading config from "+ url)

    return fetch(url)
    .then(function(res)
         {
             if(res.ok)
             {
                res.text().then(out =>
                    {
                        document.config_string = out;
                        console.log(document.config_string);
                        parse_config();
                        callback();
                    }
                );
            }
            else
            {
                console.log('Unable to load config');
                callback();
            }
         }
    )
    .catch(err => {console.log("Error while loading config: "+ err); callback();});
}


document.chords_button = [null,null,null]
document.dec_font_button = null
document.inc_font_button = null
document.dec_transpose_button = null
document.inc_transpose_button = null

function setup_buttons()
{
    var grp = document.querySelectorAll(document.config["options_toolbar_buttons_selector"])
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

    var btn = document.querySelectorAll(document.config["chords_buttons_selector"])
    for (var i = 0, n = btn.length; i < n; i++)
    {
        span = btn[i].querySelector(document.config["chords_buttons_inner_selector"])
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

//0: top, 1: right, 2: bottom, 4: left, negative: hidden
function displacechords(on, pos=1, size=0)
{
    var sz = ""+size+"px";

    var chords = document.querySelectorAll(document.config["chords_selector"]);
    if(chords.length == 0)
        return false;
    chords = chords[0]

    //chords.className += " _2M9MP"

    chords.style.position = (on ? "fixed" : "");
    chords.style.margin = (on ? "0px" : "");
    chords.style.padding = (on ? "10px" : "");
    chords.style.zIndex = (on ? "1000" : "");
    //chords.style.background="#FFFFFF55";
    chords.style.background="#F8F8F8";

    // Center
    var chords_block = document.querySelectorAll(document.config["chords_block_selector"]);
    if(chords_block.length > 0)
    {
        chords_block[0].style.margin = (on? "auto":"");
        chords_block[0].style.width = (on? "fit-content":"");
    }

    var chords_visible = on && pos >=0;
    chords.style.display = (chords_visible ? "" : "none");

    if(on)
    {
        switch(pos)
        {
        case 0:
            chords.style.top = "0px";
            chords.style.bottom= "";
            chords.style.left= "0px"
            chords.style.right = "";
            chords.style.width = "100%";
            chords.style.height = sz;
            break;
        case 1:
            chords.style.top = "0px";
            chords.style.bottom= "";
            chords.style.left= ""
            chords.style.right = "0px";
            chords.style.width = sz;
            chords.style.height = "100%";
            break;
        case 2:
            chords.style.top = "";
            chords.style.bottom= "0px";
            chords.style.left= "0px"
            chords.style.right = "";
            chords.style.width = "100%";
            chords.style.height = sz;
            break;
        case 3:
            chords.style.top = "0px";
            chords.style.bottom= "";
            chords.style.left= "0px"
            chords.style.right = "";
            chords.style.width = sz;
            chords.style.height = "100%";
            break;
        }
    }
    else
    {
            chords.style.top = "";
            chords.style.bottom= "";
            chords.style.left= "";
            chords.style.right = "";
            chords.style.width = "";
            chords.style.height = "";
    }
    return true
}

function setcolumns (nums) {
  const tabsSelector = document.config["tab_chords_selector"];
  const tabWrapper = document.querySelector(tabsSelector)
  if (tabWrapper) {
    tabWrapper.style.columnCount = nums
  }
}

function isfullscreen()
{
    var elements = document.querySelectorAll(document.config["page_selector"]);
    if(elements.length < 1)
        return "Page not found";

    var on = (elements[0].style.position != "");
    return on
}

function setfullscreen (on, pos=1, size = 0)
{
    var elements = document.querySelectorAll(document.config["page_selector"]);
    if(elements.length < 1)
        return "Page not found";

    var page = elements[0];

    //document.body.appendChild(page);

    page.children[0].style.margin = (on? "0px": "");

    page.style.position = (on? "absolute" : "");
    page.style.margin = (on? "0px": "");


    if(on)
    {
        switch(pos)
        {
        case 0:
            page.style.top = ""+size+"px";
            page.style.bottom= "";
            page.style.left= "0px"
            page.style.right = "";
            page.style.width = "100%";
            page.style.height = "calc(100% - "+size+"px)";
            break;
        case 1:
            page.style.top = "0px";
            page.style.bottom= "";
            page.style.left= "0px"
            page.style.right = "";
            page.style.width = "calc(100% - "+size+"px)";
            page.style.height = "100%";
            break;
        case 2:
            page.style.top = "0px";
            page.style.bottom= ""+size+"px";
            page.style.left= "0px"
            page.style.right = "";
            page.style.width = "100%";
            page.style.height = "calc(100% - "+size+"px)";
            break;
        case 3:
            page.style.top = "0px";
            page.style.bottom= "";
            page.style.left= ""
            page.style.right = "0px";
            page.style.width = "calc(100% - "+size+"px)";
            page.style.height = "100%";
            break;
        default:
            page.style.top = "0px";
            page.style.bottom= "";
            page.style.left= "0px"
            page.style.right = "";
            page.style.width = "100%";
            page.style.height = "100%";
            break;
        }
    }
    else
    {
            page.style.top = "";
            page.style.bottom= "";
            page.style.left= "";
            page.style.right = "";
            page.style.width = "";
            page.style.height = "";
    }


    var to_hide_sel = document.config["tohide_selector"]
    for (var ths in to_hide_sel)
    {
    console.log(ths)
        var tohide = document.querySelectorAll(ths);
        for (var j = 0; j<tohide.length; j++)
            tohide[j].style.display = (on ? "none" : "");
    }

    return "Page fullscreen set "+(on ?"ON":"OFF");
}

function change_chords_panel(pos=1, size = 0) {
    var on = isfullscreen()
    setfullscreen(on, pos, size)
    displacechords(on, pos, size)
}

function toggle_tab_full_view(nums, pos=1, size=0) {
    var on = isfullscreen()
    on = !on
    setfullscreen(on, pos, size)
    setcolumns(on ? nums : 1)
    displacechords(on, pos, size)
}

function toggle_full_view(nums, pos=1, size=0) {
    var on = isfullscreen()
    on = !on
    setfullscreen(on, pos, size)
    setcolumns(on ? nums : 1)
}

function set_tabs_list_all() {
    var grp = document.querySelectorAll(document.config["tabs_list_selector"]);
    if(!grp || grp.length ==0 | grp[0].children.length <3)
        return "Unable to find button"
    generate_click(grp[0].children[2]);
}

function get_current_font_size()
{
    var grp = document.querySelectorAll(document.config["tab_chords_selector"]);
    if(!grp || grp.length == 0)
            return null;
    return grp[0].style.fontSize;
}

function force_current_font_size(font_size)
{
    var grp = document.querySelectorAll(document.config["tab_chords_selector"]);
    if(!grp || grp.length == 0)
            return "Unable to find font size";
    grp[0].style.fontSize = font_size+"px";
    return "Font size forced to "+font_size;
}

function set_tabs_style()
{
    var tab_style = document.config["tab_chords_selector"]+" > span {overflow: hidden;}"
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
    square.style.width = 'fit-content';
    square.style.zIndex = '20000';
    square.style.position = 'fixed';
    square.style.backgroundColor = 'rgb(0,0,0)';
    square.style.backgroundColor = 'rgb(0,0,0,0.7)';
    square.style.textAlign = 'center';
    square.style.margin = 'auto';
    square.style.padding = '5px';
    square.style.overflowX= 'hidden';
    square.style.transition= '0.5s';
    square.style.right = 0;
    square.style.bottom = 0;
    document.body.appendChild(square)
}

function createTopTextZone()
{
    const square = document.createElement('div');
    square.id = "top_text_zone";
    square.innerHTML = "<b>TEST</b>";
    square.style.fontSize = "20px";
    square.style.fontStyle = "italic";
    square.style.height = '0';
    square.style.width = 'fit-content';
    square.style.zIndex = '20000';
    square.style.position = 'fixed';
    //square.style.backgroundColor = 'rgb(0,0,0)';
    //square.style.backgroundColor = 'rgb(0,0,0,0.7)';
    square.style.color= "#555";
    square.style.textAlign = 'center';
    square.style.margin = 'auto';
    square.style.padding = '5px';
    square.style.overflowX= 'hidden';
    square.style.transition= '0.5s';
    square.style.right = 0;
    square.style.top = 0;
    document.body.appendChild(square)
}

function showInfoZone(text="")
{
    var square = document.getElementById("info_zone");
    square.style.height = (text == "" ? '0px' : '50px');
    square.children[0].innerHTML = text;
}

function showTopTextZone(text="")
{
    var square = document.getElementById("top_text_zone");
    square.style.height = (text == "" ? '0px' : '50px');
    square.children[0].innerHTML = text;
}

load_config(
    () => {
        setup_buttons();
        set_tabs_style();
        createInfoZone();
        createTopTextZone();
        AndroidInterface.onJSfullyLoad();
    }
);
