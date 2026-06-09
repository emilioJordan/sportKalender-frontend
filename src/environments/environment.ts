export const environment = {
  apiUrl: 'http://localhost:9090',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'Sportkalender',
    clientId: 'sportkalender-frontend',
  },
  roles: {
    read: 'READ',
    update: 'UPDATE',
  },
};
