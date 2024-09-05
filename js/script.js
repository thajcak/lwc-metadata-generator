import { getTargetConfigHTML, getPropertyHTML, getIntegerInputsHTML, getStringInputsHTML } from './htmlTemplates.js';
import { generateXML } from './xmlGenerator.js'; // Import the generateXML function

document.addEventListener('DOMContentLoaded', function() {
  const targetCheckboxes = document.querySelectorAll('.target-checkbox');
  targetCheckboxes.forEach(checkbox => checkbox.addEventListener('change', handleTargetChange));

  // Attach event listener for Generate XML button
  document.getElementById('generateXMLButton').addEventListener('click', generateXML);
});

let targetConfigCount = 0;

// Handle target checkbox changes (add/remove target configuration)
function handleTargetChange(event) {
  const target = event.target.value;
  if (event.target.checked) {
	addTargetConfig(target); // Add target configuration when target is selected
  } else {
	removeTargetConfig(target); // Remove target configuration when target is deselected
  }
}

// Add a new targetConfig entry
function addTargetConfig(target) {
  // Check if the targetConfig already exists
  if (document.getElementById(`targetConfig-${target}`)) return;

  targetConfigCount++;

  const container = document.createElement('div');
  container.className = 'targetConfig-container';
  container.id = `targetConfig-${target}`;

  // Use the extracted HTML snippet for the target config
  container.innerHTML = getTargetConfigHTML(target);

  // Add property fields for `lightning__RecordPage`, `lightning__HomePage`, and `lightning__AppPage`
  if (target === 'lightning__RecordPage' || target === 'lightning__HomePage' || target === 'lightning__AppPage') {
	const propertiesContainer = document.createElement('div');
	propertiesContainer.id = `properties-${target}`;
	propertiesContainer.innerHTML = `
	  <h5>Properties for ${target}</h5>
	  <button type="button" onclick="addProperty('${target}')">Add Property</button>
	  <div id="propertiesList-${target}"></div>
	`;
	container.appendChild(propertiesContainer);
  }

  document.getElementById('targetConfigContainer').appendChild(container);
}

// Make addProperty function globally accessible
window.addProperty = function(target) {
  const propertiesList = document.getElementById(`propertiesList-${target}`);
  const propertyId = `property-${target}-${Date.now()}`;

  const propertyContainer = document.createElement('div');
  propertyContainer.className = 'property-container';
  propertyContainer.id = propertyId;

  // Use the extracted HTML snippet for the property container
  propertyContainer.innerHTML = getPropertyHTML(propertyId); // This should create the property type dropdown and other inputs

  propertiesList.appendChild(propertyContainer); // Ensure this is appended to the DOM
};

// Handle property type change to show specific inputs based on type
window.handlePropertyTypeChange = function(propertyId) {
  const propertyType = document.getElementById(`propertyType-${propertyId}`).value;
  const additionalInputsContainer = document.getElementById(`additionalInputs-${propertyId}`);

  // Clear existing inputs
  additionalInputsContainer.innerHTML = '';

  // Use extracted HTML snippets for Integer and String inputs
  if (propertyType === 'Integer') {
	additionalInputsContainer.innerHTML = getIntegerInputsHTML(propertyId);
  } else if (propertyType === 'String') {
	additionalInputsContainer.innerHTML = getStringInputsHTML(propertyId);
  }
};

// Remove a property
window.removeProperty = function(propertyId) {
  const propertyElement = document.getElementById(propertyId);
  if (propertyElement) {
	propertyElement.remove();
  }
};

// Remove a targetConfig entry
function removeTargetConfig(target) {
  const targetConfigElement = document.getElementById(`targetConfig-${target}`);
  if (targetConfigElement) {
	targetConfigElement.remove(); // Remove the entire target configuration
  }
}