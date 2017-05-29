const production = {
  charge: 'http://52.37.139.27/api/charges',
  client: 'http://52.37.139.27/api/clients',
  loan: 'http://52.37.139.27/api/loans',
};

const local = {
  charge: 'http://localhost:4000/api/charges',
  client: 'http://localhost:4000/api/clients',
  loan: 'http://localhost:4000/api/loans',
};

module.exports.baseUrl = local;
