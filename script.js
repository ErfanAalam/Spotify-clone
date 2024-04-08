// http://127.0.0.1:5500/index.html
let currsong = new Audio();
let songs;
let currfolder;

function secondsToMinutesAndSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // show all song to the playlist
  let songul = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];

  songul.innerHTML = "";

  for (const song of songs) {
    songul.innerHTML =
      songul.innerHTML +
      `<li><i class="fa-solid fa-music"></i>
    <div class="info">
      <div>${song}</div>
      <div>Erfan Aalam</div>
    </div>
    <div class="play-now">
      <span>Play now</span>
      <i class="fa-solid fa-play playnow"></i>
    </div>
  </li>`;
  }

  // attach a event listner to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
}

const playMusic = (track, pause = false) => {
  currsong.src = `/${currfolder}/` + track;
  if (!pause) {
    currsong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayalbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    console.log(e.href);
    if (e.href.includes("/songs")) {
      // console.log(e.href);
      let folder = e.href.split("/").slice(-1)[0];
      console.log(folder);
      // get the meta data of the folder
      let a = await fetch(`http://127.0.0.1:5500/songs/cs/info.json`);
      let response = await a.json();
      // console.log(response);
      cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="cs" class="card">
      <div class="play">
        <i class="fa-solid fa-play"></i>
      </div>  
      <img
        src="/songs/ncs/cover.jpeg"
        alt=""
      />
      <h2>${response.title}</h2>
      <p>${response.description}</p>
    </div>`
    }
  };

  
}

async function main() {
  await getsongs("songs/ncs");
  playMusic(songs[0], true);

  // Display all the albums on tha page
  displayalbums();

  // Attch a eventlitner to play next and previous

  play.addEventListener("click", () => {
    if (currsong.paused) {
      currsong.play();
      play.src = "pause.svg";
    } else {
      currsong.pause();
      play.src = "play.svg";
    }
  });

  // listen for time update event

  currsong.addEventListener("timeupdate", () => {
    document.querySelector(
      ".songtime"
    ).innerHTML = `${secondsToMinutesAndSeconds(
      currsong.currentTime
    )}:${secondsToMinutesAndSeconds(currsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currsong.currentTime / currsong.duration) * 100 + "%";
  });

  // add an event listner to the seek bar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currsong.currentTime = (currsong.duration * percent) / 100;
  });

  // add event listner to the hamburger

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".closehamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add eventlistner for the previous and next

  previous.addEventListener("click", () => {
    currsong.pause();
    console.log("previous clicked");
    let index = songs.indexOf(currsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    console.log("next clicked");
    currsong.pause();
    let index = songs.indexOf(currsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // add event to  volume

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currsong.volume = parseInt(e.target.value) / 100;
    });

  // load the platylist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
  
}

main();
