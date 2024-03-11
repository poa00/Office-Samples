/* global require __dirname console */

const portfinder = require("portfinder");

function updatefile(filePath, newString) {
  const fs = require("fs");
  const path = require("path");
  const oldString = "3000";

  const fullFilePath = path.join(__dirname, filePath);
  fs.readFile(fullFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file from disk: ${err}`);
    } else {
      const regex = new RegExp(oldString, "g");
      const newData = data.replace(regex, newString);

      fs.writeFile(fullFilePath, newData, "utf8", (err) => {
        if (err) {
          console.error(`Error writing file to disk: ${err}`);
        }
      });
    }
  });
}

const getPortPromise = new Promise((resolve, reject) => {
  portfinder.getPort({ port: 3000 }, (err, port) => {
    if (err) {
      reject(err);
    } else {
      console.log(`Available port is: ${port}`);
      updatefile("../../manifest.xml", `${port}`);
      updatefile("../../package.json", `${port}`);
      updatefile("../../webpack.config.js", `${port}`);
      updatefile("../../.vscode/launch.json", `${port}`);
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
