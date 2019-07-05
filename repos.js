const fs = require('fs').promises;
const path = require('path');

const axios = require('axios');

const config = require('./data/config.json');
const token = require('./data/token.json');
const colors = require('./data/colors.json');

const sortRepos = (a, b) => {
  if (a.stargazers_count > b.stargazers_count) {
    return -1;
  }

  if (a.stargazers_count < b.stargazers_count) {
    return 1;
  }

  if (a.pushed_at > b.pushed_at) {
    return -1;
  }

  if (a.pushed_at < b.pushed_at) {
    return 1;
  }

  return 0;
};

(async () => {
  if (!config.github_user_name) {
    throw new Error('Please provide `github_user_name` property in config file');
  }

  const headers = {};

  if (token.github_access_token) {
    headers.Authorization = `token ${token.github_access_token}`;
  }

  const request = axios.create({
    baseURL: 'https://api.github.com',
    headers,
  });

  const response = await request.get(`/users/${config.github_user_name}/repos`, {
    params: {
      visibility: 'public',
      affiliation: 'owner',
      per_page: '100',
    },
  });

  if (!response.data) {
    throw new Error('Github response is empty');
  }

  const repos = response.data
    .filter(repo => !repo.fork)
    .sort(sortRepos)
    .slice(0, config.repositories_count || 9)
    .map(repo => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      languageColor: (colors[repo.language] || {}).color || '',
      languagesUrl: repo.languages_url,
      starsCount: repo.stargazers_count,
      stargazersUrl: repo.stargazers_url,
      forksCount: repo.forks_count,
      forksUrl: repo.forks_url,
      url: repo.html_url,
    }));

  await fs.writeFile(
    path.join(__dirname, 'data/repos.json'),
    JSON.stringify(repos, null, 2),
  );
})();
