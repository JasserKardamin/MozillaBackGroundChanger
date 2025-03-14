import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import crypto from 'crypto';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import fs from 'fs' ; 



const __dirname = path.dirname(fileURLToPath(import.meta.url)); 

function createWindow() {
  const win = new BrowserWindow({
    width: 1500,
    height: 850,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'image', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname,'modules','preload.js'),
      contextIsolation: true, 
      enableRemoteModule: false,
      nodeIntegration: false,  
      //devTools: true,
    },

  });

  win.loadFile('index.html'); 
  
  //win.webContents.openDevTools();

}
 
//save the background : 
ipcMain.handle('change-background', (event , imageName ,directory) => {

  const content = `@-moz-document url("about:newtab"), url("about:home"), url(about:privatebrowsing) {
	/* Sets background image and autoscale image to browser window. */
	body{
		background-image: url("img/${imageName}") !important;
		background-size: cover !important;
		background-repeat: no-repeat !important;
		background-attachment: fixed !important;
		background-position-x: center !important;
		background-position-y: bottom !important;
	}
	`;

let stylePath = path.join(directory, "userContent.css");
    if(fs.existsSync(stylePath)) { 
        fs.writeFileSync(stylePath, content, { flag: 'w' });
        return true ;
    }
    return false ;
});


//handle images
ipcMain.handle('get-images', (event , directory) => {
  const images = [];
  try {
    const files = fs.readdirSync(directory);
    files.forEach(file => {
      if (file.match(/\.(jpg|jpeg|png|gif)$/)) {  
        images.push(path.join(directory, file));
      }
    });
  } catch (error) {
    console.error('Error reading directory:', error);
  }
  return images;
});

//adding Photo in the working dir ("imagedir")

ipcMain.handle('save-background',async (event, fileName, fileData , distination ) => {

  try {
    if (!fileName || !fileData || !distination) {
      throw new Error("Missing file name, data, or destination.");
    }

    const destinationPath = path.join(distination, 'img', fileName);

    const destinationDir = path.join(distination, 'img');
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    fs.writeFileSync(destinationPath, Buffer.from(fileData));  
    event.sender.send('reload-backgrounds'); 

    console.log(`Background saved to: ${destinationPath}`);
    return 'Background saved successfully!';
  } catch (error) {
    console.error("Error saving background:", error);
    return `Error saving background: ${error.message}`;
  }
});

//making a photo findgerprint : 

ipcMain.handle('photo-fingerprint',async (event, fileData ) => {
  const buffer = Buffer.from(fileData);
  const fingerPrint = crypto.createHash('sha256').update(buffer).digest('hex');
  return fingerPrint;
});


//get profile
ipcMain.handle('get-firefox-profile', () => {
  const homeDirectory  = homedir();
  const firefoxProfilesPath = path.join(homeDirectory , 'AppData', 'Roaming', 'Mozilla', 'Firefox', 'Profiles');
  
  if (!fs.existsSync(firefoxProfilesPath)) {
    console.log("Firefox not installed.");
    return null;
  }

  const profiles = fs.readdirSync(firefoxProfilesPath);
  
  let Devmozilla  ;
  let Defaultmozilla;
  
  for (const profile of profiles) {
    const chromeFolderPath = path.join(firefoxProfilesPath, profile, 'chrome');
    
    if (profile.includes("default-release")) {
      Defaultmozilla = chromeFolderPath
      CreateWorkingDir(Defaultmozilla) ;
    }
    if(profile.includes("dev-edition-default")) {
      Devmozilla = chromeFolderPath ;
      CreateWorkingDir(Devmozilla)
    }
  }

  
  
  return [Defaultmozilla , Devmozilla ]; 
});

function CreateWorkingDir(profilePath) {
  const content = `@-moz-document url("about:newtab"), url("about:home"), url(about:privatebrowsing) {
	/* Sets background image and autoscale image to browser window. */
	body{
		background-image: url("") !important;
		background-size: cover !important;
		background-repeat: no-repeat !important;
		background-attachment: fixed !important;
		background-position-x: center !important;
		background-position-y: bottom !important;
	}`;
    try {
        fs.mkdirSync(profilePath, { recursive: true });
        
        let imgPath = path.join(profilePath, "img");
        if(!fs.existsSync(imgPath)) { 
            fs.mkdirSync(imgPath);
            console.log('image folder created ! ');
            
        }
        let stylePath = path.join(profilePath, "userContent.css");
        if(!fs.existsSync(stylePath)) { 
            fs.writeFileSync(stylePath, content, { flag: 'w' });
            console.log('style file created ! ');
        }
    } catch (err) {
        console.error("Error creating directory or file:", err);
    }
}



// Update or Add a Preference
async function updateAboutConfig(profilePath) {
    
  if (!profilePath) throw new Error("Firefox profile not found!");

  const parentProfilePath = path.dirname(profilePath);
  const prefsPath = path.join(parentProfilePath, 'prefs.js');

  console.log(prefsPath);
  
  
  if (fs.existsSync(prefsPath)) {
    
    const content = fs.readFileSync(prefsPath, 'utf8');
    const newPref = 'user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);';
  
    if (!content.includes(newPref)) {
      fs.appendFileSync(prefsPath, `${newPref}\n`);
      console.log("Preference added.");
    } 
  }

}


// Electron IPC Handler to Change about:config
ipcMain.handle('change-about-config', (event, profilePath) => {
  try {
    updateAboutConfig(profilePath);
    return true;
  } catch (error) {
    console.error('Error updating preference:', error);
    return false;
  }
});


/*
// Restart Firefox (Windows)
ipcMain.handle('restart-firefox', () => {
  exec('taskkill /F /IM firefox.exe', (error) => {
    if (error) {
      console.error('Error closing Firefox:', error);
      return;
    }
    console.log('Firefox closed. Restarting...');
    exec('start firefox');
  });
});
*/

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
