const fs = require('fs');
const path = require('path');
const loaderUtils = require('loader-utils');
const Hashids = require('hashids');

module.exports = function (fusionSource) {
	const options = Object.assign(
		{compress: false, salt: 'eeThahM2'},
		loaderUtils.getOptions(this)
	);
	const basePath = path.join(
		path.dirname(this.resourcePath),
		path.basename(this.resourcePath, '.fusion')
	);
	const parsedFusionSource = /prototype\(([.:a-zA-Z0-9]*)\)/.exec(fusionSource);
	const compressPrototypeName = prototypeName => {
		const hashids = new Hashids(options.salt);

		return hashids.encodeHex(Buffer(prototypeName).toString('hex')).substr(0, 8); // eslint-disable-line
	};

	if (parsedFusionSource) {
		const prototypeName = parsedFusionSource[1];
		const exportName = options.compress ? compressPrototypeName(prototypeName) : prototypeName;
		const importStatements = [];
		const exportStatements = [];

		exportStatements.push(`export const prototypeName = '${exportName}';`);

		if (fs.existsSync(`${basePath}.css`)) {
			importStatements.push(`import styles from '${basePath}.css';`);
			exportStatements.push('export {styles};');
		}

		if (fs.existsSync(`${basePath}.js`)) {
			importStatements.push(`import script from '${basePath}.js';`);
			exportStatements.push('export {script};');

			const additionalFusionSource = `
prototype(${prototypeName}) {
	renderer.@process.augmentWithJavaScriptComponent = Neos.Fusion:Augmenter {
		data-component = '${exportName}'
	}
}
			`;

			fs.writeFileSync(`${basePath}.js.fusion`, additionalFusionSource);
		}

		return [...importStatements, '', ...exportStatements].join('\n');
	}

	return '';
};