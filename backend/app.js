const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');

const cors = require('http-cors');

const {client_id, client_secret} = require("./credentials.json");

const port = process.env.PORT || 8080;
const server = http.createServer( function(request, response) {
  if (cors(request, response)) return; 
});

let dog_search_term = "";

let video_ids = [];

let synch = false;
let synch_1 = false;

console.log(client_id)

server.on("listening", function()
{
   console.log("Now listening on a server");
});

server.on("request", function(req, res)
{
	console.log(req.url);
   if (req.url === "/" || req.url === "/breedify.herokuapp.com")
   {
   	console.log(req.url);
      synch = true;
      synch_1 = true;
      if (req.method === "POST")
      { 	
         get_dog_contents(res);
      }
   }
   else if (req.url.startsWith("/receive_code") || req.url.startsWith("/breedify.herokuapp.com/receive_code") && synch && synch_1)
   {
      const {code} = url.parse(req.url,true).query
      console.log("Youtube Auth Code has been received");
      console.log();

      res.writeHead(302, {
         'Location': `http://localhost:3000`
      });
      res.end();

      send_access_token_request(code, res);
   }
   else
   {
      // res.writeHead(404, {"Content-Type": "text/html"});
      // res.write(`<h1>404 Page Not Found</h1>`);
      // res.end();
   }
});

function get_dog_contents(res)
{
   const dog_endpoint = "https://dog.ceo/api/breeds/list/all";
   https.request(`${dog_endpoint}`, {method: "GET"}, process_stream).end();
   function process_stream(dog_stream){
      let dog_data = "";
      dog_stream.on("data", chunk => dog_data += chunk);
      dog_stream.on("end", () => serve_results(dog_data, res));
   }
}

function serve_results(dog_data, res){
   let dog = JSON.parse(dog_data);
   let random_breed = Object.keys(dog.message);
   dog_search_term = random_breed[Math.floor(Math.random() * random_breed.length + 1)] + " dog";
   console.log();
   console.log("Dog API has been called");
   console.log();
   console.log("Dog breed randomly selected: " + dog_search_term);
   console.log();

   //current_time = Date.now();
   if (fs.existsSync('./cached_access_token_info') && fs.existsSync('./time_token_generated') && fs.existsSync('./token_expires_in'))
   {
      const time_token_generated = fs.readFileSync('time_token_generated').toString();
      const token_expires_in = fs.readFileSync('token_expires_in').toString();
      const cached_access_token_info = fs.readFileSync('./cached_access_token_info').toString()
      
      if (Date.now() < parseInt(time_token_generated, 10) + parseInt(token_expires_in) * 1000)
      {
         send_search_request(cached_access_token_info, res);
      }
      else
      {
         redirect_request_to_youtube_auth(res);
      }
   }
   else
   {
      redirect_request_to_youtube_auth(res);
   }
}

function redirect_request_to_youtube_auth(res)
{
   const auth_endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
   const info = `&response_type=code&redirect_uri=https://breedify.herokuapp.com/receive_code&client_id=${client_id}&scope=https://www.googleapis.com/auth/youtube`;
   res.write(`${auth_endpoint}?${info}`);
   res.end();
   console.log("Redirect request has been called");
   console.log();
}

function send_access_token_request(code, res){
   const token_endpoint = "https://oauth2.googleapis.com/token";
   const redirect_uri = `https://breedify.herokuapp.com/receive_code`;
   const grant_type = "authorization_code";
   const post_data = querystring.stringify({client_id, client_secret, code, redirect_uri, grant_type});
   let options = {
      method: "POST",
      headers: {
         "Content-Type":"application/x-www-form-urlencoded"
      }
   }
   https.request(token_endpoint, options, (token_stream) => process_stream(token_stream, receive_access_token, res)).end(post_data);
   function process_stream(stream, callback, ...args)
   {
      let body = "";
      stream.on("data", chunk => body += chunk);
      stream.on("end", () => callback(body, res));
   }
}

function receive_access_token(body, res)
{
   const {access_token, expires_in} = JSON.parse(body);
   fs.writeFile('./cached_access_token_info', access_token.toString(), () => {});
   fs.writeFile('./token_expires_in', expires_in.toString(), () => {});
   fs.writeFile('./time_token_generated', Date.now().toString(), () => {});

   console.log("Youtube Access Token has been received");
   console.log();
   send_search_request(access_token, res);
}

function send_search_request(access_token, res){
   const search_endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${dog_search_term}&max-results=1&chart=mostPopular&type=video&access_token=${access_token}`;
   let options = {
      method: "GET",
      headers: {
         "Content-Type": "application/json"
      }
   }
   https.request(search_endpoint, options, (search_stream) => process_stream(search_stream, receive_search_response, res)).end();
   function process_stream(stream, callback, ...args)
   {
      let body = "";
      stream.on("data", chunk => body += chunk);
      stream.on("end", () => callback(body, res));
   }
}

function receive_search_response(body, res){
   const videos = JSON.parse(body);
   console.log("Youtube API has been called");
   console.log();
   for (let i = 0; i < videos?.items?.length; i++)
   {
      if (i == 0)
      {
         console.log("Youtube related video titles:");
      }
      console.log(videos?.items[i]?.snippet?.title);
      video_ids.push(videos?.items[i]?.id?.videoId);
   }
   res.write(`${video_ids[0]}`);
   res.end();
   video_ids = [];
}

server.listen(port);