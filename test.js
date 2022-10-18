const fs = require('fs').promises;
    const file = fs.readFile('data.txt', { encoding: 'utf8' });
        .then{
            console.log('Text')
        }