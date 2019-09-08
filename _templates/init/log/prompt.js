// see types of prompts:
// https://github.com/enquirer/enquirer/tree/master/examples
//
const changeCase = require('change-case');
module.exports = [
  {
    type: 'input',
    name: 'date',
    message: '日付を入力してください！例：2019-10-07',
  },
  {
    type: 'input',
    name: 'filename',
    message: 'タイトルを入力してください！',
  },
];
