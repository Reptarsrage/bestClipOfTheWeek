import axios from 'axios';

export default class YouTubeService {
  static chooseWorstImage(item) {
    const { thumbnails } = item.snippet;
    let image;

    if (thumbnails.default) {
      image = thumbnails.default;
    } else if (thumbnails.medium) {
      image = thumbnails.medium;
    } else if (thumbnails.high) {
      image = thumbnails.high;
    } else if (thumbnails.standard) {
      image = thumbnails.standard;
    } else if (thumbnails.maxres) {
      image = thumbnails.maxres;
    } else {
      return undefined;
    }

    return {
      height: image.height,
      url: image.url,
      width: image.width,
    };
  }

  static chooseBestImage(item) {
    const { thumbnails } = item.snippet;
    let image;

    if (thumbnails.maxres) {
      image = thumbnails.maxres;
    } else if (thumbnails.standard) {
      image = thumbnails.standard;
    } else if (thumbnails.high) {
      image = thumbnails.high;
    } else if (thumbnails.medium) {
      image = thumbnails.medium;
    } else if (thumbnails.default) {
      image = thumbnails.default;
    } else {
      return undefined;
    }

    return {
      height: image.height,
      url: image.url,
      width: image.width,
    };
  }

  constructor() {
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    this.infoCacheTime = 86400; // seconds
    this.playlistCacheTime = 300; // seconds
  }

  stringIsNotNullOrEmpty(s) {
    return typeof s !== 'undefined' && s.length > 0;
  }

  async processVideoBatch(videoIds) {
    const params = {
      fields: 'items(id,snippet(publishedAt,thumbnails,title),statistics,contentDetails(duration))',
      id: videoIds.join(','),
      key: 'AIzaSyAB4qUxv4HVAhcysFGMEG4NwG7s0ojf7P0',
      maxResults: videoIds.length,
      part: 'id,statistics,snippet,contentDetails',
    };

    const response = await axios.get(`${this.baseUrl}/videos`, { params }, { ttl: this.infoCacheTime });

    return response.data.items.map(item => ({
      commentCount: parseInt(item.statistics.commentCount, 10),
      dislikeCount: parseInt(item.statistics.dislikeCount, 10),
      id: item.id,
      imageMaxRes: this.constructor.chooseBestImage(item),
      imageMedium: this.constructor.chooseWorstImage(item),
      likeCount: parseInt(item.statistics.likeCount, 10),
      publishedDate: new Date(Date.parse(item.snippet.publishedAt)),
      title: item.snippet.title,
      viewCount: parseInt(item.statistics.viewCount, 10),
    }));
  }

  async processCommentBatch(commentIds) {
    const params = {
      fields: 'items(id,snippet(authorDisplayName,publishedAt,parentId,textDisplay))',
      id: commentIds.join(','),
      key: 'AIzaSyAB4qUxv4HVAhcysFGMEG4NwG7s0ojf7P0',
      part: 'id,snippet',
      textFormat: 'plainText',
    };

    const response = await axios.get(`${this.baseUrl}/comments`, { params }, { ttl: this.infoCacheTime });

    return response.data.items.map(item => ({
      author: item.snippet.authorDisplayName,
      id: item.id,
      parentId: item.snippet.parentId,
      publishedDate: new Date(Date.parse(item.snippet.publishedAt)),
      text: item.snippet.textDisplay,
    }));
  }

  async batchProcessVideos(videoIds, batchSize, update) {
    // split all the videos we need to fetch into batches
    const batches = [];
    for (let i = 0; i < videoIds.length; i += batchSize) {
      batches.push(videoIds.slice(i, i + batchSize));
    }

    // run all batches at once
    const results = await Promise.all(
      batches.map(async batch => {
        const batchResult = await this.processVideoBatch(batch);
        if (update) {
          update(batchResult);
        }

        return batchResult;
      }),
    );

    // flatten batches and return
    const flatResults = [].concat(...results);
    return flatResults;
  }

  async batchProcessComments(commentIds, batchSize, update) {
    // split all the comments we need to fetch into batches
    const batches = [];
    for (let i = 0; i < commentIds.length; i += batchSize) {
      batches.push(commentIds.slice(i, i + batchSize));
    }

    // run all batches at once
    const results = await Promise.all(
      batches.map(async batch => {
        const batchResult = await this.processCommentBatch(batch);
        if (update) {
          update(batchResult);
        }

        return batchResult;
      }),
    );

    // flatten batches and return
    const flatResults = (results && results.length > 0 && results.reduce((a, b) => a.concat(b))) || [];
    return flatResults;
  }

  async getCommentPageForVideo(videoId, pageSize, pageToken) {
    const url = `${this.baseUrl}/commentThreads`;
    const params = {
      fields: 'items(id,replies(comments(id,snippet(publishedAt,textDisplay,authorDisplayName)))),nextPageToken',
      key: 'AIzaSyAB4qUxv4HVAhcysFGMEG4NwG7s0ojf7P0',
      maxResults: pageSize,
      order: 'relevance',
      pageToken,
      part: 'id,replies',
      videoId,
    };

    // Get comment Ids
    const response = await axios.get(url, { params }, { ttl: this.infoCacheTime });

    // Add comments
    let commentIds = response.data.items.map(item => item.id).filter(id => this.stringIsNotNullOrEmpty(id));

    // Add replies
    const commentsWithReplies = response.data.items.filter(item => item.replies && item.replies.comments && item.replies.comments.length > 0);
    const commentReplies = commentsWithReplies && commentsWithReplies.length > 0 && commentsWithReplies.map(item => item.replies.comments).reduce((a, b) => a.concat(b));
    const replies = commentReplies && commentReplies.map(item => item.id).filter(id => this.stringIsNotNullOrEmpty(id));
    if (replies && replies.length > 0) {
      commentIds = commentIds.concat(replies);
    }

    // Fetch actual comments
    return {
      comments: await this.batchProcessComments(commentIds, pageSize),
      nextPageToken: response.data.nextPageToken,
    };
  }

