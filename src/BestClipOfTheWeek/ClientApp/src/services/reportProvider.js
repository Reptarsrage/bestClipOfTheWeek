import YouTubeService from './youtubeService';
import TermsService from './termsService';
import authService from '../components/api-authorization/AuthorizeService'

export const getTermsAsync = async (token) => {
  const service = new TermsService();
  return service.getTerms(token);
};

export const getChannelPlaylistVideosAsync = async (channelName, playlistName) => {
  const service = new YouTubeService();
  const token = await authService.getAccessToken()

  // Get channel Id
  const channelId = await service.getChannelId(channelName, token);
  if (!channelId) {
    return undefined;
  }

  // Get playlsit Id
  const playlistId = await service.getPlaylistId(channelId, playlistName, token);
  if (!playlistId) {
    return undefined;
  }

  // Get playlsit video ids
  const videos = await service.getPlaylistVideos(playlistId, token);
  if (!videos) {
    return undefined;
  }

  // Get playlist videos
  return service.batchProcessVideos(videos, 50, undefined, token);
};

export const processVotes = async (comments, oldVotes, oldVoters) => {
  // process votes
  const token = await authService.getAccessToken()
  const ballots = batchProcessComments(comments, oldVotes, undefined, token);
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

export const sortComments = comments => {
  const alreadyMoved = {};
  for (let i = 0; i < comments.length; i += 1) {
    const comment = comments[i];
    if (comment.parentId && !(comment.id in alreadyMoved)) {
      comments.splice(i, 1);
      const idx = comments.findIndex(parent => parent.id === comment.parentId);
      comments.splice(idx + 1, 0, comment);
      alreadyMoved[comment.id] = true;
    }
  }

  return comments;
};

export const parseComments = (comments, terms) =>
  comments.map(comment => {
    const pieces = [];
    pieces.push({ color: '', isTerm: false, text: comment.text });
    for (const { color, name, enabled } of terms) {
      if (!enabled) {
        continue;
      }

      const regex = new RegExp(name, 'i');
      for (let i = 0; i < pieces.length; i += 1) {
        if (pieces[i].isTerm) {
          continue;
        }
        const piece = pieces[i].text;
        const idx = piece.search(regex);
        if (idx < 0) {
          continue;
        }
        const expandedPiece = [];
        expandedPiece.push({ color: '', isTerm: false, text: piece.substring(0, idx) });
        expandedPiece.push({ color, isTerm: true, text: piece.substring(idx, idx + name.length) });
        expandedPiece.push({ color: '', isTerm: false, text: piece.substring(idx + name.length, piece.length) });
        pieces.splice(i, 1, ...expandedPiece.filter(p => p.text.length > 0));
        i -= 1;
      }
    }

    // Set piece Ids
    for (let i = 0; i < pieces.length; i += 1) {
      pieces[i].id = i;
    }

    return { ...comment, pieces };
  });

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
