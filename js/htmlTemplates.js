// HTML for target config container
export function getTargetConfigHTML(target) {
  return `
	<label for="formFactors-${target}">Supported Form Factors:</label>
	<div id="formFactors-${target}" style="display: flex; gap: 10px;">
	  <label class="toggle-label">
		<label class="switch">
		  <input type="checkbox" value="Small">
		  <span class="slider"></span>
		</label>
		Small
	  </label>
	  <label class="toggle-label">
		<label class="switch">
		  <input type="checkbox" value="Medium">
		  <span class="slider"></span>
		</label>
		Medium
	  </label>
	  <label class="toggle-label">
		<label class="switch">
		  <input type="checkbox" value="Large">
		  <span class="slider"></span>
		</label>
		Large
	  </label>
	</div>

	<label for="objects-${target}" style="display: block; margin-top: 10px;">Objects (comma separated):</label>
	<input type="text" id="objects-${target}" placeholder="Object 1, Object 2" style="width: 100%;">
  `;
}

// HTML for property container for a record page
export function getPropertyHTML(propertyId) {
  return `
	<div class="property-row">
	  <div class="property-group">
		<label for="propertyName-${propertyId}">Property Name:</label>
		<input type="text" id="propertyName-${propertyId}" placeholder="e.g. recordId">
	  </div>
	  <div class="property-group">
		<label for="propertyLabel-${propertyId}">Property Label:</label>
		<input type="text" id="propertyLabel-${propertyId}" placeholder="Property Label">
	  </div>
	  <div class="property-group">
		<label>Required</label>
		<label class="switch">
		  <input type="checkbox" id="propertyRequired-${propertyId}">
		  <span class="slider"></span>
		</label>
	  </div>
	</div>

	<div class="property-group">
	  <label for="propertyDescription-${propertyId}">Property Description:</label>
	  <textarea id="propertyDescription-${propertyId}" placeholder="Property Description"></textarea>
	</div>

	<!-- Property Type below Description -->
	<div class="property-row">
	  <div class="property-group property-type">
		<label for="propertyType-${propertyId}">Property Type:</label>
		<select id="propertyType-${propertyId}" onchange="handlePropertyTypeChange('${propertyId}')">
		  <option value="Boolean">Boolean</option>
		  <option value="Integer">Integer</option>
		  <option value="String">String</option>
		</select>
	  </div>
	  <div id="additionalInputs-${propertyId}" class="input-group"></div>
	</div>

	<button type="button" class="remove-property-button" onclick="removeProperty('${propertyId}')">Remove Property</button>
  `;
}

export function getIntegerInputsHTML(propertyId) {
  return `
	<div class="input-row">
	  <div class="input-group">
		<label for="propertyMin-${propertyId}">Min:</label>
		<input type="number" id="propertyMin-${propertyId}" placeholder="Min value">
	  </div>
	  <div class="input-group">
		<label for="propertyMax-${propertyId}">Max:</label>
		<input type="number" id="propertyMax-${propertyId}" placeholder="Max value">
	  </div>
	</div>
  `;
}

export function getStringInputsHTML(propertyId) {
  return `
	<div class="input-row">
	  <div class="input-group">
		<label for="propertyPlaceholder-${propertyId}">Placeholder:</label>
		<input type="text" id="propertyPlaceholder-${propertyId}" placeholder="Placeholder text">
	  </div>
	  <div class="input-group">
		<label for="propertyDatasource-${propertyId}">Datasource:</label>
		<input type="text" id="propertyDatasource-${propertyId}" placeholder="Datasource">
	  </div>
	</div>
  `;
}