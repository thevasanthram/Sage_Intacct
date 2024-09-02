const SFTPClient = require("ssh2-sftp-client");
const path = require("path");
const fs = require("fs");

const sftp = new SFTPClient();
const localFilePath = "./output.csv"; // Update this to the path of your local CSV file
const remoteFilePath = "/uploads/output.csv"; // Update this to the remote directory and file name

const sftpConfig = {
  host: "20.84.100.199",
  port: 22, // Default SFTP port
  username: "sftp_user",
  password: "sftpuser@123", // or use privateKey for key-based authentication
};

async function uploadFile() {
  try {
    await sftp.connect(sftpConfig);

    // Check if the local file exists
    if (!fs.existsSync(localFilePath)) {
      console.error("Local file does not exist:", localFilePath);
      return;
    }

    // Upload the file
    await sftp.put(localFilePath, remoteFilePath);
    console.log("File uploaded successfully");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    sftp.end();
  }
}

uploadFile();
