export function generateXML() {
  const apiVersion = document.getElementById('apiVersion').value || '61.0';
  const masterLabel = document.getElementById('masterLabel').value;
  const description = document.getElementById('description').value;
  const isExposed = document.getElementById('isExposed').checked;

  const targets = Array.from(document.querySelectorAll('.target-checkbox:checked')).map(checkbox => checkbox.value);

  const targetConfigs = targets.map(target => {
	const formFactors = Array.from(document.querySelectorAll(`#formFactors-${target} input[type="checkbox"]:checked`)).map(input => input.value);
	const objects = document.getElementById(`objects-${target}`).value.split(',').map(obj => obj.trim());
	const properties = [];

	// Gather properties if any exist for the target
	const propertiesList = document.getElementById(`propertiesList-${target}`);
	if (propertiesList) {
	  const propertyContainers = propertiesList.querySelectorAll('.property-container');
	  propertyContainers.forEach(propertyContainer => {
		const propertyName = propertyContainer.querySelector(`#propertyName-${propertyContainer.id}`).value;
		const propertyType = propertyContainer.querySelector(`#propertyType-${propertyContainer.id}`).value;
		const propertyLabel = propertyContainer.querySelector(`#propertyLabel-${propertyContainer.id}`).value;
		const propertyDescription = propertyContainer.querySelector(`#propertyDescription-${propertyContainer.id}`).value;
		const propertyRequired = propertyContainer.querySelector(`#propertyRequired-${propertyContainer.id}`).checked;

		// Add any additional details for Integer and String types
		let additionalDetails = {};
		if (propertyType === 'Integer') {
		  const propertyMin = propertyContainer.querySelector(`#propertyMin-${propertyContainer.id}`).value;
		  const propertyMax = propertyContainer.querySelector(`#propertyMax-${propertyContainer.id}`).value;
		  additionalDetails.min = propertyMin;
		  additionalDetails.max = propertyMax;
		} else if (propertyType === 'String') {
		  const propertyPlaceholder = propertyContainer.querySelector(`#propertyPlaceholder-${propertyContainer.id}`).value;
		  const propertyDatasource = propertyContainer.querySelector(`#propertyDatasource-${propertyContainer.id}`).value;
		  additionalDetails.placeholder = propertyPlaceholder;
		  additionalDetails.datasource = propertyDatasource;
		}

		// Push property details into the properties array
		properties.push({
		  name: propertyName,
		  type: propertyType,
		  label: propertyLabel,
		  description: propertyDescription,
		  required: propertyRequired,
		  ...additionalDetails
		});
	  });
	}

	return {
	  target,
	  formFactors,
	  objects,
	  properties,
	};
  });

  // Begin constructing the XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">\n`;
  xml += `  <apiVersion>${apiVersion}</apiVersion>\n`;
  xml += `  <description>${description}</description>\n`;
  xml += `  <masterLabel>${masterLabel}</masterLabel>\n`;
  xml += `  <isExposed>${isExposed}</isExposed>\n`;

  // Add targets
  if (targets.length > 0) {
	xml += `  <targets>\n`;
	targets.forEach(target => {
	  xml += `    <target>${target}</target>\n`;
	});
	xml += `  </targets>\n`;
  }

  // Add target configurations
  if (targetConfigs.length > 0) {
	xml += `  <targetConfigs>\n`;
	targetConfigs.forEach(config => {
	  const { target, formFactors, objects, properties } = config;

	  xml += `    <targetConfig targets="${target}">\n`;

	  // Add form factors
	  if (formFactors.length > 0) {
		xml += `      <supportedFormFactors>\n`;
		formFactors.forEach(formFactor => {
		  xml += `        <supportedFormFactor>${formFactor}</supportedFormFactor>\n`;
		});
		xml += `      </supportedFormFactors>\n`;
	  }

	  // Add objects
	  if (objects.length > 0) {
		xml += `      <objects>\n`;
		objects.forEach(object => {
		  xml += `        <object>${object}</object>\n`;
		});
		xml += `      </objects>\n`;
	  }

	  // Add properties
	  if (properties.length > 0) {
		xml += `      <properties>\n`;
		properties.forEach(property => {
		  xml += `        <property name="${property.name}" type="${property.type}" label="${property.label}" description="${property.description}" required="${property.required}"`;

		  // Add Integer specific details
		  if (property.type === 'Integer') {
			if (property.min) xml += ` min="${property.min}"`;
			if (property.max) xml += ` max="${property.max}"`;
		  }

		  // Add String specific details
		  if (property.type === 'String') {
			if (property.placeholder) xml += ` placeholder="${property.placeholder}"`;
			if (property.datasource) xml += ` datasource="${property.datasource}"`;
		  }

		  xml += ` />\n`;
		});
		xml += `      </properties>\n`;
	  }

	  xml += `    </targetConfig>\n`;
	});
	xml += `  </targetConfigs>\n`;
  }

  xml += `</LightningComponentBundle>`;

  // Display the generated XML
  const xmlOutput = document.getElementById('xmlOutput');
  xmlOutput.textContent = xml;

  return xml;
}