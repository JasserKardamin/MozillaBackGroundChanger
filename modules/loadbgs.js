
// loadbgs.js
document.addEventListener("DOMContentLoaded", async () => {
 
//load backgrounds ! 
loadBackgrounds() ;


//for loading :
window.electron.on('reload-backgrounds', async () => {
    console.log('Backgrounds updated, reloading...');
    await loadBackgrounds();  
  });
});


const loadBackgrounds = async ()=>{

    const workingDirs = await window.electron.getFirefoxProfile();
    let profilePath = workingDirs[0] ;
    if(!profilePath) {
      profilePath = workingDirs[1] ;
    }

    const backgroundDir = profilePath + '\\img';
    const backGroundContainer = document.getElementById("backgrounds-container");
    backGroundContainer.innerHTML = '';
    // Get images from the main process via IPC
    const images = await window.electron.getImages(backgroundDir);
   
  
    images.forEach((src) => {
      
      const imgElement = document.createElement("img");
      const fileName = src.split('\\').pop().split('/').pop();

      imgElement.src = src; 
      imgElement.alt = fileName; 
  
      const photoItem = document.createElement("div");
      photoItem.classList.add("photo-item");
      photoItem.appendChild(imgElement);
  
      backGroundContainer.appendChild(photoItem);
    });

    //select logic : 
    const photoItems = document.querySelectorAll(".photo-item");

    photoItems.forEach(item => {
    item.addEventListener("click", () => {
        photoItems.forEach(photo => photo.classList.remove("selected"));
        item.classList.add("selected");
        });
    });
  
  } 



