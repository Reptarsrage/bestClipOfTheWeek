import axios from 'axios';

export default class TermsService {
  async getTerms() {
    const response = await axios.get('/api/Terms');
    const { data } = response;
    return data;
  }

  async createTerm(term) {
    const response = await axios.post('/api/Terms', { ...term, termId: undefined });
    const { data } = response;
    return data;
  }

  async updateTerm(term) {
    const response = await axios.patch('/api/Terms', term);
    const { data } = response;
    return data;
  }

  async deleteTerm(termId) {
    const response = await axios.delete(`/api/Terms/${termId}`);
    const { data } = response;
    return data;
  }
}
