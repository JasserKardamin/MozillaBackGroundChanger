document.addEventListener("DOMContentLoaded",()=>{

    const reloadButton = document.getElementById('relaod-mozilla') ; 
    const bnackgroundContainer = document.getElementById('backgrounds-container') ; 
    const message = document.getElementById('message');

    let imageName  ; 

    bnackgroundContainer.addEventListener("click", async (event)=>{
         imageName = event.target.alt;
         reloadButton.classList.remove("reload-button");
         reloadButton.classList.add("active-reload-button");
         
    })

    reloadButton.addEventListener("click",async (event)=>{
        message.classList.remove("vanish"); 
        message.classList.add("appear");
        if(imageName){
            const workingDirs = await window.electron.getFirefoxProfile();
            const mozillaWorkingDir = workingDirs[0] ; 
            const mozillaDevmodWorkingDir = workingDirs[1];
            
            if(mozillaDevmodWorkingDir) {
                await window.electron.mozillaConfigChange(mozillaDevmodWorkingDir);
                const changed =  await window.electron.changeBackground(imageName,mozillaDevmodWorkingDir);
                if(changed) {
                    message.textContent = "Background changed ✔️ " ; 
                    message.style.color = "#23dc3d" ; 
                    setTimeout(() => {message.classList.add("vanish"); }, 4000);
                }else{
                    message.textContent = "Something went wrong ❌ " ; 
                    message.style.color = "#E61616" ;
                    setTimeout(() => {message.classList.add("vanish"); }, 4000);
                }
            }
            if(mozillaWorkingDir) {
                await window.electron.mozillaConfigChange(mozillaWorkingDir);
                const changed = await window.electron.changeBackground(imageName,mozillaWorkingDir);
                if(changed) {
                    message.textContent = "Background changed ✔️ " ; 
                    message.style.color = "#23dc3d" ; 
                    setTimeout(() => {message.classList.add("vanish"); }, 4000);
                }else{
                    message.textContent = "Something went wrong ❌ " ; 
                    message.style.color = "#E61616" ;
                    setTimeout(() => {message.classList.add("vanish"); }, 4000);

                }
            }
        }
    })


})