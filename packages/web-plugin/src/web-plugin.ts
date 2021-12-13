import { Plugin } from '@spotter-app/plugin';
import { Option } from '@spotter-app/core';
import { exec } from 'node:child_process';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import { INITIAL_SITES, SEARCH_TERMS } from './constants';
import { Site } from './interface';
import pDebounce from './promise-debounce';
import { execPromise } from './helper';

new class WebPlugin extends Plugin {
  private appPath: string;

  private debouncedGetSiteSearchUrl = pDebounce<string>(this.getSiteSearchUrl, 300);

  constructor() {
    super('web-plugin');
  }

  async onInit() {
    const browser = await execPromise(
      "mdfind \"kMDItemCFBundleIdentifier == $(defaults read ~/Library/Preferences/com.apple.LaunchServices/com.apple.launchservices.secure | awk -F'\"' '/http;/{print window[(NR)-1]}{window[NR]=$2}')\""
    );
    this.appPath = browser ?? '/Applications/Safari.app';


    const storage = await this.spotter.getStorage<{sites: Site[]}>();

    if (!storage.sites) {
      storage.sites = INITIAL_SITES;
      this.spotter.patchStorage({
        sites: INITIAL_SITES,
      });
    }

    this.registerOptions(storage.sites);
  }

  registerOptions(sites: Site[]) {
    this.spotter.setRegisteredOptions([
      {
        title: 'Web plugin',
        icon: this.appPath,
        onQuery: () => this.menu(sites),
      },
      ...sites.map((site) => ({
        title: site.title,
        icon: site.icon,
        onQuery: (q: string) => this.query(q, site.url, site.icon),
      })),
    ]);
  }

  async menu(sites: Site[]) {
    const options: Option[] = [
      {
        title: 'Add site',
        icon: this.appPath,
        onQuery: (q) => this.addSite(q),
      },
      ...sites.map(({title, icon}) => ({
        title,
        icon,
        onQuery: () => ([{
          title: `Remove ${title}`,
          icon,
          onSubmit: () => this.removeSite(title),
        }]),
      })),
    ];
    return options;
  }

  async addSite(query: string) {
    this.spotter.setPlaceholder('New website url...');

    if (!query.length) {
      return [];
    }

    const url = this.withHttps(query);
    const isValid = this.isValidUrl(url);

    if (!isValid) {
      return [];
    }

    const storage = await this.spotter.getStorage<{sites: Site[]}>();
    const currentSites: Site[] = storage.sites ?? [];

    const alreadyExists = currentSites.find(s => s.title === query);

    if (alreadyExists) {
      return [{ title: `${query} already exists` }];
    }

    const searchUrl = await this.debouncedGetSiteSearchUrl(url);

    const icon = `https://www.google.com/s2/favicons?domain=${url}`;

    if (!searchUrl) {
      return this.setSearchUrl(query, icon);
    }

    return [
      {
        title: `Add ${query}`,
        icon,
        onSubmit: () => this.saveSite(query, searchUrl, icon),
      },
    ];
  }

  setSearchUrl(site: string, icon: string): Option[] {
    return [{
      title: `Add ${site}`,
      icon,
      onQuery: (q: string) => {
        this.spotter.setPlaceholder('Search url: site.com/q={searchTerms}')
        const searchUrl = this.withHttps(q);
        const isValid = this.isValidUrl(searchUrl.replace(SEARCH_TERMS, ''));

        if (!isValid) {
          return [{title: 'Invalid search url'}];
        }

        if (!searchUrl.includes(SEARCH_TERMS)) {
          return [{title: `Does not include ${SEARCH_TERMS}`}];
        }

        return [{
          title: 'Save',
          icon,
          onSubmit: () => this.saveSite(site, searchUrl, icon),
        }];
      },
    }];
  }

  async saveSite(
    site: string,
    searchUrl: string,
    icon: string,
  ) {
    this.spotter.setStorage({
      name: site,
      url: searchUrl,
      icon,
    });

    this.spotter.patchRegisteredOptions([{
      title: site,
      icon,
      onQuery: (q) => this.query(q, searchUrl, icon),
    }]);
    return true;
  }

  async removeSite(site: string) {
    const storage = await this.spotter.getStorage<{sites: Site[]}>();
    const sites: Site[] = storage.sites ?? [];

    if (!sites.find(s => s.title === site)) {
      return false;
    }

    const nextSites = sites.filter(s => s.title !== site);

    this.spotter.patchStorage({
      sites: nextSites,
    });

    this.registerOptions(nextSites);

    return true;
  }

  query(
    query: string,
    searchUrl: string,
    icon: string,
  ): Option[] {
    return [
      {
        title: `Open ${query}`,
        onSubmit: () => this.openUrl(`${searchUrl.replace(SEARCH_TERMS, query)}`),
        icon,
      },
    ];
  }

  openUrl(url: string) {
    exec(`open "${url}"`);
    return true;
  }

  async getSiteSearchUrl(site: string): Promise<string | null> {
    try {
      const openSearchXMLUrl = await axios.get(site).then(result => {
        const dom = new JSDOM(result.data);
        const openSearchElement = dom.window.document
          .querySelector('link[type="application/opensearchdescription+xml"]');

        if (!openSearchElement) {
          return null;
        }

        return openSearchElement.getAttribute('href');
      });

      if (!openSearchXMLUrl) {
        return null;
      }

      const url = openSearchXMLUrl.startsWith('/')
        ? `${site}${openSearchXMLUrl}`
        : openSearchXMLUrl;
    
      return axios.get(url).then(result => {
        const dom = new JSDOM(result.data);
        const urlElement = dom.window.document.querySelector('url');

        if (!urlElement) {
          return null;
        }

        return urlElement.getAttribute('template')
      });
    } catch {
      return null;
    }
  }

  withHttps(url: string) {
    return (url.indexOf('://') === -1) ? 'https://' + url: url;
  }

  isValidUrl(url: string) {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(url);
  }

}
