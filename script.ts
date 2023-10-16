import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { Line } from './line';

// Assuming that the input file is in the following format:
type Row = {
  'sample number': string;
  '高い': string;
  '安い': string;
  '高すぎる': string;
  '安すぎる': string;
};
const headers = ['sample number','高い','安い','高すぎる','安すぎる'];

// summaryTable is 集計結果 in the paper.
type SummaryRow = {
  '金額': number;
  '高いと思う': number;
  '安いと思う': number;
  '高すぎて買えない': number;
  '安すぎて買えない': number;
};

// summaryTable should start from lowest price to highest price.
let summaryTable: SummaryRow[] = [];
initializeSummaryTable();
function initializeSummaryTable(
  lowestPrice: number = 50, highestPrice: number = 600, increment = 50
): void {
  // Currently, lowestPrice is 50, highestPrice is 600, increment for summary table is set to 50 yen.
  // This is not efficient if we have different kind of data
  // In the future, we might have to have a better way to determine the right parameter.
  for (let price = lowestPrice; price <= highestPrice; price += increment) {
    summaryTable.push({
      '金額': price,
      '高いと思う': 0,
      '安いと思う': 0,
      '高すぎて買えない': 0,
      '安すぎて買えない': 0,
    });
  }
}

let sampleNumber = 0;

// Read the raw data file and analyze it.
function readRawFile(csvFilePath: string): void {
  createReadStream(csvFilePath)
    .pipe(parse({ columns: headers }))
    .on('data', analyzeRow)
    .on('end', analyzeData);
}

// Analyze the data and print the result.
function analyzeData(){
  // To get the percentage, we need to divide the number of people who answered the question by the total number of people.
  summaryTable = summaryTable.map((row: SummaryRow) => {
    return {
      ...row,
      '高いと思う': row['高いと思う'] / sampleNumber,
      '安いと思う': row['安いと思う'] / sampleNumber,
      '高すぎて買えない': row['高すぎて買えない'] / sampleNumber,
      '安すぎて買えない': row['安すぎて買えない'] / sampleNumber,
    }
  });

  // 最低品質保証価格 is intersection of '高いと思う' and '安すぎて買えない'
  let lowestQualityPrice = findIntersection(summaryTable, '高いと思う', '安すぎて買えない');

  // 最高価格 is intersection of '安いと思う' and '高すぎて買えない'
  let highestPrice = findIntersection(summaryTable, '安いと思う', '高すぎて買えない');

  // 理想価格 is intersection of '高いと思う' and '安いと思う'
  let idealPrice = findIntersection(summaryTable, '高いと思う', '安いと思う');

  // 妥協価格 is intersection of '高すぎて買えない' and '安すぎて買えない'
  let compromisePrice = findIntersection(summaryTable, '高すぎて買えない', '安すぎて買えない');

  // It looks like the original paper round up the price.
  console.log('最高価格', Math.round(highestPrice), "円");
  console.log('妥協価格', Math.round(compromisePrice), "円");
  console.log('理想価格', Math.round(idealPrice), "円");
  console.log('最低品質保証価格', Math.round(lowestQualityPrice), "円");
}

function findIntersection(
  summaryTable: SummaryRow[], col1: keyof SummaryRow, col2: keyof SummaryRow
): number {
  for (let i=0; i<summaryTable.length-1; i++) {
    let rowi = summaryTable[i];
    let nextRowi = summaryTable[i+1];
    let l1 = new Line(rowi['金額'], rowi[col1], nextRowi['金額'], nextRowi[col1]);
    let l2 = new Line(rowi['金額'], rowi[col2], nextRowi['金額'], nextRowi[col2]);
    let [exist, p] = Line.findIntersection(l1, l2);

    if (exist) return p.x;
  }

  return 0;
}

// Analyze each row of the data.
function analyzeRow(row: Row){
  // Skip the first row, which is the header.
  if (row['高い'] === '高い') return;

  sampleNumber += 1;

  handleCheap(parseInt(row['安い']));
  handleExpensive(parseInt(row['高い']));
  handleTooCheap(parseInt(row['安すぎる']));
  handleTooExpensive(parseInt(row['高すぎる']));
};

function handleExpensive(price: number){
  // If price=x is expensive, then price>x is also expensive.
  summaryTable = summaryTable.map((row: SummaryRow) => {
    if (row['金額'] >= price) {
      return {...row, '高いと思う': row['高いと思う'] + 1};
    }
    return row;
  })
};

function handleCheap(price: number){
  // If price=x is cheap, then price<x is also cheap.
  summaryTable = summaryTable.map((row: SummaryRow) => {
    if (row['金額'] <= price) {
      return {...row, '安いと思う': row['安いと思う'] + 1};
    }
    return row;
  })
};

function handleTooExpensive(price: number){
  // If price=x is too expensive, then price>x is also too expensive.
  summaryTable = summaryTable.map((row: SummaryRow) => {
    if (row['金額'] >= price) {
      return {...row, '高すぎて買えない': row['高すぎて買えない'] + 1};
    }
    return row;
  })
};

function handleTooCheap(price: number){
  // If price=x is too cheap, then price<x is also too cheap.
  summaryTable = summaryTable.map((row: SummaryRow) => {
    if (row['金額'] <= price) {
      return {...row, '安すぎて買えない': row['安すぎて買えない'] + 1};
    }
    return row;
  })
};

// Start the program.
readRawFile('PSMrawdata.csv');
