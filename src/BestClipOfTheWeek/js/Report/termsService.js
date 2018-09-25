import axios from 'axios';

export default class TermsService {
  async getTerms() {
    const response = await axios.get('/api/Terms');
    const { data } = response;
    return data;
  }
}
