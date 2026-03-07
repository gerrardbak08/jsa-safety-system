/// <reference types="google-apps-script" />

// ----------------------------------------------------
// 타입 정의 (TypeScript Interfaces)
// ----------------------------------------------------

interface ChecklistItem {
  cat: string;
  question: string;
  score: string | number;
  judgment: string;
  remark: string;
  photoUrl?: string;
}

interface SaveChecklistData {
  isEditMode?: boolean;
  date: string;
  store: string;
  inspector: string;
  hq: string;
  dept: string;
  team: string;
  items: ChecklistItem[];
}

interface JSAStepData {
  date?: string;
  jsaDate?: string;
  inspector: string;
  store: string;
  jobName: string;
  stepNum: string | number;
  stepDesc: string;
  hazardType: string;
  hazards: string;
  measures: string;
  photoLevel?: string;
  level?: string;
  manager: string;
  workers: string;
  hq: string;
  dept: string;
  team: string;
  proofPB64?: string;
  proofQB64?: string;
  photoArray?: string[];
  hazardPhotoArray?: string[];
}

interface AccidentCheckResultData {
  checkDate: string;
  inspector: string;
  hq: string;
  dept: string;
  team: string;
  store: string;
  accidentDate: string;
  accidentType: string;
  accidentContent: string;
  agency: string;
  imgAgency: string | string[];
  hazard: string;
  risk: string;
  status: string;
  imgAction: string | string[];
  comment: string;
  rowIndex?: number;
}

interface AIAnalysisData {
  date: string;
  inspector: string;
  hq: string;
  dept: string;
  team: string;
  store: string;
  taskName: string;
  totalScore: string | number;
  grade: string;
  ranking: string | number;
  neck: string | number;
  back: string | number;
  shoulder: string | number;
  knee: string | number;
  manipulation: string | number;
  env: string | number;
  fullText: string;
  imageB64?: string;
  comment: string;
}

// ----------------------------------------------------
// 메인 함수
// ----------------------------------------------------

function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createTemplateFromFile('index').evaluate()
    .setTitle('안전 점검 시스템 v1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getStoreListData(): Record<string, any> {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('목록');
  if (!sheet) return {};
  
  const data = sheet.getDataRange().getValues().slice(1);
  let storeMap: Record<string, any> = {};

  data.forEach((row: any[]) => {
    const [hq, dept, team, store] = row;
    if (!hq || !dept || !team || !store) return;

    if (!storeMap[hq]) storeMap[hq] = {};
    if (!storeMap[hq][dept]) storeMap[hq][dept] = {};
    if (!storeMap[hq][dept][team]) storeMap[hq][dept][team] = [];
    storeMap[hq][dept][team].push(store);
  });
  return storeMap;
}

function getChecklistItems(): any[] {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('점검항목');
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues().slice(1);
  let grouped: Record<string, any> = {};

  data.forEach((row: any[]) => {
    const cat = row[0] ? row[0].toString().trim() : "";
    const q = row[1] ? row[1].toString().trim() : "";
    const judgment = row[4] ? row[4].toString().trim() : "-";
    const detail = row[5] ? row[5].toString().trim() : "-";

    if (!cat || !q) return;

    const key = (cat + q).replace(/\s+/g, '');
    if (!grouped[key]) { grouped[key] = { cat: cat, question: q, info: {} }; }
    
    const currentCount = Object.keys(grouped[key].info).length;
    let scoreKey = currentCount === 0 ? "3" : (currentCount === 1 ? "2" : "1");
    grouped[key].info[scoreKey] = { judgment: judgment, detail: detail };
  });
  return Object.values(grouped);
}

