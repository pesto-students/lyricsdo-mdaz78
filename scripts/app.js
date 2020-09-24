const root = document.querySelector('#root');
const searchBox = document.querySelector('#search-box');
const mobileSearchButton = document.querySelectorAll('#search-button')[0];
const desktopSearchButton = document.querySelectorAll('#search-button')[1];
const logo = document.querySelector('.logo');
const themeSwitcher = document.querySelector(
  '.theme-switch input[type="checkbox"]',
);
const favoritesBtn = document.querySelector('#favorites-btn');

const fetchLyrics = async (artist, title) => {
  const url = `https://api.lyrics.ovh/v1/${artist}/${title}`;
  const response = await fetch(url);
  return response.json();
};

const favoritesObj = {
  getAll() {
    const songsArray = Object.values(localStorage);
    if (songsArray.length === 0) {
      return [];
    }

    return songsArray.map((song) => JSON.parse(song));
  },

  get(id) {
    return localStorage.getItem(id) || null;
  },

  add(song) {
    localStorage.setItem(song.id, JSON.stringify(song));
    return true;
  },

  remove(id) {
    localStorage.removeItem(id);
    return true;
  },

  toggleFavorites({
    id,
    artistName,
    albumName,
    preview,
    cover,
    favoriteButton,
  }) {
    const song = this.get(id);
    if (song === null) {
      this.add({ id, artistName, albumName, preview, cover });
      favoriteButton.classList.remove('far');
      favoriteButton.classList.add('fas');
    } else {
      this.remove(id);
      favoriteButton.classList.remove('fas');
      favoriteButton.classList.add('far');
    }
  },
};

const utils = {
  getDataFromSongNodes() {
    const songNodes = document.querySelectorAll('.suggestion');
    const result = [];
    songNodes.forEach((songNode) => {
      const id = songNode.getAttribute('id');
      const preview = songNode
        .querySelector('.preview audio')
        .getAttribute('src');
      const artistName = songNode.querySelector('.description h3').innerText;
      const albumName = songNode.querySelector('.description p').innerText;
      const cover = songNode.querySelector('.cover img').getAttribute('src');
      const viewButton = songNode.querySelector('.view-lyrics');
      const favoriteButton = songNode.querySelector(
        '.view-and-like-lyrics .like i',
      );

      result.push({
        id,
        preview,
        artistName,
        albumName,
        cover,
        viewButton,
        favoriteButton,
      });
    });

    return result;
  },
  addEventListenerOnLyrics() {
    const dataObj = this.getDataFromSongNodes();
    dataObj.forEach(({ id, artistName, albumName, viewButton }) => {
      viewButton.addEventListener('click', () => {
        showLyrics(artistName, albumName);
      });
    });
  },
  addEventListenerOnFavorites() {
    const dataObj = this.getDataFromSongNodes();
    dataObj.forEach(
      ({ id, artistName, albumName, preview, cover, favoriteButton }) => {
        favoriteButton.addEventListener('click', () => {
          favoritesObj.toggleFavorites({
            id,
            artistName,
            albumName,
            preview,
            cover,
            favoriteButton,
          });
        });
      },
    );
  },
};

const dom = {
  cleanRoot() {
    root.innerHTML = '';
  },

  showLoader() {
    this.cleanRoot();
    const template = `<div class="loader">
      <div class="ids-dual-ring">
      </div>
    </div> 
    `;
    this.render(template);
  },

  render(template) {
    console.log('render', template);
    this.cleanRoot();
    root.innerHTML = template;
  },

  renderTemplateFrom(configurations) {
    const template = configurations.map((config) => {
      const { id, preview, artistName, albumName, cover } = config;
      const favIcon = favoritesObj.get(id) === null ? 'far' : 'fas';
      return `<div class="suggestion" id="${id}">
          <div class="cover">
            <img
              src="${cover}"
              alt="cover"
            />
          </div>
          <div class="description">
            <h3>${artistName}</h3>
          <p>${albumName}</p>
          </div>
          <div class="preview">
          <audio
            src="${preview}"
            controls
          ></audio>
          </div>
          <div class="view-and-like-lyrics">
             <button class="view-lyrics">View Lyrics</button>
             <div class="like">
               <i class="${favIcon} fa-heart"></i>
             </div>
           </div>
        </div>`;
    });

    const songSuggestions = ` <div class="song-suggestions">
      ${template.join('')}
    </div>`;

    this.render(songSuggestions);
    utils.addEventListenerOnFavorites();
    utils.addEventListenerOnLyrics();
  },

  renderLyrics({ lyrics, artist, title }) {
    this.cleanRoot();
    const template = ` <section class="section__lyrics">
      <div></div>
      <div class="lyrics-container">
      <h2 class="lyrics-title">${title}</h2>
      <p class="lyrics-artist">${artist}</p>
      <p class="lyrics">${lyrics || 'Lyrics is not available'}</p>
      </div>
      <div></div>
    </section>
    `;
    this.render(template);
  },

  renderFavoritesPages() {
    this.showLoader();
    const songs = favoritesObj.getAll();
    let songsTemplate;

    if (songs.length === 0) {
      songsTemplate = `<div class="container__favorites">
        <p>You haven't added any songs to favorite yet :( </p>
      </div>
      `;
      this.render(songsTemplate);
    } else {
      songsTemplate = this.renderTemplateFrom(songs);
    }
  },
};

async function showLyrics(artist, title) {
  const { lyrics } = await fetchLyrics(artist, title);
  dom.renderLyrics({ lyrics, artist, title });
}

const fetchData = async (searchTerm) => {
  const url = `https://api.lyrics.ovh/suggest/${searchTerm}`;
  const response = await fetch(url);
  return response.json();
};

const search = async () => {
  const searchTerm = searchBox.value;
  if (!searchTerm) {
    return;
  }

  dom.showLoader();
  const response = await fetchData(searchTerm);
  const { data: suggestions } = response;
  const configArray = suggestions.map((suggestion) => {
    const { id, preview, album, artist } = suggestion;
    return {
      id,
      preview,
      artistName: artist.name,
      albumName: album.title,
      cover: album.cover_medium,
    };
  });
  dom.renderTemplateFrom(configArray);
};

logo.addEventListener('click', () => {
  dom.cleanRoot();
  searchBox.value = '';
});
desktopSearchButton.addEventListener('click', search);
mobileSearchButton.addEventListener('click', search);
searchBox.addEventListener('keyup', (event) => {
  // Search if enter key is pressed
  if (event.keyCode === 13) {
    search();
  }
});
themeSwitcher.addEventListener('change', (event) => {
  if (event.target.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
});
favoritesBtn.addEventListener('click', () => {
  dom.renderFavoritesPages();
});
