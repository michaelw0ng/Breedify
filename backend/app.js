const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');

const cors = require('http-cors');

const { client_id, client_secret } = require("./credentials.json");

// process.env.PORT is used for Heroku port matching
const port = process.env.PORT || 8080;
const server = http.createServer(function (request, response) {
   // Cors library may or may not be necessary
   // Cors library is used for bypassing CORS blocks
   if (cors(request, response)) return;
});

let dog_search_term = ""; // Used to grab random dog breed 

let video_ids = []; // Used to grab video id from YouTube API

let synch = false; // Synch variables ssed to linearly progress through url links
let synch_1 = false;

console.log(client_id)

server.on("listening", function () {
   console.log("Now listening on a server");
});

// HTTP server event listener that handles HTTP requests
server.on("request", function (req, res) {
   console.log(req.url);
   if (req.url === "/" || req.url === "/breedify.herokuapp.com") {
      synch = true;
      synch_1 = true;
      if (req.method === "POST") {
         // When frontend sends a POST request, begin sending API request to Dog.ceo for a random dog breed
         get_dog_contents(res);
      }
   }
   else if (req.url.startsWith("/receive_code") || req.url.startsWith("/breedify.herokuapp.com/receive_code") && synch && synch_1) {
      // Used to parse authorization code from Google authentication to get access token
      const { code } = url.parse(req.url, true).query
      console.log("Youtube Auth Code has been received");
      console.log();

      // Returns to frontend page
      res.writeHead(302, {
         'Location': `https://michaelw0ng.github.io/Breedify`
      });
      res.end();

      send_access_token_request(code, res);
   }
   else {
      // 404 Not Found isn't used in the actual backend

      // res.writeHead(404, {"Content-Type": "text/html"});
      // res.write(`<h1>404 Page Not Found</h1>`);
      // res.end();
   }
});

function get_dog_contents(res) {
   // GET request to Dog.ceo API to get dog breeds
   const dog_endpoint = "https://dog.ceo/api/breeds/list/all";
   https.request(`${dog_endpoint}`, { method: "GET" }, process_stream).end();
   function process_stream(dog_stream) {
      let dog_data = "";
      dog_stream.on("data", chunk => dog_data += chunk);
      dog_stream.on("end", () => serve_results(dog_data, res));
   }
}

function serve_results(dog_data, res) {
   let dog = JSON.parse(dog_data);
   let random_breed = Object.keys(dog.message);
   // Selects a random dog breed from data received by Dog.ceo API
   dog_search_term = random_breed[Math.floor(Math.random() * random_breed.length + 1)] + " dog";
   console.log();
   console.log("Dog API has been called");
   console.log();
   console.log("Dog breed randomly selected: " + dog_search_term);
   console.log();

   // If authentication for access token has occured before, you won't have to authenticate until after token expires. 
   // Otherwise, you would have to authenticate with Google first.
   if (fs.existsSync('./cached_access_token_info') && fs.existsSync('./time_token_generated') && fs.existsSync('./token_expires_in')) {
      const time_token_generated = fs.readFileSync('time_token_generated').toString();
      const token_expires_in = fs.readFileSync('token_expires_in').toString();
      const cached_access_token_info = fs.readFileSync('./cached_access_token_info').toString()

      if (Date.now() < parseInt(time_token_generated, 10) + parseInt(token_expires_in) * 1000) {
         send_search_request(cached_access_token_info, res);
      }
      else {
         redirect_request_to_youtube_auth(res);
      }
   }
   else {
      redirect_request_to_youtube_auth(res);
   }
}

function redirect_request_to_youtube_auth(res) {
   // Google authorization endpoint 
   // Sends Google authorization link to login to frontend to visit
   // Requires client id, redirect uri, and other parameters
   // Required query parameters for all endpoints are given on Google API documentation
   const auth_endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
   const info = `&response_type=code&redirect_uri=https://breedify.herokuapp.com/receive_code&client_id=${client_id}&scope=https://www.googleapis.com/auth/youtube`;
   res.write(`${auth_endpoint}?${info}`);
   res.end();
   console.log("Redirect request has been called");
   console.log();
}

function send_access_token_request(code, res) {
   // Sends POST request to Google to get access token
   // Requires client id, client secret, redirect uri, and other POST data
   // Required data for all endpoints are given on Google API documentation
   const token_endpoint = "https://oauth2.googleapis.com/token";
   const redirect_uri = `https://breedify.herokuapp.com/receive_code`;
   const grant_type = "authorization_code";
   const post_data = querystring.stringify({ client_id, client_secret, code, redirect_uri, grant_type });
   let options = {
      method: "POST",
      headers: {
         "Content-Type": "application/x-www-form-urlencoded"
      }
   }
   https.request(token_endpoint, options, (token_stream) => process_stream(token_stream, receive_access_token, res)).end(post_data);
   function process_stream(stream, callback, ...args) {
      let body = "";
      stream.on("data", chunk => body += chunk);
      stream.on("end", () => callback(body, res));
   }
}

function receive_access_token(body, res) {
   const { access_token, expires_in } = JSON.parse(body);
   // Creates files to store access token information for bypassing authorization process if already done and not expired
   fs.writeFile('./cached_access_token_info', access_token.toString(), () => { });
   fs.writeFile('./token_expires_in', expires_in.toString(), () => { });
   fs.writeFile('./time_token_generated', Date.now().toString(), () => { });

   console.log("Youtube Access Token has been received");
   console.log();
   send_search_request(access_token, res);
}

function send_search_request(access_token, res) {
   // GET request to get video data from YouTube API
   // Requires search term, access token, and other query parameters
   // Required query parameters for all endpoints are given on Google API documentation
   const search_endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${dog_search_term}&max-results=1&chart=mostPopular&type=video&access_token=${access_token}`;
   let options = {
      method: "GET",
      headers: {
         "Content-Type": "application/json"
      }
   }
   https.request(search_endpoint, options, (search_stream) => process_stream(search_stream, receive_search_response, res)).end();
   function process_stream(stream, callback, ...args) {
      let body = "";
      stream.on("data", chunk => body += chunk);
      stream.on("end", () => callback(body, res));
   }
}

function receive_search_response(body, res) {
   const videos = JSON.parse(body);
   console.log("Youtube API has been called");
   console.log();
   for (let i = 0; i < videos?.items?.length; i++) {
      if (i == 0) {
         console.log("Youtube related video titles:");
      }
      console.log(videos?.items[i]?.snippet?.title);
      // Adds video id from YouTube API to array
      video_ids.push(videos?.items[i]?.id?.videoId);
   }
   // Sends video id from YouTube API to frontend for display in embed video
   res.write(`${video_ids[0]}`);
   res.end();
   video_ids = [];
}

server.listen(port);