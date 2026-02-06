/**
 * 試算表開啟時建立自訂選單
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('工具箱')
    .addItem('匯出覺察日記', 'showExportDiaryDialog')
    .addToUi();
}

function doGet(e)
{
  var para = e.parameter;
  return Router(para);
}

function doPost(e) {
  try
  {    
    let msg= JSON.parse(e.postData.contents);
    log(msg);
    let line = init();
    line.onpost(msg);
  }
  catch(ex)
  {
    log(ex);
  }
}