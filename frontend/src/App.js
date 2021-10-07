import React, { useState, useEffect } from 'react'
import './App.css'
import Videos from './Components/Videos'
import { Route, useHistory } from 'react-router-dom'

function App() {

  let video_ids = [];
  const history = useHistory();
  let redirect = "";
  const [videos, setVideos] = useState([]); // Used to update the Video component which renders the YouTube embed video

  function onClick() {
    let redirected = false;

    video_ids = [];

    // Sends POST request to backend hosted on heroku. Grabs the response from backend which includes a redirect to Google authentication and YouTube video id
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => {
      console.log(xhr.responseText);
      if (xhr.responseText.length > 20) {
        redirect = xhr.responseText; // Used to grab the Google authentication link from backend
      }

      if (xhr.responseText !== "works" && xhr.responseText.length < 20) {
        video_ids.push(xhr.responseText);
        console.log(video_ids);
        video_ids.forEach(video => setVideos(() => [video]));
      }
      
      if (redirect !== "" && !redirected) {
        history.push("/google"); // Used to redirect to Google authentication page with the help of Route below
      }
    });
    xhr.open("POST", "https://breedify.herokuapp.com");
    xhr.send();
  }

  return (
    <div id="border">
      <h1 id="font">Breedify</h1>
      <p>Click search for video from a random dog breed</p>
      <p id="smalltext">(Press search again after authentication. Youtube API only allows 100 searches a day. If you don't see a video, the Youtube API very likely has ran out of free credits.)</p>
      <button id="search" onClick={onClick}>Search</button>
      <h1> </h1>
      <Videos videos={videos} />
      <Route path='/google' component={() => {
        window.location.href = `${redirect}`;
        return null;
      }}>
      </Route>
    </div>
  )
}

export default App;
