/**
 * 覺察日記 PDF 匯出功能
 */

/**
 * 顯示匯出對話框
 */
function showExportDiaryDialog() {
  var html = HtmlService.createHtmlOutputFromFile('DiaryExportForm')
    .setWidth(380)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, '匯出覺察日記');
}

/**
 * 匯出覺察日記主函數
 * @param {string} name - 姓名
 * @param {string} startDateStr - 開始日期 (YYYY-MM-DD)
 * @param {string} endDateStr - 結束日期 (YYYY-MM-DD)
 * @param {string} format - 匯出格式 ('pdf' 或 'docx')
 * @returns {Object} 結果物件 {success, data, fileName, message}
 */
function exportDiaryPdf(name, startDateStr, endDateStr, format) {
  try {
    format = format || 'pdf';
    // 手動解析日期以避免時區問題 (YYYY-MM-DD)
    var startParts = startDateStr.split('-');
    var endParts = endDateStr.split('-');
    var startDate = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]), 0, 0, 0);
    var endDate = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]), 23, 59, 59, 999);

    // 從兩個工作表查詢資料
    var entries = getDiaryEntries(name, startDate, endDate);

    if (entries.length === 0) {
      return {
        success: false,
        message: '找不到「' + name + '」在指定期間的覺察日記'
      };
    }

    // 生成文件
    var result = createDiaryPdf(name, startDate, endDate, entries, format);

    return {
      success: true,
      data: result.data,
      fileName: result.fileName
    };

  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: e.message || '發生未知錯誤'
    };
  }
}

/**
 * 從工作表查詢覺察日記
 * @param {string} name - 姓名
 * @param {Date} startDate - 開始日期
 * @param {Date} endDate - 結束日期
 * @returns {Array} 日記條目陣列，按時間排序
 */
function getDiaryEntries(name, startDate, endDate) {
  var sheetNames = ['Report_Bot_覺察', '覺察_手動登記'];
  var allEntries = [];

  sheetNames.forEach(function(sheetName) {
    var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
    if (!sheet) return;

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return; // 只有標題列或空白

    // 跳過標題列，從第 2 行開始
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var time = row[0]; // Time
      var rowName = row[1]; // Name
      var content = row[2]; // Content

      // 跳過空白列
      if (!time || !rowName) continue;

      // 確保 time 是 Date 物件
      if (!(time instanceof Date)) {
        time = new Date(time);
      }

      // 檢查姓名是否符合（部分匹配）
      if (String(rowName).indexOf(name) === -1 && name.indexOf(String(rowName)) === -1) {
        continue;
      }

      // 檢查日期範圍
      if (time >= startDate && time <= endDate) {
        allEntries.push({
          time: time,
          name: rowName,
          content: content,
          source: sheetName
        });
      }
    }
  });

  // 按時間排序（舊到新）
  allEntries.sort(function(a, b) {
    return a.time - b.time;
  });

  return allEntries;
}

/**
 * 建立覺察日記 PDF
 * @param {string} name - 姓名
 * @param {Date} startDate - 開始日期
 * @param {Date} endDate - 結束日期
 * @param {Array} entries - 日記條目陣列
 * @returns {Object} {url, fileName}
 */
