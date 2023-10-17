const figlet = require('figlet')
const chalk = require('chalk')
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const { DelimiterParser } = require('@serialport/parser-delimiter')
const { ByteLengthParser } = require('@serialport/parser-byte-length')
const axios = require('axios').default;
// Create a port
const comPort = 'COM3'
const port = new SerialPort({
  path: comPort,
  baudRate: 57600,
})

// Figlet Config
const config = {
  font: 'doom',
  horizontalLayout: 'default',
  verticalLayout: 'default',
  width: 90,
}

const baseUrl = 'https://ams.masben.dev/api'
// const baseUrl = 'https://ams-polda-banten.test/api'
const apikey = 'CbIVEbqweS8l76pIktgMUqPapq4OEQPZ'
axios.default.defaults.headers.common['X-API-KEY'] = apikey

let temp = '';
const parser = port.pipe(new ByteLengthParser({ length: 21 }))

const send = async (hex) => {
  await axios.post(baseUrl + '/senjata/status', { rfid: hex })
    .then(() => {
      console.log('✅' + chalk.green('SUKSES') + ': Data RFID Terkirim')
    })
    .catch((error) => {
      if (error.response) {
        if (error.response.status === 404) {
          console.log('❌' + chalk.red('ERROR') + ': RFID Senjata Belum Terdaftar')
        }
      }
    }
    )
}

const clear = () => {
  console.clear();
  console.log(chalk.green(figlet.textSync('RFID Server', config)))
  console.log(chalk.bold.yellow(`                 ${baseUrl}`))
  console.log(chalk.yellow(`              COM Port: ${chalk.green(comPort)} | Scanner: `, chalk.green('READY')));
  console.log('==========================================================')
  console.log('')
}

clear()
parser.on('data', async (buff) => {
  let hex = buff.toString('hex')
  hex = hex.slice(12, 36)
  if (temp != hex) {
    console.log('🔍' + chalk.cyan('SCAN: ') + hex)
    await send(hex)
    temp = hex;
  }
})


