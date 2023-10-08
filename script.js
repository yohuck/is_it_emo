const SPOTIFY_API_URL = "https://api.spotify.com/v1/search";
const SPOTIFY_ACCESS_TOKEN = "" ;
const OPENAI_API_KEY = "";
const OPEN_API_URL = 'https://api.openai.com/v1/chat/completions';

const artist = document.getElementById("artist");
const song_title = document.getElementById("song_title");
const submit = document.getElementById("submit");
const spotify_id = document.getElementById("spotify_id");
const score_element = document.getElementById("score");
const explanation_element = document.getElementById("explanation");
const lyrics_found_element = document.getElementById("lyrics_found");
const container = document.querySelector(".container-2");

async function getSpotifySongId(input) {
  const query = `${input}`;
  const url = `${SPOTIFY_API_URL}?q=${encodeURIComponent(query)}&type=track`;

  const response = await fetch(url, {
      method: 'GET',
      headers: {
      'Authorization': `Bearer ${SPOTIFY_ACCESS_TOKEN}`
      }
  });

  if (response.ok) {
    const data = await response.json();
    const best_match = data.tracks.items[0]; // Assuming the first result is the best match

    if (best_match) {
      const spotifyId = best_match.id;
      return spotifyId;
    } else {
      console.log('No matching song found.');
      return "NO SONG";
    }
  } else {
      console.log('Error fetching data from Spotify API.');
      return "ERROR";
  }
}

async function fetchLyrics(trackId) {
  try {
      const response = await fetch(`https://spotify-lyric-api.herokuapp.com/?trackid=${trackId}`);
      
      if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error:', error);
      return null;
  }
}

async function askAI(artist, song, lyrics){
  const input = `Artist: ${artist}. Song: ${song}. Lyrics: ${lyrics}`;
  const max_tokens = 100;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  };
    
  const request_body = JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a sarcastic and funny music journalist giving songs a ranking on how emo they are from 1 to 100 then a 1 sentence explanation for your review roasting the song. Please use the following format precisely: 89/here is explanation'
      },
      {
        role: 'user',
        content: input
      }
    ],
    max_tokens
  });
    
  const res = await fetch(OPEN_API_URL, {
    method: 'POST',
    headers: headers,
    body: request_body
  })

  const data = await res.json();

  const summary = data.choices[0].message.content.split("/")

  const return_object = {
      score: summary[0],
      explanation: summary[1]
  }
    
  return return_object
}

submit.addEventListener('click',  async (e) => {
  e.preventDefault();
  selected_artist = artist.value;
  selected_song = song_title.value;
  const spotifyId = await getSpotifySongId(`${selected_artist} ${selected_song}`);
  spotify_id.innerText = spotifyId;
  const lyricData  = await fetchLyrics(spotifyId) ;
  lyrics_found_element.innerText = "true";
  const lyrics = lyricData.lines.reduce((b, a) => b += ` ${a.words}`, "" );
  const {score, explanation} = await askAI(selected_artist, selected_song, lyrics);
  score_element.innerText = score;
  explanation_element.innerText = explanation;
  
  progress_groups.forEach((progress, index) => {
      let progressStartValue = 0;
      let progressStartEnd = score;
      let speed = 10;
      let progessTimer = setInterval(() => {
      progressStartValue++;
    
      if (progressStartValue == progressStartEnd) {
        clearInterval(progessTimer);
      }
    
      progress.querySelector(".circular-progress").style.background = `
      conic-gradient(${"#EF4444"} ${3.6 * progressStartValue}deg, white 0deg)`;
      
      progress.childNodes[1].childNodes[1].innerHTML = progressStartValue + "%";
       }, speed);
    });
})
 
const progress_groups = document.querySelectorAll(".progess-group")

progress_groups.forEach((progress, index) => {
  let progressStartValue = 0;
  let progressStartEnd = 90;
  let speed = 10;
  let progessTimer = setInterval(() => {
  progressStartValue++;

  if (progressStartValue == progressStartEnd) {
    clearInterval(progessTimer);
  }

  progress.querySelector(".circular-progress").style.background = `
  conic-gradient(${"#EF4444"} ${3.6 * progressStartValue}deg, white 0deg)`;
  
  progress.childNodes[1].childNodes[1].innerHTML = progressStartValue + "%";
   }, speed);
});








