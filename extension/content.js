console.log('[ResumeRadar] content.js loaded on', location.href);

function grabNow() {
  const container =
    document.querySelector('.show-more-less-html__markup') ||
    document.getElementById('job-details');

  if (!container) return '';

  // Prefer spans, otherwise take whole innerText
  const spans = container.querySelectorAll('span');
  return spans.length
    ? Array.from(spans).map(s => s.textContent.trim()).filter(Boolean).join('\n')
    : container.innerText.trim();
}

function waitForJobText(timeoutMs = 6000) {
  return new Promise((resolve) => {
    const firstTry = grabNow();
    if (firstTry) return resolve(firstTry);

    const observer = new MutationObserver(() => {
      const txt = grabNow();
      if (txt) {
        observer.disconnect();
        resolve(txt);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(''); // fallback
    }, timeoutMs);
  });
}

async function getLinkedInJobDescription() {
  const jobTitleEl = document.querySelector("h1") || document.querySelector("h1 a");
  const jobTitle = jobTitleEl ? jobTitleEl.textContent.trim() : "Untitled Job";
  const jobText = await waitForJobText();
  return { jobTitle, jobText };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[ResumeRadar] got message', request);
  
  if (request.type === "GET_JOB_DESCRIPTION") {
    getLinkedInJobDescription().then((data) => {
        console.log('[ResumeRadar] sending back', data);
        sendResponse(data);
    });
    return true;
  }
});
