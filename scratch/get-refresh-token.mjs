import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("\n=======================================================");
  console.log("   🔑 GOOGLE OAUTH 2.0 REFRESH TOKEN GENERATOR");
  console.log("=======================================================\n");

  console.log("Before starting, ensure you have configured your OAuth Client in Google Cloud Console:");
  console.log("1. Go to Google Cloud Console > APIs & Services > Credentials.");
  console.log("2. Click 'Create Credentials' > 'OAuth client ID'. Select 'Web application'.");
  console.log("3. Under 'Authorized redirect URIs', add this exact URL:");
  console.log("   👉 https://developers.google.com/oauthplayground");
  console.log("4. Click Create and keep the Client ID and Client Secret ready!\n");

  const clientId = (await askQuestion("Step 1: Enter your Client ID: ")).trim();
  const clientSecret = (await askQuestion("Step 2: Enter your Client Secret: ")).trim();

  if (!clientId || !clientSecret) {
    console.error("Error: Client ID and Client Secret are required!");
    rl.close();
    return;
  }

  // Generate the auth url
  const redirectUri = "https://developers.google.com/oauthplayground";
  const scope = "https://www.googleapis.com/auth/drive";
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

  console.log("\n-------------------------------------------------------");
  console.log("Step 3: Open the following URL in your web browser:\n");
  console.log(authUrl);
  console.log("\n-------------------------------------------------------");
  console.log("Instructions:");
  console.log("1. Log in with your personal Google (@gmail.com) account.");
  console.log("2. Click 'Continue' or 'Advanced > Go to project' (if unverified warning shows).");
  console.log("3. Grant permissions to view and manage your Google Drive files.");
  console.log("4. Once authorized, it will redirect you to Google OAuth Playground.");
  console.log("5. Look at the address bar of your browser! It will look like:");
  console.log("   https://developers.google.com/oauthplayground/?code=4/0AdQt8...&scope=...");
  console.log("6. Copy the entire 'code' parameter (everything between '?code=' and '&scope=').\n");

  const code = (await askQuestion("Step 4: Paste the authorization code here: ")).trim();

  if (!code) {
    console.error("Error: Authorization code is required!");
    rl.close();
    return;
  }

  console.log("\nExchanging authorization code for refresh token...");

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }

    console.log("\n🎉 SUCCESS! Here is your Refresh Token:\n");
    console.log("-------------------------------------------------------");
    console.log(`GOOGLE_REFRESH_TOKEN="${data.refresh_token}"`);
    console.log("-------------------------------------------------------\n");
    console.log("Now add these to your local .env.local file:\n");
    console.log(`GOOGLE_CLIENT_ID="${clientId}"`);
    console.log(`GOOGLE_CLIENT_SECRET="${clientSecret}"`);
    console.log(`GOOGLE_REFRESH_TOKEN="${data.refresh_token}"`);
    console.log("\n=======================================================\n");

  } catch (error) {
    console.error("\n❌ Failed to exchange code for token:");
    console.error(error.message);
  } finally {
    rl.close();
  }
}

main();
