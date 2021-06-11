import axios from 'axios'

export default class TermsService {
  async getTerms(token) {
    const response = await axios.get('api/terms', { headers: { Authorization: `Bearer ${token}` } })
    const { data } = response
    return data
  }

  async createTerm(term, token) {
    const response = await axios.post(
      'api/terms',
      { ...term, termId: undefined },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const { data } = response
    return data
  }

  async updateTerm(term, token) {
    const response = await axios.patch('api/terms', term, { headers: { Authorization: `Bearer ${token}` } })
    const { data } = response
    return data
  }

  async deleteTerm(termId, token) {
    const response = await axios.delete(`api/terms/${termId}`, { headers: { Authorization: `Bearer ${token}` } })
    const { data } = response
    return data
  }
}
