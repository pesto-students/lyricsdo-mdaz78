const root = document.querySelector('#root');

const loaderTemplate = () => {
  return `<div class="loader">
    <div class="ids-dual-ring">
    </div>
  </div> 
  `;
};

const cleanRoot = () => (root.innerHTML = '');

const render = (template) => {
  root.innerHTML = template;
};

const renderLyrics = ({ lyrics, artist, title }) => {
  cleanRoot();
  const template = `
    <div class="lyrics-container">
      <h2 class="lyrics-title">${title}</h2>
      <p class="lyrics-artist">${artist}</p>
      <p class="lyrics">${lyrics || 'Lyrics is not available'}</p>
    </div>
  `;

  render(template);
};

const fetchLyrics = async (artist, title) => {
  const url = `https://api.lyrics.ovh/v1/${artist}/${title}`;
  const response = await fetch(url);
  return await response.json();
};

const viewLyrics = async (artist, title) => {
  cleanRoot();
  render(loaderTemplate());
  const { lyrics } = await fetchLyrics(artist, title);
  renderLyrics({ lyrics, artist, title });
};

const getSuggestionsTemplate = (suggestions) => {
  const suggestionsTemplate = suggestions.map((suggestion) => {
    const { preview, artist, album } = suggestion;
    return `
      <div class="suggestion">
      <div class="cover">
        <img
          src="${album.cover_medium}"
          alt="cover"
        />
      </div>
      <div class="description">
        <h3>${artist.name}</h3>
        <p>${album.title}</p>
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
          <i class="far fa-heart"></i>
        </div>
      </div>
    </div>`;
  });

  return `
    <div class="song-suggestions">
      ${suggestionsTemplate.join('')}
    </div>
  `;
};

const addEventListenerToViewLyrics = () => {
  const suggestionNodes = document.querySelectorAll('.suggestion');
  suggestionNodes.forEach((suggestionNode) => {
    const artist = suggestionNode.querySelector('.description h3').innerText;
    const title = suggestionNode.querySelector('.description p').innerText;
    const viewButton = suggestionNode.querySelector('.view-lyrics');

    viewButton.addEventListener('click', () => viewLyrics(artist, title));
  });
};

const fetchData = async (searchTerm) => {
  let url = `https://api.lyrics.ovh/suggest/${searchTerm}`;
  const response = await fetch(url);
  return await response.json();
};

const search = async () => {
  const searchTerm = searchBox.value;
  if (!searchTerm) {
    return;
  }

  render(loaderTemplate());
  const response = await fetchData(searchTerm);
  const { data: suggestions, next } = response;
  const suggestionsTemplate = getSuggestionsTemplate(suggestions);
  cleanRoot();
  render(suggestionsTemplate);
  addEventListenerToViewLyrics();
};

const searchBox = document.querySelector('#search-box');
const mobileSearchButton = document.querySelectorAll('#search-button')[0];
const desktopSearchButton = document.querySelectorAll('#search-button')[1];
const logo = document.querySelector('.logo');

logo.addEventListener('click', () => {
  cleanRoot();
  searchBox.value = '';
});

desktopSearchButton.addEventListener('click', search);
mobileSearchButton.addEventListener('click', search);
searchBox.addEventListener('keyup', (event) => {
  // If enter key is not pressed return
  if (event.keyCode !== 13) {
    return;
  } else {
    search();
  }
});
