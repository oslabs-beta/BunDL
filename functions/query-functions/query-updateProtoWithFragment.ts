/**
 * Takes collected fragments and integrates them onto the prototype where referenced.
 * @param {Object} protoObj - Prototype before it has been updated with fragments.
 * @param {Object} frags - Fragments object to update prototype with.
 * @returns {Object} Updated prototype object.
 */
export function updateProtoWithFragment(protoObj: ProtoObjType, frags: FragsType): ProtoObjType {
	// If the proto or frags objects are null/undefined, return the protoObj.
	if (!protoObj || !frags) return protoObj;

	// Loop through the fields in the proto object.
	for (const key in protoObj) {
		// If the field is a nested object and not an introspection field (fields starting with '__'
		// that provide information about the underlying schema)
		if (typeof protoObj[key] === 'object' && !key.includes('__')) {
			// Update the field to the result of recursively calling updateProtoWithFragment,
			// passing the field and fragments.
			protoObj[key] = updateProtoWithFragment(protoObj[key] as ProtoObjType, frags);
		}

		// If the field is a reference to a fragment, replace the reference to the fragment with
		// the actual fragment.
		if (Object.prototype.hasOwnProperty.call(frags, key)) {
			protoObj = { ...protoObj, ...frags[key] };
			delete protoObj[key];
		}
	}

	// Return the updated proto
	return protoObj;
}
