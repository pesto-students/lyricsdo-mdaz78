// eslint-disable-next-line no-unused-vars
const favorites = {
  getAll() {
    const songsArray = Object.values(localStorage);
    if (songsArray) {
      return [];
    }

    return songsArray.map((song) => JSON.parse(song));
  },

  get(id) {
    return localStorage.getItem(id) || {};
  },

  add(song) {
    localStorage.setItem(song.id, JSON.stringify(song));
    return true;
  },

  remove(id) {
    localStorage.removeItem(id);
    return true;
  },
};
