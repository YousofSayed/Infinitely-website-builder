 const electronUpdater = require('./utils/updater.cjs');
 
 const api = {
  isDesktop: true,
  electronUpdater ,
  helloDesktop(name) {
    return `Hello ${name}`;
  },
  
};

module.exports = { api };

