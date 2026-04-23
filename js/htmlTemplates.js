import { FORM_FACTORS, TARGET_DEFINITIONS } from './metadataSchema.js';

export function getTargetsCatalogHTML() {
  const categoryOrder = ['Pages', 'Experience Cloud', 'Agentforce', 'Email', 'Other'];
  const groupedTargets = TARGET_DEFINITIONS.reduce((accumulator, target) => {
    const category = target.category || 'Other';
    if (!accumulator[category]) accumulator[category] = [];
    accumulator[category].push(target);
    return accumulator;
  }, {});

  return categoryOrder
    .filter((category) => (groupedTargets[category] || []).length > 0)
    .map((category) => {
      const sortedTargets = [...groupedTargets[category]].sort((left, right) => {
        return left.label.localeCompare(right.label);
      });

      const targetsMarkup = sortedTargets.map((target) => `
    <div class="target-item" data-target="${target.value}">
      <label class="toggle-label">
        <label class="switch">
          <input type="checkbox" class="target-checkbox" value="${target.value}" />
          <span class="slider"></span>
        </label>
        ${target.label}
      </label>
      <div id="targetConfigSlot-${target.value}" class="target-config-slot"></div>
      <hr />
    </div>
  `).join('');

      return `
        <div class="target-category">
          <details open>
            <summary>${category}</summary>
            ${targetsMarkup}
          </details>
        </div>
      `;
    })
    .join('');
}

export function getTargetConfigHTML(targetDefinition) {
  const { value: target } = targetDefinition;
  const sections = [];
  if (targetDefinition.supports.formFactors) {
    const formFactorOptions = FORM_FACTORS.map((formFactor) => `
      <label class="toggle-label">
        <label class="switch">
          <input type="checkbox" value="${formFactor}">
          <span class="slider"></span>
        </label>
        ${formFactor}
      </label>
    `).join('');
    sections.push(`
      <label for="formFactors-${target}">Supported Form Factors</label>
      <div id="formFactors-${target}" class="inline-toggle-list">${formFactorOptions}</div>
    `);
  }

  if (targetDefinition.supports.objects) {
    sections.push(`
      <label for="objects-${target}">Objects (comma separated)</label>
      <input type="text" id="objects-${target}" placeholder="Account, Contact">
    `);
  }

  if (targetDefinition.attributes?.length) {
    const attributeInputs = targetDefinition.attributes.map((attribute) => {
      if (attribute.type === 'select') {
        const options = attribute.options.map((option) => `<option value="${option}">${option}</option>`).join('');
        return `
          <div class="property-group">
            <label for="${attribute.key}-${target}">${attribute.label}</label>
            <select id="${attribute.key}-${target}">${options}</select>
          </div>
        `;
      }
      return `
        <div class="property-group">
          <label for="${attribute.key}-${target}">${attribute.label}</label>
          <input type="text" id="${attribute.key}-${target}" placeholder="${attribute.placeholder || ''}">
        </div>
      `;
    }).join('');
    sections.push(`<div class="property-row">${attributeInputs}</div>`);
  }

  if (targetDefinition.supports.events) {
    sections.push(`
      <h5>Events</h5>
      <div id="eventsList-${target}" class="properties-list"></div>
      <button type="button" class="add-property-button" onclick="addEvent('${target}')">Add Event</button>
    `);
  }

  return sections.join('');
}

export function getPropertyHTML(propertyId, allowedTypes = ['Boolean', 'Integer', 'String']) {
  const typeOptions = allowedTypes.map((type) => `<option value="${type}">${type}</option>`).join('');
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
		  ${typeOptions}
		</select>
	  </div>
	  <div id="additionalInputs-${propertyId}" class="input-group"></div>
	</div>

	<button type="button" class="remove-property-button" onclick="removeProperty('${propertyId}')">Remove Property</button>
  `;
}

export function getEventHTML(eventId) {
  return `
	<div class="property-row">
	  <div class="property-group">
		<label for="eventName-${eventId}">Event Name:</label>
		<input type="text" id="eventName-${eventId}" placeholder="e.g. selectionchange">
	  </div>
	  <div class="property-group">
		<label for="eventLabel-${eventId}">Event Label:</label>
		<input type="text" id="eventLabel-${eventId}" placeholder="Selection Changed">
	  </div>
	</div>
	<div class="property-group">
	  <label for="eventDescription-${eventId}">Event Description:</label>
	  <textarea id="eventDescription-${eventId}" placeholder="Event description"></textarea>
	</div>
	<button type="button" class="remove-property-button" onclick="removeEvent('${eventId}')">Remove Event</button>
  `;
}

export function getIntegerInputsHTML(propertyId, allowedAttributes = []) {
  const includeMin = allowedAttributes.includes('min');
  const includeMax = allowedAttributes.includes('max');
  if (!includeMin && !includeMax) return '';
  return `
	<div class="input-row">
      ${includeMin ? `
	  <div class="input-group">
		<label for="propertyMin-${propertyId}">Min:</label>
		<input type="number" id="propertyMin-${propertyId}" placeholder="Min value">
	  </div>` : ''}
      ${includeMax ? `
	  <div class="input-group">
		<label for="propertyMax-${propertyId}">Max:</label>
		<input type="number" id="propertyMax-${propertyId}" placeholder="Max value">
	  </div>` : ''}
	</div>
  `;
}

export function getStringInputsHTML(propertyId, allowedAttributes = []) {
  const includePlaceholder = allowedAttributes.includes('placeholder');
  const includeDatasource = allowedAttributes.includes('datasource');
  if (!includePlaceholder && !includeDatasource) return '';
  return `
	<div class="input-row">
      ${includePlaceholder ? `
	  <div class="input-group">
		<label for="propertyPlaceholder-${propertyId}">Placeholder:</label>
		<input type="text" id="propertyPlaceholder-${propertyId}" placeholder="Placeholder text">
	  </div>` : ''}
      ${includeDatasource ? `
	  <div class="input-group">
		<label for="propertyDatasource-${propertyId}">Datasource:</label>
		<input type="text" id="propertyDatasource-${propertyId}" placeholder="Datasource">
	  </div>` : ''}
	</div>
  `;
}