function createDiaryPdf(name, startDate, endDate, entries, format) {
  var timezone = 'Asia/Taipei';

  // 格式化日期
  var startStr = Utilities.formatDate(startDate, timezone, 'yyyy/MM/dd');
  var endStr = Utilities.formatDate(endDate, timezone, 'yyyy/MM/dd');
  var fileName = '覺察日記_' + name + '_' + startStr.replace(/\//g, '') + '-' + endStr.replace(/\//g, '');

  // 建立 Google Doc
  var doc = DocumentApp.create(fileName);
  var body = doc.getBody();

  // 設定頁面邊距
  body.setMarginTop(50);
  body.setMarginBottom(50);
  body.setMarginLeft(50);
  body.setMarginRight(50);

  // 設定頁面背景色（淡米色）
  body.setBackgroundColor('#FAF8F3');

  // ===== 溫暖舒適的封面設計 =====
  // 上方留白
  for (var i = 0; i < 5; i++) {
    body.appendParagraph('');
  }

  // 裝飾線條（頂部）
  var topLine = body.appendParagraph('──────────────────────');
  topLine.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  topLine.setForegroundColor('#D4C4B0');
  topLine.setFontSize(24);

  // 主標題 - 溫暖的深棕色
  var title = body.appendParagraph('📔 覺察日記彙整');
  title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  title.setFontSize(36);
  title.setBold(true);
  title.setForegroundColor('#5D4E37');

  // 裝飾線條（底部）
  var bottomLine = body.appendParagraph('──────────────────────');
  bottomLine.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  bottomLine.setForegroundColor('#D4C4B0');
  bottomLine.setFontSize(24);

  // 空行
  for (var i = 0; i < 6; i++) {
    body.appendParagraph('');
  }

  // 姓名 - 加大字
  var nameP = body.appendParagraph(name);
  nameP.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  nameP.setFontSize(32);
  nameP.setBold(true);
  nameP.setForegroundColor('#5D4E37');

  // 期間
  body.appendParagraph('');
  var dateRange = body.appendParagraph(startStr + ' ~ ' + endStr);
  dateRange.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  dateRange.setFontSize(20);
  dateRange.setForegroundColor('#5D4E37');

  // 篇數
  var count = body.appendParagraph('共 ' + entries.length + ' 篇');
  count.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  count.setFontSize(20);
  count.setForegroundColor('#5D4E37');

  // 底部溫馨提示
  for (var i = 0; i < 2; i++) {
    body.appendParagraph('');
  }

  var footer = body.appendParagraph('願這份紀錄，陪伴你看見內在的成長');
  footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  footer.setFontSize(20);
  footer.setItalic(true);
  footer.setForegroundColor('#8B7355');

  // ===== 加入每篇日記（每篇換頁）=====
  entries.forEach(function(entry, index) {
    // 分頁
    body.appendPageBreak();

    // 使用單一表格包含頁眉和內容
    var table = body.appendTable();

    // 頁眉列
    var headerRow = table.appendTableRow();
    var headerCell = headerRow.appendTableCell('第 ' + (index + 1) + ' 篇  |  ' + Utilities.formatDate(entry.time, timezone, 'yyyy/MM/dd HH:mm'));
    headerCell.setBackgroundColor('#E8DCC8');
    headerCell.setPaddingTop(8);
    headerCell.setPaddingBottom(8);
    headerCell.setPaddingLeft(12);
    headerCell.setPaddingRight(12);
    var headerPara = headerCell.getChild(0).asParagraph();
    headerPara.setFontSize(11);
    headerPara.setForegroundColor('#5D4E37');
    headerPara.setBold(true);

    // 內容列
    var contentRow = table.appendTableRow();
    var contentCell = contentRow.appendTableCell(entry.content || '（無內容）');
    contentCell.setBackgroundColor('#FFFFFF');
    contentCell.setPaddingTop(12);
    contentCell.setPaddingBottom(12);
    contentCell.setPaddingLeft(12);
    contentCell.setPaddingRight(12);

    // 內容文字樣式 - 使用深色以利閱讀
    var numChildren = contentCell.getNumChildren();
    for (var j = 0; j < numChildren; j++) {
      var child = contentCell.getChild(j);
      if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
        var para = child.asParagraph();
        var text = para.editAsText();
        text.setForegroundColor('#2C2C2C');
        text.setFontSize(11);
      }
    }

    // 設定表格邊框
    table.setBorderColor('#E8DCC8');
    table.setBorderWidth(1);
  });

  // 儲存並關閉 Doc
  doc.saveAndClose();

  var docFile = DriveApp.getFileById(doc.getId());
  var blob;
  var ext;

  if (format === 'docx') {
    // 匯出為 DOCX
    var url = 'https://docs.google.com/document/d/' + doc.getId() + '/export?format=docx';
    var response = UrlFetchApp.fetch(url, {
      headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() }
    });
    blob = response.getBlob();
    ext = '.docx';
  } else {
    // 匯出為 PDF
    blob = docFile.getAs('application/pdf');
    ext = '.pdf';
  }

  // 取得 base64 資料供前端下載
  var data = Utilities.base64Encode(blob.getBytes());

  // 刪除暫時的 Doc
  docFile.setTrashed(true);

  return {
    data: data,
    fileName: fileName + ext
  };
}
