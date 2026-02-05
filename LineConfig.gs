function init()
{
  let lineApp = new LineApp(CHANNEL_ACCESS_TOKEN);
  lineApp.aggressive = true;

  lineApp.addRule(
    "你好",
    () => {
      return [LineApp.LineText("你好!"),LineApp.LinePositiveSticker()];
    }
  );

  lineApp.addRule(
    "查詢命令",
    () => {
      return [LineApp.LineText(cmdList())];
    }
  );

  lineApp.addRule(
    "提醒分享心得",
    () => {
      return [LineApp.LineText(remindReport())];
    }
  );

  lineApp.addRule(
    "查詢心得",
    (event) => {
      return [LineApp.LineText(checkReport(event.word))];
    }
  );

  function collectReport(event, report) {
    // if(event.source.groupId == null)
    //   return LineApp.LineText("請在群組內使用此功能。");
    
    try
    {
      // 確認標題格式：第一行需包含關鍵字
      let firstLine = event.word.split('\n')[0];
      if (!firstLine.includes(report.title.replace(/[0-9.]+版$/, ''))) {
        updateNGTime(event.user.userId);
        return [
          LineApp.LineText(event.user.displayName + "夥伴您好，" +
            "請在第一行包含「" + report.title + "」"),
          LineApp.LineStickerFormatNG(),
        ];
      }

      // 確認姓名格式
      let name_array = event.word.match(/(【\s*姓名\s*】|姓名：)(.*)/);
      if (!name_array || name_array[2].trim() == "") {
        updateNGTime(event.user.userId);
        return [
          LineApp.LineText(event.user.displayName + "夥伴您好，" +
            "請在心得中填上姓名，格式如下：\n【姓名】ＸＸＸ"),
          LineApp.LineStickerFormatNG(),
        ];
      }

      let lastNG = false;
      if(event.user.lastNGTime) {
        lastNG = checkHasRecentNG(event.user.userId);
      }

      if(GROUP_TEST.includes(event.source.groupId)) {
        // 測試
      }

      // 儲存心得
      appendReport([
        new Date(),
        name_array[2].trim(),
        event.word,
        event.user.displayName,
      ], report.sheetName);

      if(lastNG) {
        return LineApp.LineStickerFormatOK();
      } else {
        return [];
      }
    }
    catch(e)
    {
      log(e);

      if(!GROUP_TEST.includes(event.source.groupId)) {
        return [];
      }

      return LineApp.LineText("程式錯誤。");
    }
  }

  // 覺察日記（統一處理，不論是否帶版本號）
  lineApp.addRule_quote(
    "覺察日記",
    (event) => {
      return collectReport(event, { title: "覺察日記6.0版", sheetName: "Report_Bot_覺察" });
    }
  );

  // 觀呼吸心得分享
  lineApp.addRule_quote(
    "觀呼吸心得分享",
    (event) => {
      return collectReport(event, { title: "觀呼吸心得分享", sheetName: "Report_Bot_觀呼吸" });
    }
  );

  // 天人師心得分享
  lineApp.addRule_quote(
    "天人師心得分享",
    (event) => {
      return collectReport(event, { title: "天人師心得分享", sheetName: "Report_Bot_天人師" });
    }
  );


  // TITLE = "觀呼吸心得分享";
  
  // lineApp.addRule_quote(
  //   "心得分享",
  //   (event) => {
  //     if(event.source.groupId == null)
  //       return LineApp.LineText("請在群組內使用此功能。");
      
  //     try
  //     {
  //       // 確認標題格式
  //       let rule = "^(【.*" + TITLE + ".*】" + "|" + "［.*" + TITLE + ".*］)";
  //       let re = new RegExp(`${rule}`);
  //       if (!event.word.match(re)) {
  //         updateNGTime(event.user.userId);
  //         return [
  //           LineApp.LineText(event.user.displayName + "夥伴您好，" +
  //             "請使用以下標題格式，前面請勿空白、空行：\n" + "【" + TITLE + "】"),
  //           LineApp.LineStickerFormatNG(),
  //         ];
  //       }

  //       // 確認姓名格式
  //       let name_array = event.word.match(/(【\s*姓名\s*】|［\s*姓名\s*］)(.*)/);
  //       // let name_array = event.word.match(/(\s*姓名：\s*)(.*)/);
  //       if (!name_array || name_array[2].trim() == "") {
  //         updateNGTime(event.user.userId);
  //         return [
  //           LineApp.LineText(event.user.displayName + "夥伴您好，" +
  //             "請在心得中填上姓名，格式如下：\n【姓名】ＸＸＸ"),
  //           LineApp.LineStickerFormatNG(),
  //         ];
  //       }

  //       let lastNG = false;
  //       if(event.user.lastNGTime) {
  //         lastNG = checkHasRecentNG(event.user.userId);
  //       }

  //       if(GROUP_TEST.includes(event.source.groupId)) {
  //         // 測試
  //       }

  //       // 儲存心得
  //       appendReport([
  //         new Date(),
  //         name_array[2].trim(),
  //         event.word,
  //         event.user.displayName,
  //       ], Report_Bot);

  //       // 儲存心得 (舊寫法，效率低)
  //       // DataHelper.appendData("Report_Bot", {
  //       //   Time: new Date(),
  //       //   LineName: event.user.displayName,
  //       //   Name: name_array[2].trim(),
  //       //   Content: event.word});

  //       // 此為測試區，只在特定群組有效
  //       // if(GROUP_TEST.includes(event.source.groupId)) {
  //       //   // 測試
  //       // }

  //       if(lastNG) {
  //         return LineApp.LineStickerFormatOK();
  //       } else {
  //         return [];
  //       }
  //     }
  //     catch(e)
  //     {
  //       log(e);

  //       if(!GROUP_TEST.includes(event.source.groupId)) {
  //         return [];
  //       }

  //       return LineApp.LineText("程式錯誤。");
  //     }
  //   }
  // );


  //"join",當機器人被加入群組時
  //"leave",當機器人被踢出群組時
  //"memberJoined",當有使用者被加入群組時
  //"memberLeft",當有使用者離開群組時
  //"follow",當有使用者加好友時
  //"unfollow",當有使用者封鎖時
  //"message",當接收到任何訊息時
  //以下都會先觸發message
  //"location",當收到地理資訊時
  //"image",當接收到圖片時
  //"audio",當接收到音訊時
  //"video",當接收到影片時
  //"file",當接收到檔案時
  //"sticker",當接收到貼圖時
  //"postback",當接收到postback時，按鈕互動時才會使用到
  //"text",當接收到文字訊息時

  //以下非Line  Messaging的事件
  //"error",當有錯誤發生時
  //"final",當流程全部走完時
  /*
  lineApp.on('image', (event) =>{    
    if(AdminGroup.getData(event.source.groupId)!=null)
    {      
      let img = lineApp.getMessageContent(event.message.id).getBlob();
      savefile(event.source.groupId,img);
      lineApp._replayMessages.push(LineApp.LineText("已暫存圖片。"));
    }
  });
  */

  return lineApp;
}