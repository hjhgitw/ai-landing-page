const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const indexFile = path.join(publicDir, 'index.html');

fs.readdir(publicDir, (err, files) => {
    if (err) throw err;

    const fileList = files
        .filter(file => file !== 'index.html')
        .map(file => `<li><a href="${file}">${file}</a></li>`)
        .join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Directory Listing</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            ul { list-style-type: none; }
            li { margin: 5px 0; }
        </style>
    </head>
    <body>
        <h1>Directory Listing</h1>
        <ul>
            ${fileList}
        </ul>
    </body>
    </html>
    `;

    fs.writeFile(indexFile, htmlContent, err => {
        if (err) throw err;
        console.log('Index file created successfully.');
    });
});