/* Data management operations for all resources */

console.log('data-manager.js loading...');

let schemas = {};

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
  editButton.onclick = function() { editResourceButtonClick(`${this.id}`) };
  return editButton;
 }

function createDeleteButton(id, resourceName) {
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-button';
  deleteButton.innerText = 'Delete';
  deleteButton.id = `${resourceName}-${id}`;
  deleteButton.onclick = function() { deleteResourceButtonClick(`${this.id}`) };
  return deleteButton;
 }

function createAddButton(resourceName) {
  const addButton = document.createElement('button');
  addButton.className = 'add-button';
  addButton.innerText = 'Add';
  addButton.id = `${resourceName}-add`;
  addButton.onclick = function() { addResourceButtonClick(`${resourceName}`) };
  addButton.style.textAlign = 'center';
  addButton.style.width = '100%';
  return addButton;
}

function createSaveButton(id, resourceName) {
  const saveButton = document.createElement('button');
  saveButton.className = 'save-button';
  saveButton.innerText = 'Save';
  saveButton.id = `${resourceName}-${id}`;
  saveButton.onclick = function() { saveResourceButtonClick(`${this.id}`) };
  return saveButton;
}

async function loadResource() {
  const dropdownMenu = document.getElementById('dropdown-menu');
  resourceName = dropdownMenu.value;
  if (resourceName !== '') {
    const resources = await getResources(resourceName);
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

async function getSchemas() {
  const token = localStorage.getItem('token');
  const url = `${API_URL}/schemas`;
  return await get(url, token);
}

function translateType(type) {
  apiTypes = {
    'INTEGER': 'number',
    'TEXT': 'text',
    'BOOLEAN': 'checkbox'
  };
  return sqliteTypes[type];
}

async function makeTable(resourceName, resources) {
  schemas = await getSchemas();
  resourceSchema = schemas[resourceName];
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
  // make table header with names from resourceSchema
  resourceSchema.forEach(column => {
    if (column.serialized) {
      const th = document.createElement('th');
      th.innerText = column.name;
      tr.appendChild(th);
    }
  });
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
    // for (const key in resources[0]) {
    resourceSchema.forEach(column => {
      if (column.serialized) {
        key = column.name;
        const td = document.createElement('td');
        td.id = `add-${resourceName}-${key}-cell`;
        if (key !== 'id') {
          const input = createInputField('text', `add-${resourceName}-${key}`, '', '12ch');
          td.appendChild(input);
        }
        trNew.appendChild(td);
      }
    });
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

async function addResourceButtonClick(resourceName) {
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
  createResource(resourceName, data);
  removeTable(resourceName);
  resources = await getResources(resourceName);
  makeTable(resourceName, resources);
}

async function saveResourceButtonClick(label) {
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
  updateResource(resourceName, id, data);
}


function editResourceButtonClick(label) {
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

async function deleteResourceButtonClick(label) {
  resource = label.split('-')[0];
  id = label.split('-')[1];
  // delete row from table
  const row = document.getElementById(`${resource}-${id}-row`);
  row.remove();
  // delete resource from database
  deleteResource(resource, id);
}

async function addDropdownMenu() {
  const dropdownContainer = document.createElement('div');
  dropdownContainer.id = 'dropdown-container';
  const dropdownMenu = document.createElement('select');
  dropdownMenu.id = 'dropdown-menu';
  dropdownMenu.onchange = loadResource;
  const dropdownLabel = document.createElement('label');
  dropdownLabel.for = 'dropdown-menu';
  dropdownLabel.innerText = 'Select a resource:\n';
  dropdownContainer.appendChild(dropdownLabel);
  dropdownContainer.appendChild(dropdownMenu);
  let resources = [''];
  resourceSchema = await getSchemas();
  Object.keys(resourceSchema).forEach(key => {
    resources.push(key);
  });

  resources.forEach(resource => {
    const option = document.createElement('option');
    option.value = resource;
    option.innerText = resource;
    dropdownMenu.appendChild(option);
  });
  appendBody(dropdownContainer);
}

function launchDataManager() {
  clearBody();
  addDropdownMenu();
}


console.log('data-manager.js loaded!');
