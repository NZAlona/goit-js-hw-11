import Notiflix from 'notiflix';
import axios from 'axios';

const formSearch = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');

formSearch.addEventListener('submit', onFormSubmit);

async function onFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const searchQuery = form.elements.searchQuery.value.trim();

  if (!searchQuery) {
    return;
  }

  gallery.innerHTML = '';
  const reply = await pixabayFetch(searchQuery);
  cardsRender(reply);
}

async function pixabayFetch(searchQuery, page = 1) {
  const BASE_URL = 'https://pixabay.com/api';
  const KEY = '32842210-baf8a3411c9407cd0a791243e';
  try {
    const fetchResponse = await axios.get(
      `${BASE_URL}?key=${KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
    );
    const resp = await fetchResponse.data;
    console.log(resp);
    return resp;
  } catch (error) {
    console.error(error);
  }
}

function cardsRender(data) {
  const markup = data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" width= 480/>
  <div class="info">
    <p class="info-item">
      <b>Likes <br>${likes}</b>
    </p>
    <p class="info-item">
      <b>Views <br>${views}</b>
    </p>
    <p class="info-item">
      <b>Comments</b> <br><b>${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads <br>${downloads}</b>
    </p>
  </div>
</div>`
    )
    .join('');
  gallery.insertAdjacentHTML('afterbegin', markup);
}
