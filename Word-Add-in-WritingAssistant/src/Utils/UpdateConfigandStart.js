/* global require */
/* global __dirname console */

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
        const regex = new RegExp(process.env.npm_package_config_dev_server_port, "g");
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
  portfinder.getPort({ port: process.env.npm_package_config_dev_server_port }, async (err, port) => {
    if (err) {
      reject(err);
    } else {
      console.log(`Available port is: ${port}`);
      Promise.all([
        updatefile("../../package.json", `${port}`),
        updatefile("../../manifest.xml", `${port}`),
        updatefile("../../webpack.config.js", `${port}`),
        updatefile("../../.vscode/launch.json", `${port}`),
      ])
        .then(() => {
          delete require.cache[require.resolve("../../package.json")];
          let packageJson = require("../../package.json");
          console.log(`Port in package.json is: ${packageJson.config.dev_server_port}`);
          resolve(port);
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    }
  });
});

// updateConfigAndStart.js
const { exec } = require("child_process");

// Your function to update the config...
function updateConfig() {
  return new Promise((resolve, reject) => {
    getPortPromise
      .then((port) => {
        console.log(`Port ${port} is available.`);
        resolve();
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}

// Update the config and then start the desktop
updateConfig()
  .then(() => {
    // Require the package.json
    // Delete the cached module
    delete require.cache[require.resolve("../../package.json")];
    let packageJson = require("../../package.json");
    console.log(`xxxPort in package.json is: ${packageJson.config.dev_server_port}`);
    exec(
      `office-addin-debugging start manifest.xml desktop --app word`,
      { env: { ...process.env, npm_package_config_dev_server_port: packageJson.config.dev_server_port } },
      (err, stdout) => {
        if (err) {
          console.error(err);
        } else {
          console.log(stdout);
        }
      }
    );
  })
  .catch((err) => {
    console.error(err);
  });
