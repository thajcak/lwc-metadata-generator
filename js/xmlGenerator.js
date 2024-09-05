export function generateXML() {
  // Get the top-level values
  const apiVersion = document.getElementById("apiVersion").value || '61.0';
  const description = document.getElementById("description").value;
  const masterLabel = document.getElementById("masterLabel").value;
  const isExposed = document.getElementById("isExposed").checked; // Get isExposed value
  const targets = Array.from(document.querySelectorAll('.target-checkbox:checked')).map(cb => cb.value);

  const targetConfigs = targets.map(target => {
	const formFactors = Array.from(document.getElementById(`formFactors-${target}`).selectedOptions).map(option => option.value);
	const objects = document.getElementById(`objects-${target}`).value.split(',').map(item => item.trim());
	const properties = [];

	// Collect properties for `lightning__RecordPage`, `lightning__HomePage`, and `lightning__AppPage`
	if (target === 'lightning__RecordPage' || target === 'lightning__HomePage' || target === 'lightning__AppPage') {
	  const propertiesList = document.getElementById(`propertiesList-${target}`);
	  const propertiesElements = propertiesList.querySelectorAll('.property-container');

	  propertiesElements.forEach(property => {
		const propertyName = property.querySelector(`#propertyName-${property.id}`).value;
		const propertyType = property.querySelector(`#propertyType-${property.id}`).value;
		const propertyLabel = property.querySelector(`#propertyLabel-${property.id}`).value;
		const propertyDescription = property.querySelector(`#propertyDescription-${property.id}`).value;
		const propertyRequired = property.querySelector(`#propertyRequired-${property.id}`).checked;

		let additionalDetails = {};

		if (propertyType === 'Integer') {
		  const propertyMin = property.querySelector(`#propertyMin-${property.id}`).value;
		  const propertyMax = property.querySelector(`#propertyMax-${property.id}`).value;
		  additionalDetails.min = propertyMin;
		  additionalDetails.max = propertyMax;
		} else if (propertyType === 'String') {
		  const propertyPlaceholder = property.querySelector(`#propertyPlaceholder-${property.id}`).value;
		  const propertyDatasource = property.querySelector(`#propertyDatasource-${property.id}`).value;
		  additionalDetails.placeholder = propertyPlaceholder;
		  additionalDetails.datasource = propertyDatasource;
		}

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
	  properties
	};
  });

  // Generate XML Blob using the information collected
  let xmlBlob = `<?xml version="1.0" encoding="UTF-8"?>\n<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">\n`;

  // Add the top-level XML fields
  if (apiVersion) {
	xmlBlob += `  <apiVersion>${apiVersion}</apiVersion>\n`;
  }
  if (description) {
	xmlBlob += `  <description>${description}</description>\n`;
  }
  if (masterLabel) {
	xmlBlob += `  <masterLabel>${masterLabel}</masterLabel>\n`;
  }
  xmlBlob += `  <isExposed>${isExposed}</isExposed>\n`;

  // Targets
  if (targets.length > 0) {
	xmlBlob += `  <targets>\n`;
	targets.forEach(target => {
	  xmlBlob += `    <target>${target}</target>\n`;
	});
	xmlBlob += `  </targets>\n`;
  }

  // Target Configurations
  targetConfigs.forEach(config => {
	const { target, formFactors, objects, properties } = config;

	xmlBlob += `  <targetConfigs>\n`;
	xmlBlob += `    <targetConfig targets="${target}">\n`;

	// Form Factors
	if (formFactors.length > 0) {
	  xmlBlob += `      <supportedFormFactors>\n`;
	  formFactors.forEach(formFactor => {
		xmlBlob += `        <supportedFormFactor>${formFactor}</supportedFormFactor>\n`;
	  });
	  xmlBlob += `      </supportedFormFactors>\n`;
	}

	// Objects
	if (objects.length > 0) {
	  xmlBlob += `      <objects>\n`;
	  objects.forEach(object => {
		xmlBlob += `        <object>${object}</object>\n`;
	  });
	  xmlBlob += `      </objects>\n`;
	}

	// Properties for targets
	if (properties.length > 0) {
	  xmlBlob += `      <properties>\n`;
	  properties.forEach(property => {
		xmlBlob += `        <property name="${property.name}" type="${property.type}" label="${property.label}" description="${property.description}" required="${property.required}"`;

		if (property.type === 'Integer') {
		  if (property.min) xmlBlob += ` min="${property.min}"`;
		  if (property.max) xmlBlob += ` max="${property.max}"`;
		}

		if (property.type === 'String') {
		  if (property.placeholder) xmlBlob += ` placeholder="${property.placeholder}"`;
		  if (property.datasource) xmlBlob += ` datasource="${property.datasource}"`;
		}

		xmlBlob += ` />\n`;
	  });
	  xmlBlob += `      </properties>\n`;
	}

	xmlBlob += `    </targetConfig>\n`;
	xmlBlob += `  </targetConfigs>\n`;
  });

  xmlBlob += `</LightningComponentBundle>`;

  // Output the XML to the textarea
  document.getElementById("xmlOutput").innerText = xmlBlob;
}