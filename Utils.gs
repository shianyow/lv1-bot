function findtext(text,st,en)
{
  let a = text.indexOf(st);  
  if(a==-1)
    return "";  
  if(typeof en ==='undefined' || en=="")
    return text.slice(a + st.length).trim();
  let b = text.indexOf(en , a + st.length);
  if(b==-1)
    return text.slice(a + st.length).trim();
  else
    return text.slice(a + st.length, b).trim();
}

function appendReport(row, sheetName)
{
  let sheet = SpreadsheetApp.getActive().getSheetByName(sheetName); 
  // console.log(row, sheetName);

  sheet.appendRow(row);
}

const reports = [
  { title: "覺察日記6.0版", sheetName: "Report_Bot_覺察" },
  // { title: "觀呼吸心得分享", sheetName: "Report_Bot_觀呼吸" },
  { title: "天人師心得分享", sheetName: "Report_Bot_天人師" },
];



function test()
{
  console.log("Test: " + reports[0].title + ", " + reports[0].sheetName);
  // for (const report of reports) {
  //   console.log("Test: " + report.title + ", " + report.sheetName);
  // }

  // console.log(findNoReportNames());
  // console.log(remindReport());
  // console.log(cmdList());
  // console.log(checkReport("查詢心得 本週未分享"));
  // console.log(checkReport("查詢心得 本週已分享"));
  // console.log(checkReport("查詢心得 上週未分享"));
  // console.log(checkReport("查詢心得 上週已分享"));
  // console.log(checkReport("查詢心得"));
  // console.log(checkReport("查詢心得 123"));

//   let phrase = `【108項修煉心得分享】
// 【033 修觀果知因】
// 【第**篇】
  

// 【第＊組】
// 【姓名】＊＊＊
// 【日期】2022.06.**

// 【心得】

// 【從中看到的自己】

// 【從中得到的體悟】

// 【從中得到的反思】
// `
//   let row = [new Date(), "test_123", phrase, "吳先祐"];

//   appendReport(row);
}

function testUpdateNGTime()
{
  let userId = "U70991a1bceaad744e8967c3997bb4ef9";
  updateNGTime(userId);
}

function updateNGTime(userId)
{
  let user = User.getData(userId);
  if(user) {
    user.lastNGTime = new Date();
    User.putData(user);
  }
}

function testHastRecentNG()
{
  let userId = "U70991a1bceaad744e8967c3997bb4ef9";
  if(checkHasRecentNG(userId)) {
    console.log("true");
  } else {
    console.log("false");
  }
}

function checkHasRecentNG(userId)
{
  let user = User.getData(userId);
  
  if(user.lastNGTime) {
    let lastNGTime = new Date(user.lastNGTime).getTime();
    user.lastNGTime = "";
    User.putData(user);

    let now = new Date().getTime();
    let diffSecs = Math.floor((now - lastNGTime) / 1000);
     
    if(diffSecs < 600) {
      return true
    }
  }

  return false;
}

function cmdList()
{
  cmd =
    "查詢命令 -- 列出所有命令\n" +
    "提醒分享心得 -- 提醒本週未分享心得的夥伴\n" +
    "查詢心得 -- 查詢心得分享情況";

  return cmd;
}

function checkReport(cmd)
{  
  let help =
    "使用範例：\n" +
    "1) 查詢心得 本週未分享\n" +
    "2) 查詢心得 本週已分享\n" +
    "3) 查詢心得 上週未分享\n" +
    "4) 查詢心得 上週已分享";

  console.log(cmd);
  let args = cmd.match(/(查詢心得\s)(.*)/);

  if (!args || args[2].trim() == "") {
    return help;
  }

  let names = [];
  let date = new Date();

  switch (args[2].trim()) {
    case "本週未分享":
      date.setDate(date.getDate());
      names = findNoReportNames(date, false);
      break;
    case "本週已分享":
      date.setDate(date.getDate());
      names = findNoReportNames(date, true);
      break;
    case "上週未分享":
      date.setDate(date.getDate() - 7);
      names = findNoReportNames(date, false);
      break;
    case "上週已分享":
      date.setDate(date.getDate() - 7);
      names = findNoReportNames(date, true);
      break;
    default:
      return help;
  }

  let output = args[2].trim() + "：共 " + names.length + " 位\n";
  output += formatNames(names);

  return output;
}