  async getAllCommentsForVideo(videoId, batchSize, update) {
    const url = `${this.baseUrl}/commentThreads`;
    const params = {
      fields: 'items(id,replies(comments(id,snippet(publishedAt,textDisplay,authorDisplayName)))),nextPageToken',
      key: 'AIzaSyAB4qUxv4HVAhcysFGMEG4NwG7s0ojf7P0',
      maxResults: '100',
      pageToken: '',
      part: 'id,replies',
      videoId,
    };

    let pageToken = '';
    let comments = [];
    let batch = []; // wait until batch gets to > batchSize and process

    do {
      if (this.stringIsNotNullOrEmpty(pageToken)) {
        params.pageToken = pageToken;
      }
      const response = await axios.get(url, { params }, { ttl: this.infoCacheTime });

      // Add comments
      let commentIds = response.data.items.map(item => item.id).filter(id => this.stringIsNotNullOrEmpty(id));

      // Add replies
      const commentsWithReplies = response.data.items.filter(item => item.replies && item.replies.comments && item.replies.comments.length > 0);
      const commentReplies = commentsWithReplies && commentsWithReplies.length > 0 && commentsWithReplies.map(item => item.replies.comments).reduce((a, b) => a.concat(b));
      const replies = commentReplies && commentReplies.map(item => item.id).filter(id => this.stringIsNotNullOrEmpty(id));
      if (replies && replies.length > 0) {
        commentIds = commentIds.concat(replies);
      }

      batch = batch.concat(commentIds);
      if (batch.length > batchSize) {
        // Use comment Ids to fetch comments
        const commentsBatch = await this.batchProcessComments(batch, 50, undefined);
        if (update) {
          update(commentsBatch);
        }

        comments = comments.concat(commentsBatch);
        batch = []; // empty out batch
      }

      // Check next page
      pageToken = response.data.nextPageToken;
    } while (this.stringIsNotNullOrEmpty(pageToken));

    // Make sure to process any left over
    if (batch.length > 0) {
      // Use comment Ids to fetch comments
      const commentsBatch = await this.batchProcessComments(batch, 50, update);
      comments = comments.concat(commentsBatch);
    }

    return comments;
  }

  async getChannelId(channelName) {
    const response = await axios.get(
      `${this.baseUrl}/channels`,
      {
        params: {
          fields: 'items/id,nextPageToken',
          forUsername: channelName,
          key: 'AIzaSyAB4qUxv4HVAhcysFGMEG4NwG7s0ojf7P0',
          maxResults: '1',
          part: 'id',
        },
      },
      { ttl: this.infoCacheTime },
    );
    return response.data.items.length === 0 ? undefined : response.data.items[0].id;
  }

  async getPlaylistId(channelId, playlistName) {
    const url = `${this.baseUrl}/playlists`;
    const params = {
      channelId,
      fields: 'items(id,snippet/title),nextPageToken',
      key: 'AIzaSyAB4qUxv4HVAhcysFGMEG4NwG7s0ojf7P0',
      maxResults: '50',
      pageToken: '',
      part: 'id,snippet',
    };
    let pageToken = '';
    let id;

    do {
      if (this.stringIsNotNullOrEmpty(pageToken)) {
        params.pageToken = pageToken;
      }
      const response = await axios.get(url, { params }, { ttl: this.infoCacheTime });
      const itemsWithId = response.data.items.filter(item => item.snippet.title === playlistName);

      if (itemsWithId.length > 0) {
        const [item] = itemsWithId;
        ({ id } = item);
      }

      pageToken = response.data.nextPageToken;
    } while (!id && this.stringIsNotNullOrEmpty(pageToken));

    return id || undefined;
  }

  async getPlaylistVideos(playlistId) {
    const url = `${this.baseUrl}/playlistItems`;
    const params = {
      fields: 'items/contentDetails/videoId,nextPageToken',
      key: 'AIzaSyAB4qUxv4HVAhcysFGMEG4NwG7s0ojf7P0',
      maxResults: '50',
      pageToken: '',
      part: 'contentDetails',
      playlistId,
    };

    let pageToken = '';
    let list = [];

    do {
      if (this.stringIsNotNullOrEmpty(pageToken)) {
        params.pageToken = pageToken;
      }
      const response = await axios.get(url, { params }, { ttl: this.playlistCacheTime });
      const videoIds = response.data.items.map(item => item.contentDetails.videoId).filter(videoId => this.stringIsNotNullOrEmpty(videoId));

      // Add Ids to list
      list = list.concat(videoIds);

      // Process next page
      pageToken = response.data.nextPageToken;
    } while (this.stringIsNotNullOrEmpty(pageToken));

    return list;
  }
}
