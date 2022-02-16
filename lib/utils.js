function getIPAddress(){
  const interfaces = require('os').networkInterfaces();
  for(const devName in interfaces){
    const items = interfaces[devName];
    for(let i=0;i<items.length;i++){
      const alias = items[i];
      if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
        return alias.address;
      }
    }
  }
}

module.exports = {getIPAddress};
