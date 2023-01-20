import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

Notiflix.Notify.init({
  width: '430px',
  position: 'right-top',
  distance: '10px',
  borderRadius: '5px',
  opacity: '1',
  fontSize: '18px',
});

let lightbox = new SimpleLightbox('.gallery a');

const formSearch = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');

formSearch.addEventListener('submit', onFormSubmit);
loadBtn.addEventListener('click', onBtnClick);
let page = 1;
let searchQuery = '';

async function onFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  searchQuery = form.elements.searchQuery.value.trim();

  if (!searchQuery) {
    Notiflix.Notify.failure('An empty input field. Please fill it up');
    return;
  }

  loadBtn.classList.add('hidden');

  gallery.innerHTML = '';

  try {
    const reply = await pixabayFetch(searchQuery, page);

    const hits = reply.hits.length;

    if (!hits) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    const totalHits = reply.totalHits;
    if (totalHits > 0) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    cardsRender(reply);
    loadBtn.classList.remove('hidden');
    if (page * 40 > totalHits) {
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch {
    catchErrorNotification();
  }
}

async function pixabayFetch(searchQuery, page = 1) {
  const BASE_URL = 'https://pixabay.com/api/';
  const KEY = '32842210-baf8a3411c9407cd0a791243e';
  try {
    const fetchResponse = await axios.get(
      `${BASE_URL}?key=${KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
    );
    const resp = await fetchResponse.data;

    return resp;
  } catch (error) {
    throw new Error(error.statusText);
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
 <a href="${largeImageURL}"> <img src="${webformatURL}" alt="${tags}" loading="lazy" width ="360"/></a>
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
  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

async function onBtnClick() {
  page += 1;

  try {
    const data = await pixabayFetch(searchQuery, page);

    cardsRender(data);

    if (page * 40 > data.totalHits) {
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
      loadBtn.classList.add('hidden');
    }
  } catch {
    catchErrorNotification();
  }
}

function catchErrorNotification() {
  Notiflix.Notify.failure(
    'Oops, something went wrong. There are no images matching your request. Please try it again.'
  );
}
