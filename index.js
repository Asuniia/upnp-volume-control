var MediaRendererClient = require("upnp-mediarenderer-client");
var Client = require("node-ssdp").Client;
var ssdp_client = new Client();
require("dotenv").config();

let devices = [];
var volumes_level = process.env.VOLUME; // 0-100% Set the volume level here
var interval = process.env.INTERVAL; // Set the interval here (in ms) to check for new devices and set the volume on all devices
var enable_logging = process.env.ENABLE_LOGGING; // Set to false to disable logging

console.log("Searching for MediaRenderer devices on the network...");

ssdp_client.on("response", function (headers) {
    devices.push(headers);
});

ssdp_client.search("urn:schemas-upnp-org:device:MediaRenderer:1");

console.log("Press Ctrl+C to stop.");

function start() {
    setTimeout(async function () {
        if (enable_logging) console.log("Found " + devices.length + " device(s) on the network.");

        devices.forEach((device) => {
            if (enable_logging) console.log("Connecting to %s", device.LOCATION);
            var client = new MediaRendererClient(device.LOCATION);

            client.getVolume(function (err, volume) {
                if (err) throw err;
                if (enable_logging) console.log("Current volume is %d%", volume);
            });

            client.setVolume(volumes_level, function (err) {
                if (err) throw err;
                if (enable_logging) console.log("Volume set at %d%", volumes_level);
            });
        });

        start();
    }, interval);
}

start();
