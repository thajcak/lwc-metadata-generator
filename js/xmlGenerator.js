import { FORM_FACTORS, getAllowedPropertyAttributes, getTargetDefinition } from './metadataSchema.js';
import {
  escapeXml,
  sanitizeList,
  validateGroupedTargetConfigs,
  validateSelectedTargets,
  validateTargetConfig
} from './metadataValidation.js';

function buildAttributeString(attributes) {
  const validEntries = Object.entries(attributes).filter(([, value]) => value !== '' && value !== undefined && value !== null);
  if (!validEntries.length) {
    return '';
  }
  return ` ${validEntries.map(([key, value]) => `${key}="${escapeXml(value)}"`).join(' ')}`;
}

function highlightXml(xml) {
  const escaped = escapeXml(xml);
  const withComments = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="xml-comment">$1</span>');
  const withTags = withComments.replace(
    /(&lt;\/?)([A-Za-z_][\w:.-]*)([\s\S]*?)(&gt;)/g,
    (_, open, tagName, attrs, close) => {
      const highlightedAttrs = attrs.replace(
        /(\s+)([A-Za-z_][\w:.-]*)(=)(&quot;[\s\S]*?&quot;)/g,
        '$1<span class="xml-attr-name">$2</span><span class="xml-punctuation">$3</span><span class="xml-attr-value">$4</span>'
      );
      return `<span class="xml-punctuation">${open}</span><span class="xml-tag">${tagName}</span>${highlightedAttrs}<span class="xml-punctuation">${close}</span>`;
    }
  );

  return withTags;
}

function collectProperty(propertyContainer) {
  const propertyName = propertyContainer.querySelector(`#propertyName-${propertyContainer.id}`)?.value?.trim();
  if (!propertyName) return null;

  const propertyType = propertyContainer.querySelector(`#propertyType-${propertyContainer.id}`)?.value;
  const propertyLabel = propertyContainer.querySelector(`#propertyLabel-${propertyContainer.id}`)?.value?.trim();
  const propertyDescription = propertyContainer.querySelector(`#propertyDescription-${propertyContainer.id}`)?.value?.trim();
  const propertyRequired = propertyContainer.querySelector(`#propertyRequired-${propertyContainer.id}`)?.checked;

  const property = {
    name: propertyName,
    type: propertyType,
    label: propertyLabel,
    description: propertyDescription,
    required: propertyRequired ? 'true' : undefined
  };

  if (propertyType === 'Integer') {
    const min = propertyContainer.querySelector(`#propertyMin-${propertyContainer.id}`)?.value;
    const max = propertyContainer.querySelector(`#propertyMax-${propertyContainer.id}`)?.value;
    if (min !== '') property.min = min;
    if (max !== '') property.max = max;
  }

  if (propertyType === 'String') {
    const placeholder = propertyContainer.querySelector(`#propertyPlaceholder-${propertyContainer.id}`)?.value?.trim();
    const datasource = propertyContainer.querySelector(`#propertyDatasource-${propertyContainer.id}`)?.value?.trim();
    if (placeholder) property.placeholder = placeholder;
    if (datasource) property.datasource = datasource;
  }

  return property;
}

function sanitizePropertyForTarget(target, property) {
  const allowedAttributes = getAllowedPropertyAttributes(target, property.type);
  const sanitizedProperty = {};
  Object.entries(property).forEach(([key, value]) => {
    if (allowedAttributes.includes(key)) {
      sanitizedProperty[key] = value;
    }
  });
  return sanitizedProperty;
}

function sortValues(values = []) {
  return [...values].sort((a, b) => String(a).localeCompare(String(b)));
}

function normalizeConfigForGrouping(config) {
  const normalizedProperties = sortValues(
    config.properties.map((property) => JSON.stringify(sanitizePropertyForTarget(config.target, property)))
  );
  const normalizedEvents = sortValues(
    config.events.map((event) => JSON.stringify(event))
  );
  const normalizedAttributes = sortValues(
    Object.entries(config.attributeValues).map(([key, value]) => `${key}:${value}`)
  );

  return JSON.stringify({
    formFactors: sortValues(config.formFactors),
    objects: sortValues(config.objects),
    properties: normalizedProperties,
    events: normalizedEvents,
    attributeValues: normalizedAttributes
  });
}

function getDefinitionCompatibilitySignature(target) {
  const definition = getTargetDefinition(target);
  if (!definition) return '';
  return JSON.stringify({
    supports: definition.supports || {},
    propertyTypes: definition.propertyTypes || [],
    attributes: (definition.attributes || []).map((attribute) => attribute.key).sort()
  });
}

function collectTargetConfig(target) {
  const definition = getTargetDefinition(target);
  const selectedFormFactors = Array.from(document.querySelectorAll(`#formFactors-${target} input[type="checkbox"]:checked`)).map((input) => input.value);
  const formFactors = selectedFormFactors.filter((value) => FORM_FACTORS.includes(value));

  const rawObjects = document.getElementById(`objects-${target}`)?.value || '';
  const objects = sanitizeList(rawObjects.split(','));

  const properties = [];
  const propertiesList = document.getElementById(`propertiesList-${target}`);
  if (propertiesList) {
    const propertyContainers = propertiesList.querySelectorAll('.property-container');
    propertyContainers.forEach((propertyContainer) => {
      const property = collectProperty(propertyContainer);
      if (property) properties.push(property);
    });
  }

  const events = [];
  const eventsList = document.getElementById(`eventsList-${target}`);
  if (eventsList) {
    const eventContainers = eventsList.querySelectorAll('.property-container');
    eventContainers.forEach((eventContainer) => {
      const eventName = eventContainer.querySelector(`#eventName-${eventContainer.id}`)?.value?.trim();
      if (!eventName) return;
      const eventLabel = eventContainer.querySelector(`#eventLabel-${eventContainer.id}`)?.value?.trim();
      const eventDescription = eventContainer.querySelector(`#eventDescription-${eventContainer.id}`)?.value?.trim();
      events.push({
        name: eventName,
        label: eventLabel,
        description: eventDescription
      });
    });
  }

  const attributeValues = {};
  if (definition?.attributes?.length) {
    definition.attributes.forEach((attribute) => {
      const value = document.getElementById(`${attribute.key}-${target}`)?.value?.trim();
      if (value) attributeValues[attribute.key] = value;
    });
  }

  return { target, formFactors, objects, properties, events, attributeValues };
}