function remindReport()
{
  date = new Date();
  names = findNoReportNames(date, false);

  let text = "敬愛的老師、各位家人們當下好，溫馨提醒尚未分享心得的家人，記得分享修煉文喔\n\n";
  return text + formatNames(names);
}

function formatNames(names)
{
  if (!names) {
    return "";
  }

  let output = "";

  if (names.length > 0) {
    output = output + names[0];
  }
  for (let i = 1; i < names.length; i++) {
    output = output + "、" + names[i];
  }

  return output;
}

function findNoReportNames(date, submit)
{
  // let sheetArray = ["第一組", "第二組", "第三組", "第四組", "第五組", "第六組", "第七組", "第八組",
    // "第九組", "第十組", "第11組", "第12組", "第13組", "第14組"];
  let sheetArray = ["ABCD", "EFGH", "IJKL", "MNOP", "Q"];
  // let sheetArray = ["第五組"];
  let nameNoReport = [];
  let nameSubmitted = [];

  for (const sheetName of sheetArray) {
    let sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
    if (sheet == null) {
      return "程式錯誤，不存在的工作表：" + '"' + sheetName + '"';
    }

    // let column = sheet.getRange('A:P');
    let column = sheet.getRange('A:FF');
    let values = column.getValues();
  
    console.log("sheetName=", sheetName, "values.length=", values.length);
    for (let i = 0; i < values.length; i++) {
      // 欄位格式是日期
      if ((values[i][1] instanceof Date) && (values[i][2] instanceof Date)) {
        // 時間在當週區間
        if (date.getTime() >= values[i][1].getTime() && date.getTime() < values[i][2].getTime()) {
          console.log("index=", i);
          for (let j = 3; j < values[i].length; j++) {
            // 名字存在
            if (values[8][j] != "") {
              // 報告篇數是空的
              if (values[i][j] == 0 || isNaN(values[i][j])) {
                nameNoReport.push(values[8][j]);
              } else {
                nameSubmitted.push(values[8][j]);
              }
            }
          }
          break;
        }
      }
    }
  }

  if (submit == true) {
    return nameSubmitted;
  } else {
    return nameNoReport;
  }
}

function test_parse_start_line()
{
  let phrase = 
`【 覺察報告5.0版　】
【033 修觀果知因】
【第**篇】
  

【第＊組】
【姓名】＊＊＊
【日期】2022.06.**

【心得】

【從中看到的自己】

【從中得到的體悟】

【從中得到的反思】
`
  const TITLE = "覺察報告5.0版";
  name_quote = "【" + TITLE + "】";
  console.log(name_quote); 
  let rule = "^\n?.*(【.*" + TITLE + ".*】)";
  let re = new RegExp(`${rule}`);
  // console.log(phrase);
  console.log(re);
  let name_array = phrase.match(re);
  if (name_array) {
    console.log("Yes!\n");
  }

  // let rule2 = "^(【.*" + TITLE + ".*】)";
  // let rule2 = "^.*(【" + TITLE + "】)";
  let rule2 = "^【.*" + TITLE + ".*】";
  console.log(rule2);
  let re2 = new RegExp(`${rule2}`);
  name_array = phrase.match(re2);
  if (!name_array) {
    console.log("請在心得第一行使用以下標題：\n" +  "【" + TITLE + "】");
  } else {
    console.log("格式正確!");
  }

}

function test_parse_name()
{
// 姓名：４５６
  let phrase = `
【108項修煉心得分享】
【033 修觀果知因】
【第**篇】
【第＊組】
　　姓名：　　１２３　　
【日期】2022.06.**

【心得】

【從中看到的自己】

【從中得到的體悟】

【從中得到的反思】
`

  // let name_array = phrase.match(/(【\s*姓名\s*】|\［\s*姓名\s*\］|\s*姓名：\s*)(.*)/);
  let name_array = phrase.match(/(【\s*姓名\s*】|姓名：)(.*)/);
  if (!name_array || name_array[2].trim() == "") {
    console.log(
      "請在心得中填上姓名，格式如下：\n" +
      "【姓名】ＸＸＸ");
  } else {
    console.log("_" + name_array[2].trim() + "_");
  }
}

function log(e)
{
  Log.appendData({Time:new Date(),Message:JSON.stringify(e)});
}
