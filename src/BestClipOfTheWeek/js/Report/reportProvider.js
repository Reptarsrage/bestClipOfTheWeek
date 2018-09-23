import YouTubeService from './youtubeService';
import TermsService from './termsService';

export const getTermsAsync = async () => {
  const service = new TermsService();
  return service.getTerms();
};

export const getChannelPlaylistVideosAsync = async (channelName, playlistName) => {
  const service = new YouTubeService();

  // Get channel Id
  const channelId = await service.getChannelId(channelName);
  if (!channelId) {
    return undefined;
  }

  // Get playlsit Id
  const playlistId = await service.getPlaylistId(channelId, playlistName);
  if (!playlistId) {
    return undefined;
  }

  // Get playlsit video ids
  const videos = await service.getPlaylistVideos(playlistId);
  if (!videos) {
    return undefined;
  }

  // Get playlist videos
  return service.batchProcessVideos(videos, 50, undefined);
};

export const processVotes = (comments, oldVotes, oldVoters) => {
  // process votes
  const ballots = batchProcessComments(comments, oldVotes);
  const voters = {};
  const votes = {};

  // build new dicts using old values
  for (const key of Object.keys(oldVotes)) {
    votes[key] = { ...oldVotes[key] };
  }
  for (const key of Object.keys(oldVoters)) {
    voters[key] = oldVoters[key];
  }

  // add new values
  for (const { term, author } of ballots) {
    votes[term].votes += 1;

    if (author in voters) {
      voters[author] += 1;
    } else {
      voters[author] = 1;
    }
  }

  return { voters, votes };
};

const batchProcessComments = (comments, terms) => {
  const votes = [];

  for (const comment of comments) {
    const { text: commentText, author } = comment;

    for (const termText of Object.keys(terms)) {
      if (commentText.indexOf(termText) !== -1) {
        votes.push({ author, term: termText });
      }
    }
  }

  return votes;
};
