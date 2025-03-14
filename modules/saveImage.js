document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("ConfirmButton").addEventListener("click", async () => {
      const fileInput = document.getElementById("background-to-add");
      const file = fileInput.files[0];
  
      if (file) {
        const reader = new FileReader();

        reader.onload = async () => {
            const fileData = reader.result;

            const workingDirs = await window.electron.getFirefoxProfile();
            const Mozilladistination = workingDirs[0];
            const DevMozillaDestination = workingDirs[1];
        
            

            const generatedName = await window.electron.photoFingerprint(fileData);
            const fileExtension = file.name.split('.').pop();

            let fileName = generatedName +'.'+ fileExtension

            if(Mozilladistination) {
            await window.electron.saveBackground(fileName, fileData, Mozilladistination);
            }
            if(DevMozillaDestination) {
              await window.electron.saveBackground(fileName, fileData, DevMozillaDestination);
            }
    
        };
  
        reader.readAsArrayBuffer(file);
      } else {
        console.log("No file selected.");
      }
    });
  });
  