/* Utils for making API calls */

console.log('utils.js loading...');


async function fetchWithErrorHandling(url = '', config = {}) {
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (response.ok) {
      return data;
    }
    throw new Error(data.message || 'Request failed');
  } catch (error) {
    handleError(error)
  }
}

function handleError(error) {
  console.log(error);
  alert(error.stack);
  if (context === "local") {
    rickRoll();
  }
}

async function get(url, token) {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return fetchWithErrorHandling(url, config);
}

async function post(url, token, body) {
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  };
  return fetchWithErrorHandling(url, config);
}

async function put(url, token, body) {
  const config = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  };
  return fetchWithErrorHandling(url, config);
}

async function remove(url, token) {
  const config = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return fetchWithErrorHandling(url, config);
}

async function login(username, password) {
  const url = `${API_URL}/login`;
  const body = {
    username,
    password,
  };
  return post(url, null, body);
}

async function signup(username, email, password) {
  const url = `${API_URL}/signup`;
  const body = {
    username,
    email,
    password,
  };
  return post(url, null, body);
}

async function getSchema(resourceName) {
  const token = localStorage.getItem('token');
  const url = `${API_URL}/schemas/${resourceName}`;
  return get(url, token);
}

async function getResources(resourceName) {
  const token = localStorage.getItem('token');
  const url = `${API_URL}/${resourceName}`;
  return get(url, token);
}

async function createResource(resourceName, resource) {
  const token = localStorage.getItem('token');
  const url = `${API_URL}/${resourceName}`;
  return post(url, token, resource);
}

async function getResource(resourceName, id) {
  const token = localStorage.getItem('token');
  const url = `${API_URL}/${resourceName}/${id}`;
  return get(url, token);
}

async function updateResource(resourceName, id, resource) {
  const token = localStorage.getItem('token');
  const url = `${API_URL}/${resourceName}/${id}`;
  return put(url, token, resource);
}

async function deleteResource(resourceName, id) {
  const token = localStorage.getItem('token');
  const url = `${API_URL}/${resourceName}/${id}`;
  return remove(url, token);
}

function rickRoll() {
  const rickRoll = document.createElement('iframe');
  rickRoll.setAttribute('width', '560');
  rickRoll.setAttribute('height', '315');
  rickRoll.setAttribute('src', 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1');
  rickRoll.setAttribute('frameborder', '0');
  rickRoll.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
  rickRoll.setAttribute('allowfullscreen', '');
  rickRoll.style.padding = '20px';
  rickRoll.setid = 'rick-roll';
  const removeRickRoll = document.createElement('button');
  removeRickRoll.innerText = 'Remove Rick Roll';
  removeRickRoll.addEventListener('click', function() {
    rickRoll.remove();
    removeRickRoll.remove();
  });
  appendBody(rickRoll);
  appendBody(removeRickRoll);
}


console.log('utils.js loaded!');
