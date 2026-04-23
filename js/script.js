import { getTargetConfigHTML, getPropertyHTML, getIntegerInputsHTML, getStringInputsHTML, getTargetsCatalogHTML, getEventHTML } from './htmlTemplates.js';
import { generateXML } from './xmlGenerator.js';
import { getAllowedPropertyAttributes, getTargetDefinition } from './metadataSchema.js';

let refreshTimer;

document.addEventListener('DOMContentLoaded', function() {
  const targetsContainer = document.getElementById('targetsContainer');
  const wrapXmlToggle = document.getElementById('wrapXmlToggle');
  targetsContainer.innerHTML = getTargetsCatalogHTML();
  const configForm = document.getElementById('configForm');
  const targetCheckboxes = document.querySelectorAll('.target-checkbox');
  targetCheckboxes.forEach(checkbox => checkbox.addEventListener('change', handleTargetChange));

  configForm.addEventListener('input', function(event) {
	sanitizeXmlUnsafeInput(event);
	scheduleRefreshXML();
  });
  configForm.addEventListener('change', scheduleRefreshXML);

  wrapXmlToggle.addEventListener('change', function(event) {
	setXmlWrapMode(event.target.checked);
  });

  setXmlWrapMode(wrapXmlToggle.checked);
  refreshXML();
});

function handleTargetChange(event) {
  const target = event.target.value;
  const checkbox = event.target;

  if (checkbox.checked) {
	addTargetConfig(target);
  } else {
	removeTargetConfig(target);
  }
  refreshXML();
}

function addTargetConfig(target) {
  if (document.getElementById(`targetConfig-${target}`)) return;

  const container = document.createElement('div');
  container.className = 'targetConfig-container';
  container.id = `targetConfig-${target}`;
  const targetDefinition = getTargetDefinition(target);
  if (!targetDefinition) return;

  container.innerHTML = `
	<h4>${targetDefinition.label} <code>${targetDefinition.value}</code></h4>
	${getTargetConfigHTML(targetDefinition)}
  `;

  if (targetDefinition.supports.properties) {
	const propertiesContainer = document.createElement('div');
	propertiesContainer.id = `properties-${target}`;
	propertiesContainer.innerHTML = `
	  <h5>Properties</h5>
	  <div id="propertiesList-${target}" class="properties-list"></div>
	  <button type="button" class="add-property-button" onclick="addProperty('${target}')">Add Property</button>
	`;
	container.appendChild(propertiesContainer);
  }

  const configSlot = document.getElementById(`targetConfigSlot-${target}`);
  if (configSlot) {
	configSlot.appendChild(container);
  }
  refreshXML();
}

window.addProperty = function(target) {
  const propertiesList = document.getElementById(`propertiesList-${target}`);
  if (!propertiesList) return;
  const targetDefinition = getTargetDefinition(target);
  if (!targetDefinition) return;
  const propertyId = `property-${target}-${Date.now()}`;

  const propertyContainer = document.createElement('div');
  propertyContainer.className = 'property-container';
  propertyContainer.id = propertyId;

  propertyContainer.innerHTML = getPropertyHTML(propertyId, targetDefinition.propertyTypes || ['Boolean', 'Integer', 'String']);

  propertiesList.appendChild(propertyContainer);
  window.handlePropertyTypeChange(propertyId);
  refreshXML();
};

window.addEvent = function(target) {
  const eventsList = document.getElementById(`eventsList-${target}`);
  if (!eventsList) return;
  const eventId = `event-${target}-${Date.now()}`;
  const eventContainer = document.createElement('div');
  eventContainer.className = 'property-container';
  eventContainer.id = eventId;
  eventContainer.innerHTML = getEventHTML(eventId);
  eventsList.appendChild(eventContainer);
  refreshXML();
};

window.handlePropertyTypeChange = function(propertyId) {
  const target = extractTargetFromPropertyId(propertyId);
  if (!target) return;
  const propertyType = document.getElementById(`propertyType-${propertyId}`).value;
  const additionalInputsContainer = document.getElementById(`additionalInputs-${propertyId}`);
  const allowedAttributes = getAllowedPropertyAttributes(target, propertyType);

  additionalInputsContainer.innerHTML = '';

  if (propertyType === 'Integer') {
	additionalInputsContainer.innerHTML = getIntegerInputsHTML(propertyId, allowedAttributes);
  } else if (propertyType === 'String') {
	additionalInputsContainer.innerHTML = getStringInputsHTML(propertyId, allowedAttributes);
  }
  refreshXML();
};

window.removeProperty = function(propertyId) {
  const propertyElement = document.getElementById(propertyId);
  if (propertyElement) {
	propertyElement.remove();
  }
  refreshXML();
};

window.removeEvent = function(eventId) {
  const eventElement = document.getElementById(eventId);
  if (eventElement) {
	eventElement.remove();
  }
  refreshXML();
};

function removeTargetConfig(target) {
  const targetConfigElement = document.getElementById(`targetConfig-${target}`);
  if (targetConfigElement) {
	targetConfigElement.remove();
  }
  refreshXML();
}

function renderWarnings(warnings) {
  const warningOutput = document.getElementById('validationOutput');
  if (!warningOutput) return;
  if (!warnings.length) {
	warningOutput.textContent = '';
	warningOutput.classList.remove('has-content');
	return;
  }
  const warningMarkup = warnings.map((warning) => `<li>${warning}</li>`).join('');
  warningOutput.innerHTML = `<strong>Validation warnings</strong><ul>${warningMarkup}</ul>`;
  warningOutput.classList.add('has-content');
}

function extractTargetFromPropertyId(propertyId) {
  if (!propertyId.startsWith('property-')) return null;
  const timestampSeparator = propertyId.lastIndexOf('-');
  if (timestampSeparator <= 'property-'.length) return null;
  return propertyId.slice('property-'.length, timestampSeparator);
}

function scheduleRefreshXML() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(refreshXML, 60);
}

function refreshXML() {
  const result = generateXML();
  renderWarnings(result.warnings || []);
}

function setXmlWrapMode(isWrapped) {
  const xmlOutput = document.getElementById('xmlOutput');
  if (!xmlOutput) return;
  xmlOutput.classList.toggle('no-wrap', !isWrapped);
}

function sanitizeXmlUnsafeInput(event) {
  const target = event.target;
  if (!target) return;
  if (target.id === 'apiVersion' || target.type === 'checkbox' || target.tagName === 'SELECT') return;
  if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') return;
  if (target.type && target.type !== 'text' && target.tagName !== 'TEXTAREA') return;

  const original = target.value;
  const sanitized = original.replace(/[<>&"']/g, '');
  if (sanitized === original) return;

  const cursorOffset = original.length - (target.selectionStart || original.length);
  target.value = sanitized;
  const nextCursor = Math.max(0, sanitized.length - cursorOffset);
  target.setSelectionRange(nextCursor, nextCursor);
}