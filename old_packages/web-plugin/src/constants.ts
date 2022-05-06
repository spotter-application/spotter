import { Site } from "./interface";

export const SEARCH_TERMS = '{searchTerms}';

export const INITIAL_SITES: Site[] = [
  {
    title: 'github.com',
    url: `https://github.com/search?q=${SEARCH_TERMS}`,
    icon: 'https://github.com/favicon.ico',
  },
  {
    title: 'brave.com',
    url: `https://search.brave.com/search?q=${SEARCH_TERMS}`,
    icon: 'https://brave.com/static-assets/images/brave-favicon.png',
  },
  {
    title: 'duckduckgo.com',
    url: `https://duckduckgo.com/?q=${SEARCH_TERMS}`,
    icon: 'https://duckduckgo.com/favicon.ico',
  },
  {
    title: 'google.com',
    url: `http://www.google.com/search?q=${SEARCH_TERMS}`,
    icon: 'https://www.google.com/favicon.ico',
  },
  {
    title: 'youtube.com',
    url: `http://www.youtube.com/search?q=${SEARCH_TERMS}`,
    icon: 'https://www.youtube.com/favicon.ico',
  },
  {
    title: 'stackoverflow.com',
    url: `https://stackoverflow.com/search?q=${SEARCH_TERMS}`,
    icon: 'https://stackoverflow.com/favicon.ico',
  },
  {
    title: 'yandex.com',
    url: `https://yandex.com/search/?text=${SEARCH_TERMS}`,
    icon: 'https://yastatic.net/s3/home-static/_/92/929b10d17990e806734f68758ec917ec.png',
  },
  {
    title: 'amazon.com',
    url: `https://www.amazon.com/s?k=${SEARCH_TERMS}`,
    icon: 'https://www.amazon.com/favicon.ico',
  },
];
