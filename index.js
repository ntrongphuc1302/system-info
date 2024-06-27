const express = require("express");
const os = require("os");
const path = require("path");
const requestIp = require("request-ip");
const axios = require("axios");
const app = express();

// Middleware to capture IP address
app.use(requestIp.mw());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Endpoint to get local IP addresses and public IP
app.get("/api/local-ip", async (req, res) => {
  try {
    const localIpAddresses = getLocalIPv4Addresses();
    const publicIpAddress = await getPublicIpAddress();

    const deviceInfo = {
      publicIpAddress,
      localIpAddresses,
      hostname: os.hostname(),
    };

    // Logging to terminal
    console.log("IP and Device Information:");
    console.log(`Public IP Address: ${deviceInfo.publicIpAddress}`);
    console.log(
      `Local IP Addresses: ${deviceInfo.localIpAddresses.join(", ")}`
    );
    console.log(`Hostname: ${deviceInfo.hostname}`);

    res.json(deviceInfo);
  } catch (error) {
    console.error("Error in /api/local-ip endpoint:", error.message);
    res.status(500).json({ error: "Failed to retrieve IP information" });
  }
});

// Function to get local IPv4 addresses
function getLocalIPv4Addresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const iface in interfaces) {
    for (const ifaceDetails of interfaces[iface]) {
      if (ifaceDetails.family === "IPv4" && !ifaceDetails.internal) {
        addresses.push(ifaceDetails.address);
      }
    }
  }
  return addresses;
}

// Function to get public IP address using an external API
async function getPublicIpAddress() {
  try {
    const response = await axios.get("https://api64.ipify.org?format=json");
    return response.data.ip;
  } catch (error) {
    console.error("Error fetching public IP address:", error.message);
    return "Unknown"; // Fallback value
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
