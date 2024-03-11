/* global require __dirname console */

const portfinder = require("portfinder");

const fs = require("fs");
const path = require("path");

function updatefile(filePath, newString) {
  return new Promise((resolve, reject) => {
    const fullFilePath = path.join(__dirname, filePath);
    fs.readFile(fullFilePath, "utf8", (err, data) => {
      if (err) {
        reject(`Error reading file from disk: ${err}`);
      } else {
        const regex = new RegExp("3000", "g");
        const newData = data.replace(regex, newString);

        fs.writeFile(fullFilePath, newData, "utf8", (err) => {
          if (err) {
            reject(`Error writing file to disk: ${err}`);
          } else {
            resolve(fullFilePath);
          }
        });
      }
    });
  });
}

const getPortPromise = new Promise((resolve, reject) => {
  portfinder.getPort({ port: 3000 }, async (err, port) => {
    if (err) {
      reject(err);
    } else {
      console.log(`Available port is: ${port}`);
      updatefile("../../package.json", `${port}`).then(() => {});
      updatefile("../../manifest.xml", `${port}`).then(() => {});
      updatefile("../../webpack.config.js", `${port}`).then(() => {});
      updatefile("../../.vscode/launch.json", `${port}`).then(() => {});
      delete require.cache[require.resolve("../../package.json")];

      resolve(port);
    }
  });
});

getPortPromise
  .then((port) => {
    console.log(`Port ${port} is available.`);
  })
  .catch((err) => {
    console.error(err);
  });
