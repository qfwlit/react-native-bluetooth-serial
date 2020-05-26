// util.js
const _ = require('lodash');

/**
* 判断当前字符是中文还是英文
* @param {*} word 打印的字符
*/
const isChinese = (word) => {
  const charCode = word.charCodeAt(0);
  return !(charCode >= 0 && charCode <= 128)
}

/**
* 计算单个字符的长度
* @param {*} word 打印的字符 中文长度为 2 英文长度为 1
*/
const getWordLength = (word) => {
  return isChinese(word) ? 2 : 1;
}

/**
* 获取打印字符的长度 一个字符 为 2
* @param {*} words 打印的字符
*/
const getWordsLength = (words) => {
  // v -> 代表每一个字符
  return _.reduce(words, (m, v) => m + getWordLength(v), 0);
}

/**
* 计算打印的空格
* @param {*} len 空格的长度
*/
const getSpace = (len) => {
  return _.times(len, () => ' ').join('');
}

/**
* 一个将字符串转换为 16 进制的方法
* @param {*} str 转换 16 进制的字符串
*/
const stringToHex = (str) => {
  let val = ''
  for (let i = 0; i < str.length; i++) {
    if (val === '') {
      val = str.charCodeAt(i).toString(16)
    } else {
      val += ' ' + str.charCodeAt(i).toString(16)
    }
  }
  return val
}

module.exports = {
  isChinese,
  getWordsLength,
  getWordLength,
  getSpace,
  stringToHex
};