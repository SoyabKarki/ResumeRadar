export const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
};
  

export const getJobDescriptionFromPage = () => {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: "GET_JOB_DESCRIPTION" },
          (response) => {
            if (chrome.runtime.lastError) {
              resolve(null);
            } else {
              resolve(response?.jobText || null);
            }
          }
        );
      });
    });
};
  

export const buildTags = (data) => {
    const mk = (arr, type, status) => 
      arr.map((tag) => ({
        text: tag, type, status
      }));
  
    const tags = [
      ...mk(data.matched_required, 'required', 'matched'),
      ...mk(data.missing_required, 'required', 'missing'),
      ...mk(data.matched_preferred, 'preferred', 'matched'),
      ...mk(data.missing_preferred, 'preferred', 'missing'),
    ];
    
    return { ...data, tags };
};