function groupTargetConfigs(targetConfigs, groupCompatibleTargets) {
  if (!groupCompatibleTargets) {
    return targetConfigs.map((config) => ({ ...config, targets: [config.target] }));
  }

  const groupedMap = new Map();
  targetConfigs.forEach((config) => {
    const compatibilityKey = getDefinitionCompatibilitySignature(config.target);
    const configKey = normalizeConfigForGrouping(config);
    const mapKey = `${compatibilityKey}::${configKey}`;
    if (!groupedMap.has(mapKey)) {
      groupedMap.set(mapKey, { ...config, targets: [config.target] });
      return;
    }
    groupedMap.get(mapKey).targets.push(config.target);
  });

  return Array.from(groupedMap.values()).map((group) => ({
    ...group,
    targets: sortValues(group.targets)
  }));
}

export function buildXMLFromState(state) {
  const apiVersion = state.apiVersion || '61.0';
  const masterLabel = (state.masterLabel || '').trim();
  const description = (state.description || '').trim();
  const isExposed = Boolean(state.isExposed);
  const targets = Array.from(state.targets || []);
  const targetConfigs = Array.from(state.targetConfigs || []);
  const groupedConfigs = groupTargetConfigs(targetConfigs, Boolean(state.groupCompatibleTargets));

  const warnings = [
    ...validateSelectedTargets(targets),
    ...targetConfigs.flatMap((config) => validateTargetConfig(config)),
    ...validateGroupedTargetConfigs(groupedConfigs)
  ];

  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">');
  lines.push(`  <apiVersion>${escapeXml(apiVersion)}</apiVersion>`);
  if (description) lines.push(`  <description>${escapeXml(description)}</description>`);
  if (masterLabel) lines.push(`  <masterLabel>${escapeXml(masterLabel)}</masterLabel>`);
  lines.push(`  <isExposed>${isExposed ? 'true' : 'false'}</isExposed>`);

  if (targets.length) {
    lines.push('  <targets>');
    targets.forEach((target) => lines.push(`    <target>${escapeXml(target)}</target>`));
    lines.push('  </targets>');
  }

  if (groupedConfigs.length) {
    lines.push('  <targetConfigs>');
    groupedConfigs.forEach((group) => {
      const representativeTarget = group.targets[0];
      const definition = getTargetDefinition(representativeTarget);
      const targetsAttribute = group.targets.join(',');
      const targetConfigAttributes = { targets: targetsAttribute, ...group.attributeValues };
      lines.push(`    <targetConfig${buildAttributeString(targetConfigAttributes)}>`);

      if (definition?.supports.formFactors && group.formFactors.length) {
        lines.push('      <supportedFormFactors>');
        group.formFactors.forEach((formFactor) => {
          lines.push(`        <supportedFormFactor type="${escapeXml(formFactor)}" />`);
        });
        lines.push('      </supportedFormFactors>');
      }

      if (definition?.supports.objects && group.objects.length) {
        lines.push('      <objects>');
        group.objects.forEach((object) => lines.push(`        <object>${escapeXml(object)}</object>`));
        lines.push('      </objects>');
      }

      if (definition?.supports.properties && group.properties.length) {
        group.properties.forEach((property) => {
          const sanitizedProperty = sanitizePropertyForTarget(representativeTarget, property);
          lines.push(`      <property${buildAttributeString(sanitizedProperty)} />`);
        });
      }

      if (definition?.supports.events && group.events.length) {
        group.events.forEach((event) => {
          lines.push(`      <event${buildAttributeString(event)} />`);
        });
      }

      lines.push('    </targetConfig>');
    });
    lines.push('  </targetConfigs>');
  }

  lines.push('</LightningComponentBundle>');
  return { xml: lines.join('\n'), warnings, groupedConfigs };
}

export function generateXML() {
  const apiVersion = document.getElementById('apiVersion').value || '61.0';
  const masterLabel = document.getElementById('masterLabel').value.trim();
  const description = document.getElementById('description').value.trim();
  const isExposed = document.getElementById('isExposed').checked;
  const groupCompatibleTargets = document.getElementById('groupCompatibleTargets')?.checked ?? false;
  const targets = Array.from(document.querySelectorAll('.target-checkbox:checked')).map((checkbox) => checkbox.value);
  const targetConfigs = targets.map((target) => collectTargetConfig(target));
  const { xml, warnings } = buildXMLFromState({
    apiVersion,
    masterLabel,
    description,
    isExposed,
    targets,
    targetConfigs,
    groupCompatibleTargets
  });

  const xmlOutput = document.getElementById('xmlOutput');
  xmlOutput.innerHTML = highlightXml(xml);
  xmlOutput.dataset.rawXml = xml;
  return { xml, warnings };
}