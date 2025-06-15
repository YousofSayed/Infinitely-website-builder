const hmrBroadcastChannel = new BroadcastChannel("preview");
hmrBroadcastChannel.addEventListener("message", async (ev) => {
  const currentUrl = location.href;
  const { command, props } = ev.data;
  console.log("yes i eval me from broadcas", props, command, currentUrl);
  const { url } = props;
  if (!url) return;
  const parsedURL = new URL(url, window.origin);
  if (currentUrl.toLowerCase() == parsedURL.href?.toLowerCase?.()) {
    console.log("yes i equal me from broadcast", url, currentUrl);
    location.reload();
    // window = window
    // const response = await (await fetch(parsedURL.href)).text();
    // const iframe = document.createElement('iframe');
    // iframe.src = parsedURL.href;
    // iframe.addEventListener('load',()=>{
    //   console.log('load ended');
      
    //   document.documentElement.replaceWith(iframe.contentDocument.documentElement);
    //   iframe.remove()
    // });
    // iframe.hidden = true;
    // document.body.appendChild(iframe);

    // window.location = window.location
    // window.top.location = window.top.location
    // window.top.location = (window.top.location.hostname + window.top.location.pathname)
    // const newDocument = new DOMParser().parseFromString(response, "text/html");
    // const scripts = newDocument.querySelectorAll("script");
    // scripts.forEach((oldScript) => {
    //   const newScript = document.createElement("script");
    //   if (oldScript.src) {
    //     newScript.src = oldScript.src; // External scripts
    //     newScript.async = false; // Ensure synchronous execution
    //   } else {
    //     newScript.textContent = oldScript.textContent; // Inline scripts
    //   }
    //   // Append to target or body to execute
    //   document.body.appendChild(newScript);
    // });
    // document.body.innerHTML = newDocument.body.innerHTML;
    // document.documentElement.replaceWith(newDocument.documentElement);
    // // document.documentElement.remove();
    // console.log('Replace Document done 👍');

    // Optionally, re-run scripts if needed
    //   const scripts = document.getElementsByTagName('script');
    //   for (let script of scripts) {
    //     if (script.src) {
    //       const newScript = document.createElement('script');
    //       newScript.src = script.src;
    //       document.body.appendChild(newScript);
    //     } else {
    //       // Be cautious with eval due to security risks
    //       eval(script.innerText);
    //     }
    //   }
  }
});
