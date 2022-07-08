function f() {
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