function saveChecklist(data: SaveChecklistData): string {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("점검결과");

    if (!sheet) {
      sheet = ss.insertSheet("점검결과");
      sheet.appendRow(["날짜", "점검자", "영업본부", "부서명", "팀명", "매장명", "카테고리", "질문", "점수", "판정", "비고", "사진"]);
    }

    const lastRow = sheet.getLastRow();

    if (data.isEditMode) {
      const fullRange = sheet.getDataRange();
      const fullData = fullRange.getValues();
      const updateItems = [...data.items];
      const newItemsToAppend: any[][] = [];

      updateItems.forEach(item => {
        let found = false;
        for (let i = 1; i < fullData.length; i++) {
          let rowDate = fullData[i][0];
          if (rowDate) rowDate = Utilities.formatDate(new Date(rowDate), "GMT+9", "yyyy-MM-dd");
          const rowStore = fullData[i][5];
          const rowCat = fullData[i][6];
          const rowQ = fullData[i][7];

          if (rowDate === data.date && rowStore === data.store && rowCat === item.cat && rowQ === item.question) {
            sheet!.getRange(i + 1, 9, 1, 4).setValues([[item.score, item.judgment, item.remark, item.photoUrl || ""]]);
            makeCellClickableLinks(sheet!.getRange(i + 1, 12), item.photoUrl || "");
            found = true;
            break;
          }
        }
        if (!found) {
          newItemsToAppend.push([
            data.date, data.inspector, data.hq, data.dept, data.team, data.store,
            item.cat, item.question, item.score, item.judgment, item.remark, item.photoUrl || ""
          ]);
        }
      });

      if (newItemsToAppend.length > 0) {
        const startRow = sheet.getLastRow() + 1;
        sheet.getRange(startRow, 1, newItemsToAppend.length, 12).setValues(newItemsToAppend);
        for (let k = 0; k < newItemsToAppend.length; k++) {
          makeCellClickableLinks(sheet!.getRange(startRow + k, 12), newItemsToAppend[k][11]);
        }
      }
      return "수정 및 추가 성공";
    } else {
      const newRows = data.items.map(item => [
        data.date, data.inspector, data.hq, data.dept, data.team, data.store,
        item.cat, item.question, item.score, item.judgment, item.remark, item.photoUrl || ""
      ]);
      const startRow = lastRow + 1;
      sheet.getRange(startRow, 1, newRows.length, 12).setValues(newRows);

      for (let k = 0; k < newRows.length; k++) {
        makeCellClickableLinks(sheet!.getRange(startRow + k, 12), newRows[k][11]);
      }
      return "저장 성공";
    }
  } catch (error: any) {
    throw new Error("저장 중 에러 발생: " + error.toString());
  }
}

// ... 기타 함수들도 동일한 방식으로 타입 지정 (가독성을 위해 일부 생략 혹은 동일하게 변환) ...

function uploadImage(base64: string, filename: string, inspectorName: string): string {
  const folderMap: Record<string, string> = {
    "Kang (안전)": "1Uwu8kGqepJ45qrFqooEuWB1woh2y5qFb",
    "Kang(안전)": "1Uwu8kGqepJ45qrFqooEuWB1woh2y5qFb",
    "Park (안전)": "1wjYwmA2ecB-mAwCp7x1yfn_pHQ83Hh-p",
    "Park(안전)": "1wjYwmA2ecB-mAwCp7x1yfn_pHQ83Hh-p",
    "Yoo (안전)": "1ag5xGJjg168TqkS3LREcbAxdSn71KZHS",
    "Yoo(안전)": "1ag5xGJjg168TqkS3LREcbAxdSn71KZHS",
    "Seo (안전)": "1lFqI1AZHSCH_1oHbVPn2IztiaJznZaxZ",
    "Seo(안전)": "1lFqI1AZHSCH_1oHbVPn2IztiaJznZaxZ",
    "Park (보건)": "1Q-FL9g2pjw0ycuDY-H1YzRtkaKIG8Dpr",
    "Park(보건)": "1Q-FL9g2pjw0ycuDY-H1YzRtkaKIG8Dpr",
    "Yoon (보건)": "1mW2sXsjNGBhWVwEzqVlXP2Effw7kGhA2",
    "Yoon(보건)": "1mW2sXsjNGBhWVwEzqVlXP2Effw7kGhA2"
  };

  let inspectorFolder: GoogleAppsScript.Drive.Folder;
  const folderId = folderMap[inspectorName];

  if (folderId) {
    inspectorFolder = DriveApp.getFolderById(folderId);
  } else {
    const mainFolderId = "1UwvnG6AfyeEob_ZFMypidFWzsekIbTNa";
    const mainFolder = DriveApp.getFolderById(mainFolderId);
    const folders = mainFolder.getFoldersByName(inspectorName);
    if (folders.hasNext()) {
      inspectorFolder = folders.next();
    } else {
      inspectorFolder = mainFolder.createFolder(inspectorName);
    }
  }

  const contentType = base64.substring(5, base64.indexOf(';'));
  const bytes = Utilities.base64Decode(base64.split(',')[1]);
  const blob = Utilities.newBlob(bytes, contentType, filename);

  const file = inspectorFolder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return file.getUrl();
}

function makeCellClickableLinks(range: GoogleAppsScript.Spreadsheet.Range, urlsStr: string): void {
  if (!urlsStr) return;

  const urls = urlsStr.split('\n');
  const builder = SpreadsheetApp.newRichTextValue().setText(urlsStr);

  let currentPos = 0;
  urls.forEach(url => {
    if (url.startsWith('http')) {
      builder.setLinkUrl(currentPos, currentPos + url.length, url);
    }
    currentPos += url.length + 1;
  });

  range.setRichTextValue(builder.build());
}
