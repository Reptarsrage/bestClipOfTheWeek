import axios from 'axios'

export default class YouTubeApiConfigService {
  async getConfig(token) {
    const response = await axios.get('api/youtubeapiconfig', { headers: { Authorization: `Bearer ${token}` } })
    const { data } = response
    return data
  }
}
