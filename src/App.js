import React, { useState } from 'react';
import XLSX from 'xlsx';

import './App.scss';

const App = () => {
  const [data, setData] = useState(null);

  const handleChangeFile = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file)
    reader.onload = e => {
      const data = new Uint8Array(e.target.result);
      const { SheetNames, Sheets } = XLSX.read(data, {type: 'array'})
      const currentSheet = Sheets[SheetNames[0]];
      const rows  =  XLSX.utils.sheet_to_row_object_array(currentSheet);

      const parseDateExcel = excelTimestamp => {
        const secondsInDay = 24 * 60 * 60;
        const excelEpoch = new Date(1899, 11, 31);
        const excelEpochAsUnixTimestamp = excelEpoch.getTime();
        const missingLeapYearDay = secondsInDay * 1000;
        const delta = excelEpochAsUnixTimestamp - missingLeapYearDay;
        const excelTimestampAsUnixTimestamp = excelTimestamp * secondsInDay * 1000;
        const parsed = excelTimestampAsUnixTimestamp + delta;
        return isNaN(parsed) ? null : parsed;
      };

      const generateCode = (base, numOfRandom, useAlpha, useNum) => {
        const alpha = 'abcdefghijklmnopqrstuvwxyz';
        const num = '0123456789';

        let alphaNum;
        if (useAlpha && useNum) {
          alphaNum = alpha + num;
        }

        let randomString = ''
        for (var i = 0; i < numOfRandom; i++) {
          if (useAlpha && useNum) {
            randomString += String(alphaNum[Math.floor(alphaNum.length * Math.random())]);
          } else if (useAlpha && !useNum) {
            randomString += String(alpha[Math.floor(alpha.length * Math.random())]);
          } else if (useNum && !useAlpha) {
            randomString += String(num[Math.floor(num.length * Math.random())]);
          }
        }
        if (base) return base + randomString;
        return randomString;
      }
      
      const newRows = rows.map(({ date, start, end }) => {
        
        console.log(date, start)
        return {
          code: generateCode('hey', 4, false, true),
          start: new Date(parseDateExcel(date + start)),
          end: new Date(parseDateExcel(date + end))
        }
      })
      console.log(newRows);
      setData(newRows);
    }
  }

  return (
    <div className='app'>
      <input 
        className='input-file'
        type='file' 
        name='file'
        id='upload' 
        onChange={handleChangeFile} 
        required
      />
      <label htmlFor='upload'>Choose File</label>
      <div className='table'>
        <div className='row header'>
          <span>Entry Code</span>
          <span>Start Time</span>
          <span>End Time</span>
          <span>Timezone</span>
        </div>
        {
          data &&
          data.map(({ code, start, end }, i) => (
            <div key={i} className='row'>
              <span>{code}</span>
              <span>{start.toString().slice()}</span>
              <span>{end.toString()}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default App;
