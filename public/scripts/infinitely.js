
async function doAsync(callback = async ()=>{}) {
  try {
    await callback();
  } catch (error) {
    console.error("Error in doAsync:", error);
  }
}


  
  
  
