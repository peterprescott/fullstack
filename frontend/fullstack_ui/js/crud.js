
function createInputField(type, id, value, width) {
  const input = document.createElement('input');
  input.type = type;
  input.id = id;
  input.value = value;
  input.style.width = width;
  return input;
}

function createEditButton(id, resourceName) {
  const editButton = document.createElement('button');
  editButton.className = 'edit-button';
  editButton.innerText = `Edit`;
  editButton.id = `${resourceName}-${id}`;
  editButton.onclick = function() { editResource(`${this.id}`) };
  return editButton;
 }

function createDeleteButton(id, resourceName) {
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-button';
  deleteButton.innerText = 'Delete';
  deleteButton.id = `${resourceName}-${id}`;
  deleteButton.onclick = function() { deleteResource(`${this.id}`) };
  return deleteButton;
 }

function createAddButton(resourceName) {
  const addButton = document.createElement('button');
  addButton.className = 'add-button';
  addButton.innerText = 'Add';
  addButton.id = `${resourceName}-add`;
  addButton.onclick = function() { addResource(`${resourceName}`) };
  addButton.style.textAlign = 'center';
  addButton.style.width = '100%';
  return addButton;
}

function createSaveButton(id, resourceName) {
  const saveButton = document.createElement('button');
  saveButton.className = 'save-button';
  saveButton.innerText = 'Save';
  saveButton.id = `${resourceName}-${id}`;
  saveButton.onclick = function() { saveResource(`${this.id}`) };
  return saveButton;
}

async function loadResource() {
  const dropdownMenu = document.getElementById('dropdown-menu');
  resourceName = dropdownMenu.value;
  if (resourceName !== '') {
    const resources = await getResource(resourceName);
    makeTable(resourceName, resources);
  }
}

function removeTable(resourceName) {
  const tableDiv = document.getElementById(`${resourceName}-table-div`);
  if (tableDiv) {
    tableDiv.remove();
  }
  const dropdownMenu = document.getElementById('dropdown-menu');
  dropdownMenu.value = '';
}

function makeTable(resourceName, resources) {
  removeTable(resourceName);
  const tableDiv = document.createElement('div');
  tableDiv.id = `${resourceName}-table-div`;
  tableDiv.className = 'table-div';
  const tableTitle = document.createElement('span');
  tableTitle.className = 'table-title';
  removeTableFunc = `removeTable('${resourceName}')`;
  tableTitle.innerHTML = `<button class="remove-table-button"
    onclick=${removeTableFunc}>X</button> ` +
    `${resourceName}`;
  tableDiv.appendChild(tableTitle);
  const table = document.createElement('table');
  table.id = `${resourceName}-table`;
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const tr = document.createElement('tr');
  const th = document.createElement('th');
  // make table header with keys from first object in resources array
  for (const key in resources[0]) {
    const th = document.createElement('th');
    th.innerText = key;
    tr.appendChild(th);
  }
  // add edit and delete buttons to table header
  const editTh = document.createElement('th');
  tr.appendChild(editTh);
  const deleteTh = document.createElement('th');
  tr.appendChild(deleteTh);
  thead.appendChild(tr);
  table.appendChild(thead);
  // make table body with values from each object in resources array
  resources.forEach(resource => {
    id = resource.id;
    const tr = document.createElement('tr');
    tr.id = `${resourceName}-${id}-row`;
    for (const key in resource) {
      const td = document.createElement('td');
      td.innerText = resource[key];
      td.id = `${resourceName}-${id}-${key}`;
      td.style.maxWidth = '15ch';
      if (key !== 'id') {
        td.className = `${resourceName}-${id}-cell`;
      }
      tr.appendChild(td);
    }
    const user_roles = localStorage.getItem('user_roles');
    if (user_roles.includes('admin')) {
      // only admins can edit and delete resources
      const editTd = document.createElement('td');
      const editButton = createEditButton(id, resourceName);
      editTd.appendChild(editButton);
      tr.appendChild(editTd);
      const deleteTd = document.createElement('td');
      const deleteButton = createDeleteButton(id, resourceName);
      deleteTd.appendChild(deleteButton);
      tr.appendChild(deleteTd);
    }
    tbody.appendChild(tr);
  });
  if (resourceName !== 'users') {
    // 'users' can only be added directly from the auth form

    // add row to table body with input fields for adding new resource
    const trNew = document.createElement('tr');
    trNew.id = `${resourceName}-add-row`;
    for (const key in resources[0]) {
      const td = document.createElement('td');
      td.id = `add-${resourceName}-${key}-cell`;
      if (key !== 'id') {
        const input = createInputField('text', `add-${resourceName}-${key}`, '', '12ch');
        td.appendChild(input);
      }
      trNew.appendChild(td);
    }
    // add add button to table body
    const addTd = document.createElement('td');
    addTd.colSpan = 2;
    addTd.style.justifyContent = 'center';
    const addButton = createAddButton(resourceName);
    addTd.appendChild(addButton);
    trNew.appendChild(addTd);
    tbody.appendChild(trNew);
  }
    table.appendChild(tbody);
    tableDiv.appendChild(table);
    tableDiv.maxWidth = '100%';
    appendBody(tableDiv);
}

