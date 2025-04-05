const proccess = require('child_process');
 const uri = `http://localhost:5173`
proccess.exec(`open ${uri}`);
console.log('done');

