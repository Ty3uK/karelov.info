const config = require('./data/config.json');
const socialMedia = require('./data/social_media.json');
const repos = require('./data/repos.json');

if (config.github_access_token) {
  delete config.github_access_token;
}

module.exports = {
  locals: {
    config,
    repos,
    socialMedia,
  },
};
