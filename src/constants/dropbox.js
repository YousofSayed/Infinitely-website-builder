export const dropbox_client_id = "ii7jhayl4qz7feg";
const redirectUri = window.location.href ;
console.log('redirect: ' , redirectUri);

export const authUrl = `https://www.dropbox.com/oauth2/authorize?response_type=token&token_access_type=offline&client_id=${dropbox_client_id}&redirect_uri=${redirectUri}`;
 
// redirect user to Dropbox login:
// const authWindow = window.open(authUrl)

// Then extract the access_token from URL hash on redirect back

