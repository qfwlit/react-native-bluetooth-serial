// esc.js
const _ = require('lodash')
const Util = require('./util')

/**
* 初始化打印的基础配置
*/
const Common = {
  INIT: "1B 40", // 初始化

  ALIGN_LEFT: "1B 61 00", // 左对齐
  ALIGN_RIGHT: "1B 61 02", // 居右对齐
  ALIGN_CENTER: "1B 61 01", // 居中对齐

  UNDER_LINE: "1C 2D 01", // 下划线

  PRINT_AND_NEW_LINE: "0A", // 打印并换行

  FONT_SMALL: "1B 4D 01", // 小号字体 9x17
  FONT_NORMAL: "1B 4D 00", // 正常 12x24
  FONT_BOLD: "1B 45 01", // 粗体

  FONT_HEIGHT_TIMES: '1B 21 10',
  FONT_WIDTH_TIMES: '1B 21 20',
  FONT_HEIGHT_WIDTH_TIMES: '1B 21 30',

  QRCODETYPE: '1B 23 23 51 50 49 58 12', // 美达设置二维码像素点大小
  QRCODEINIT: '1D 28 6B 03 00 31 43 05', // 二维码初始化
  QRCODESEND: '1D 28 6B 03 00 31 51 30', // 二维码发送到打印机

  SOUND: "1B 42 02 02" // 蜂鸣 2次/100ms
}

/**
* 打印字符长度的配置
*/
const Config = {
  wordNumber: 32 // 可打印的字数，对应58mm纸张; 48 对应 80mm
}

let writeTextToDevice, writeHexToDevice

const _setBT = (bt) => {
  // 将字符写进设备
  writeTextToDevice = bt.writeTextToDevice
  // 将 16 进制写进设备
  writeHexToDevice = bt.writeHexToDevice
}

/**
* 合并配置数据
* @param {*} config 传进来的手动配置
*/
const setConfig = (config) => {
  Object.assign(Config, config)
}

/**
* 打印左右格式的方案
* @param {*} left 打印左侧的字符
* @param {*} right 打印右侧的字符
* @param {*} wordNumber 打印字符的总长度
*/
const leftRight = (left, right, wordNumber = Config.wordNumber) => {
  return left + Util.getSpace(wordNumber - Util.getWordsLength(left) - Util.getWordsLength(right)) + right
}

/**
* 打印左中右格式的方案
* @param {*} left 左侧的打印字符
* @param {*} center 中间的打印字符
* @param {*} right 右侧的打印字符
* @param {*} wordNumber 打印字符的总长度
*/
const leftCenterRight = (left, center, right, wordNumber = Config.wordNumber) => {
  const spaceLen = Util.getSpace((wordNumber - Util.getWordsLength(left) - Util.getWordsLength(center) - Util.getWordsLength(right)) / 4)
  return left + spaceLen + center + spaceLen + right
}

/**
* 配置佳博二维码的 16 进制数据
* @param {*} str 二维码的地址链接
*/
const jboConfigQrcode = (str) => {
  let strLen = str.length
  let pL = strLen + 3
  let map = `1D 28 6b ${pL.toString(16)} 00 31 50 30 ${Util.stringToHex(str)}`
  // alert(map)
  return map
}

/**
* 配置美达二维码的 16 进制数据
* @param {*} str 二维码打印的地址链接
*/
const mdaConfigQrcode = (str) => {
  let strLen = str.length
  let pL = strLen + 3
  let map = `1D 28 6b ${pL} 00 31 50 30 ${Util.stringToHex(str)}`
  return map
}

const keyValue = (name, value, wordNumber = Config.wordNumber) => {
  const nameLen = Util.getWordsLength(name)
  let vArr = [], temp = ''
  _.each(value, (v, i) => {
    const tvLen = Util.getWordsLength(temp + v)
    const diff = tvLen - (wordNumber - nameLen)
    if (diff <= 0) {
      temp += v
      if (i === value.length - 1) {
        vArr.push(temp)
      }
    } else {
      if (Util.isChinese(v) && diff === 1) {
        temp += ' '
      }
      vArr.push(temp)
      temp = v
    }
  })
  return _.map(vArr, (v, i) => {
    if (i === 0) {
      return name + v
    } else {
      return Util.getSpace(name.length) + v
    }
  }).join('')
}

/**
* 传输到打印机的打印命令的配置
*/
const ESC = {
  Common,
  Util: {
    leftRight,
    keyValue,
    leftCenterRight,
    jboConfigQrcode,
    mdaConfigQrcode
  },
  _setBT,
  setConfig,

  // 初始化打印机
  init: () => {
    writeHexToDevice(Common.INIT)
  },

  // 打印并换行
  printAndNewLine: () => {
    writeHexToDevice(Common.PRINT_AND_NEW_LINE)
  },

  // 对齐方式
  alignLeft: () => {
    writeHexToDevice(Common.ALIGN_LEFT)
  },
  alignCenter: () => {
    writeHexToDevice(Common.ALIGN_CENTER)
  },
  alignRight: () => {
    writeHexToDevice(Common.ALIGN_RIGHT)
  },

  // 打印下划线
  underline: () => {
    writeHexToDevice(Common.UNDER_LINE)
  },

  // 字体设置
  fontSmall: () => {
    writeHexToDevice(Common.FONT_SMALL)
  },
  fontNormal: () => {
    writeHexToDevice(Common.FONT_NORMAL)
  },
  fontBold: () => {
    writeHexToDevice(Common.FONT_BOLD)
  },

  fontHeightTimes: () => {
    writeHexToDevice(Common.FONT_HEIGHT_TIMES)
  },
  fontHeightTimes: () => {
    writeHexToDevice(Common.FONT_WIDTH_TIMES)
  },
  fontHeightTimes: () => {
    writeHexToDevice(Common.FONT_HEIGHT_WIDTH_TIMES)
  },

  // 打印文字
  text: (str) => {
    writeTextToDevice(str)
  },

  /**
  * 佳博打印二维码的命令
  * @param {*} str 二维码的数据内容
  */
  jboQrcodePrint: (str) => {
    writeHexToDevice(Common.QRCODEINIT)
    writeHexToDevice(str)
    writeHexToDevice(Common.QRCODESEND)
  },

  /**
  * 美达打印二维码的命令
  * @param {*} str 二维码的数据内容
  */
  mdaQrcodePrint: (str) => {
    writeHexToDevice(Common.QRCODETYPE)
    writeHexToDevice(Common.QRCODEINIT)
    writeHexToDevice(str)
    writeHexToDevice('1D 28 6B 33 33 31 51 30')
  },

  /**
  * 蜂鸣
  */
  sound: () => {
    writeHexToDevice(Common.SOUND)
  }
}

module.exports = ESC