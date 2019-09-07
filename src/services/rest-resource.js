const publicAPIPath = process.env.VUE_APP_API_URL || 'http://127.0.0.1:3001';

class RestResource {

  handleResponse(response, reidrectOnForbidden = true) {
    const primaryStatusCode = response.status && parseInt(response.status / 100);

    if (reidrectOnForbidden && primaryStatusCode === 4) {
      history.replaceState(undefined, undefined, '#login')
      location.reload();
      return;
    }
    if (primaryStatusCode !== 2) {
      throw new Error(response.status);
    }
  }

  async getServers() {
    try {
      const response = await fetch(`${publicAPIPath}/API/servers`, {
        credentials: 'include',
      });

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.warn('get servers fail. ' + (error || ''));
      throw new Error('get servers fail');
    }
  }

  async addServer(displayName, macAddress, validUser) {
    try {
      const response = await fetch(`${publicAPIPath}/API/servers`, {
        method: "post",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          displayName,
          macAddress,
          validUsers: [validUser]
        })
      });

      this.handleResponse(response);
    } catch (error) {
      console.warn('add a local server fail. ' + (error || ''));
      throw new Error('add a local server fail');
    }
  }

  async generateServerKey(macAddress) {
    try {
      const response = await fetch(`${publicAPIPath}/API/servers/auth/${macAddress}`, {
        method: "post",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.warn('generate API key for a local server fail. ' + (error || ''));
      throw new Error('generate API key for a local server fail.');
    }
  }

  async removeServer(macAddress) {
    try {
      const response = await fetch(`${publicAPIPath}/API/servers/${macAddress}`, {
        method: "delete",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      this.handleResponse(response);
    } catch (error) {
      console.warn('remove a local server fail. ' + (error || ''));
      throw new Error('remove a local server fail.');
    }
  }

  async editServer(localServer) {
    try {
      const response = await fetch(`${publicAPIPath}/API/servers/${localServer.macAddress}`, {
        method: "put",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(localServer)
      });

      this.handleResponse(response);
    } catch (error) {
      console.warn('edit a local server fail. ' + (error || ''));
      throw new Error('edit a local server fail.');
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${publicAPIPath}/API/administration/auth/login`, {
        method: "post",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
        })
      });

      this.handleResponse(response, false);
    } catch (error) {
      console.warn('login to the administration panel fail. ' + (error || ''));
      throw new Error('login to the administration panel fail.');
    }
  }

  async logout() {
    try {
      const response = await fetch(`${publicAPIPath}/API/administration/auth/logout`, {
        method: "post",
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });


      this.handleResponse(response);
    } catch (error) {
      console.warn('logout to the administration panel fail. ' + (error || ''));
      throw new Error('logout to the administration panel fail.');
    }
  }

}


export default new RestResource;
