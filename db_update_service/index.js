const fetch = require('node-fetch');
const url = 'http://backend:5000/api/update_tracks'

const msToWaitBeforeUpdate = 300000;

requestUpdate();

setInterval(requestUpdate, msToWaitBeforeUpdate);

async function requestUpdate() {
  while (true) {
    try {
      console.log("sent get")
      var r = await timeout(3000, fetch(url));
      var json = await r.json();
      break;
      console.log(json);    
    } 
    catch (error) {
      console.log(error);
      console.log("error in GET request, try again in a bit");
      if (error == "timeout") {
        console.log("timeout bitch");
        // await new Promise(r => setTimeout(r, 3000));
        // continue
      }
    }

    finally {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
    
}

function timeout(ms, promise) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        reject(new Error("timeout"))
      }, ms)
      promise.then(resolve, reject)
    })
}