async function addResource(resourceName) {
  row = document.getElementById(`${resourceName}-add-row`);
  cells = row.childNodes;
  data = {};
  for (let i = 1; i < cells.length - 1; i += 1) {
    cell = cells[i];
    key = cell.id.split('-')[2];
    value = cell.firstChild.value;
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }
    data[key] = value;
  }
  // add resource to database
  token = localStorage.getItem('token');
  try {
    const response = await fetch(`${apiURL}${resourceName}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    });
    if (response.ok) {
      alert(`Resource ${resourceName} added!`);
      const resource_id = await response.json().resource_id;
    } else {
      alert(`${response.status} ${response.statusText}`);
    }
  } catch (error) {
    alert(`${error}`);
  }
  // add row to table body with added resource
  try {
    const resources = await getResource(resourceName);
    makeTable(resourceName, resources);
  } catch (error) {
    alert(`${error}`);
  }
}

async function saveResource(label) {
  resourceName = label.split('-')[0];
  id = label.split('-')[1];
  cells = document.getElementsByClassName(`${resourceName}-${id}-cell`);
  data = {};
  for (let i = 0; i < cells.length; i += 1) {
    cell = cells[i];
    key = cell.id.split('-')[2];
    value = cell.firstChild.value;
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }
    data[key] = value;
    cell.innerHTML = value;
  }
  editButtonCell = document.getElementById(`${resourceName}-${id}-row`
                    ).childNodes[cells.length + 1];
  editButtonCell.innerHTML = '';
  const editButton = createEditButton(id, resourceName);
  editButtonCell.appendChild(editButton);
  // save resource to database
  token = localStorage.getItem('token');
  try {
    const response = await fetch(`${apiURL}${resourceName}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    });
    if (response.ok) {
      const data = await response.json();
      alert(`Resource ${resourceName}-${id} saved!`);
    } else {
      alert(`${response.status} ${response.statusText}`);
    }
  } catch (error) {
    alert(`${error}`);
  }
}


function editResource(label) {
  resourceName = label.split('-')[0];
  id = label.split('-')[1];
  cells = document.getElementsByClassName(`${resourceName}-${id}-cell`);
  for (let i = 0; i < cells.length; i += 1) {
    cell = cells[i];
    key = cell.id.split('-')[2];
    value = cell.innerText;
    const input = createInputField('text', `edit-${resourceName}-${id}-${key}`, value, '12ch');
    cell.innerHTML = '';
    cell.appendChild(input);
  }
  editButtonCell = document.getElementById(`${resourceName}-${id}-row`
                    ).childNodes[cells.length + 1];
  editButtonCell.innerHTML = '';
  const saveButton = createSaveButton(id, resourceName);
  editButtonCell.appendChild(saveButton);

}

async function deleteResource(label) {
  resource = label.split('-')[0];
  id = label.split('-')[1];
  // delete row from table
  const row = document.getElementById(`${resource}-${id}-row`);
  row.remove();
  // delete resource from database
  token = localStorage.getItem('token');
  try {
    const response = await fetch(`${apiURL}${resource}/${id}`, {
    method: 'DELETE',
    headers: {
         'Authorization': `Bearer ${token}`
        }
    });
    if (response.ok) {
      const data = await response.json();
      alert(`Resource ${resource}-${id} deleted!`);
    } else {
      alert(`${response.status} ${response.statusText}`);
    }
  } catch (error) {
      alert(`${error}`);
  }
}

async function getResource(resource) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${apiURL}${resource}`,
      {
        method : 'GET',
        headers : {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      alert(`${response.status} ${response.statusText}`);
    }
  } catch (error) {
    alert(`${error}`);
  }
}

async function addDropdownMenu() {
  try {
    const response = await fetch(`${apiURL}`);
    if (response.ok) {
      const data = await response.json();
      const resources = data.resources;
      const dropdownContainer = document.createElement('div');
      dropdownContainer.id = 'dropdown-container';
      const dropdownMenu = document.createElement('select');
      dropdownMenu.id = 'dropdown-menu';
      dropdownMenu.onchange = loadResource;
      const dropdownLabel = document.createElement('label');
      dropdownLabel.for = 'dropdown-menu';
      dropdownLabel.innerText = 'Select a resource:';
      dropdownContainer.appendChild(dropdownLabel);
      dropdownContainer.appendChild(dropdownMenu);
      resources.unshift('');
      resources.forEach(resource => {
        const option = document.createElement('option');
        option.value = resource;
        option.innerText = resource;
        dropdownMenu.appendChild(option);
      });
      appendBody(dropdownContainer);
    } else {
      alert(`
        Error: \n\n Failed to fetch API resources list.
        \n\n ${response.status} ${response.statusText}
        `);
    }
  } catch (error) {
      alert(`${error}`);
  }
}
