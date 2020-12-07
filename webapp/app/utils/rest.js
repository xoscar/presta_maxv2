const rest = ({ resource, headers = {}, onFailAuth }) => ({
  async send({ redirect = true, url, options }) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      });

      return await {
        data: response.json(),
        statusCode: response.status,
      };
    } catch ({ status, responseText }) {
      if (status === 401 && onFailAuth && redirect) {
        return onFailAuth();
      }

      return {
        data: JSON.parse(responseText),
        statusCode: status,
      };
    }
  },
  async create(body) {
    return await this.send({ url: resource, method: 'POST', body });
  },

  async update(id, body) {
    return await this.send({ url: `${resource}/${id}`, method: 'PATCH', body });
  },

  async get(id) {
    return await this.send({ url: `${resource}/${id}`, method: 'GET' });
  },

  async getAll() {
    return await this.send({ url: `${resource}`, method: 'GET' });
  },

  async del(id) {
    return await this.send({ url: `${resource}/${id}`, method: 'DELETE' });
  },
});

export default rest;
