/**
 * Combines two objects containing results from separate sources and outputs a single object with information from both sources combined,
 * formatted to be delivered to the client, using the queryProto as a template for how to structure the final response object.
 * @param {Object} cacheResponse - Response data from the cache.
 * @param {Object} serverResponse - Response data from the server or external API.
 * @param {Object} queryProto - Current slice of the prototype being used as a template for final response object structure.
 * @param {boolean} fromArray - Whether or not the current recursive loop came from within an array (should NOT be supplied to function call).
 */
function joinResponses(cacheResponse, serverResponse, queryProto, fromArray = false) {
	let mergedResponse = {};

	// loop through fields object keys, the "source of truth" for structure
	// store combined responses in mergedResponse
	for (const key in queryProto) {
		// for each key, check whether data stored at that key is an array or an object
		const checkResponse = Object.prototype.hasOwnProperty.call(serverResponse, key) ? serverResponse : cacheResponse;
		if (Array.isArray(checkResponse[key])) {
			// merging logic depends on whether the data is on the cacheResponse, serverResponse, or both
			// if both of the caches contain the same keys...
			if (cacheResponse[key] && serverResponse[key]) {
				// we first check to see if the responses have identical keys to both avoid
				// only returning 1/2 of the data (ex: there are 2 objects in the cache and
				// you query for 4 objects (which includes the 2 cached objects) only returning
				// the 2 new objects from the server)
				// if the keys are identical, we can return a "simple" merge of both
				const cacheKeys = Object.keys(cacheResponse[key][0]);
				const serverKeys = Object.keys(serverResponse[key][0]);
				let keysSame = true;
				for (let n = 0; n < cacheKeys.length; n++) {
					if (cacheKeys[n] !== serverKeys[n]) keysSame = false;
				}
				if (keysSame) {
					mergedResponse[key] = [...cacheResponse[key], ...serverResponse[key]];
				}
				// otherwise, we need to combine the responses at the object level
				else {
					const mergedArray = [];
					for (let i = 0; i < cacheResponse[key].length; i++) {
						// for each index of array, combine cache and server response objects
						const joinedResponse = joinResponses({ [key]: cacheResponse[key][i] }, { [key]: serverResponse[key][i] }, { [key]: queryProto[key] }, true);
						mergedArray.push(joinedResponse);
					}
					mergedResponse[key] = mergedArray;
				}
			} else if (cacheResponse[key]) {
				mergedResponse[key] = cacheResponse[key];
			} else {
				mergedResponse[key] = serverResponse[key];
			}
		} else {
			if (!fromArray) {
				// if object doesn't come from an array, we must assign on the object at the given key
				mergedResponse[key] = {
					...cacheResponse[key],
					...serverResponse[key],
				};
			} else {
				// if the object comes from an array, we do not want to assign to a key as per GQL spec
				mergedResponse = {
					...cacheResponse[key],
					...serverResponse[key],
				};
			}

			for (const fieldName in queryProto[key]) {
				// check for nested objects
				if (typeof queryProto[key][fieldName] === 'object' && !fieldName.includes('__')) {
					// recurse joinResponses on that object to create deeply nested copy on mergedResponse
					let mergedRecursion = {};
					if (cacheResponse[key] && serverResponse[key]) {
						if (cacheResponse[key][fieldName] && serverResponse[key][fieldName]) {
							mergedRecursion = joinResponses(
								{
									[fieldName]: cacheResponse[key][fieldName],
								},
								{
									[fieldName]: serverResponse[key][fieldName],
								},
								{ [fieldName]: queryProto[key][fieldName] }
							);
						} else if (cacheResponse[key][fieldName]) {
							mergedRecursion[fieldName] = cacheResponse[key][fieldName];
						} else {
							mergedRecursion[fieldName] = serverResponse[key][fieldName];
						}
					}
					// place on merged response, spreading the mergedResponse[key] if it
					// is an object or an array, or just adding it as a value at key otherwise
					if (typeof mergedResponse[key] === 'object' || Array.isArray(mergedResponse[key])) {
						mergedResponse[key] = {
							...mergedResponse[key],
							...mergedRecursion,
						};
					} else {
						// case for when mergedResponse[key] is not an object or array and possibly
						// boolean or a string
						mergedResponse[key] = {
							key: mergedResponse[key],
							...mergedRecursion,
						};
					}
				}
			}
		}
	}
	return mergedResponse;
}
