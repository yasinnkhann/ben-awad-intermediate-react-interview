import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/App.css';

function App() {
	const [isLoaded, setIsLoaded] = useState(false);
	const [profiles, setProfiles] = useState({});
	const [query, setQuery] = useState('');
	const inputRef = useRef(null);

	const fetchProfiles = async signal => {
		try {
			const { data } = await axios.get(
				'https://randomuser.me/api/?results=20',
				{
					signal,
				}
			);
			setProfiles({
				data: data.results,
				sorting: 'UNSORTED',
			});
			setIsLoaded(true);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		const abortController = new AbortController();
		fetchProfiles(abortController.signal);
		return () => abortController.abort();
	}, []);

	// useEffect(() => {
	// 	if (query.length > 0) {
	// 		const filteredProfiles = profiles.data.filter(profile => {
	// 			const row = Object.values(profile.location);
	// 			// console.log('LV', row);
	// 			return row.some(value => {
	// 				// console.log(value.toString().toLowerCase());
	// 				return value.toString().toLowerCase().includes(query.toLowerCase());
	// 			});
	// 		});
	// 		console.log('filteredProfiles', filteredProfiles);
	// 		// setProfiles(currProfiles => ({
	// 		// 	...currProfiles,
	// 		// 	data: filteredProfiles,
	// 		// }));
	// 	}
	// }, [query]);

	if (!isLoaded) {
		return <div>Loading...</div>;
	}

	const getLocationKeys = () => {
		const locationObj = profiles.data.map(profile => profile.location)[0];
		const locationKeysArr = extractDeepestKeys(locationObj);

		return locationKeysArr;
	};

	const extractDeepestKeys = obj => {
		const keysArr = [];
		for (let key in obj) {
			let val = obj[key];
			if (typeof val !== 'object') {
				keysArr.push(key);
			} else {
				keysArr.push(...extractDeepestKeys(val));
			}
		}

		return keysArr;
	};

	const extractDeepestValues = obj => {
		const valuesArr = [];
		for (let key in obj) {
			let val = obj[key];
			if (typeof val !== 'object') {
				valuesArr.push(val);
			} else {
				valuesArr.push(...extractDeepestValues(val));
			}
		}
		return valuesArr;
	};

	const getLocationValues = locationObj => {
		const locationValuesArr = extractDeepestValues(locationObj);
		return locationValuesArr;
	};

	const flattenProfiles = () => {
		const flattenedLocations = flattenLocations();
		const profilesCopy = [...profiles.data];
		for (let i = 0; i < profilesCopy.length; i++) {
			const location = flattenedLocations[i];
			profilesCopy[i].location = location;
		}

		setProfiles(currProfiles => ({
			...currProfiles,
			data: profilesCopy,
		}));
	};

	const handleSorting = header => {
		flattenProfiles();

		const copyProfiles = [...profiles.data];

		const sortedProfiles = copyProfiles.sort((a, b) => {
			const aVal = a.location[header];
			const bVal = b.location[header];
			if (profiles.sorting === 'DESC' || profiles.sorting === 'UNSORTED') {
				setProfiles(currProfiles => ({
					...currProfiles,
					sorting: 'ASC',
				}));
				return aVal > bVal ? 1 : -1;
			} else {
				setProfiles(currProfiles => ({
					...currProfiles,
					sorting: 'DESC',
				}));
				return aVal < bVal ? 1 : -1;
			}
		});
		setProfiles(currProfiles => ({
			...currProfiles,
			data: sortedProfiles,
		}));

		setProfiles(currProfiles => ({
			...currProfiles,
			data: sortedProfiles,
		}));
	};

	const flattenLocations = () => {
		const flattenedLocationsArr = [];
		const locationKeys = getLocationKeys();
		for (let i = 0; i < profiles.data.length; i++) {
			let profile = profiles.data[i];
			const flattenedLocationObj = {};
			const locationValues = getLocationValues(profile.location);
			for (let j = 0; j < locationKeys.length; j++) {
				let key = locationKeys[j];
				flattenedLocationObj[key] = locationValues[j];
			}
			flattenedLocationsArr.push(flattenedLocationObj);
		}
		return flattenedLocationsArr;
	};

	const handleChange = e => {
		flattenProfiles();
		setQuery(e.target.value);
		// const filteredProfiles = profiles.data.filter(profile => {
		// 	const row = Object.values(profile.location);
		// 	return row.some(value => {
		// 		return value
		// 			.toString()
		// 			.toLowerCase()
		// 			.includes(inputRef.current.value.toLowerCase());
		// 	});
		// });

		// console.log('filteredProfiles', filteredProfiles);

		// if (filteredProfiles.length === 0) {
		// 	setProfiles(currProfiles => ({
		// 		...currProfiles,
		// 		data: profiles.data,
		// 	}));
		// } else {
		// 	setProfiles(currProfiles => ({
		// 		...currProfiles,
		// 		data: filteredProfiles,
		// 	}));
		// }
	};

	const handleFiltering = () => {};

	return (
		<div className='app'>
			<input type='text' onChange={handleChange} ref={inputRef} />
			<table>
				<thead>
					<tr>
						{Object.keys(flattenLocations()[0]).map(header => (
							<th key={header} onClick={() => handleSorting(header)}>
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{flattenLocations().map((location, idx) => (
						<tr key={idx}>
							{Object.values(location)?.map((val, idx) => (
								<td key={idx}>{val}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default App;
