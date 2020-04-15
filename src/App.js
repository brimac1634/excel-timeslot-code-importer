import React, { useState } from 'react';
import XLSX from 'xlsx';

import './App.scss';

const App = () => {
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState({
    base: '',
    numOfRandom: 4,
    useAlpha: true,
    useNum: true
  })

  const { base, numOfRandom, useAlpha, useNum } = settings;

  const handleSettingsChange = e => {
    setSettings({ ...settings, [e.target.name]: e.target.value })
  }

  const handleCheck = e => {
    setSettings({ ...settings, [e.target.name]: !settings[e.target.name] })
  }
  console.log(settings);

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
          if ((useAlpha && useNum) || (!useAlpha && !useNum)) {
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
      console.log(rows)
      
      const newRows = rows.map(({ code, date, start, end }) => {
        return {
          code: code ? code : generateCode(base, numOfRandom, useAlpha, useNum),
          start: new Date(parseDateExcel(date + start)),
          end: new Date(parseDateExcel(date + end))
        }
      })

      setData(newRows);
    }
  }

  const dateOptions = {
    year: '2-digit',
    month:'2-digit',
    day:'2-digit',
    hour12 : true,
    hour:  '2-digit',
    minute: '2-digit',
  }

  return (
    <div className='app'>
      <div className='section'>
        <span className='step'>1.</span>
        <div className='group'>
          <input 
            className='form-input'
            type='text' 
            name='base'
            id='base' 
            value={base}
            onChange={handleSettingsChange}
          />
          <label 
            htmlFor='base' 
            className='form-input-label'
          >
            Entry Code Base (optional)
          </label>
        </div>
        <div className='col'>
          <div className='group'>
            <input 
              className='form-input'
              type='number' 
              name='numOfRandom'
              id='numOfRandom' 
              value={numOfRandom}
              onChange={handleSettingsChange}
            />
            <label 
              htmlFor='numOfRandom' 
              className='form-input-label'
            >
              Number of Random Characters
            </label>
          </div>
        </div>
        <div className='col'>
          <div className='row'>
            <input 
              type='checkbox'
              id='useAlpha'
              name='useAlpha'
              checked={useAlpha}
              onChange={handleCheck}
            />
            <label htmlFor='useAlpha'>Use Alphabet</label>
          </div>
          <div className='row'>
            <input 
              type='checkbox'
              id='useNum'
              name='useNum'
              checked={useNum}
              onChange={handleCheck}
            />
            <label htmlFor='useNum'>Use Numbers</label>
          </div>
        </div>
      </div>
      <div className='section'>
        <span className='step'>2.</span>
        <input 
          className='input-file'
          type='file' 
          name='file'
          id='upload' 
          onChange={handleChangeFile} 
          required
        />
        <label htmlFor='upload'>Choose File</label>
      </div>
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
              <span>{start.toLocaleDateString('en-US', dateOptions)}</span>
              <span>{end.toLocaleDateString('en-US', dateOptions)}</span>
              <span>{start.toLocaleDateString('en-US', { timeZoneName: 'short' })}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default App;
