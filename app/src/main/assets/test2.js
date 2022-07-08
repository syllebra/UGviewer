function setcolumns () {
  const tabsSelector = 'code > pre';
  const tabWrapper = document.querySelector(tabsSelector)
  if (tabWrapper) {
    tabWrapper.style.columnCount = 4
  }
}