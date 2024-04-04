// initpassport.js

const path = require("path");
const credentialsPath = path.join(__dirname, "../credentials.json");

let credentials;
try {
  // Attempt to require the credentials.json file
  credentials = require(credentialsPath);
} catch (error) {
  // Handle the error if the file is not found
  if (error.code === "MODULE_NOT_FOUND") {
    console.error(`Error: Cannot find module '${credentialsPath}'`);
    console.error(
      `Make sure the 'credentials.json' file exists at the path: '${credentialsPath}'`
    );
    console.error(
      `Please check if the file path is correct and the file exists.`
    );
    // You may choose to exit the application gracefully or handle the error differently based on your requirements.
    process.exit(1); // Exit with a non-zero status code to indicate an error
  } else {
    // For any other errors, re-throw the error
    throw error;
  }
}

// Use the 'credentials' object in your application
// ...

// Rest of your initpassport.js code
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth2");

module.exports = initPassport;

function initPassport() {
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((obj, cb) => cb(null, obj));

  const callback = (accessToken, refreshToken, profile, cb) => {
    cb(null, { profile, accessToken, refreshToken });
  };

  const GoogleCredentials = Credentials.Google.installed;
 
  passport.use(
    new GoogleStrategy(
      {
        clientID: GoogleCredentials.client_id,
        clientSecret: GoogleCredentials.client_secret,
        callbackURL: "http://localhost:4000/auth/google/callback",
      },
      callback
    )
  );
}
