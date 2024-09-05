// HTML for target config container
export function getTargetConfigHTML(target) {
  return `
	<h4>Target Config: ${target}</h4>
	<label for="formFactors-${target}">Supported Form Factors:</label>
	<select id="formFactors-${target}" multiple>
	  <option value="Small">Small</option>
	  <option value="Medium">Medium</option>
	  <option value="Large">Large</option>
	</select>

	<label for="objects-${target}">Objects (comma separated):</label>
	<input type="text" id="objects-${target}" placeholder="Object 1, Object 2">
  `;
}

// HTML for property container for a record page
export function getPropertyHTML(propertyId) {
  return `
	<label for="propertyName-${propertyId}">Property Name:</label>
	<input type="text" id="propertyName-${propertyId}" placeholder="e.g. recordId">

	<label for="propertyLabel-${propertyId}">Property Label:</label>
	<input type="text" id="propertyLabel-${propertyId}" placeholder="Property Label">

	<label for="propertyDescription-${propertyId}">Property Description:</label>
	<input type="text" id="propertyDescription-${propertyId}" placeholder="Property Description">

	<label for="propertyType-${propertyId}">Property Type:</label>
	<select id="propertyType-${propertyId}" onchange="handlePropertyTypeChange('${propertyId}')">
	  <option value="Boolean">Boolean</option>
	  <option value="Integer">Integer</option>
	  <option value="String">String</option>
	</select>

	<div id="additionalInputs-${propertyId}"></div>

	<label><input type="checkbox" id="propertyRequired-${propertyId}"> Required</label>

	<button type="button" onclick="removeProperty('${propertyId}')">Remove Property</button>
  `;
}

// HTML for additional inputs based on property type
export function getIntegerInputsHTML(propertyId) {
  return `
	<label for="propertyMin-${propertyId}">Min:</label>
	<input type="number" id="propertyMin-${propertyId}" placeholder="Min value">

	<label for="propertyMax-${propertyId}">Max:</label>
	<input type="number" id="propertyMax-${propertyId}" placeholder="Max value">
  `;
}

export function getStringInputsHTML(propertyId) {
  return `
	<label for="propertyPlaceholder-${propertyId}">Placeholder:</label>
	<input type="text" id="propertyPlaceholder-${propertyId}" placeholder="Placeholder text">

	<label for="propertyDatasource-${propertyId}">Datasource:</label>
	<input type="text" id="propertyDatasource-${propertyId}" placeholder="Datasource">
  `;
}