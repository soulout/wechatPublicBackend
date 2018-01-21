const express = require('express');
const wechat = require('wechat');
const axios = require('axios');

async function getToken(appID, appSecret) {
  let token = null;
  try {
    const response = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appSecret}`)
    token = response.data.access_token;
  } catch (err) {
    console.error('get tocken error', err)
  }
  return token
}

async function getMaterials(token) {
  try {
    const response = await axios.post(`https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=${token}`, {
      "type":"image",
      "offset":0,
      "count":10
    });
    return response.data;
  } catch (err) {
    console.error('get tocken error', err)
  }
}


async function process() {
  const APPID = 'wx78e38471ec15a2cc';
  const APPSECRET = '****';
  const token = await getToken(APPID, APPSECRET);
  const metials = await getMaterials(token);
  autoRefreshTocken = (appId, appSecret, token) => async () => {
    token = await getToken(appId, appSecret, token);
    console.log(token);
  };
  const a = autoRefreshTocken(APPID, APPSECRET, token);
  setInterval(a, 1000 * 60 * 90);
  const app = express();
  app.use(express.query());

  app.get('/', (req, res) => res.send('Hello New World!'));

  const config = {
    token: 'abc',
    appid: 'wxd7168959b4bb1f58',
    encodingAESKey: 'lKhv47m5a9LosswGXwZug3ConqKwadPikt7JPHuKNkR',
    checkSignature: true
  };

  app.use('/wechat', wechat(config, function (req, res, next) {
    metials
    res.reply({
      type: "image",
      content: {
        mediaId: metials.item[0].media_id
      }
    });
  }));

  app.listen(3000, () => console.log('Example app listening on port 3000!'));
}

async function runJob() {
  try {
    await process();
  } catch (e) {
    console.log(e.message);
  }
}

runJob();